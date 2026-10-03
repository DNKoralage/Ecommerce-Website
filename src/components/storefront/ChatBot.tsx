'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageCircle, X, Send, Bot, User, Minimize2,
  ShoppingBag, Package, HelpCircle, Phone, ChevronRight,
  RefreshCw, Sparkles, Lock, LogIn,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
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
  typing?: boolean;
}

// ── Admin reply storage ──────────────────────────────────────────────────────
const CHAT_STORAGE_KEY = 'ct_chat_messages';
const ADMIN_REPLY_KEY  = 'ct_admin_replies';

function getStoredMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveMessages(msgs: Message[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs.slice(-60))); } catch {}
}
function getAdminReplies(): { text: string; ts: string }[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(ADMIN_REPLY_KEY) || '[]'); } catch { return []; }
}

function now() {
  return new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
}

// ── AI response engine ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Track my order',   icon: Package,      q: 'How do I track my order?' },
  { label: 'Payment / COD',    icon: ShoppingBag,  q: 'Do you accept Cash on Delivery?' },
  { label: 'Shipping info',    icon: ChevronRight, q: 'What are your shipping options?' },
  { label: 'Contact support',  icon: Phone,        q: 'How can I reach customer support?' },
];

function getBotReply(input: string): string {
  const q = input.toLowerCase();

  if (q.match(/track|order status|where.*order/))
    return '📦 To track your order, go to **My Account → Orders** and enter your order number. You\'ll see real-time status updates. Orders typically ship within 1–2 business days.';

  if (q.match(/cod|cash on delivery|payment|pay/))
    return '💰 Yes! We support **Cash on Delivery (COD)** island-wide across Sri Lanka. Simply place your order and pay when it arrives at your door. No online payment required.';

  if (q.match(/ship|deliver|courier|how long/))
    return '🚚 We offer:\n• **Standard Delivery** — 3–5 business days (Rs. 350, free over Rs. 7,500)\n• **Express Delivery** — 24–48 hours (Rs. 750)\n\nAll orders include a tracking number.';

  if (q.match(/return|refund|exchange/))
    return '🔄 We have a **7-day return policy** for unused items in original packaging. Visit `/returns` for full details or contact our support team for assistance.';

  if (q.match(/contact|support|help|phone|whatsapp/))
    return '📞 You can reach us at:\n• **WhatsApp:** +94 77 123 4567\n• **Email:** support@ceylontimes.lk\n• **Hours:** Mon–Sat, 9am–6pm\n\nOur team typically responds within 2 hours.';

  if (q.match(/product|item|availab|stock/))
    return '🛍️ Browse our full collection at `/products`. Use the filters to find exactly what you need — we carry Jewellery, Textiles, Ayurveda products, Tea, and more from verified Sri Lankan vendors.';

  if (q.match(/coupon|discount|promo|offer/))
    return '🎁 We regularly offer promotional discounts! Enter your coupon code at checkout. Follow us on social media or subscribe to our newsletter for exclusive deals.';

  if (q.match(/account|login|sign|register/))
    return '👤 You can create an account or log in at `/login`. Having an account lets you track orders, save addresses, and manage your wishlist easily.';

  if (q.match(/hi|hello|hey|good morning|good evening/))
    return '👋 Hello! Welcome to **Ceylon Times** — Sri Lanka\'s trusted marketplace. I\'m here to help with orders, shipping, products, and more. What can I assist you with today?';

  if (q.match(/thank|thanks|great|awesome|perfect/))
    return '😊 You\'re very welcome! Is there anything else I can help you with? Feel free to ask anytime.';

  if (q.match(/admin|dashboard|manage|seller/))
    return '🔐 The Admin Dashboard is accessible at `/admin` for authorised administrators. If you\'re a vendor, please contact us at support@ceylontimes.lk to apply.';

  return `🤔 I'm not sure about that specific query, but I'm happy to help! You can also:\n• Browse [All Products](/products)\n• Visit our [FAQ](/faq)\n• Or contact support at +94 77 123 4567\n\nWould you like me to connect you with a live agent?`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const { theme } = useTheme();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const isLight = theme === 'light';

  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const seenAdminReplies = useRef<Set<string>>(new Set());

  const T = {
    bg:     isLight ? '#FFFFFF' : '#1E293B',
    bg2:    isLight ? '#F8FAFC' : '#0F172A',
    border: isLight ? '#E2E8F0' : '#334155',
    text:   isLight ? '#0F172A' : '#F1F5F9',
    muted:  isLight ? '#64748B' : '#94A3B8',
    userBg: '#2563EB',
    botBg:  isLight ? '#F1F5F9' : '#334155',
  };

  // Load stored messages on mount
  useEffect(() => {
    const stored = getStoredMessages();
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      // Initial greeting
      const greet: Message = {
        id: 'greet',
        role: 'bot',
        text: '👋 Hi! I\'m the **Ceylon Times** assistant. How can I help you today?',
        time: now(),
      };
      setMessages([greet]);
      saveMessages([greet]);
    }
  }, []);

  // Poll for admin replies from dashboard every 5s
  useEffect(() => {
    const poll = setInterval(() => {
      const replies = getAdminReplies();
      replies.forEach(r => {
        if (seenAdminReplies.current.has(r.ts)) return;
        seenAdminReplies.current.add(r.ts);
        const adminMsg: Message = {
          id: `admin-${r.ts}`,
          role: 'admin',
          text: r.text,
          time: new Date(r.ts).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => {
          const next = [...prev, adminMsg];
          saveMessages(next);
          return next;
        });
        if (!open) setUnread(n => n + 1);
        sound.playNotification();
      });
    }, 5000);
    return () => clearInterval(poll);
  }, [open]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnread(0);
    }
  }, [open, minimised]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (!user) {
      sound.playNotification();
      return;
    }
    sound.playClick();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      time: now(),
      user_id: user.id,
      user_name: user.full_name || 'Customer',
      user_email: user.email,
    };
    setMessages(prev => {
      const next = [...prev, userMsg];
      saveMessages(next);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key: CHAT_STORAGE_KEY }));
        window.dispatchEvent(new CustomEvent('ceylon_customer_chat', { detail: userMsg }));
      }
      return next;
    });
    setInput('');
    setTyping(true);

    // Simulate thinking delay (0.8–1.4s)
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const reply = getBotReply(text);
    const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', text: reply, time: now() };
    setMessages(prev => {
      const next = [...prev, botMsg];
      saveMessages(next);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key: CHAT_STORAGE_KEY }));
      }
      return next;
    });
    setTyping(false);
    sound.playChime();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    const greet: Message = {
      id: `greet-${Date.now()}`, role: 'bot',
      text: '👋 Hi! I\'m the **Ceylon Times** assistant. How can I help you today?',
      time: now(),
    };
    setMessages([greet]);
    saveMessages([greet]);
  };

  // Render text with basic **bold** support
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {open && !minimised && (
          <motion.div
            key="chatwindow"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              position: 'fixed', bottom: 84, right: 20, zIndex: 7000,
              width: 360, height: 520,
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 20,
              boxShadow: isLight
                ? '0 24px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(37,99,235,0.1)'
                : '0 24px 80px rgba(0,0,0,0.55)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={19} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Ceylon Times Assistant</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                  Online · AI + Live Support
                </div>
              </div>
              <button onClick={clearChat} title="Clear chat" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}>
                <RefreshCw size={13} />
              </button>
              <button onClick={() => setMinimised(true)} title="Minimise" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}>
                <Minimize2 size={13} />
              </button>
              <button onClick={() => setOpen(false)} title="Close" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}>
                <X size={13} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                  {msg.role !== 'user' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: msg.role === 'admin' ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#2563EB,#3B82F6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {msg.role === 'admin' ? <User size={13} color="#fff" /> : <Sparkles size={13} color="#fff" />}
                    </div>
                  )}
                  <div style={{ maxWidth: '78%' }}>
                    {msg.role === 'admin' && (
                      <div style={{ fontSize: 10, color: '#059669', fontWeight: 600, marginBottom: 3, letterSpacing: '0.04em' }}>LIVE AGENT</div>
                    )}
                    <div style={{
                      padding: '9px 13px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                      background: msg.role === 'user' ? T.userBg : (msg.role === 'admin' ? (isLight ? '#ECFDF5' : 'rgba(5,150,105,0.15)') : T.botBg),
                      color: msg.role === 'user' ? '#fff' : T.text,
                      fontSize: 13, lineHeight: 1.55,
                      border: msg.role === 'admin' ? '1px solid rgba(5,150,105,0.25)' : 'none',
                      whiteSpace: 'pre-line',
                    }}>
                      {renderText(msg.text)}
                    </div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#2563EB,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={13} color="#fff" />
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: T.botBg, display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: T.muted,
                        animation: `bounce 1.2s ${i * 0.2}s infinite`,
                        display: 'inline-block',
                      }} />
                    ))}
                  </div>
                </div>
              )}
              {/* Mandatory Sign In Prompt for Unauthenticated Visitors */}
              {!user && (
                <div style={{
                  padding: '16px 14px',
                  margin: '8px 0',
                  borderRadius: 16,
                  background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.12)',
                  border: '1px solid rgba(37,99,235,0.25)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: '#2563EB', color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8, boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
                  }}>
                    <Lock size={18} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                    Sign In Required
                  </div>
                  <p style={{ fontSize: 11.5, color: T.muted, margin: '0 0 12px', lineHeight: 1.45 }}>
                    Please sign in to your Ceylon Times account to initiate live chat, ask questions, or connect with our support agents.
                  </p>
                  <Link
                    href="/login?redirect=/"
                    onClick={() => sound.playClick()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 16px', borderRadius: 9,
                      background: '#2563EB', color: '#fff',
                      fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      boxShadow: '0 3px 8px rgba(37,99,235,0.25)',
                    }}
                  >
                    <LogIn size={13} />
                    <span>Sign In or Register</span>
                  </Link>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            {user && messages.length <= 2 && !typing && (
              <div style={{ padding: '4px 14px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {QUICK_ACTIONS.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => sendMessage(qa.q)}
                    style={{
                      padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.12)',
                      color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <qa.icon size={11} />
                    {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            {!user ? (
              <div style={{
                padding: '12px 14px',
                borderTop: `1px solid ${T.border}`,
                background: T.bg2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <span style={{ fontSize: 12, color: T.muted }}>Sign in to start messaging</span>
                <Link
                  href="/login?redirect=/"
                  onClick={() => sound.playClick()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 8,
                    background: '#2563EB', color: '#fff',
                    fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                  }}
                >
                  <LogIn size={12} />
                  <span>Sign In</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                padding: '10px 12px',
                borderTop: `1px solid ${T.border}`,
                display: 'flex', gap: 8, alignItems: 'center',
                background: T.bg2,
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message…"
                  style={{
                    flex: 1, padding: '9px 13px', borderRadius: 12, fontSize: 13,
                    background: T.bg, border: `1px solid ${T.border}`,
                    color: T.text, outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = T.border)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none',
                    background: input.trim() && !typing ? 'linear-gradient(135deg,#2563EB,#3B82F6)' : (isLight ? '#E2E8F0' : '#334155'),
                    color: input.trim() && !typing ? '#fff' : T.muted,
                    cursor: input.trim() && !typing ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0,
                    boxShadow: input.trim() && !typing ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimised bar */}
      <AnimatePresence>
        {open && minimised && (
          <motion.div
            key="minimised"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setMinimised(false)}
            style={{
              position: 'fixed', bottom: 84, right: 20, zIndex: 7000,
              background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
              borderRadius: 14, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}
          >
            <Bot size={16} color="#fff" />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Ceylon Times Chat</span>
            {typing && <RefreshCw size={13} color="rgba(255,255,255,0.7)" style={{ animation: 'spin 1s linear infinite' }} />}
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); setMinimised(false); }}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', marginLeft: 4 }}>
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => { sound.playClick(); setOpen(o => !o); setMinimised(false); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', bottom: 24, right: 20, zIndex: 7001,
          width: 54, height: 54, borderRadius: '50%', border: 'none',
          background: open ? (isLight ? '#F1F5F9' : '#334155') : 'linear-gradient(135deg,#2563EB,#3B82F6)',
          color: open ? (isLight ? '#64748B' : '#94A3B8') : '#fff',
          cursor: 'pointer',
          boxShadow: open ? 'none' : '0 8px 28px rgba(37,99,235,0.45), 0 4px 12px rgba(37,99,235,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.25s, box-shadow 0.25s',
        }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          <motion.div key={open ? 'x' : 'chat'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.div>
        </AnimatePresence>

        {/* Unread badge */}
        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: -3, right: -3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#EF4444', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(239,68,68,0.5)',
            }}
          >{unread}</motion.span>
        )}

        {/* Pulse ring when closed */}
        {!open && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(37,99,235,0.35)',
            animation: 'pulse-ring 2.5s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </motion.button>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ── Admin Reply Panel (for use in admin dashboard) ───────────────────────────
export function AdminChatPanel() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');

  const T = {
    bg: isLight ? '#FFFFFF' : 'rgba(30,41,59,0.6)',
    border: isLight ? '#E2E8F0' : '#334155',
    text: isLight ? '#0F172A' : '#F1F5F9',
    muted: isLight ? '#64748B' : '#94A3B8',
  };

  useEffect(() => {
    const load = () => setMessages(getStoredMessages().slice(-20));
    load();
    const iv = setInterval(load, 4000);
    return () => clearInterval(iv);
  }, []);

  const sendAdminReply = () => {
    if (!reply.trim()) return;
    const ts = new Date().toISOString();
    const replies = getAdminReplies();
    try { localStorage.setItem(ADMIN_REPLY_KEY, JSON.stringify([{ text: reply.trim(), ts }, ...replies].slice(0, 20))); } catch {}
    setReply('');
    sound.playClick();
  };

  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.border}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
        background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <MessageCircle size={16} color="#fff" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Live Customer Chat</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{messages.filter(m => m.role === 'user').length} customer messages</div>
        </div>
        <HelpCircle size={14} color="rgba(255,255,255,0.6)" />
      </div>

      {/* Message history */}
      <div style={{ maxHeight: 280, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: T.muted, fontSize: 12, padding: '20px 0' }}>No customer messages yet.</div>
        ) : messages.slice(-15).map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: msg.role === 'user' ? '#EFF6FF' : msg.role === 'admin' ? '#ECFDF5' : '#F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'user' ? <User size={12} color="#2563EB" /> : msg.role === 'admin' ? <User size={12} color="#059669" /> : <Bot size={12} color="#64748B" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: msg.role === 'user' ? '#2563EB' : msg.role === 'admin' ? '#059669' : T.muted, marginBottom: 2 }}>
                {msg.role === 'user' ? 'CUSTOMER' : msg.role === 'admin' ? 'YOU (ADMIN)' : 'AI BOT'} · {msg.time}
              </div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
        <input
          value={reply}
          onChange={e => setReply(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendAdminReply()}
          placeholder="Type admin reply to customer…"
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: 13,
            background: isLight ? '#F8FAFC' : 'rgba(51,65,85,0.5)',
            border: `1px solid ${T.border}`, color: T.text, outline: 'none',
          }}
        />
        <button
          onClick={sendAdminReply}
          disabled={!reply.trim()}
          style={{
            padding: '8px 14px', borderRadius: 10, border: 'none',
            background: reply.trim() ? 'linear-gradient(135deg,#2563EB,#3B82F6)' : (isLight ? '#E2E8F0' : '#334155'),
            color: reply.trim() ? '#fff' : T.muted,
            cursor: reply.trim() ? 'pointer' : 'default',
            fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Send size={13} /> Reply
        </button>
      </div>
    </div>
  );
}
