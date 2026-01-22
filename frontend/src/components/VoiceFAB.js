import { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceFAB({ user }) {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleVoiceClick = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setIsListening(true);
      toast.info('आवाज़ सुन रहे हैं... | Listening...');
      
      setTimeout(() => {
        setIsListening(false);
        toast.success('समझ गये! | Got it!');
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <>
      <button
        data-testid="voice-fab"
        onClick={handleVoiceClick}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-2xl flex items-center justify-center z-50 cursor-pointer hover:scale-110 transition-transform animate-pulse-slow"
        aria-label="Voice Assistant"
      >
        {isListening ? (
          <div className="relative">
            <Mic className="h-7 w-7" />
            <div className="absolute inset-0 animate-ping">
              <Mic className="h-7 w-7 opacity-75" />
            </div>
          </div>
        ) : (
          <Volume2 className="h-7 w-7" />
        )}
      </button>

      {isActive && (
        <div
          data-testid="voice-overlay"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => setIsActive(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                {isListening ? (
                  <Mic className="h-12 w-12 text-white animate-pulse" />
                ) : (
                  <MicOff className="h-12 w-12 text-white" />
                )}
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Voice Assistant
              </h3>
              <p className="text-slate-600 mb-6">
                {isListening
                  ? 'बोलिए... | Speak now...'
                  : 'आवाज़ सहायक तैयार है | Voice assistant ready'}
              </p>
              
              {isListening && (
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="h-12 w-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="h-16 w-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="h-20 w-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="h-16 w-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                  <div className="h-12 w-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 text-left">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">Voice Commands:</strong>
                  <br />
                  • "आज की रिपोर्ट बताओ" (Today's report)
                  <br />
                  • "बिक्री कितनी है?" (Sales total?)
                  <br />
                  • "इनसाइट्स सुनाओ" (Read insights)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}