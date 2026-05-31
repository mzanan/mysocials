export interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechSupported = (): boolean => getCtor() !== null;

export function createRecognition(lang: string): Recognition | null {
  const Ctor = getCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  return recognition;
}

export function transcriptFrom(event: SpeechResultEvent): string {
  return event.results?.[0]?.[0]?.transcript ?? "";
}
