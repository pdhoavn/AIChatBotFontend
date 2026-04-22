import { useCallback, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SPEECH_LANG = "vi-VN";

export default function useSpeechRecognitionST() {
  const previousTranscriptRef = useRef("");

  const {
    transcript,
    interimTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript,
  } = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });

  const isSupported = browserSupportsSpeechRecognition;
  const isListening = listening;

  const startListening = useCallback(() => {
    if (!isSupported) return;
    previousTranscriptRef.current = transcript;
    SpeechRecognition.startListening({
      continuous: false,
      language: SPEECH_LANG,
    });
  }, [isSupported, transcript]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  const clearTranscript = useCallback(() => {
    resetTranscript();
    previousTranscriptRef.current = "";
  }, [resetTranscript]);

  const displayTranscript = transcript || previousTranscriptRef.current;

  return {
    isListening,
    isSupported,
    isMicrophoneAvailable,
    transcript: displayTranscript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
  };
}
