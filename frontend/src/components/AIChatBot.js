import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaTrashAlt,
  FaGraduationCap,
  FaLightbulb,
  FaCode,
  FaQuestionCircle,
} from 'react-icons/fa';
import { sendChatMessage } from '../api/chat';

/* ───── Markdown-lite renderer ───── */
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3);
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={elements.length} className="chat-code-block">
          {lang && <span className="chat-code-lang">{lang}</span>}
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={elements.length} />);
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = `h${level + 3}`; // h4, h5, h6 inside chat
      elements.push(
        <Tag key={elements.length} className="chat-heading">
          {formatInline(headingMatch[2])}
        </Tag>
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^\s*[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={elements.length} className="chat-list">
          {items.map((item, j) => (
            <li key={j}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={elements.length} className="chat-list">
          {items.map((item, j) => (
            <li key={j}>{formatInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={elements.length} className="chat-paragraph">
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function formatInline(text) {
  // Bold + italic, bold, italic, inline code
  const parts = [];
  const regex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith('`')) {
      parts.push(<code key={match.index} className="chat-inline-code">{m.slice(1, -1)}</code>);
    } else if (m.startsWith('***')) {
      parts.push(<strong key={match.index}><em>{m.slice(3, -3)}</em></strong>);
    } else if (m.startsWith('**')) {
      parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>);
    } else if (m.startsWith('*')) {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    }
    lastIndex = match.index + m.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

/* ───── Typing indicator ───── */
function TypingIndicator() {
  return (
    <div className="chat-message chat-message-bot">
      <div className="chat-avatar chat-avatar-bot">
        <FaRobot size={14} />
      </div>
      <div className="chat-bubble chat-bubble-bot">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

/* ───── Suggested prompts ───── */
const SUGGESTED_PROMPTS = [
  { icon: <FaQuestionCircle />, text: 'Explain this lesson in simple terms' },
  { icon: <FaLightbulb />, text: 'Give me a summary of key concepts' },
  { icon: <FaCode />, text: 'Show me a practical example' },
  { icon: <FaGraduationCap />, text: 'What should I learn next?' },
];

/* ───── Main component ───── */
const AIChatBot = ({ courseSlug, courseTitle, currentLessonId, currentLessonTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages, scrollToBottom]);

  const buildHistory = () => {
    return messages
      .filter((m) => m.role === 'user' || m.role === 'model')
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history = buildHistory();
      const res = await sendChatMessage(courseSlug, text.trim(), history, currentLessonId);
      const botMsg = {
        role: 'model',
        text: res.data.reply,
        timestamp: new Date(res.data.timestamp),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        className={`chat-fab ${isOpen ? 'chat-fab-active' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        title="AI Study Assistant"
      >
        {isOpen ? <FaTimes size={20} /> : <FaRobot size={22} />}
        {!isOpen && <span className="chat-fab-badge">AI</span>}
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? 'chat-panel-open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-header-avatar">
              <FaRobot size={18} />
            </div>
            <div>
              <div className="chat-header-title">StudyBot</div>
              <div className="chat-header-subtitle">
                {currentLessonTitle
                  ? `Helping with: ${currentLessonTitle}`
                  : `AI Tutor for ${courseTitle}`}
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              type="button"
              className="chat-header-btn"
              onClick={clearChat}
              title="Clear conversation"
              disabled={messages.length === 0}
            >
              <FaTrashAlt size={14} />
            </button>
            <button
              type="button"
              className="chat-header-btn"
              onClick={toggleChat}
              title="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <FaRobot size={40} />
              </div>
              <h5 className="chat-welcome-title">Hi! I'm StudyBot</h5>
              <p className="chat-welcome-text">
                I'm your AI study assistant for <strong>{courseTitle}</strong>. Ask me
                anything about this course — I can explain concepts, give examples,
                summarize lessons, and help you learn better.
              </p>
              <div className="chat-suggestions">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chat-suggestion-btn"
                    onClick={() => sendMessage(prompt.text)}
                    disabled={loading}
                  >
                    <span className="chat-suggestion-icon">{prompt.icon}</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${
                  msg.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="chat-avatar chat-avatar-bot">
                    <FaRobot size={14} />
                  </div>
                )}
                <div
                  className={`chat-bubble ${
                    msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                  } ${msg.isError ? 'chat-bubble-error' : ''}`}
                >
                  {msg.role === 'model' ? renderMarkdown(msg.text) : msg.text}
                </div>
              </div>
            ))
          )}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-area" onSubmit={handleSubmit}>
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask StudyBot anything..."
              rows={1}
              maxLength={2000}
              disabled={loading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || loading}
              title="Send message"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
          <div className="chat-input-footer">
            <span>Powered by Gemini</span>
            <span>{input.length}/2000</span>
          </div>
        </form>
      </div>
    </>
  );
};

export default AIChatBot;
