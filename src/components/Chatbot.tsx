import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Mic, MicOff, Volume2, Languages } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type Language = 'en' | 'bn';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! Welcome to Splendour. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { siteConfig, products } = useStore();

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(undefined, transcript);
      };
      recognition.start();
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };

  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].role === 'model') {
       // Optional: Auto-speak last message
       // speak(messages[messages.length - 1].text);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const productContext = products.map(p => `${p.name} (${p.category}): ${p.price} BDT. ${p.description}`).join('\n');
      
      const systemInstruction = `You are a friendly AI shopping assistant for "Splendour", a premium streetwear brand based in Dhaka, Bangladesh. 
      Your tone is helpful, friendly, and knowledgeable.
      Support both English and Bengali. If the user speaks in Bengali, respond in Bengali.
      Help customers with product information, size guides, and order information.
      Current Products:
      ${productContext}
      
      Keep responses natural and helpful.
      If someone asks for an invoice, tell them they can find it in their profile after logging in.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: messageToSend }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const aiText = response.text || "Sorry, I lost connection. I am here to help!";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error('Chat AI Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!siteConfig.isChatbotEnabled) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-brand-card/95 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-brand-red/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red rounded-2xl flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black uppercase tracking-tighter text-lg leading-none">Splendour AI</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Always active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-brand-muted flex items-center gap-1.5"
                  title="Switch Language"
                >
                  <Languages size={16} />
                  <span className="text-[10px] font-black uppercase">{language}</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} className="text-brand-muted" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center",
                      m.role === 'user' ? "bg-white/10" : "bg-brand-red/10 text-brand-red"
                    )}>
                      {m.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                      {m.role === 'user' ? 'Client' : 'Collective AI'}
                    </span>
                  </div>
                  <div className={cn(
                    "p-4 rounded-3xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-brand-red text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-brand-muted rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start mr-auto max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-brand-red/10 text-brand-red rounded-lg flex items-center justify-center">
                      <Loader2 size={12} className="animate-spin" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted animate-pulse">Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-black/20">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={language === 'en' ? "Ask me anything..." : "কিছু জিজ্ঞাসা করুন..."}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-brand-red transition-all"
                  />
                  <button 
                    type="button"
                    onClick={startListening}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                      isListening ? "bg-brand-red text-white animate-pulse" : "text-brand-muted hover:bg-white/5"
                    )}
                  >
                    {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-4 bg-brand-red text-white rounded-2xl hover:bg-brand-accent-dark transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <p className="text-[8px] font-black uppercase tracking-widest text-brand-muted/30">Trusted Shopping Assistant</p>
                {messages.length > 1 && messages[messages.length - 1].role === 'model' && (
                  <button 
                    onClick={() => speak(messages[messages.length - 1].text)}
                    className="p-1 hover:text-brand-red transition-colors text-brand-muted"
                    title="Read Aloud"
                  >
                    <Volume2 size={12} />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-300",
          isOpen ? "bg-white text-black rotate-90" : "bg-brand-red text-white shadow-brand-red/20"
        )}
      >
        {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
      </motion.button>
    </div>
  );
}
