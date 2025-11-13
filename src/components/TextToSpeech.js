// Text-to-Speech Component for Accessibility
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TextToSpeech = ({ text, className = '' }) => {
  const { currentLanguage } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Language to voice mapping for better TTS
  const languageVoiceMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ur': 'ur-IN',
    'sa': 'sa-IN',
    'ks': 'ks-IN',
    'sd': 'sd-IN',
    'ne': 'ne-NP',
    'si': 'si-LK',
  };

  const speak = () => {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
      console.warn('No text to speak');
      return;
    }

    // Function to speak with loaded voices
    const speakText = () => {
      try {
        // Set language
        const lang = languageVoiceMap[currentLanguage] || 'en-US';

        // Get voices and find matching voice
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 TTS: Available voices:', voices.length);
        console.log('🔊 TTS: Current language code:', currentLanguage);
        console.log('🔊 TTS: Looking for voice with locale:', lang);

        // List all available voices for debugging
        voices.forEach(v => console.log(`  - ${v.name} (${v.lang})`));

        // Try multiple matching strategies
        let matchingVoice = null;

        // 1. Try exact match (e.g., 'hi-IN')
        matchingVoice = voices.find(voice => voice.lang === lang);

        // 2. Try language code with dash (e.g., 'hi-' matches 'hi-IN')
        if (!matchingVoice) {
          matchingVoice = voices.find(voice => voice.lang.startsWith(currentLanguage + '-'));
        }

        // 3. Try language code with underscore (e.g., 'hi_' matches 'hi_IN')
        if (!matchingVoice) {
          matchingVoice = voices.find(voice => voice.lang.startsWith(currentLanguage + '_'));
        }

        // 4. Try just the language code (e.g., 'hi')
        if (!matchingVoice) {
          matchingVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(currentLanguage.toLowerCase()));
        }

        // 5. Try case-insensitive search in lang string
        if (!matchingVoice) {
          matchingVoice = voices.find(voice =>
            voice.lang.toLowerCase().includes(currentLanguage.toLowerCase())
          );
        }

        // 6. For Indian languages, try to find any Indian voice
        if (!matchingVoice && lang.includes('-IN')) {
          matchingVoice = voices.find(voice => voice.lang.includes('-IN'));
        }

        // 7. If still no match, try to find any voice that contains the language code
        if (!matchingVoice) {
          matchingVoice = voices.find(voice =>
            voice.lang.toLowerCase().includes(currentLanguage.toLowerCase().substring(0, 2))
          );
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Set language
        utterance.lang = lang;

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
          console.log('🔊 TTS: Started speaking:', text.substring(0, 50) + '...');
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          console.log('🔊 TTS: Finished speaking');
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          console.error('🔊 TTS: Speech error:', event.error);
          if (event.error !== 'interrupted') {
            alert('Text-to-Speech error: ' + event.error);
          }
        };

        // Speak the text
        console.log('🔊 TTS: Speaking text:', text);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error in text-to-speech:', error);
        setIsSpeaking(false);
        alert('Could not read text aloud: ' + error.message);
      }
    };

    // Load voices if not loaded yet
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('🔊 TTS: Voices not loaded yet, waiting...');
      // Voices not loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        console.log('🔊 TTS: Voices loaded!');
        speakText();
      };
      // Also try after a short delay as fallback
      setTimeout(speakText, 100);
    } else {
      speakText();
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <button
      onClick={isSpeaking ? stop : speak}
      className={`tts-button ${className}`}
      type="button"
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
      style={{
        background: isSpeaking 
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        minWidth: '40px',
        height: '36px',
      }}
      onMouseEnter={(e) => {
        if (!isSpeaking) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isSpeaking ? '⏸️' : '🔊'}
    </button>
  );
};

export default TextToSpeech;
