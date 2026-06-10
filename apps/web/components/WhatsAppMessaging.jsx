'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Phone, CheckCheck, Check } from 'lucide-react';

export default function WhatsAppMessaging() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages?professional_id=1');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      
      // Group messages by phone number
      const convos = groupByConversation(data);
      setConversations(convos);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && convos.length > 0) {
        setSelectedConversation(convos[0].phone);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const groupByConversation = (msgs) => {
    const grouped = {};
    msgs.forEach(msg => {
      if (!grouped[msg.client_phone]) {
        grouped[msg.client_phone] = {
          phone: msg.client_phone,
          name: msg.client_name || msg.client_phone,
          lastMessage: msg.content,
          lastMessageTime: msg.sent_at,
          unreadCount: 0
        };
      }
      // Update last message if this one is newer
      if (new Date(msg.sent_at) > new Date(grouped[msg.client_phone].lastMessageTime)) {
        grouped[msg.client_phone].lastMessage = msg.content;
        grouped[msg.client_phone].lastMessageTime = msg.sent_at;
      }
    });
    return Object.values(grouped).sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const selectedConvo = conversations.find(c => c.phone === selectedConversation);
      const response = await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_phone: selectedConversation,
          client_name: selectedConvo?.name || '',
          content: newMessage,
          professional_id: 1
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your WhatsApp API credentials.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = selectedConversation
    ? messages.filter(m => m.client_phone === selectedConversation)
    : [];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    if (status === 'read') return <CheckCheck className="w-4 h-4 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-gray-400" />;
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex h-[600px]">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-green-600 text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5" />
            WhatsApp Messages
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Messages will appear here when clients contact you</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.phone}
                onClick={() => setSelectedConversation(convo.phone)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left transition-colors ${
                  selectedConversation === convo.phone ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{convo.name}</p>
                    <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {formatTime(convo.lastMessageTime)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {conversations.find(c => c.phone === selectedConversation)?.name || selectedConversation}
              </h3>
              <p className="text-sm text-gray-500">{selectedConversation}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Start a conversation</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'sent'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-xs ${message.direction === 'sent' ? 'text-green-100' : 'text-gray-500'}`}>
                          {formatTime(message.sent_at)}
                        </span>
                        {message.direction === 'sent' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
