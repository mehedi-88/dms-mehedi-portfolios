'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Bot, Search, Settings, Send, Copy, Sparkles, Loader2 } from 'lucide-react';

type Tool = 'chat' | 'codegen' | 'codefixer' | 'countries' | 'translator';

const tools: { id: Tool; name: string; icon: string; description: string }[] = [
  {
    id: 'chat',
    name: 'AI Chat Assistant',
    icon: '🤖',
    description: 'Interactive AI conversation with multiple modes',
  },
  {
    id: 'codegen',
    name: 'Code Generator',
    icon: '💻',
    description: 'Generate code in HTML, JS, TS, Python, Node',
  },
  {
    id: 'codefixer',
    name: 'Code Fixer',
    icon: '🔧',
    description: 'Fix errors and get explanations with patch diffs',
  },
  {
    id: 'countries',
    name: 'Countries List',
    icon: '🌍',
    description: 'Get country data with flags and ISO codes',
  },
  {
    id: 'translator',
    name: 'Translator',
    icon: '🌐',
    description: 'Translate text and JSON objects',
  },
];

function AIChatInterface() {
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    status: 'sent' | 'seen';
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'thinking' | 'agent' | 'research' | 'auto'>('thinking');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiModes = useMemo(() => [
    { id: 'thinking' as const, name: 'AI Thinking', icon: Brain, description: 'Creative problem solving', color: 'from-purple-500 to-pink-500' },
    { id: 'agent' as const, name: 'Agent Mode', icon: Bot, description: 'Task automation', color: 'from-blue-500 to-cyan-500' },
    { id: 'research' as const, name: 'Deep Research', icon: Search, description: 'In-depth analysis', color: 'from-green-500 to-emerald-500' },
    { id: 'auto' as const, name: 'Auto Mode', icon: Settings, description: 'Adaptive responses', color: 'from-orange-500 to-red-500' }
  ], []);

  const moodPrompts: Record<string, string> = {
    thinking: 'You are a deep reflective AI who reasons carefully before answering. Take your time to provide thoughtful responses.',
    agent: 'You are a helpful and fast digital assistant who gives concise, actionable answers. Be quick and efficient.',
    research: 'You are an analytical AI researcher who provides detailed factual responses with proper citations.',
    auto: 'You are an adaptive AI who balances reasoning and quick insight automatically. Be versatile.'
  };

  // Load saved mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('dms-ai-chat-mode');
    if (savedMode && aiModes.find(m => m.id === savedMode)) {
      setSelectedMode(savedMode as any);
    }
  }, [aiModes]);

  // Load messages from localStorage on mount and mode change
  useEffect(() => {
    const savedMessages = localStorage.getItem(`dms-ai-chat-messages-${selectedMode}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
        setMessages(messagesWithDates);
        // Scroll to bottom after messages are loaded
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
              behavior: 'auto',
              block: 'end',
              inline: 'nearest'
            });
          }
        }, 100);
      } catch (error) {
        console.error('Error loading chat messages:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [selectedMode]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`dms-ai-chat-messages-${selectedMode}`, JSON.stringify(messages));
    }
  }, [messages, selectedMode]);

  // Save selected mode to localStorage
  useEffect(() => {
    localStorage.setItem('dms-ai-chat-mode', selectedMode);
  }, [selectedMode]);

  // Auto-scroll to bottom when new messages arrive with smooth animation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isTyping]);

  const sendMessage = async (retryCount = 0) => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date(),
      status: 'sent' as const
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'chat',
          input: userMessage.content,
          mode: selectedMode,
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.result || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: new Date(),
        status: 'seen' as const
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false); // Hide typing indicator immediately when AI message appears

      // Mark user message as seen
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'seen' as const } : msg
      ));

    } catch (error) {
      console.error('Error sending message:', error);

      if (retryCount < 2) {
        // Auto-retry up to 2 times
        setTimeout(() => sendMessage(retryCount + 1), 1000);
        return;
      }

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        status: 'seen' as const
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`dms-ai-chat-messages-${selectedMode}`);
  };

  // Mode-specific typing indicator component
  const ModeTypingIndicator = ({ mode }: { mode: typeof selectedMode }) => {
    const getTypingConfig = () => {
      switch (mode) {
        case 'thinking':
          return {
            icon: '🤖',
            text: 'AI Thinking...',
            animation: 'bouncing-dots'
          };
        case 'agent':
          return {
            icon: '🧩',
            text: 'DMS Agent is typing...',
            animation: 'pulsing-bar'
          };
        case 'research':
          return {
            icon: '🔍',
            text: 'DMS Research AI analyzing...',
            animation: 'fade-dots'
          };
        case 'auto':
          return {
            icon: '⚙️',
            text: 'DMS Auto AI generating...',
            animation: 'rotating-gear'
          };
        default:
          return {
            icon: '🤖',
            text: 'AI Thinking...',
            animation: 'bouncing-dots'
          };
      }
    };

    const config = getTypingConfig();

    const renderAnimation = () => {
      switch (config.animation) {
        case 'bouncing-dots':
          return (
            <div className="flex space-x-1">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-[#00C4FF] rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-[#00C4FF] rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-[#00C4FF] rounded-full"
              />
            </div>
          );
        case 'pulsing-bar':
          return (
            <div className="flex space-x-1">
              <motion.div
                animate={{ scaleX: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                className="w-3 h-1 bg-[#00C4FF] rounded-full origin-left"
              />
              <motion.div
                animate={{ scaleX: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                className="w-3 h-1 bg-[#00C4FF] rounded-full origin-left"
              />
              <motion.div
                animate={{ scaleX: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                className="w-3 h-1 bg-[#00C4FF] rounded-full origin-left"
              />
            </div>
          );
        case 'fade-dots':
          return (
            <div className="flex space-x-1">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-[#00C4FF] rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-2 h-2 bg-[#00C4FF] rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="w-2 h-2 bg-[#00C4FF] rounded-full"
              />
            </div>
          );
        case 'rotating-gear':
          return (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 text-[#00C4FF]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </motion.div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-6 h-6 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] rounded-full flex items-center justify-center"
        >
          <span className="text-sm">{config.icon}</span>
        </motion.div>
        {renderAnimation()}
        <span className="text-sm text-gray-400">{config.text}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* AI Mode Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {aiModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                selectedMode === mode.id
                  ? `bg-gradient-to-r ${mode.color} border-transparent text-white shadow-lg`
                  : 'bg-black/50 border-[#1254FF]/20 text-gray-300 hover:border-[#00C4FF]/40'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{mode.name}</div>
              <div className="text-xs opacity-75">{mode.description}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Messages Container */}
      <div className="relative">
        <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-4 bg-black/30 rounded-lg border border-[#1254FF]/20 scrollbar-thin scrollbar-thumb-[#00C4FF]/30 scrollbar-track-transparent">
          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <motion.button
              onClick={clearChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-2 right-2 z-10 p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 opacity-60 hover:opacity-100"
              title="Clear chat history"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          )}
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Start a conversation with DMS AI</p>
              <p className="text-sm">Ask me anything in {aiModes.find(m => m.id === selectedMode)?.name} mode</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    initial={message.role === 'assistant' && index === messages.length - 1 ? { scale: 0.8 } : {}}
                    animate={message.role === 'assistant' && index === messages.length - 1 ? {
                      scale: [0.8, 1.05, 1],
                      rotate: [0, -1, 1, 0],
                      transition: { duration: 0.5, ease: "easeOut" }
                    } : {}}
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white border-2 border-[#00C4FF]/50'
                        : 'bg-black/50 border border-[#1254FF]/30 text-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-6 h-6 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] rounded-full flex items-center justify-center"
                        >
                          <Sparkles className="w-3 h-3 text-white" />
                        </motion.div>
                        <span className="text-xs font-semibold text-[#00C4FF]">DMS AI</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        {message.role === 'user' && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            message.status === 'seen'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {message.status}
                          </span>
                        )}
                        <motion.button
                          onClick={() => copyMessage(message.content)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="opacity-50 hover:opacity-100 transition-opacity p-1"
                        >
                          <Copy className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex justify-start"
                  >
                    <div className="bg-black/50 border border-[#1254FF]/30 rounded-2xl p-4 max-w-[85%] sm:max-w-[80%]">
                      <ModeTypingIndicator mode={selectedMode} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me anything in ${aiModes.find(m => m.id === selectedMode)?.name} mode...`}
            className="w-full px-4 py-3 bg-black/50 border-2 border-[#1254FF]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00C4FF] focus:ring-2 focus:ring-[#00C4FF]/20 transition-all duration-300 resize-none"
            disabled={isLoading}
          />
        </div>
        <motion.button
          onClick={() => sendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px #00C4FF" }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </motion.button>
      </div>
    </div>
  );
}

export function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<Tool>('chat');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToolChange = (tool: Tool) => {
    setSelectedTool(tool);
    setInput('');
    setOutput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!input) {
      alert('Please provide input');
      return;
    }

    setLoading(true);
    try {
      // Placeholder for Gemini API call
      // In production, this would call your backend API that uses Gemini
      const response = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          input: input,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.result);
      } else {
        setOutput('Error processing request. Please try again.');
      }
    } catch (error) {
      setOutput('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!output) return;

    let content = output;
    let filename = `export.${format}`;

    if (format === 'json') {
      try {
        content = JSON.stringify(JSON.parse(output), null, 2);
      } catch {
        content = JSON.stringify({ data: output }, null, 2);
      }
    } else if (format === 'csv') {
      // Simple CSV conversion
      content = output.replace(/\n/g, '\r\n');
      filename = 'export.csv';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const currentTool = tools.find((t) => t.id === selectedTool);

  return (
    <div className="min-h-screen py-20 px-4 md:px-8 star-field">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-1 mb-4">
            <motion.span
              animate={{
                textShadow: [
                  '0 0 5px #00C4FF',
                  '0 0 10px #00C4FF',
                  '0 0 5px #00C4FF',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              DMS
            </motion.span>{' '}
            <span className="text-[#00C4FF]">AI Powered</span>
          </h1>
          <p className="body-text text-[#8D8D8D]">
            Powered by OpenAI GPT-4 — Image, Text & Code Intelligence
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tool Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-xl p-6 space-y-3 sticky top-20"
            >
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolChange(tool.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    selectedTool === tool.id
                      ? 'bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white'
                      : 'glass hover:border-[#00C4FF]'
                  }`}
                >
                  <div className="text-xl mb-1">{tool.icon}</div>
                  <div className="font-semibold text-sm">{tool.name}</div>
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Tool Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-xl p-8 space-y-6">
              {/* Tool Header */}
              <div>
                <h2 className="heading-2 text-[#1254FF] mb-2">
                  {currentTool?.name}
                </h2>
                <p className="text-[#8D8D8D]">{currentTool?.description}</p>
              </div>

              {/* Input Section */}
              <div className="space-y-4">
                <label className="block text-[#00C4FF] font-semibold">Input</label>

                {selectedTool === 'chat' ? (
                  <AIChatInterface />
                ) : (
                  <>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Enter ${currentTool?.name.toLowerCase()}...`}
                      className="w-full h-40 bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] resize-none"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <motion.button
                        onClick={handleProcess}
                        disabled={loading}
                        className="button-primary flex-1"
                        whileHover={{ scale: 1.02, boxShadow: "0 0 10px #1254FF" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? 'Processing...' : 'Process'}
                      </motion.button>
                      <button
                        onClick={() => setInput('')}
                        className="button-secondary flex-1"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Output Section */}
              {output && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <label className="block text-[#00C4FF] font-semibold">
                    Output
                  </label>
                  <div className="bg-black bg-opacity-50 border border-[#00C4FF] border-opacity-30 rounded-lg p-4 max-h-64 overflow-auto">
                    <pre className="text-[#8D8D8D] whitespace-pre-wrap break-words">
                      {output}
                    </pre>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleExport('json')}
                      className="button-secondary flex-1"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="button-secondary flex-1"
                    >
                      Export CSV
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
