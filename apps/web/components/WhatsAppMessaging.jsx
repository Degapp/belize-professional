'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function WhatsAppMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.client_phone);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function fetchConversations() {
    try {
      const res = await fetch(`/api/whatsapp/conversations?professional_id=${user?.id || 1}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(clientPhone) {
    try {
      const res = await fetch(`/api/whatsapp/messages?professional_id=${user?.id || 1}&client_phone=${clientPhone}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: user?.id || 1,
          client_phone: selectedConversation.client_phone,
          client_name: selectedConversation.client_name,
          content: newMessage
        })
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages([...messages, sentMessage]);
        setNewMessage('');
        fetchConversations(); // Refresh conversation list
      } else {
        const error = await res.json();
        alert(`Failed to send message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Check your WhatsApp credentials.');
    } finally {
      setSending(false);
    }
  }

  async function handleStartNewChat(e) {
    e.preventDefault();
    if (!newChatPhone.trim()) return;

    // Check if conversation already exists
    const existing = conversations.find(c => c.client_phone === newChatPhone);
    if (existing) {
      setSelectedConversation(existing);
      setShowNewChat(false);
      return;
    }

    // Create new conversation by sending first message
    const newConversation = {
      client_phone: newChatPhone,
      client_name: newChatName || newChatPhone,
      last_message: 'Start conversation',
      last_message_at: new Date().toISOString(),
      unread_count: 0
    };

    setSelectedConversation(newConversation);
    setConversations([newConversation, ...conversations]);
    setShowNewChat(false);
    setNewChatPhone('');
    setNewChatName('');
  }

  async function handleTestMessage() {
    if (!selectedConversation) {
      alert('Please select a conversation first');
      return;
    }

    const testMsg = `Hello ${selectedConversation.client_name}, this is a test message from Belize Professionals at ${new Date().toLocaleTimeString()}`;
    setNewMessage(testMsg);
  }

  function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'sent':
        return <i className="ph-light ph-check text-slate-400"></i>;
      case 'delivered':
        return <i className="ph-fill ph-checks text-slate-400"></i>;
      case 'read':
        return <i className="ph-fill ph-checks text-blue-500"></i>;
      case 'failed':
        return <i className="ph-light ph-warning text-red-500"></i>;
      default:
        return <i className="ph-light ph-clock text-slate-300"></i>;
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <i className="ph-light ph-spinner text-2xl animate-spin text-brand-600"></i>
        <p className="mt-2 text-sm text-slate-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white" style={{ height: '500px' }}>
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Messages</h3>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors"
            >
              <i className="ph-light ph-plus"></i>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestMessage}
              className="flex-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <i className="ph-light ph-test-tube mr-1"></i>
              Test Message
            </button>
            <button
              onClick={fetchConversations}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
            >
              <i className="ph-light ph-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {/* New Chat Form */}
        {showNewChat && (
          <div className="p-4 border-b border-slate-200 bg-blue-50">
            <form onSubmit={handleStartNewChat} className="space-y-2">
              <input
                type="tel"
                value={newChatPhone}
                onChange={(e) => setNewChatPhone(e.target.value)}
                placeholder="Phone number (e.g., +5012345678)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <input
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="Contact name (optional)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Start Chat
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewChat(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <i className="ph-light ph-chat-circle-dots text-4xl text-slate-300 mb-3"></i>
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Click + to start a new chat</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.client_phone}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
                  selectedConversation?.client_phone === conv.client_phone ? 'bg-brand-50 border-l-4 border-l-brand-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-semibold text-slate-900 text-sm">{conv.client_name}</div>
                  <div className="text-xs text-slate-400">{formatTime(conv.last_message_at)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 truncate flex-1">
                    {conv.last_message || 'No messages'}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="ml-2 min-w-[20px] h-5 px-2 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{selectedConversation.client_name}</div>
                  <div className="text-xs text-slate-500">{selectedConversation.client_phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ph-light ph-chat-text text-4xl text-slate-300 mb-3"></i>
                  <p className="text-sm text-slate-500">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Send your first message below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isSent = msg.direction === 'sent';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isSent
                                ? 'bg-brand-600 text-white rounded-br-sm'
                                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
                            }`}
                          >
                            {msg.message_type === 'text' ? (
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            ) : (
                              <div className="text-sm">
                                <i className={`ph-light ${
                                  msg.message_type === 'image' ? 'ph-image' :
                                  msg.message_type === 'video' ? 'ph-video' :
                                  msg.message_type === 'document' ? 'ph-file' :
                                  msg.message_type === 'audio' ? 'ph-microphone' :
                                  'ph-file'
                                } mr-2`}></i>
                                {msg.content}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${isSent ? 'justify-end' : 'justify-start'}`}>
                            <span>{formatTime(msg.sent_at)}</span>
                            {isSent && (
                              <span className="ml-1">{getStatusIcon(msg.status)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  style={{ maxHeight: '100px' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <i className="ph-light ph-spinner animate-spin"></i>
                      <span className="text-sm">Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="ph-light ph-paper-plane-tilt"></i>
                      <span className="text-sm">Send</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Press Enter to send, Shift+Enter for new line
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <i className="ph-light ph-chat-circle-text text-5xl text-slate-300 mb-3"></i>
              <p className="text-slate-500 font-medium">Select a conversation</p>
              <p className="text-sm text-slate-400 mt-1">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
