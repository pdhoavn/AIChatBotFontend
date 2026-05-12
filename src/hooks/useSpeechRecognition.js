import { useCallback, useEffect, useRef, useState } from "react";

const SPEECH_LANG = "vi-VN";

/**
 * Kiểm tra SpeechRecognition API thực sự khả dụng.
 *
 * Browser support (caniuse.com/speech-recognition):
 *   Chrome desktop/Android ✅ (webkit prefix)
 *   Safari 14.1+ / iOS 14.5+ ✅ (webkit prefix)
 *   Edge desktop ❌ (Chromium nhưng MS đã bỏ)
 *   Opera desktop ❌
 *   Firefox ❌ (disabled by default)
 *
 * Trên browser không hỗ trợ → isSupported = false → UI hiện nút mic disabled
 * hoặc ẩn, kèm tooltip "Trình duyệt không hỗ trợ".
 */
function detectSpeechRecognition() {
  if (typeof window === "undefined") return null;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;

  // Thử tạo instance — đảm bảo API thực sự hoạt động
  try {
    const test = new SR();
    test.abort();
    return SR;
  } catch {
    return null;
  }
}

/**
 * Custom hook dùng native SpeechRecognition API trực tiếp.
 *
 * @returns {{
 *   isListening: boolean,
 *   isSupported: boolean,
 *   transcript: string,
 *   interimTranscript: string,
 *   error: string|null,
 *   startListening: () => void,
 *   stopListening: () => void,
 *   clearTranscript: () => void,
 * }}
 */
export default function useSpeechRecognitionST() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const previousTranscriptRef = useRef("");
  const nativeSRRef = useRef(detectSpeechRecognition());

  const isSupported = !!nativeSRRef.current;

  // Tạo instance mới mỗi lần start (tránh singleton bị stuck trên HTTPS)
  const startListening = useCallback(() => {
    const NativeSR = nativeSRRef.current;
    if (!NativeSR) {
      setError("not-supported");
      return;
    }

    setError(null);

    // Dừng instance cũ nếu còn
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    previousTranscriptRef.current = transcript;

    let recognition;
    try {
      recognition = new NativeSR();
    } catch (err) {
      console.error("[SpeechRecognition] Cannot create instance:", err);
      setError("not-supported");
      return;
    }

    recognition.lang = SPEECH_LANG;
    recognition.interimResults = true;

    // continuous = true cho phép nghe liên tục
    // Một số browser có thể không hỗ trợ → graceful fallback
    try { recognition.continuous = true; } catch { /* ignore */ }

    // Timeout: nếu onstart không fire trong 3s → browser có API stub nhưng không hoạt động
    let startTimeout = null;

    recognition.onstart = () => {
      clearTimeout(startTimeout);
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setTranscript(finalText || interimText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      clearTimeout(startTimeout);
      const errType = event.error;
      console.warn("[SpeechRecognition] error:", errType);

      // no-speech: mic hoạt động nhưng user chưa nói → chờ tiếp
      if (errType === "no-speech") return;

      // Map lỗi cụ thể
      const errorMap = {
        "not-allowed": "not-allowed",
        "service-not-allowed": "not-allowed",
        "network": "network",
        "audio-capture": "no-mic",
        "aborted": null, // user chủ động dừng
      };

      const mapped = errType in errorMap ? errorMap[errType] : errType;
      if (mapped) setError(mapped);

      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      clearTimeout(startTimeout);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();

      // Nếu sau 3s onstart chưa fire → coi như không hỗ trợ
      startTimeout = setTimeout(() => {
        if (!recognitionRef.current) return;
        console.warn("[SpeechRecognition] start timeout — browser API stub without backend");
        try { recognition.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
        setIsListening(false);
        setError("network");
      }, 3000);
    } catch (err) {
      console.error("[SpeechRecognition] start() failed:", err);
      clearTimeout(startTimeout);
      setError("start-failed");
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    previousTranscriptRef.current = "";
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  const displayTranscript = transcript || previousTranscriptRef.current;

  return {
    isListening,
    isSupported,
    isMicrophoneAvailable: true,
    transcript: displayTranscript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    /** "not-allowed" | "network" | "no-mic" | "not-supported" | "start-failed" | null */
    error,
  };
}
