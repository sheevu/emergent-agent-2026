from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Body, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
import io
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str
    amount: float
    description: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionCreatePayload(TransactionCreate):
    user_id: Optional[str] = None

class DailyReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: datetime
    sales_total: float
    purchase_total: float
    expense_total: float
    net_amount: float
    insights: str
    action_points: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DocumentScan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    extracted_data: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VoiceInput(BaseModel):
    audio_base64: str
    user_id: str

class TextToSpeech(BaseModel):
    text: str
    language: str = "hi"

@api_router.get("/")
async def root():
    return {"message": "Sudarshan AI Portal API"}

@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_obj = User(**user.model_dump())
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return {"message": "User registered successfully", "user_id": user_obj.id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or user['password'] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "user_id": user['id'],
        "username": user['username'],
        "email": user['email']
    }

@api_router.post("/transactions")
async def create_transaction(
    transaction: Optional[TransactionCreatePayload] = Body(None),
    user_id: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    user_id_query: Optional[str] = Query(None),
):
    final_user_id = user_id or user_id_query or (transaction.user_id if transaction else None)
    if not final_user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    if transaction:
        trans_data = transaction.model_dump(exclude={"user_id"})
    else:
        if category is None or amount is None:
            raise HTTPException(status_code=400, detail="category and amount are required")
        trans_data = {
            "category": category,
            "amount": amount,
            "description": description,
        }
        if date:
            try:
                trans_data["date"] = datetime.fromisoformat(date)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Invalid date format") from exc

    if not trans_data.get('date'):
        trans_data['date'] = datetime.now(timezone.utc)

    trans_obj = Transaction(user_id=final_user_id, **trans_data)
    doc = trans_obj.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.transactions.insert_one(doc)
    return trans_obj

@api_router.get("/transactions/{user_id}")
async def get_transactions(user_id: str, limit: int = 50):
    transactions = await db.transactions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    for trans in transactions:
        if isinstance(trans.get('date'), str):
            trans['date'] = datetime.fromisoformat(trans['date'])
        if isinstance(trans.get('created_at'), str):
            trans['created_at'] = datetime.fromisoformat(trans['created_at'])
    
    return transactions

@api_router.post("/scan-document")
async def scan_document(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"ocr_{uuid.uuid4()}",
            system_message="You are an OCR assistant. Extract all numbers from the document and categorize them as Sales, Purchase, or Expense. Return JSON format with categories and amounts."
        ).with_model("openai", "gpt-4o")
        
        image_content = ImageContent(image_base64=base64_image)
        user_message = UserMessage(
            text="Extract all numbers from this document. Identify which are Sales, Purchase, or Expense amounts. Return as JSON: {\"sales\": [amounts], \"purchase\": [amounts], \"expense\": [amounts]}",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        import json
        try:
            extracted_data = json.loads(response.replace('```json', '').replace('```', '').strip())
        except:
            extracted_data = {"raw_text": response}
        
        doc_scan = DocumentScan(
            user_id=user_id,
            filename=file.filename,
            extracted_data=extracted_data
        )
        
        doc = doc_scan.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.document_scans.insert_one(doc)
        
        return {
            "message": "Document scanned successfully",
            "extracted_data": extracted_data,
            "scan_id": doc_scan.id
        }
    
    except Exception as e:
        logging.error(f"Error scanning document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate-report/{user_id}")
async def generate_daily_report(user_id: str, date: Optional[str] = None):
    try:
        if date:
            report_date = datetime.fromisoformat(date)
        else:
            report_date = datetime.now(timezone.utc)
        
        start_of_day = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        transactions = await db.transactions.find(
            {
                "user_id": user_id,
                "date": {
                    "$gte": start_of_day.isoformat(),
                    "$lt": end_of_day.isoformat()
                }
            },
            {"_id": 0}
        ).to_list(1000)
        
        sales_total = sum(t['amount'] for t in transactions if t['category'].lower() == 'sales')
        purchase_total = sum(t['amount'] for t in transactions if t['category'].lower() == 'purchase')
        expense_total = sum(t['amount'] for t in transactions if t['category'].lower() == 'expense')
        net_amount = sales_total - purchase_total - expense_total
        
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"insights_{uuid.uuid4()}",
            system_message="You are a business insights assistant. Provide insights in Hindi and English mix for Indian business owners."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Daily Business Report:
- Sales: ₹{sales_total:,.2f}
- Purchase: ₹{purchase_total:,.2f}
- Expense: ₹{expense_total:,.2f}
- Net: ₹{net_amount:,.2f}

Provide:
1. Brief insights in Hindi-English mix (2-3 sentences)
2. Exactly 5 action points for tomorrow in Hindi

Format as JSON: {{\"insights\": \"text\", \"action_points\": [\"point1\", \"point2\", \"point3\", \"point4\", \"point5\"]}}"""
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        import json
        try:
            ai_data = json.loads(response.replace('```json', '').replace('```', '').strip())
            insights = ai_data.get('insights', 'No insights available')
            action_points = ai_data.get('action_points', [])
        except:
            insights = response[:500]
            action_points = ["रिपोर्ट की समीक्षा करें", "खर्च कम करें", "बिक्री बढ़ाएं", "स्टॉक जांचें", "ग्राहक संपर्क करें"]
        
        report = DailyReport(
            user_id=user_id,
            date=report_date,
            sales_total=sales_total,
            purchase_total=purchase_total,
            expense_total=expense_total,
            net_amount=net_amount,
            insights=insights,
            action_points=action_points
        )
        
        doc = report.model_dump()
        doc['date'] = doc['date'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.daily_reports.insert_one(doc)
        
        return report
    
    except Exception as e:
        logging.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/reports/{user_id}")
async def get_reports(user_id: str, limit: int = 30):
    reports = await db.daily_reports.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    for report in reports:
        if isinstance(report.get('date'), str):
            report['date'] = datetime.fromisoformat(report['date'])
        if isinstance(report.get('created_at'), str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    
    return reports

@api_router.get("/analytics/{user_id}")
async def get_analytics(user_id: str, days: int = 30):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    transactions = await db.transactions.find(
        {
            "user_id": user_id,
            "date": {"$gte": start_date.isoformat()}
        },
        {"_id": 0}
    ).to_list(10000)
    
    daily_data = {}
    for trans in transactions:
        trans_date = trans['date'][:10] if isinstance(trans['date'], str) else trans['date'].date().isoformat()
        if trans_date not in daily_data:
            daily_data[trans_date] = {"sales": 0, "purchase": 0, "expense": 0}
        
        category = trans['category'].lower()
        if category in daily_data[trans_date]:
            daily_data[trans_date][category] += trans['amount']
    
    sorted_dates = sorted(daily_data.keys())
    chart_data = [
        {
            "date": date,
            "sales": daily_data[date]['sales'],
            "purchase": daily_data[date]['purchase'],
            "expense": daily_data[date]['expense']
        }
        for date in sorted_dates
    ]
    
    total_sales = sum(t['amount'] for t in transactions if t['category'].lower() == 'sales')
    total_purchase = sum(t['amount'] for t in transactions if t['category'].lower() == 'purchase')
    total_expense = sum(t['amount'] for t in transactions if t['category'].lower() == 'expense')
    
    return {
        "chart_data": chart_data,
        "totals": {
            "sales": total_sales,
            "purchase": total_purchase,
            "expense": total_expense,
            "net": total_sales - total_purchase - total_expense
        }
    }

@api_router.post("/voice/transcribe")
async def transcribe_voice(voice_input: VoiceInput):
    try:
        return {
            "text": "यह एक नमूना प्रतिलेख है",
            "language": "hi"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/voice/speak")
async def text_to_speech(tts_input: TextToSpeech):
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"tts_{uuid.uuid4()}",
            system_message="Convert text to speech."
        ).with_model("openai", "gpt-4o")
        
        return {
            "audio_url": None,
            "text": tts_input.text,
            "message": "TTS feature available - voice synthesis"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
