import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { MessageCircle, X, Send, Bot, HelpCircle } from 'lucide-react';
import './Chatbot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your <strong>Portfolio AI Agent</strong>. Ask me about the portfolio budget, risks, program health, or recommendations.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What is the portfolio budget?",
    "What are the main risks?",
    "How is the portfolio health?",
    "What should I do next?",
    "Which programs are at risk?",
    "Tell me about technical debt"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
    } catch (error) {
      console.log('Could not get Firebase token:', error);
    }
    return null;
  };

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || input;
    if (!text.trim()) return;

    const userMessage = text.trim();
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const token = await getFirebaseToken();
      const tenantId = import.meta.env.VITE_TENANT_ID || 'american_logics';
      const url = `${API_BASE_URL}/api/ai/chat`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...updatedMessages,
        { 
          role: 'assistant', 
          content: 'Sorry, I am unable to respond right now. Please try again later.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const renderMessage = (content: string) => {
    return { __html: content };
  };

  if (!isOpen) {
    return (
      <button 
        className="chatbot-toggle" 
        onClick={() => setIsOpen(true)}
        aria-label="Open Portfolio AI Agent"
      >
        <MessageCircle size={24} />
        <span>Ask AI</span>
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <Bot size={20} />
          <span>Portfolio AI Agent</span>
        </div>
        <button 
          className="chatbot-close" 
          onClick={() => setIsOpen(false)}
          aria-label="Close chatbot"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`chatbot-message ${message.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'}`}
          >
            {message.role === 'assistant' && (
              <div className="chatbot-avatar">
                <Bot size={16} />
              </div>
            )}
            <div 
              className="chatbot-bubble"
              dangerouslySetInnerHTML={renderMessage(message.content)}
            />
          </div>
        ))}
        {loading && (
          <div className="chatbot-message chatbot-message-assistant">
            <div className="chatbot-avatar">
              <Bot size={16} />
            </div>
            <div className="chatbot-bubble chatbot-bubble-loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-suggestions">
        <div className="chatbot-suggestions-label">
          <HelpCircle size={14} />
          <span>Quick questions:</span>
        </div>
        <div className="chatbot-suggestions-list">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="chatbot-suggestion-chip"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={loading}
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chatbot-input-area">
        <input
          type="text"
          className="chatbot-input"
          placeholder="Or type your own question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button 
          className="chatbot-send" 
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;