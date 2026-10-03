'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  User,
  Bot,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Search,
  CheckCheck,
  Check,
  Phone,
  Paperclip,
  Smile,
  MoreVertical,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Clock,
  Circle,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { sound } from '@/lib/sound';

interface Message {
  id: string;
  role: 'user' | 'bot' | 'admin';
  text: string;
  time: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  typing?: boolean;
}

interface ConversationItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online: boolean;
  avatarColor: string;
}

const CHAT_STORAGE_KEY = 'ct_chat_messages';
const ADMIN_REPLY_KEY  = 'ct_admin_replies';

function getStoredMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredMessages(msgs: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

const QUICK_MACROS = [
  '👋 Hello! How can I assist you with your Ceylon Times order today?',
  '🚚 Your Cash on Delivery order is packed and will be dispatched via courier shortly.',
  '✅ We have verified your contact coordinates and confirmed your booking request.',
  '📞 For urgent inquiries, our direct WhatsApp hotline is +94 77 123 4567.',
  '🏷️ Would you like assistance finding any specific gem, handloom, or artisan craft?',
];

export default function AdminMessagesPage() {
  const { theme } = useTheme();
  const { user: currentAdmin } = useAuth();
  const isLight = theme === 'light';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string>('active-client');
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);
  const [showMacros, setShowMacros] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Color Palette - WhatsApp Inspired */
  const T = {
    bg:              isLight ? '#EFEAE2' : '#0B141A',
    headerBg:        isLight ? '#F0F2F5' : '#202C33',
    sidebarBg:       isLight ? '#FFFFFF' : '#111B21',
    chatBg:          isLight ? '#EFEAE2' : '#0B141A',
    card:            isLight ? '#FFFFFF' : '#111B21',
    border:          isLight ? '#E2E8F0' : '#222E35',
    text:            isLight ? '#111B21' : '#E9EDEF',
    muted:           isLight ? '#667781' : '#8696A0',
    accent:          '#2563EB',
    whatsappGreen:   '#00A884',
    adminBubble:     isLight ? '#D9FDD3' : '#005C4B',
    adminBubbleText: isLight ? '#111B21' : '#E9EDEF',
    userBubble:      isLight ? '#FFFFFF' : '#202C33',
    userBubbleText:  isLight ? '#111B21' : '#E9EDEF',
    botBubble:       isLight ? '#EBF5FF' : '#1A2938',
    itemHover:       isLight ? '#F5F6F6' : '#202C33',
    itemActive:      isLight ? '#EBEFF2' : '#2A3942',
  };

  const refreshMessages = () => {
    const list = getStoredMessages();
    setMessages(list);
  };

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 2000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY || e.key === ADMIN_REPLY_KEY) {
        refreshMessages();
      }
    };
    const handleCustomerChat = () => {
      refreshMessages();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ceylon_customer_chat', handleCustomerChat);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ceylon_customer_chat', handleCustomerChat);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Derive active customer profile from messages
  const lastCustomerMessage = [...messages].reverse().find(m => m.role === 'user');
  const customerName = lastCustomerMessage?.user_name || 'Ceylon Patron';
  const customerEmail = lastCustomerMessage?.user_email || 'patron@ceylontimes.lk';
  const customerPhone = lastCustomerMessage?.user_phone || '+94 77 123 4567';

  // Construct conversation list items
  const conversations: ConversationItem[] = [
    {
      id: 'active-client',
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      lastMessage: messages.length > 0 ? messages[messages.length - 1].text : 'No messages yet',
      lastTime: messages.length > 0 ? messages[messages.length - 1].time : 'Now',
      unreadCount: messages.filter(m => m.role === 'user').length > 0 ? 1 : 0,
      online: true,
      avatarColor: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    },
    {
      id: 'client-inquiry-2',
      name: 'Nimal Bandara (Kandy)',
      email: 'nimal.b@gmail.com',
      phone: '+94 81 223 4910',
      lastMessage: 'Is Cash on Delivery available to Peradeniya?',
      lastTime: '10:45 AM',
      unreadCount: 0,
      online: false,
      avatarColor: 'linear-gradient(135deg, #10B981, #059669)',
    },
    {
      id: 'client-inquiry-3',
      name: 'Anoma Jayasinghe (Galle)',
      email: 'anoma.j@outlook.com',
      phone: '+94 91 224 8812',
      lastMessage: 'Thank you! The Ratnapura sapphire ring arrived safely.',
      lastTime: 'Yesterday',
      unreadCount: 0,
      online: false,
      avatarColor: 'linear-gradient(135deg, #F59E0B, #D97706)',
    },
  ];

  const handleSendReply = (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    sound.playClick();

    const timestamp = new Date();
    const timeStr = timestamp.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
    const tsIso = timestamp.toISOString();

    const newAdminMsg: Message = {
      id: `admin-${Date.now()}`,
      role: 'admin',
      text: textToSend,
      time: timeStr,
      user_name: currentAdmin?.full_name || 'Administrator',
    };

    // 1. Update message history in local storage
    const currentMsgs = getStoredMessages();
    const updatedMsgs = [...currentMsgs, newAdminMsg];
    saveStoredMessages(updatedMsgs);
    setMessages(updatedMsgs);

    // 2. Append to admin reply queue for storefront chatbot polling
    try {
      const existingReplies = JSON.parse(localStorage.getItem(ADMIN_REPLY_KEY) || '[]');
      const updatedReplies = [...existingReplies, { text: textToSend, ts: tsIso }];
      localStorage.setItem(ADMIN_REPLY_KEY, JSON.stringify(updatedReplies));
    } catch {}

    // 3. Dispatch storage event for instant multi-window sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: ADMIN_REPLY_KEY }));
      window.dispatchEvent(new StorageEvent('storage', { key: CHAT_STORAGE_KEY }));
      window.dispatchEvent(new CustomEvent('ceylon_admin_reply', { detail: newAdminMsg }));
    }

    if (!customText) {
      setInputText('');
    }
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation history with this customer?')) {
      sound.playClick();
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem(ADMIN_REPLY_KEY);
      setMessages([]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key: CHAT_STORAGE_KEY }));
      }
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', height: 'calc(100vh - 100px)', minHeight: 600 }}>
      {/* Outer WhatsApp Shell */}
      <div style={{
        height: '100%',
        display: 'flex',
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${T.border}`,
        boxShadow: isLight
          ? '0 12px 36px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 12px 36px rgba(0,0,0,0.5)',
      }}>

        {/* ── LEFT SIDEBAR (Chats List) ── */}
        <aside style={{
          width: 360,
          background: T.sidebarBg,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
        className={mobileShowChat ? 'hidden md:flex' : 'flex w-full md:w-[360px]'}
        >
          {/* Top Bar Header */}
          <div style={{
            height: 64,
            padding: '0 18px',
            background: T.headerBg,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 14,
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}>
                CT
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: 'Outfit, sans-serif' }}>
                  Live Chats
                </div>
                <div style={{ fontSize: 11, color: '#00A884', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A884', display: 'inline-block' }} />
                  Admin Console Active
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={refreshMessages}
                title="Refresh messages"
                style={{
                  background: 'none', border: 'none', color: T.muted, cursor: 'pointer',
                  padding: 7, borderRadius: 8, display: 'flex', alignItems: 'center',
                }}
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              position: 'relative',
              background: isLight ? '#F0F2F5' : '#202C33',
              borderRadius: 10,
              display: 'flex', alignItems: 'center',
            }}>
              <Search size={15} style={{ position: 'absolute', left: 12, color: T.muted }} />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: T.text,
                }}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map((chat) => {
              const isSelected = selectedChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChatId(chat.id);
                    setMobileShowChat(true);
                    sound.playClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isSelected ? T.itemActive : 'transparent',
                    borderBottom: `1px solid ${isLight ? '#F0F2F5' : '#1C272E'}`,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = T.itemHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: chat.avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 15,
                    }}>
                      {chat.name.slice(0, 1)}
                    </div>
                    {chat.online && (
                      <span style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 11, height: 11, borderRadius: '50%',
                        background: '#00A884', border: `2px solid ${T.sidebarBg}`,
                      }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {chat.name}
                      </span>
                      <span style={{ fontSize: 11, color: chat.unreadCount > 0 ? '#00A884' : T.muted, fontWeight: chat.unreadCount > 0 ? 600 : 400 }}>
                        {chat.lastTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{
                        fontSize: 12.5, color: T.muted, margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: 210,
                      }}>
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span style={{
                          background: '#00A884', color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          borderRadius: 20, padding: '1px 6px',
                        }}>
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── RIGHT ACTIVE CHAT PANE ── */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: T.chatBg,
          minWidth: 0,
        }}
        className={!mobileShowChat ? 'hidden md:flex' : 'flex'}
        >
          {/* Chat Header */}
          <div style={{
            height: 64,
            padding: '0 20px',
            background: T.headerBg,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Mobile Back Button */}
              <button
                className="md:hidden"
                onClick={() => setMobileShowChat(false)}
                style={{
                  background: 'none', border: 'none', color: T.text, cursor: 'pointer',
                  padding: 4, marginRight: 2, display: 'flex', alignItems: 'center',
                }}
              >
                <ArrowLeft size={18} />
              </button>

              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                }}>
                  {customerName.slice(0, 1)}
                </div>
                <span style={{
                  position: 'absolute', bottom: 1, right: 1,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#00A884', border: `2px solid ${T.headerBg}`,
                }} />
              </div>

              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{customerName}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px',
                    borderRadius: 10, background: 'rgba(37,99,235,0.12)', color: '#2563EB',
                  }}>
                    Verified Patron
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.muted }}>
                  {customerPhone} · {customerEmail}
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a
                href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                title="Open customer in WhatsApp"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8,
                  background: isLight ? '#E7FCE3' : 'rgba(0,168,132,0.15)',
                  color: '#00A884', border: `1px solid rgba(0,168,132,0.25)`,
                  fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}
              >
                <Phone size={13} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <button
                onClick={handleClearChat}
                title="Clear conversation"
                style={{
                  background: 'none', border: 'none', color: T.muted, cursor: 'pointer',
                  padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Messages Container with WhatsApp subtle background */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: isLight
              ? '#EFEAE2 radial-gradient(#D1D7DB 0.75px, transparent 0.75px)'
              : '#0B141A radial-gradient(#182229 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px',
          }}>
            {/* Encryption notice banner */}
            <div style={{
              margin: '0 auto 12px',
              padding: '6px 14px',
              borderRadius: 8,
              background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(32,44,51,0.85)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              fontSize: 11,
              color: T.muted,
              textAlign: 'center',
              maxWidth: 420,
            }}>
              🔒 Messages are synced real-time with customer storefront and stored on device.
            </div>

            {/* Date Pill */}
            <div style={{ textAlign: 'center', margin: '6px 0 10px' }}>
              <span style={{
                background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(32,44,51,0.9)',
                color: T.muted,
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}>
                Today
              </span>
            </div>

            {/* Message List */}
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: T.muted, maxWidth: 300 }}>
                <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontSize: 13, margin: 0 }}>No messages yet. When customer chats on storefront, replies appear here in real time.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.role === 'admin';
                const isUser = msg.role === 'user';
                const isBot = msg.role === 'bot';

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <div style={{
                      maxWidth: '72%',
                      padding: '8px 12px',
                      borderRadius: isAdmin ? '12px 0px 12px 12px' : '0px 12px 12px 12px',
                      background: isAdmin
                        ? T.adminBubble
                        : isBot
                        ? T.botBubble
                        : T.userBubble,
                      color: isAdmin ? T.adminBubbleText : T.userBubbleText,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}>
                      {/* Sender label */}
                      <div style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: isAdmin
                          ? (isLight ? '#00A884' : '#25D366')
                          : isBot
                          ? '#2563EB'
                          : '#128C7E',
                        marginBottom: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {isAdmin ? 'You (Administrator)' : isBot ? '🤖 AI Assistant' : (msg.user_name || customerName)}
                      </div>

                      {/* Message text */}
                      <div style={{
                        fontSize: 13,
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>

                      {/* Timestamp and delivery tick */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 3,
                        marginTop: 4,
                        fontSize: 10,
                        color: T.muted,
                      }}>
                        <span>{msg.time}</span>
                        {isAdmin && <CheckCheck size={14} color="#53BDEB" />}
                        {isUser && <Check size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Macro Replies Bar */}
          <div style={{
            padding: '8px 16px',
            background: isLight ? '#F0F2F5' : '#202C33',
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={12} color="#00A884" /> Quick Replies:
            </span>
            {QUICK_MACROS.map((macro, idx) => (
              <button
                key={idx}
                onClick={() => handleSendReply(macro)}
                style={{
                  fontSize: 11.5,
                  padding: '5px 12px',
                  borderRadius: 16,
                  background: isLight ? '#FFFFFF' : '#111B21',
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#00A884';
                  (e.currentTarget as HTMLElement).style.color = '#00A884';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = T.border;
                  (e.currentTarget as HTMLElement).style.color = T.text;
                }}
              >
                {macro.slice(0, 36)}…
              </button>
            ))}
          </div>

          {/* WhatsApp Bottom Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendReply();
            }}
            style={{
              padding: '10px 16px',
              background: T.headerBg,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => sound.playClick()}
              title="Add emoji"
              style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 6 }}
            >
              <Smile size={20} />
            </button>

            <button
              type="button"
              onClick={() => sound.playClick()}
              title="Attach media"
              style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 6 }}
            >
              <Paperclip size={19} />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message (Enter to send)…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 22,
                border: 'none',
                background: isLight ? '#FFFFFF' : '#2A3942',
                color: T.text,
                fontSize: 13.5,
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: 'none',
                background: inputText.trim() ? '#00A884' : (isLight ? '#E2E8F0' : '#2A3942'),
                color: '#fff',
                cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: inputText.trim() ? '0 2px 8px rgba(0,168,132,0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={17} style={{ marginLeft: 2 }} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
