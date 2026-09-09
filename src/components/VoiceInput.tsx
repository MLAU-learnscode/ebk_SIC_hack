import { useEffect, useRef, useState } from 'react';

/**
 * Speech-to-text via the browser's built-in Web Speech API.
 * No key, no dependency, no cost (CONTEXT.md §7). Chrome and Edge support it;
 * everywhere else this button simply does not render, and typing still works.
 *
 * Deliberate choices:
 *  - never auto-submits; the founder reads what was heard and presses continue
 *  - no time limit; recording stops when they stop it
 *  - status is announced politely so a screen-reader user knows it is listening
 */

type SR = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SR | null {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.continuous = true;
  r.interimResults = true;
  r.lang = 'en-SG';
  return r;
}

export function voiceSupported(): boolean {
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export default function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const ref = useRef<SR | null>(null);

  useEffect(() => {
    setSupported(voiceSupported());
    return () => ref.current?.stop();
  }, []);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      ref.current?.stop();
      setListening(false);
      return;
    }
    const r = getRecognition();
    if (!r) return;
    ref.current = r;
    r.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      onTranscript(text);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    setListening(true);
  }

  return (
    <>
      <button
        type="button"
        className={listening ? 'btn' : 'btn btn-secondary'}
        onClick={toggle}
        aria-pressed={listening}
      >
        <span aria-hidden="true">{listening ? '■' : '🎙'}</span>
        {listening ? 'Stop recording' : 'Speak your answer'}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {listening ? 'Listening. Your words appear in the box as you speak.' : ''}
      </span>
    </>
  );
}
