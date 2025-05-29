import { useState, useEffect, useRef } from 'react';
import { SparklesIcon, SendIcon, LoadingIcon, CopyIcon, ExpandIcon, CompressIcon } from './Icons';

export default function AIChat({ agentId, phase, context = {}, onContentGenerated }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkAIStatus();
    initializeChat();
  }, [agentId, phase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      const data = await response.json();
      setAiStatus(data.data);
    } catch (error) {
      console.error('Failed to check AI status:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Hello! I'm your ${getAgentName(agentId)} for the ${phase} phase. I'm here to help you create comprehensive documentation and guide you through this phase of the BMAD Method. What would you like to work on?`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const getAgentName = (agentId) => {
    const agentNames = {
      'role-analyst-a-brainstorming-ba-and-ra-expert': 'Business Analyst & Research Expert',
      'role-product-manager-(pm)-agent': 'Product Manager',
      'role-architect-agent': 'System Architect',
      'role-design-architect-uiux-&-frontend-strategy-expert': 'Design Architect & Frontend Expert',
      'role-technical-product-owner-(po)-agent': 'Technical Product Owner',
      'role-scrum-master-agent': 'Scrum Master'
    };
    return agentNames[agentId] || 'AI Agent';
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          phase,
          message: inputMessage,
          context: {
            ...context,
            chatHistory: messages
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.data.response,
          timestamp: data.data.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'AI chat failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTemplate = async (templateName) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          agentId,
          context: {
            ...context,
            chatHistory: messages
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        const templateMessage = {
          id: Date.now(),
          type: 'template',
          content: data.data.content,
          templateName: data.data.templateName,
          timestamp: data.data.timestamp
        };
        setMessages(prev => [...prev, templateMessage]);

        if (onContentGenerated) {
          onContentGenerated(data.data.content, templateName);
        }
      } else {
        throw new Error(data.message || 'Template generation failed');
      }
    } catch (error) {
      console.error('Template generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          phase,
          currentData: context
        }),
      });

      const data = await response.json();

      if (data.success) {
        const suggestionsMessage = {
          id: Date.now(),
          type: 'suggestions',
          content: data.data.suggestions,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyChat = async () => {
    try {
      const agentName = getAgentName(agentId);
      const chatText = `# ${agentName} - ${phase.toUpperCase()} Phase Chat
Project: ${context.projectName || 'Unknown Project'}
Date: ${new Date().toLocaleString()}

${messages.map(message => {
        if (message.type === 'user') {
          return `**User:** ${message.content}`;
        } else if (message.type === 'ai') {
          return `**${agentName}:** ${message.content}`;
        } else if (message.type === 'suggestions') {
          return `**${agentName} (Suggestions):** ${message.content.map(s => `• ${s.title}: ${s.description}`).join('\n')}`;
        } else if (message.type === 'template') {
          return `**${agentName} (Generated ${message.templateName}):**\n${message.content}`;
        } else if (message.type === 'error') {
          return `**System Error:** ${message.content}`;
        }
        return '';
      }).filter(Boolean).join('\n\n')}`;

      await navigator.clipboard.writeText(chatText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy chat:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = chatText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!aiStatus?.ready) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <SparklesIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-900 mb-2">AI Service Not Available</h3>
        <p className="text-yellow-800">
          The AI agent service is not currently available. Please check the configuration.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for maximized view */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMaximize}
        />
      )}

      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${
        isMaximized ? 'fixed inset-4 z-50 h-auto' : 'h-96'
      }`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <SparklesIcon className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{getAgentName(agentId)}</h3>
              <p className="text-xs text-gray-500">AI Assistant for {phase} phase</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyChat}
              disabled={isLoading || messages.length === 0}
              className={`btn btn-outline btn-sm ${copySuccess ? 'bg-green-100 text-green-800' : ''}`}
              title="Copy chat history"
            >
              <CopyIcon className="h-4 w-4 mr-1" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={toggleMaximize}
              className="btn btn-outline btn-sm"
              title={isMaximized ? 'Minimize chat' : 'Maximize chat'}
            >
              {isMaximized ? (
                <CompressIcon className="h-4 w-4" />
              ) : (
                <ExpandIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={getSuggestions}
              disabled={isLoading}
              className="btn btn-outline btn-sm"
            >
              Get Suggestions
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`${isMaximized ? 'max-w-5xl w-full' : 'max-w-xs lg:max-w-md'}`}>
              {/* Speaker Label */}
              <div className={`text-xs font-medium mb-1 ${
                message.type === 'user' ? 'text-right text-primary-600' : 'text-left text-gray-600'
              }`}>
                {message.type === 'user' ? 'You' :
                 message.type === 'error' ? 'System' :
                 message.type === 'suggestions' ? `${getAgentName(agentId)} (Suggestions)` :
                 message.type === 'template' ? `${getAgentName(agentId)} (Generated Content)` :
                 getAgentName(agentId)}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-lg ${
                  isMaximized ? 'px-6 py-4' : 'px-4 py-3'
                } ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : message.type === 'template'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : message.type === 'suggestions'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {message.type === 'suggestions' ? (
                  <div>
                    <p className={`font-medium mb-2 ${isMaximized ? 'text-base' : 'text-sm'}`}>Here are some suggestions:</p>
                    <ul className="space-y-1">
                      {message.content.map((suggestion, index) => (
                        <li key={index} className={isMaximized ? 'text-sm' : 'text-xs'}>
                          • <strong>{suggestion.title}:</strong> {suggestion.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : message.type === 'template' ? (
                  <div>
                    <p className={`font-medium mb-2 ${isMaximized ? 'text-base' : 'text-sm'}`}>Generated {message.templateName}:</p>
                    <div className={`bg-white bg-opacity-50 rounded mt-2 ${isMaximized ? 'p-4' : 'p-2'}`}>
                      <pre className={`whitespace-pre-wrap font-mono ${isMaximized ? 'text-sm' : 'text-xs'}`}>{message.content}</pre>
                    </div>
                  </div>
                ) : (
                  <div className={`whitespace-pre-wrap leading-relaxed ${
                    isMaximized ? 'text-base' : 'text-sm'
                  }`}>{message.content}</div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-xs text-gray-400 mt-1 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <LoadingIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI agent for help..."
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={isMaximized ? "4" : "2"}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn btn-primary btn-sm self-end"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
