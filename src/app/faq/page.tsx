'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles, ChevronDown, Loader2, Send, Copy, Check, Brain, Bot, Search, Settings } from 'lucide-react';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    category: 'Digital Marketing',
    question: 'What services do you offer in digital marketing?',
    answer: 'I offer comprehensive digital marketing services including SEO, social media marketing, content marketing, PPC advertising, email marketing, and analytics.',
  },
  {
    id: 2,
    category: 'Digital Marketing',
    question: 'How long does it take to see results from SEO?',
    answer: 'SEO typically takes 3-6 months to show significant results, depending on your website\'s current state and competition.',
  },
  {
    id: 3,
    category: 'Digital Marketing',
    question: 'Do you provide ongoing support for digital marketing campaigns?',
    answer: 'Yes, I offer monthly retainer packages that include campaign optimization, performance reports, and continuous improvements.',
  },
  {
    id: 4,
    category: 'Digital Marketing',
    question: 'What is your pricing for digital marketing services?',
    answer: 'Pricing varies based on scope and requirements. Contact me for a customized quote tailored to your business needs.',
  },
  {
    id: 5,
    category: 'SEO',
    question: 'What is included in an SEO audit?',
    answer: 'An SEO audit includes technical SEO analysis, on-page optimization review, backlink analysis, keyword research, competitor analysis, and performance recommendations.',
  },
  {
    id: 6,
    category: 'SEO',
    question: 'How do you handle keyword research?',
    answer: 'I use advanced SEO tools to identify high-value, low-competition keywords specific to your business and target audience.',
  },
  {
    id: 7,
    category: 'SEO',
    question: 'Will you help improve my website\'s loading speed?',
    answer: 'Absolutely! Website speed is a crucial ranking factor. I optimize images, code, and server configurations for maximum performance.',
  },
  {
    id: 8,
    category: 'SEO',
    question: 'Do you provide SEO training for my team?',
    answer: 'Yes, I can provide workshops and training sessions to help your team understand and implement SEO best practices.',
  },
  {
    id: 9,
    category: 'Shopify',
    question: 'Can you help me set up a Shopify store?',
    answer: 'Yes, I offer complete Shopify store setup including theme customization, product configuration, payment gateways, and app integrations.',
  },
  {
    id: 10,
    category: 'Shopify',
    question: 'How do you optimize Shopify stores for conversions?',
    answer: 'I optimize product pages, checkout flow, mobile experience, and add conversion-boosting apps to maximize sales.',
  },
  {
    id: 11,
    category: 'Shopify',
    question: 'Do you provide Shopify maintenance and support?',
    answer: 'Yes, I offer ongoing maintenance packages to keep your store updated, secure, and performing optimally.',
  },
  {
    id: 12,
    category: 'Shopify',
    question: 'Can you integrate third-party apps with my Shopify store?',
    answer: 'Absolutely! I specialize in integrating marketing tools, analytics, inventory management, and other essential apps.',
  },
  {
    id: 13,
    category: 'Dropshipping',
    question: 'What is your experience with dropshipping businesses?',
    answer: 'I\'ve helped set up and scale multiple successful dropshipping stores across various niches with proven strategies.',
  },
  {
    id: 14,
    category: 'Dropshipping',
    question: 'How do you find profitable products for dropshipping?',
    answer: 'I use data-driven methods to research trending products, analyze competition, and identify high-margin opportunities.',
  },
  {
    id: 15,
    category: 'Dropshipping',
    question: 'Do you help with dropshipping marketing strategies?',
    answer: 'Yes, I create comprehensive marketing plans including Facebook ads, Google ads, influencer partnerships, and email campaigns.',
  },
  {
    id: 16,
    category: 'Dropshipping',
    question: 'What tools do you use for dropshipping automation?',
    answer: 'I utilize tools like Oberlo, DSers, AutoDS, and custom automation scripts to streamline order processing and inventory management.',
  },
  {
    id: 17,
    category: 'Web Development',
    question: 'What technologies do you use for web development?',
    answer: 'I specialize in modern frameworks like Next.js, React, Node.js, and work with various databases and hosting platforms.',
  },
  {
    id: 18,
    category: 'Web Development',
    question: 'Do you provide responsive website design?',
    answer: 'Yes, all websites I develop are fully responsive and optimized for all devices including mobile, tablet, and desktop.',
  },
  {
    id: 19,
    category: 'Web Development',
    question: 'What is your typical project timeline?',
    answer: 'Project timelines vary, but a standard website typically takes 2-4 weeks, while complex applications may take 6-12 weeks.',
  },
  {
    id: 20,
    category: 'Web Development',
    question: 'Do you offer website maintenance and hosting services?',
    answer: 'Yes, I provide ongoing maintenance, security updates, backups, and can help set up reliable hosting solutions.',
  },
];

// AI Chatbox Component with 4 Modes
const AIChatbox: React.FC = () => {
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'thinking' | 'agent' | 'research' | 'auto'>('thinking');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiModes = [
    { id: 'thinking' as const, name: 'AI Thinking', icon: Brain, description: 'Creative problem solving', color: 'from-purple-500 to-pink-500' },
    { id: 'agent' as const, name: 'Agent Mode', icon: Bot, description: 'Task automation', color: 'from-blue-500 to-cyan-500' },
    { id: 'research' as const, name: 'Deep Research', icon: Search, description: 'In-depth analysis', color: 'from-green-500 to-emerald-500' },
    { id: 'auto' as const, name: 'Auto Mode', icon: Settings, description: 'Adaptive responses', color: 'from-orange-500 to-red-500' }
  ];

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('faq-chat-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('faq-chat-messages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          mood: selectedMode,
          history: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
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
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('faq-chat-messages');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl border-2 border-[#1254FF]/30 bg-gradient-to-br from-[#1254FF]/10 to-[#00C4FF]/10 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#1254FF]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Assistant</h3>
              <p className="text-sm text-gray-400">Ask me anything about DMS MEHEDI</p>
            </div>
          </div>
          <motion.button
            onClick={clearChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-xs text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
          >
            Clear Chat
          </motion.button>
        </div>

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
                    : 'bg-white/5 border-[#1254FF]/20 text-gray-300 hover:border-[#1254FF]/40'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{mode.name}</div>
                <div className="text-xs opacity-75">{mode.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Ask me anything about DMS MEHEDI&apos;s services, projects, or expertise</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white'
                    : 'bg-white/10 border border-[#1254FF]/20 text-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <motion.button
                      onClick={() => copyMessage(message.content)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 border border-[#1254FF]/20 rounded-2xl p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#00C4FF] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#00C4FF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#00C4FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400">AI is typing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#1254FF]/20">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me anything in ${aiModes.find(m => m.id === selectedMode)?.name} mode...`}
            className="flex-1 px-4 py-3 bg-white/5 border border-[#1254FF]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00C4FF] focus:ring-1 focus:ring-[#00C4FF] transition-colors"
            disabled={isLoading}
          />
          <motion.button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({});
  const [loadingAnswers, setLoadingAnswers] = useState<Record<number, boolean>>({});

  const handleAskAI = async (faq: FAQ) => {
    if (aiAnswers[faq.id]) return; // Don't re-fetch if already answered

    setLoadingAnswers((prev) => ({ ...prev, [faq.id]: true }));

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              sender: 'user',
              message: faq.question,
            },
          ],
        }),
      });

      if (response.ok) {
        const { reply } = await response.json();
        setAiAnswers((prev) => ({ ...prev, [faq.id]: reply }));
      } else {
        setAiAnswers((prev) => ({
          ...prev,
          [faq.id]: 'Sorry, I couldn\'t generate an AI response. Please try again later.',
        }));
      }
    } catch (error) {
      console.error('AI error:', error);
      setAiAnswers((prev) => ({
        ...prev,
        [faq.id]: 'Sorry, I couldn\'t generate an AI response. Please try again later.',
      }));
    } finally {
      setLoadingAnswers((prev) => ({ ...prev, [faq.id]: false }));
    }
  };

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black py-10 sm:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-[#00C4FF] mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-[#1254FF] to-[#00C4FF] bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions or ask AI for instant help
          </p>
        </motion.div>

        {/* AI Chatbox Section - Integrated inline with Ask AI buttons */}

        {/* FAQ Accordions by Category */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-[#1254FF] to-[#00C4FF] mr-3 rounded-full"></span>
                {category}
              </h2>
              <div className="space-y-4">
                {faqs
                  .filter((faq) => faq.category === category)
                  .map((faq) => (
                    <motion.div
                      key={faq.id}
                      variants={itemVariants}
                      className="glass rounded-xl border border-[#1254FF]/20 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === faq.id ? null : faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#1254FF]/5 transition-colors"
                      >
                        <span className="text-white font-medium pr-8">{faq.question}</span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAskAI(faq);
                            }}
                            disabled={loadingAnswers[faq.id] || !!aiAnswers[faq.id]}
                            className="px-3 py-1 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
                          >
                            {loadingAnswers[faq.id] ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                AI Thinking...
                              </>
                            ) : aiAnswers[faq.id] ? (
                              <>
                                <Sparkles className="w-3 h-3" />
                                AI Answered
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                Ask AI
                              </>
                            )}
                          </motion.button>
                          <ChevronDown
                            className={`w-5 h-5 text-[#00C4FF] transition-transform ${
                              openIndex === faq.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {openIndex === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 py-4 border-t border-[#1254FF]/20 bg-[#1254FF]/5">
                              <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                              {aiAnswers[faq.id] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-4 p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-[#00C4FF]/30 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-[#00C4FF]" />
                                    <span className="text-sm font-semibold text-[#00C4FF]">AI Enhanced Answer</span>
                                  </div>
                                  <p className="text-gray-200 text-sm leading-relaxed">
                                    {aiAnswers[faq.id]}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* AI Chatbox Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <AIChatbox />
        </motion.div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-2xl p-8 border-2 border-[#1254FF]/30 bg-gradient-to-br from-[#1254FF]/10 to-[#00C4FF]/10">
            <h3 className="text-2xl font-bold text-white mb-3">Still Have Questions?</h3>
            <p className="text-gray-300 mb-6">
              Get in touch with me directly for personalized assistance
            </p>
            <motion.a
              href="/#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Contact Me
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

