import requests
import sys
import json
import base64
from datetime import datetime
from pathlib import Path

class SudarshanAPITester:
    def __init__(self, base_url="https://voice-insight-hub-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=30)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {"message": "Success but no JSON response"}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "username": f"test_user_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'user_id' in response:
            self.user_id = response['user_id']
            print(f"   Registered user ID: {self.user_id}")
            return True, user_data
        return False, {}

    def test_user_login(self, user_data):
        """Test user login"""
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'user_id' in response:
            self.user_id = response['user_id']
            return True
        return False

    def test_create_transaction(self):
        """Test creating a transaction"""
        if not self.user_id:
            print("❌ No user_id available for transaction test")
            return False
            
        # The API has a design issue - it expects both JSON body and form field
        # Let's try a different approach - send as multipart with JSON content
        import json
        
        transaction_data = {
            "category": "sales",
            "amount": 1000.0,
            "description": "Test sales transaction"
        }
        
        # Try sending as multipart form data
        files = {
            'user_id': (None, self.user_id),
        }
        
        # Send JSON in the body
        success, response = self.run_test(
            "Create Transaction",
            "POST",
            "transactions",
            200,
            data=transaction_data,
            files=files
        )
        return success

    def test_get_transactions(self):
        """Test getting user transactions"""
        if not self.user_id:
            print("❌ No user_id available for get transactions test")
            return False
            
        success, response = self.run_test(
            "Get Transactions",
            "GET",
            f"transactions/{self.user_id}",
            200
        )
        return success

    def test_document_scan(self):
        """Test document scanning with OCR"""
        if not self.user_id:
            print("❌ No user_id available for document scan test")
            return False
            
        # Create a simple test image (1x1 PNG)
        test_image_data = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')
        
        files = {
            'file': ('test.png', test_image_data, 'image/png')
        }
        data = {
            'user_id': self.user_id
        }
        
        success, response = self.run_test(
            "Document Scan OCR",
            "POST",
            "scan-document",
            200,
            data=data,
            files=files
        )
        return success

    def test_generate_report(self):
        """Test generating daily report"""
        if not self.user_id:
            print("❌ No user_id available for generate report test")
            return False
            
        success, response = self.run_test(
            "Generate Daily Report",
            "POST",
            f"generate-report/{self.user_id}",
            200
        )
        return success

    def test_get_reports(self):
        """Test getting user reports"""
        if not self.user_id:
            print("❌ No user_id available for get reports test")
            return False
            
        success, response = self.run_test(
            "Get Reports",
            "GET",
            f"reports/{self.user_id}",
            200
        )
        return success

    def test_get_analytics(self):
        """Test getting analytics data"""
        if not self.user_id:
            print("❌ No user_id available for analytics test")
            return False
            
        success, response = self.run_test(
            "Get Analytics",
            "GET",
            f"analytics/{self.user_id}?days=7",
            200
        )
        return success

    def test_voice_transcribe(self):
        """Test voice transcription"""
        if not self.user_id:
            print("❌ No user_id available for voice transcribe test")
            return False
            
        voice_data = {
            "audio_base64": "dGVzdCBhdWRpbyBkYXRh",  # base64 encoded "test audio data"
            "user_id": self.user_id
        }
        
        success, response = self.run_test(
            "Voice Transcribe",
            "POST",
            "voice/transcribe",
            200,
            data=voice_data
        )
        return success

    def test_text_to_speech(self):
        """Test text to speech"""
        tts_data = {
            "text": "नमस्ते, यह एक परीक्षण है",
            "language": "hi"
        }
        
        success, response = self.run_test(
            "Text to Speech",
            "POST",
            "voice/speak",
            200,
            data=tts_data
        )
        return success

def main():
    print("🚀 Starting Sudarshan AI Portal API Tests")
    print("=" * 50)
    
    tester = SudarshanAPITester()
    
    # Test sequence
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("User Registration", tester.test_user_registration),
        ("Create Transaction", tester.test_create_transaction),
        ("Get Transactions", tester.test_get_transactions),
        ("Document Scan OCR", tester.test_document_scan),
        ("Generate Report", tester.test_generate_report),
        ("Get Reports", tester.test_get_reports),
        ("Get Analytics", tester.test_get_analytics),
        ("Voice Transcribe", tester.test_voice_transcribe),
        ("Text to Speech", tester.test_text_to_speech)
    ]
    
    user_data = None
    
    for test_name, test_func in tests:
        try:
            if test_name == "User Registration":
                success, user_data = test_func()
                if success and user_data:
                    # Test login with the registered user
                    tester.test_user_login(user_data)
            else:
                test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            tester.failed_tests.append({
                "test": test_name,
                "error": str(e)
            })

    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"  - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())