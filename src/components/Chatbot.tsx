import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  FileText, 
  Scale,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

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
}

interface IPCSection {
  section: string;
  offense: string;
  punishment: string;
  bailable: boolean;
  court: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI Legal Assistant. Please describe the incident or complaint you need to file an FIR for. I can help you extract key details and suggest appropriate IPC sections.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<ExtractedDetails | null>(null);
  const [suggestedSections, setSuggestedSections] = useState<IPCSection[]>([]);
  const [showFIRGenerate, setShowFIRGenerate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI processing
    setTimeout(() => {
      processComplaint(inputText);
    }, 1000);
  };

  const processComplaint = (complaint: string) => {
    // Simulate AI extraction and legal analysis
    const mockExtraction: ExtractedDetails = {
      victim: 'Rahul Sharma',
      accused: 'Unknown person',
      incident: 'Theft of mobile phone and wallet',
      date: '2025-01-12',
      time: '21:30',
      location: 'Sector 14 Market, Near Metro Station'
    };

    const mockSections: IPCSection[] = [
      {
        section: 'IPC 379',
        offense: 'Theft',
        punishment: 'Up to 3 years imprisonment',
        bailable: true,
        court: 'Magistrate Court'
      },
      {
        section: 'IPC 356',
        offense: 'Assault or criminal force in attempt to commit theft',
        punishment: 'Up to 7 years imprisonment',
        bailable: false,
        court: 'Sessions Court'
      }
    ];

    setExtractedDetails(mockExtraction);
    setSuggestedSections(mockSections);

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: 'I\'ve analyzed your complaint and extracted the key details. Please review the information below and the suggested IPC sections.',
      timestamp: new Date(),
      data: { extraction: mockExtraction, sections: mockSections }
    };

    setMessages(prev => [...prev, botResponse]);
    setShowFIRGenerate(true);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const generateFIR = () => {
    // Navigate to FIR preview - implement routing
    console.log('Generating FIR with:', { extractedDetails, suggestedSections });
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-6 rounded-t-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-xl p-3 shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">AI Legal Assistant</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Powered by advanced NLP for legal documentation</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl w-full ${message.type === 'user' ? 'ml-auto' : ''}`}>
              <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl shadow-lg ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {message.timestamp.toLocaleTimeString()}
                  </p>

                  {/* Extracted Details */}
                  {message.data?.extraction && (
                    <div className="mt-4 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl p-5 border border-blue-200 dark:border-blue-800 shadow-lg">
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Extracted Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium"><strong>Victim:</strong> {message.data.extraction.victim}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-medium"><strong>Accused:</strong> {message.data.extraction.accused}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span className="font-medium"><strong>Incident:</strong> {message.data.extraction.incident}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-600" />
                          <span className="font-medium"><strong>Date & Time:</strong> {message.data.extraction.date} at {message.data.extraction.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 col-span-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="font-medium"><strong>Location:</strong> {message.data.extraction.location}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IPC Sections */}
                  {message.data?.sections && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Scale className="w-4 h-4 mr-2" />
                        Recommended IPC Sections
                      </h4>
                      {message.data.sections.map((section: IPCSection, index: number) => (
                        <div key={index} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
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
                              <h5 className="font-bold text-slate-900 dark:text-white mb-2">{section.offense}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                <strong>Punishment:</strong> {section.punishment}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                <strong>Court:</strong> {section.court}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Generate FIR Button */}
        {showFIRGenerate && (
          <div className="flex justify-center pt-6">
            <button
              onClick={generateFIR}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-3 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            >
              <FileText className="w-6 h-6" />
              <span className="text-lg">Generate FIR Draft</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-6 rounded-b-2xl shadow-lg">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe the incident or complaint in detail..."
              className="w-full px-6 py-4 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium placeholder:text-slate-400"
            />
          </div>
          
          <button
            onClick={handleVoiceToggle}
            className={`p-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-200 dark:shadow-red-900/50' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 hover:shadow-xl"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;