// Component that displays translated text and speaks it in the selected language
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import SpeakButton from './SpeakButton';

const TranslatedSpeakButton = ({
  text,
  className = '',
  showText = true,
  speakButtonClassName = ''
}) => {
  const { t } = useTranslation();
  const [displayText, setDisplayText] = useState(text);

  // The translation hook should handle the translation
  // We just need to get the translated version for speaking

  return (
    <div className={`translated-speak-container ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%'
    }}>
      {showText && (
        <span className="translated-text" style={{
          flex: 1,
          color: '#1e293b',
          fontSize: '0.95rem'
        }}>
          {t(text)}
        </span>
      )}
      <SpeakButton
        text={t(text)}
        className={speakButtonClassName}
      />
    </div>
  );
};

export default TranslatedSpeakButton;
