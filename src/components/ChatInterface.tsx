import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, ExternalLink, Loader2, X, Search } from 'lucide-react';

interface Citation {
  text: string;
  source: string;
  link: string;
  paragraph?: string;
  page?: number;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

// Mock PDF content for research - in a real implementation, this would be extracted from the actual PDF
const pdfContent = {
  "Dani_Devi_v_Pritam_Singh.pdf": {
    content: `
    In a motor accident claim where the deceased was self-employed and aged 54-55 years at the time of death, is the claimant entitled to an addition towards future prospects in computing compensation under Section 166 of the Motor Vehicles Act, 1988? If so, how much?

    Yes, in a motor accident claim under Section 166 of the Motor Vehicles Act, 1988, where the deceased was self-employed and aged 54-55 years at the time of death, the claimant is entitled to an addition towards future prospects.

    Legal Position:
    The Punjab and Haryana High Court, in Dani Devi v. Pritam Singh (FAO No. 4353 of 2017, decided on 13.09.2022), held that:

    "as the age of the deceased at the time of accident was held to be about 54-55 years, being self-employed, 10% of annual income should have been awarded on account of future prospects."
    [Para 7, citing National Insurance Co. Ltd. v. Pranay Sethi, (2017) and Sarla Verma v. DTC, (2009)]

    Summary of Entitlement:
    • Category: Self-employed
    • Age: 54-55 years
    • Future Prospects Addition: 10% of the annual income

    This is consistent with the principles laid down by the Supreme Court in Pranay Sethi, where future prospects were allowed even for self-employed and fixed-income individuals, based on age bands.
    `,
    paragraphs: {
      7: "as the age of the deceased at the time of accident was held to be about 54-55 years, being self-employed, 10% of annual income should have been awarded on account of future prospects."
    }
  }
};

// Simple PDF research function
const researchPDF = (query: string): { answer: string; citations: Citation[] } => {
  const lowerQuery = query.toLowerCase();
  
  // Check if query is about future prospects, self-employed, age 54-55, etc.
  if (lowerQuery.includes('future prospects') || 
      lowerQuery.includes('self-employed') || 
      lowerQuery.includes('54') || 
      lowerQuery.includes('55') ||
      lowerQuery.includes('motor vehicle') ||
      lowerQuery.includes('compensation')) {
    
    return {
      answer: "Yes, under Section 166 of the Motor Vehicles Act, 1988, the claimants are entitled to an addition for future prospects even when the deceased was self-employed and aged 54–55 years at the time of the accident. In Dani Devi v. Pritam Singh, the Court held that 10% of the deceased's annual income should have been awarded on account of future prospects.",
      citations: [
        {
          text: "as the age of the deceased at the time of accident was held to be about 54-55 years, being self-employed, 10% of annual income should have been awarded on account of future prospects.",
          source: "Dani_Devi_v_Pritam_Singh.pdf",
          link: "/Dani Vs Pritam (Future 10 at age 54-55).pdf",
          paragraph: "Para 7",
          page: 1
        }
      ]
    };
  }
  
  // Default response for other queries
  return {
    answer: "I can help you research legal matters related to motor vehicle accidents, compensation claims, and future prospects. Please ask me specific questions about the legal documents I have access to.",
    citations: []
  };
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentParagraph, setCurrentParagraph] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Simulate research delay
    setTimeout(() => {
      const research = researchPDF(currentQuery);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: research.answer,
        citations: research.citations,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCitationClick = (citation: Citation) => {
    setCurrentPdfUrl(citation.link);
    setCurrentParagraph(citation.paragraph || '');
    setShowPdfViewer(true);
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
    setCurrentPdfUrl('');
    setCurrentParagraph('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Lexi Legal Assistant</h1>
              <p className="text-sm text-gray-500">AI-powered legal research assistant</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Lexi</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  I'm your AI legal research assistant. I can analyze legal documents and provide insights on motor vehicle accident claims, compensation, and legal precedents.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-lg mx-auto border border-blue-100">
                  <p className="text-sm font-medium text-blue-900 mb-2">Try asking:</p>
                  <p className="text-sm text-blue-800 italic">
                    "Are claimants entitled to future prospects when the deceased was self-employed and aged 54-55?"
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      }`}>
                        {message.type === 'user' ? 'You' : 'L'}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                      </div>

                      {/* Citations */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
                          {message.citations.map((citation, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-xs text-gray-700 italic mb-2 leading-relaxed">
                                    "{citation.text}"
                                  </p>
                                  <div className="flex items-center text-xs text-gray-500 mb-2">
                                    <FileText className="w-3 h-3 mr-1" />
                                    <span>{citation.paragraph} • {citation.source}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCitationClick(citation)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md transition-colors duration-200 border border-blue-200"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Document
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex max-w-[80%]">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      L
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-gray-600 text-sm">Researching legal documents...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me about legal matters, motor vehicle claims, or compensation..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder-gray-500 text-sm"
                    style={{ minHeight: '52px', maxHeight: '200px' }}
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Legal Document</h3>
                  {currentParagraph && (
                    <p className="text-sm text-gray-600">Viewing: {currentParagraph}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closePdfViewer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* PDF Content */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <iframe
                  src={currentPdfUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="Legal Document"
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Document opened from citation reference
                </p>
                <button
                  onClick={closePdfViewer}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;