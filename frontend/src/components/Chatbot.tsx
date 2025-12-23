import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, FileText, AlertTriangle, Clock, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import PoliceIcon from './PoliceIcon';
import { createFIR } from '../api/firService';

const BACKEND_URL = import.meta.env.VITE_CHATBOT_API_BASE_URL || "http://localhost:8000";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ExtractedDetails {
  victim?: string;
  accused?: string;
  incident?: string;
  date?: string;
  time?: string;
  location?: string;
  caseType?: string;
  confidence?: number;
}

interface IPCSuggestion {
  section_number: string;
  section_label: string;
  offense: string;
  description: string;
  punishment: string;
}

interface DraftFIR {
  firNumber: string;
  victim: string;
  accused: string;
  incident: string;
  date: string;
  time: string;
  location: string;
  ipcSections: string[];
  description: string;
}

const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content:
        "👋 Hello! I'm your AI Legal Assistant. Describe the incident or ask any legal question — I’ll analyze it and suggest relevant IPC sections.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftFIR, setDraftFIR] = useState<DraftFIR | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognitionType = typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

    if (!SpeechRecognitionType) return;

    const rec = new SpeechRecognitionType();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInputText(transcript.trim());
    };

    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, []);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const simulateTyping = async (delay = 1500) => {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, delay));
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isFetching || isGenerating) return;
    
    addMessage({ type: 'user', content: inputText });

    const userInput = inputText;
    setInputText('');

    await simulateTyping(500);
    await processIncident(userInput);
  };

  const processIncident = async (incident: string) => {
    setIsFetching(true);
    try {
      const res = await fetch(`${BACKEND_URL}/predict_top3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_text: incident }),
      });

      if (!res.ok) {
        let detail = 'Error analyzing case.';
        try { detail = (await res.json()).detail || detail; } catch {}
        throw new Error(detail);
      }

      const data = await res.json();
      const suggestions: IPCSuggestion[] = data.ipc_suggestions || [];
      const pretty = suggestions.length
        ? suggestions.map((s, i) =>
            `${i + 1}. ${s.section_label}\n   Offense: ${s.offense}\n   Punishment: ${s.punishment}`
          ).join('\n\n')
        : 'No IPC suggestions found.';

      addMessage({
        type: 'bot',
        content: `🧾 Here's the AI legal analysis:\n\n${pretty}\n\nWould you like me to generate a draft FIR for this?`,
        data: { showConfirmation: true, suggestions },
      });
      
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      addMessage({
        type: 'bot',
        content: `⚠️ Sorry, something went wrong while analyzing the case.\n\nError: ${error.message}`,
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerateDraft = (sugs: IPCSuggestion[]) => {
    setIsGenerating(true);
    addMessage({ type: 'bot', content: '🛠 Generating draft…' });

    setTimeout(() => {
      const summary = sugs.map(s =>
        `${s.section_label}\nOffense: ${s.offense}\nPunishment: ${s.punishment}\n`
      ).join('\n');
      const draft: DraftFIR = {
        firNumber: `FIR/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
        victim: 'N/A',
        accused: 'N/A',
        incident: 'Auto-generated from analysis',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        location: 'Unknown',
        ipcSections: sugs.map(s => s.section_label),
        description: summary,
      };

      setDraftFIR(draft);
      setShowDraftModal(true);
      setIsGenerating(false);

      addMessage({
        type: 'bot',
        content: '✅ Draft FIR Generated Successfully. Please review it before submitting for inspector approval.',
      });

      // Submit draft to backend (status: pending)
      const payload = {
        ...draft,
        createdBy: user?.email || 'user',
      };
      createFIR(payload)
        .then(() => {
          addNotification({
            title: 'FIR Submitted',
            message: `${draft.firNumber} sent for inspector approval.`,
            type: 'success',
          });
        })
        .catch((err: any) => {
          addNotification({
            title: 'Error',
            message: err?.message || 'Failed to submit FIR',
            type: 'error',
          });
        });
    }, 500);
  };

  const handleSubmitDraft = () => {
    if (!draftFIR) return;

    addNotification({
      title: 'FIR Draft Submitted',
      message: `${draftFIR.firNumber} has been sent for inspector review.`,
      type: 'success',
    });

    addMessage({
      type: 'bot',
      content: `🎉 Draft FIR ${draftFIR.firNumber} has been sent for inspector review. You'll be notified once it's approved.`,
    });

    setShowDraftModal(false);
    setDraftFIR(null);
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch {
        // ignore double start
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* CHAT BODY */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl p-4 space-y-6 pb-[104px] sm:pb-[96px]">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`w-full break-words [overflow-wrap:anywhere] rounded-3xl px-6 py-4 shadow-md ${
                m.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <div className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg whitespace-pre-wrap">
                {m.content}
              </div>

              {m.data?.showConfirmation && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleGenerateDraft(m.data.suggestions)}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Yes, Generate Draft FIR
                  </button>
                  <button 
                    disabled={isGenerating}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Not Now
                  </button>
                </div>
              )}
              {isGenerating && m.data?.showConfirmation && (
                <div className="mt-2 text-sm text-slate-400 animate-pulse">Preparing draft…</div>
              )}
            </div>
          </div>
        ))}
        {(isFetching || isTyping) && (
          <div className="flex items-center space-x-2 text-slate-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/>
            </svg>
            <span>{isFetching ? 'Analyzing...' : 'Typing...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="sticky bottom-0 z-20 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-4xl flex items-center gap-3 p-4">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isFetching || isGenerating}
            placeholder="Describe the incident..."
            className="flex-1 px-6 py-4 rounded-3xl border-2 border-slate-300 dark:border-slate-600 text-base dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
          />
          <button
            onClick={handleVoiceToggle}
            disabled={isFetching || isGenerating}
            aria-pressed={isRecording}
            className={`relative p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700'
            }`}
          >
            {isRecording && (
              <>
                <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-red-400 animate-ping" />
                <span className="pointer-events-none absolute -inset-1 rounded-full bg-red-500/20 animate-pulse" />
              </>
            )}
            {isRecording ? <MicOff /> : <Mic />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isFetching || isGenerating || !inputText.trim()}
            aria-busy={isFetching}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send />
          </button>
        </div>
      </div>

      {/* FIR MODAL */}
      {showDraftModal && draftFIR && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl border dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Draft FIR Preview</h3>
              <button onClick={() => setShowDraftModal(false)}>
                <X />
              </button>
            </div>
            <textarea
              value={draftFIR.description}
              rows={10}
              onChange={(e) =>
                setDraftFIR((prev) => (prev ? { ...prev, description: e.target.value } : null))
              }
              className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:text-white"
            />
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-600 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDraft}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
