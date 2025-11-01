'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

type Tool = 'ocr' | 'codegen' | 'codefixer' | 'countries' | 'translator';

const tools: { id: Tool; name: string; icon: string; description: string }[] = [
  {
    id: 'ocr',
    name: 'OCR & Image Captioning',
    icon: '🖼️',
    description: 'Extract text and generate captions from images',
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

export function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<Tool>('ocr');
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

                {selectedTool === 'ocr' ? (
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="button-secondary w-full"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 10px #00C4FF" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Upload Image
                    </motion.button>
                    {input && (
                      <img
                        src={input}
                        alt="Uploaded"
                        className="max-h-64 rounded-lg"
                      />
                    )}
                  </div>
                ) : (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Enter ${currentTool?.name.toLowerCase()}...`}
                    className="w-full h-40 bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] resize-none"
                  />
                )}
              </div>

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
