import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, FileText, Scale, AlertTriangle, CheckCircle, Clock, MapPin, Calendar, X, CreditCard as Edit3, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import PoliceIcon from './PoliceIcon';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ExtractedDetails {
  victim: string;
  accused: string;
  incident: string;
  date: string;
  time: string;
  location: string;
  caseType: 'criminal' | 'civil';
  confidence: number;
}

interface IPCSection {
  section: string;
  offense: string;
  punishment: string;
  bailable: boolean;
  confidence: number;
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
      content: 'Hello! I\'m your AI Legal Assistant. I can help you draft FIRs by analyzing incident descriptions and predicting relevant IPC sections. Please describe the incident or ask any legal query.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftFIR, setDraftFIR] = useState<DraftFIR | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (delay: number = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: inputText
    });

    const userInput = inputText;
    setInputText('');

    // Simulate AI processing
    await simulateTyping();
    await processIncident(userInput);
  };

  const processIncident = async (incident: string) => {
    // Simulate AI extraction and legal analysis
    const mockExtraction: ExtractedDetails = {
      victim: 'Rahul Sharma',
      accused: 'Unknown person',
      incident: 'Theft of mobile phone and wallet',
      date: new Date().toISOString().split('T')[0],
      time: '21:30',
      location: 'Sector 14 Market, Near Metro Station',
      caseType: 'criminal',
      confidence: 94.2
    };

    const mockSections: IPCSection[] = [
      {
        section: 'IPC 379',
        offense: 'Theft',
        punishment: 'Up to 3 years imprisonment',
        bailable: true,
        confidence: 96.8
      },
      {
        section: 'IPC 356',
        offense: 'Assault or criminal force in attempt to commit theft',
        punishment: 'Up to 7 years imprisonment',
        bailable: false,
        confidence: 87.3
      }
    ];

    // Add analysis response
    addMessage({
      type: 'bot',
      content: `I've analyzed your incident description. Here's what I found:

**Case Classification:** ${mockExtraction.caseType.toUpperCase()} (${mockExtraction.confidence}% confidence)

**Key Details Extracted:**
• Victim: ${mockExtraction.victim}
• Accused: ${mockExtraction.accused}
• Incident: ${mockExtraction.incident}
• Location: ${mockExtraction.location}

**Recommended IPC Sections:**`,
      data: { extraction: mockExtraction, sections: mockSections }
    });

    // Wait a bit then ask for confirmation
    await simulateTyping(1000);
    
    addMessage({
      type: 'bot',
      content: '**Would you like me to generate a draft FIR for this incident?**\n\nI can create a structured FIR document with all the extracted details and recommended sections for your review.',
      data: { showConfirmation: true, extraction: mockExtraction, sections: mockSections }
    });
  };

  const handleGenerateDraft = (extraction: ExtractedDetails, sections: IPCSection[]) => {
    const draft: DraftFIR = {
      firNumber: `FIR/2025/${String(Date.now()).slice(-6)}`,
      victim: extraction.victim,
      accused: extraction.accused,
      incident: extraction.incident,
      date: extraction.date,
      time: extraction.time,
      location: extraction.location,
      ipcSections: sections.map(s => s.section),
      description: `Incident of ${extraction.incident} reported by ${extraction.victim}. The accused ${extraction.accused} committed the offense at ${extraction.location} on ${extraction.date} at ${extraction.time}.`
    };

    setDraftFIR(draft);
    setShowDraftModal(true);

    addMessage({
      type: 'bot',
      content: '✅ **Draft FIR Generated Successfully!**\n\nI\'ve created a structured FIR document with all the details. Please review the draft in the modal that just opened. You can edit any details before submitting for inspector approval.'
    });
  };

  const handleSubmitDraft = () => {
    if (!draftFIR) return;

    addNotification({
      title: 'FIR Draft Submitted',
      message: `${draftFIR.firNumber} has been sent to Inspector for review`,
      type: 'success'
    });

    addMessage({
      type: 'bot',
      content: `🎉 **Your draft FIR has been sent to the Inspector for review.**\n\n**FIR Number:** ${draftFIR.firNumber}\n**Status:** Pending Inspector Approval\n\nYou'll receive a notification once the Inspector reviews your submission.`
    });

    setShowDraftModal(false);
    setDraftFIR(null);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setInputText("I want to report a theft incident that happened at Sector 14 market yesterday evening around 9 PM. Someone stole my mobile phone and wallet while I was walking near the metro station.");
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-xl p-2.5 shadow-lg">
            <PoliceIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              AI Legal Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Smart FIR Drafting System
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all duration-200"
          />
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
                    : 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-3xl px-6 py-4 shadow-lg animate-fade-in ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed font-medium">
                      {message.content}
                    </p>
                  </div>

                  {/* Extracted Details */}
                  {message.data?.extraction && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span><strong>Victim:</strong> {message.data.extraction.victim}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span><strong>Accused:</strong> {message.data.extraction.accused}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span><strong>Location:</strong> {message.data.extraction.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span><strong>Time:</strong> {message.data.extraction.date} at {message.data.extraction.time}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IPC Sections */}
                  {message.data?.sections && (
                    <div className="mt-4 space-y-3">
                      {message.data.sections.map((section: IPCSection, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">
                                {section.section}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                section.bailable 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                              }`}>
                                {section.bailable ? 'Bailable' : 'Non-Bailable'}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {section.confidence}% confidence
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">{section.offense}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Punishment:</strong> {section.punishment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Confirmation Buttons */}
                  {message.data?.showConfirmation && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleGenerateDraft(message.data.extraction, message.data.sections)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Yes, Generate Draft FIR</span>
                      </button>
                      <button className="px-6 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all duration-200">
                        Not Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-11">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl px-6 py-4 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the incident or ask a legal query…"
                className="w-full px-6 py-4 pr-24 border-2 border-slate-300 dark:border-slate-600 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg font-medium placeholder:text-slate-400 text-base transition-all duration-200 resize-none"
                disabled={isTyping}
              />
              
              {/* Voice Button */}
              <button
                onClick={handleVoiceToggle}
                className={`absolute right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Input'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 font-medium">
            Press Enter to send • Click 🎤 for voice input • AI will analyze and suggest IPC sections
          </p>
        </div>
      </div>

      {/* Draft FIR Modal */}
      {showDraftModal && draftFIR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-2.5 shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Draft FIR Preview</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review and edit before submission</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDraftModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">FIR Number</label>
                  <input
                    type="text"
                    value={draftFIR.firNumber}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date & Time</label>
                  <input
                    type="text"
                    value={`${draftFIR.date} at ${draftFIR.time}`}
                    onChange={(e) => setDraftFIR(prev => prev ? {...prev, date: e.target.value.split(' at ')[0], time: e.target.value.split(' at ')[1]} : null)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Victim Name</label>
                <input
                  type="text"
                  value={draftFIR.victim}
                  onChange={(e) => setDraftFIR(prev => prev ? {...prev, victim: e.target.value} : null)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Accused</label>
                <input
                  type="text"
                  value={draftFIR.accused}
                  onChange={(e) => setDraftFIR(prev => prev ? {...prev, accused: e.target.value} : null)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={draftFIR.location}
                  onChange={(e) => setDraftFIR(prev => prev ? {...prev, location: e.target.value} : null)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">IPC Sections</label>
                <div className="flex flex-wrap gap-2">
                  {draftFIR.ipcSections.map((section, index) => (
                    <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Incident Description</label>
                <textarea
                  value={draftFIR.description}
                  onChange={(e) => setDraftFIR(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-4">
              <button
                onClick={() => setShowDraftModal(false)}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDraft}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
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