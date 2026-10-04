'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Save, Plus, Trash2, ChevronDown, ChevronUp, ExternalLink,
  RefreshCw, Sparkles, Check, AlertCircle, Paintbrush, Type,
  Navigation, Layout, Image, Globe, Link2, Columns, Star,
} from 'lucide-react';
import { api } from '@/lib/store';
import { SiteCustomization, NavLink, FooterColumn, SocialLink, HeroSlide, SiteSettings } from '@/types';
import { useTheme } from '@/context/ThemeContext';

type Tab = 'navigation' | 'footer' | 'hero' | 'identity';

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'navigation', label: 'Navigation', icon: Navigation, desc: 'Top nav links & order' },
  { id: 'footer', label: 'Footer', icon: Layout, desc: 'Columns, social & copyright' },
  { id: 'hero', label: 'Hero Slides', icon: Image, desc: 'Homepage banner slides' },
  { id: 'identity', label: 'Site Identity', icon: Globe, desc: 'Name, tagline & announcement' },
];

/* â”€â”€ Shared style tokens (theme-aware) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function useTokens() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return {
    isLight,
    card: {
      background: isLight ? '#FFFFFF' : 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
      border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 16, padding: 24,
    } as React.CSSProperties,
    inp: {
      width: '100%', padding: '9px 13px', boxSizing: 'border-box',
      background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 10, color: isLight ? '#0F172A' : '#E8E6E1', fontSize: 13, outline: 'none',
    } as React.CSSProperties,
    lbl: {
      fontSize: 11, fontWeight: 700, color: isLight ? '#64748B' : '#6B6760',
      letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6,
    } as React.CSSProperties,
    secTitle: {
      fontSize: 14, fontWeight: 700, color: isLight ? '#0F172A' : '#E8E6E1', marginBottom: 16,
      paddingBottom: 12, borderBottom: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
      display: 'flex', alignItems: 'center', gap: 8,
    } as React.CSSProperties,
    row: {
      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px',
      borderRadius: 12, background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, marginBottom: 8,
    } as React.CSSProperties,
    btnGhost: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 10, border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)'}`,
      background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)', color: isLight ? '#64748B' : '#9A9490', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
    } as React.CSSProperties,
    btnGold: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '9px 18px', borderRadius: 10, border: 'none',
      background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
      color: '#FFFFFF', cursor: 'pointer', fontSize: 12, fontWeight: 700,
    } as React.CSSProperties,
    text: isLight ? '#0F172A' : '#E8E6E1',
    muted: isLight ? '#64748B' : '#6B6760',
    accent: '#2563EB',
  };
}

/* â”€â”€ Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 18, borderRadius: 9, flexShrink: 0,
        background: value ? '#C9A96E' : 'rgba(255,255,255,0.1)',
        transition: 'background 0.2s', cursor: 'pointer', position: 'relative', border: 'none',
      }}
    >
      <div style={{
        width: 12, height: 12, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: value ? 19 : 3, transition: 'left 0.2s',
      }} />
    </button>
  );
}

/* â”€â”€ Confirm Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ConfirmDialog({ msg, onOk, onCancel }: { msg: string; onOk: () => void; onCancel: () => void }) {
  const T = useTokens();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: T.isLight ? '#FFFFFF' : '#151520', border: `1px solid ${T.isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: 28, maxWidth: 380, width: '90%' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <AlertCircle size={20} color="#F87171" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: T.text, fontSize: 14, lineHeight: 1.5 }}>{msg}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={T.btnGhost}>Cancel</button>
          <button onClick={onOk} style={{ ...T.btnGold, background: '#F87171', color: '#fff' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   NAVIGATION TAB
   ===================================================================== */
function NavTab({ links, onChange }: { links: NavLink[]; onChange: (l: NavLink[]) => void }) {
  const T = useTokens();
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ label: '', href: '' });

  const sorted = [...links].sort((a, b) => a.sort_order - b.sort_order);

  const upd = (id: string, p: Partial<NavLink>) => onChange(links.map(l => l.id === id ? { ...l, ...p } : l));
  const del = (id: string) => { onChange(links.filter(l => l.id !== id)); setDelId(null); };

  const swap = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex(l => l.id === id);
    const ni = idx + dir;
    if (ni < 0 || ni >= sorted.length) return;
    const arr = [...sorted];
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    onChange(arr.map((l, i) => ({ ...l, sort_order: i + 1 })));
  };

  const add = () => {
    if (!draft.label.trim() || !draft.href.trim()) return;
    onChange([...links, { id: `nav-${Date.now()}`, label: draft.label.trim(), href: draft.href.trim(), enabled: true, sort_order: links.length + 1 }]);
    setDraft({ label: '', href: '' });
  };

  return (
    <div>
      <div style={T.secTitle}>
        <Navigation size={16} color={T.accent} />
        Top Navigation Links
        <span style={{ marginLeft: 'auto', fontSize: 11, color: T.muted, fontWeight: 400 }}>
          {sorted.filter(l => l.enabled).length}/{sorted.length} enabled
        </span>
      </div>

      {sorted.map((link, idx) => (
        <div key={link.id} style={{ ...T.row, borderColor: editId === link.id ? 'rgba(37,99,235,0.35)' : undefined }}>
          {/* Move arrows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
            <button onClick={() => swap(link.id, -1)} disabled={idx === 0}
              style={{ background: 'none', border: 'none', color: idx === 0 ? '#ccc' : T.muted, cursor: idx === 0 ? 'default' : 'pointer', padding: 2 }}>
              <ChevronUp size={13} />
            </button>
            <button onClick={() => swap(link.id, 1)} disabled={idx === sorted.length - 1}
              style={{ background: 'none', border: 'none', color: idx === sorted.length - 1 ? '#ccc' : T.muted, cursor: idx === sorted.length - 1 ? 'default' : 'pointer', padding: 2 }}>
              <ChevronDown size={13} />
            </button>
          </div>

          <Toggle value={link.enabled} onChange={v => upd(link.id, { enabled: v })} />

          {editId === link.id ? (
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <input value={link.label} onChange={e => upd(link.id, { label: e.target.value })}
                placeholder="Label" style={{ ...T.inp, flex: 1 }} autoFocus />
              <input value={link.href} onChange={e => upd(link.id, { href: e.target.value })}
                placeholder="/path" style={{ ...T.inp, flex: 2, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: link.enabled ? T.text : T.muted }}>{link.label}</div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace' }}>{link.href}</div>
            </div>
          )}

          {editId === link.id ? (
            <button onClick={() => setEditId(null)} style={{ ...T.btnGold, padding: '5px 10px' }}><Check size={13} /> Done</button>
          ) : (
            <button onClick={() => setEditId(link.id)} style={{ ...T.btnGhost, padding: '5px 10px', color: T.accent, borderColor: 'rgba(37,99,235,0.3)' }}>
              <Type size={13} /> Edit
            </button>
          )}
          <button onClick={() => setDelId(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* Add link */}
      <div style={{ ...T.card, padding: 18, marginTop: 8 }}>
        <p style={{ ...T.secTitle, fontSize: 12, marginBottom: 12, paddingBottom: 10 }}><Plus size={14} color="#4ADE80" /> Add Link</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={T.lbl}>Label</label>
            <input value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} placeholder="e.g. Blog" style={T.inp} />
          </div>
          <div>
            <label style={T.lbl}>URL / Path</label>
            <input value={draft.href} onChange={e => setDraft(d => ({ ...d, href: e.target.value }))} placeholder="/blog" style={T.inp} />
          </div>
          <button onClick={add} disabled={!draft.label.trim() || !draft.href.trim()}
            style={{ ...T.btnGold, opacity: (!draft.label.trim() || !draft.href.trim()) ? 0.4 : 1 }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {delId && <ConfirmDialog msg="Remove this nav link?" onOk={() => del(delId)} onCancel={() => setDelId(null)} />}
    </div>
  );
}

/* =====================================================================
   FOOTER TAB
   ===================================================================== */
function FooterTab({ tagline, copyright, columns, socialLinks, badges, onChange }: {
  tagline: string; copyright: string; columns: FooterColumn[];
  socialLinks: SocialLink[]; badges: { id: string; icon: string; text: string; enabled: boolean }[];
  onChange: (p: Partial<SiteCustomization>) => void;
}) {
  const T = useTokens();
  const [expCol, setExpCol] = useState<string | null>(columns[0]?.id ?? null);
  const [delTarget, setDelTarget] = useState<{ type: string; id: string } | null>(null);

  const updCol = (cid: string, p: Partial<FooterColumn>) =>
    onChange({ footer_columns: columns.map(c => c.id === cid ? { ...c, ...p } : c) });

  const updLink = (cid: string, lid: string, p: { label?: string; href?: string; enabled?: boolean }) =>
    onChange({ footer_columns: columns.map(c => c.id === cid ? { ...c, links: c.links.map(l => l.id === lid ? { ...l, ...p } : l) } : c) });

  const addLink = (cid: string) =>
    onChange({ footer_columns: columns.map(c => c.id === cid ? { ...c, links: [...c.links, { id: `fl-${Date.now()}`, label: 'New Link', href: '/', enabled: true }] } : c) });

  const remLink = (cid: string, lid: string) => {
    onChange({ footer_columns: columns.map(c => c.id === cid ? { ...c, links: c.links.filter(l => l.id !== lid) } : c) });
    setDelTarget(null);
  };

  const addCol = () => onChange({ footer_columns: [...columns, { id: `col-${Date.now()}`, heading: 'New Column', links: [{ id: `fl-${Date.now()}`, label: 'Link', href: '/', enabled: true }] }] });
  const remCol = (cid: string) => { onChange({ footer_columns: columns.filter(c => c.id !== cid) }); setDelTarget(null); };

  const updSoc = (id: string, p: Partial<SocialLink>) => onChange({ footer_social_links: socialLinks.map(s => s.id === id ? { ...s, ...p } : s) });
  const updBadge = (id: string, p: { text?: string; enabled?: boolean }) => onChange({ footer_badges: badges.map(b => b.id === id ? { ...b, ...p } : b) });

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Brand text */}
      <div style={T.card}>
        <p style={T.secTitle}><Type size={16} color={T.accent} /> Brand Text</p>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={T.lbl}>Footer Tagline</label>
            <textarea value={tagline} onChange={e => onChange({ footer_tagline: e.target.value })}
              rows={3} style={{ ...T.inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div>
            <label style={T.lbl}>Copyright Text</label>
            <input value={copyright} onChange={e => onChange({ footer_copyright: e.target.value })} style={T.inp} />
          </div>
        </div>
      </div>

      {/* Columns */}
      <div style={T.card}>
        <div style={{ ...T.secTitle, marginBottom: 20 }}>
          <Columns size={16} color={T.accent} /> Footer Columns
          <button onClick={addCol} style={{ ...T.btnGhost, marginLeft: 'auto', color: '#4ADE80', borderColor: 'rgba(74,222,128,0.3)', padding: '5px 12px' }}>
            <Plus size={13} /> Add Column
          </button>
        </div>
        {columns.map(col => (
          <div key={col.id} style={{ border: `1px solid ${T.isLight ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            <div onClick={() => setExpCol(expCol === col.id ? null : col.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: expCol === col.id ? 'rgba(37,99,235,0.08)' : (T.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.02)'), cursor: 'pointer' }}>
              <Columns size={14} color={T.accent} />
              <input value={col.heading} onChange={e => { e.stopPropagation(); updCol(col.id, { heading: e.target.value }); }}
                onClick={e => e.stopPropagation()} style={{ ...T.inp, flex: 1, padding: '5px 8px', fontWeight: 600, background: 'transparent', border: '1px solid transparent' }} />
              <span style={{ color: T.muted, fontSize: 11 }}>{col.links.filter(l => l.enabled).length} links</span>
              {expCol === col.id ? <ChevronUp size={14} color={T.muted} /> : <ChevronDown size={14} color={T.muted} />}
              <button onClick={e => { e.stopPropagation(); setDelTarget({ type: 'col', id: col.id }); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', padding: 4 }}>
                <Trash2 size={13} />
              </button>
            </div>
            {expCol === col.id && (
              <div style={{ padding: 16 }}>
                {col.links.map(link => (
                  <div key={link.id} style={{ ...T.row, marginBottom: 6 }}>
                    <Toggle value={link.enabled} onChange={v => updLink(col.id, link.id, { enabled: v })} />
                    <input value={link.label} onChange={e => updLink(col.id, link.id, { label: e.target.value })}
                      style={{ ...T.inp, flex: 1, padding: '6px 10px' }} placeholder="Label" />
                    <input value={link.href} onChange={e => updLink(col.id, link.id, { href: e.target.value })}
                      style={{ ...T.inp, flex: 2, padding: '6px 10px', fontFamily: 'monospace', fontSize: 12 }} placeholder="/path" />
                    <button onClick={() => setDelTarget({ type: 'link', id: `${col.id}::${link.id}` })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addLink(col.id)} style={{ ...T.btnGhost, width: '100%', justifyContent: 'center', color: '#4ADE80', borderColor: 'rgba(74,222,128,0.2)', marginTop: 8 }}>
                  <Plus size={13} /> Add Link to &quot;{col.heading}&quot;
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social links */}
      <div style={T.card}>
        <p style={T.secTitle}><Globe size={16} color={T.accent} /> Social Media Links</p>
        {socialLinks.map(s => (
          <div key={s.id} style={T.row}>
            <Toggle value={s.enabled} onChange={v => updSoc(s.id, { enabled: v })} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, width: 96, flexShrink: 0 }}>{s.platform}</span>
            <input value={s.url} onChange={e => updSoc(s.id, { url: e.target.value })}
              style={{ ...T.inp, flex: 1, padding: '7px 12px', fontFamily: 'monospace', fontSize: 12 }} placeholder="https://..." />
          </div>
        ))}
      </div>

      {/* Badges */}
      <div style={T.card}>
        <p style={T.secTitle}><Star size={16} color={T.accent} /> Trust Badges</p>
        {badges.map(b => (
          <div key={b.id} style={T.row}>
            <Toggle value={b.enabled} onChange={v => updBadge(b.id, { enabled: v })} />
            <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
            <input value={b.text} onChange={e => updBadge(b.id, { text: e.target.value })}
              style={{ ...T.inp, flex: 1, padding: '7px 12px' }} />
          </div>
        ))}
      </div>

      {delTarget && (
        <ConfirmDialog
          msg={delTarget.type === 'col' ? 'Delete this footer column and all its links?' : 'Remove this footer link?'}
          onOk={() => {
            if (delTarget.type === 'col') remCol(delTarget.id);
            else { const [c, l] = delTarget.id.split('::'); remLink(c, l); }
          }}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}

/* =====================================================================
   HERO SLIDES TAB
   ===================================================================== */
function HeroTab({ slides, onChange }: { slides: HeroSlide[]; onChange: (s: HeroSlide[]) => void }) {
  const T = useTokens();
  const [active, setActive] = useState(slides[0]?.id ?? '');
  const slide = slides.find(s => s.id === active);

  const upd = (p: Partial<HeroSlide>) => onChange(slides.map(s => s.id === active ? { ...s, ...p } : s));

  const addSlide = () => {
    const ns: HeroSlide = { id: `hero-${Date.now()}`, image_url: '', heading: 'New Slide', subheading: 'Enter description.', cta_text: 'Shop Now', cta_link: '/products', badge: '', sort_order: slides.length + 1, is_active: true };
    onChange([...slides, ns]);
    setActive(ns.id);
  };

  const remSlide = (id: string) => {
    const rem = slides.filter(s => s.id !== id);
    onChange(rem);
    setActive(rem[0]?.id ?? '');
  };

  return (
    <div>
      <div style={T.secTitle}>
        <Image size={16} color={T.accent} /> Hero Banner Slides
        <button onClick={addSlide} style={{ ...T.btnGhost, marginLeft: 'auto', color: '#4ADE80', borderColor: 'rgba(74,222,128,0.3)', padding: '5px 12px' }}>
          <Plus size={13} /> Add Slide
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 20 }}>
        {/* Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
              border: active === s.id ? `1px solid rgba(37,99,235,0.4)` : `1px solid ${T.isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              background: active === s.id ? 'rgba(37,99,235,0.1)' : (T.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.02)'),
              color: active === s.id ? T.accent : T.muted, transition: 'all 0.2s',
            }}>
              <div style={{ width: 32, height: 24, borderRadius: 5, overflow: 'hidden', background: T.isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                {s.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.text }}>Slide {i + 1}</div>
                <div style={{ fontSize: 10, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.heading?.slice(0, 22)}</div>
              </div>
              <Toggle value={s.is_active} onChange={v => onChange(slides.map(sl => sl.id === s.id ? { ...sl, is_active: v } : sl))} />
            </button>
          ))}
        </div>

        {/* Editor */}
        {slide ? (
          <div style={{ ...T.card, display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Editing Slide</span>
              {slides.length > 1 && (
                <button onClick={() => { if (confirm('Remove this slide?')) remSlide(slide.id); }}
                  style={{ ...T.btnGhost, color: '#F87171', borderColor: 'rgba(248,113,113,0.25)', padding: '5px 10px' }}>
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
            <div>
              <label style={T.lbl}>Image URL</label>
              <input value={slide.image_url} onChange={e => upd({ image_url: e.target.value })} style={T.inp} placeholder="https://images.unsplash.com/..." />
              {slide.image_url && (
                <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', height: 110 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={T.lbl}>Badge Text</label><input value={slide.badge || ''} onChange={e => upd({ badge: e.target.value })} style={T.inp} placeholder="✦ Collection" /></div>
              <div><label style={T.lbl}>CTA Link</label><input value={slide.cta_link} onChange={e => upd({ cta_link: e.target.value })} style={T.inp} placeholder="/products" /></div>
            </div>
            <div><label style={T.lbl}>Heading</label><input value={slide.heading} onChange={e => upd({ heading: e.target.value })} style={T.inp} /></div>
            <div><label style={T.lbl}>Subheading</label><textarea value={slide.subheading} onChange={e => upd({ subheading: e.target.value })} rows={3} style={{ ...T.inp, resize: 'vertical', lineHeight: 1.6 }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={T.lbl}>CTA Button Text</label><input value={slide.cta_text} onChange={e => upd({ cta_text: e.target.value })} style={T.inp} placeholder="Shop Now" /></div>
              <div><label style={T.lbl}>CTA Text (Sinhala)</label><input value={slide.cta_text_si || ''} onChange={e => upd({ cta_text_si: e.target.value })} style={T.inp} /></div>
            </div>
          </div>
        ) : (
          <div style={{ ...T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 13 }}>Select a slide to edit</div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   IDENTITY TAB
   ===================================================================== */
function IdentityTab({ s, onChange }: {
  s: Pick<SiteSettings, 'site_name' | 'tagline' | 'logo_url' | 'announcement_bar_active' | 'announcement_bar_text' | 'announcement_bar_link'>;
  onChange: (p: Partial<typeof s>) => void;
}) {
  const T = useTokens();
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={T.card}>
        <p style={T.secTitle}><Globe size={16} color={T.accent} /> Store Identity</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={T.lbl}>Store Name</label><input value={s.site_name} onChange={e => onChange({ site_name: e.target.value })} style={T.inp} /></div>
          <div><label style={T.lbl}>Tagline</label><input value={s.tagline} onChange={e => onChange({ tagline: e.target.value })} style={T.inp} /></div>
        </div>
        <div>
          <label style={T.lbl}>Logo URL (optional)</label>
          <input value={s.logo_url || ''} onChange={e => onChange({ logo_url: e.target.value || null })} style={T.inp} placeholder="https://yoursite.com/logo.png" />
          {s.logo_url && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logo_url} alt="Logo preview" style={{ height: 40, maxWidth: 160, objectFit: 'contain', borderRadius: 6, background: T.isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)', padding: 4 }} />
              <button onClick={() => onChange({ logo_url: null })} style={{ ...T.btnGhost, color: '#F87171', borderColor: 'rgba(248,113,113,0.25)', padding: '4px 10px', fontSize: 11 }}>Remove</button>
            </div>
          )}
        </div>
      </div>
      <div style={T.card}>
        <p style={{ ...T.secTitle, marginBottom: 18 }}>
          <Sparkles size={16} color={T.accent} /> Announcement Bar
          <Toggle value={s.announcement_bar_active} onChange={v => onChange({ announcement_bar_active: v })} />
          <span style={{ fontSize: 11, color: s.announcement_bar_active ? '#4ADE80' : T.muted, fontWeight: 400 }}>
            {s.announcement_bar_active ? 'Visible' : 'Hidden'}
          </span>
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={T.lbl}>Announcement Text</label>
            <input value={s.announcement_bar_text || ''} onChange={e => onChange({ announcement_bar_text: e.target.value })} style={T.inp} placeholder="Free shipping on orders over Rs. 7,500" />
          </div>
          <div>
            <label style={T.lbl}>Link (optional)</label>
            <input value={s.announcement_bar_link || ''} onChange={e => onChange({ announcement_bar_link: e.target.value })} style={T.inp} placeholder="/products" />
          </div>
        </div>
      </div>
      <div style={T.card}>
        <p style={T.secTitle}><Link2 size={16} color={T.accent} /> Live Preview</p>
        <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>
          All changes made here are saved to your browser&apos;s local storage and applied to the
          storefront in real-time â€” no deployment or code changes needed. Open the storefront in a new
          tab while editing to see changes live.
        </p>
        <Link href="/" target="_blank" style={{ ...T.btnGold, display: 'inline-flex', marginTop: 16, textDecoration: 'none' }}>
          <ExternalLink size={14} /> Preview Live Storefront
        </Link>
      </div>
    </div>
  );
}

/* =====================================================================
   MAIN PAGE
   ===================================================================== */
export default function AdminCustomizePage() {
  const T = useTokens();
  const [tab, setTab] = useState<Tab>('navigation');
  const [cust, setCust] = useState<SiteCustomization | null>(null);
  const [siteSt, setSiteSt] = useState<Pick<SiteSettings, 'site_name' | 'tagline' | 'logo_url' | 'announcement_bar_active' | 'announcement_bar_text' | 'announcement_bar_link'> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([api.getSiteCustomization(), api.getSiteSettings()]);
    setCust(c);
    setSiteSt({ site_name: s.site_name, tagline: s.tagline, logo_url: s.logo_url, announcement_bar_active: s.announcement_bar_active, announcement_bar_text: s.announcement_bar_text, announcement_bar_link: s.announcement_bar_link });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!cust || !siteSt) return;
    setSaving(true);
    await Promise.all([api.updateSiteCustomization(cust), api.updateSiteSettings(siteSt)]);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    if (!confirm('Reset ALL customizations to factory defaults? This cannot be undone.')) return;
    if (typeof window !== 'undefined') localStorage.removeItem('ceylon_site_customization');
    setLoading(true); await load();
  };

  if (loading || !cust || !siteSt) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <Paintbrush size={32} color={T.accent} style={{ marginBottom: 12, opacity: 0.6 }} />
          <p style={{ color: T.muted, fontSize: 13 }}>Loading Customization Studioâ€¦</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Paintbrush size={22} color={T.accent} /> Site Customizer
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
            No-code visual editor â€” shape every part of your storefront without touching code.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleReset} style={{ ...T.btnGhost, color: '#F87171', borderColor: 'rgba(248,113,113,0.25)' }}>
            <RefreshCw size={14} /> Reset Defaults
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            ...T.btnGold,
            background: saved ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg,#2563EB,#1D4ED8)',
            border: saved ? '1px solid rgba(74,222,128,0.5)' : 'none',
            color: saved ? '#4ADE80' : '#FFFFFF', minWidth: 150,
          }}>
            {saved ? <><Check size={14} /> Saved!</> : saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Savingâ€¦</> : <><Save size={14} /> Save All Changes</>}
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 24, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: T.accent }}>
        <Sparkles size={14} />
        <span>Changes apply to the live storefront immediately after saving â€” no code or deployment needed.</span>
        <Link href="/" target="_blank" style={{ marginLeft: 'auto', color: T.accent, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}>
          Preview <ExternalLink size={12} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar tabs */}
        <nav>
          {TABS.map(t => {
            const Icon = t.icon;
            const isAct = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px',
                borderRadius: 12, marginBottom: 6, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                background: isAct ? 'rgba(37,99,235,0.10)' : 'transparent',
                border: isAct ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent',
                color: isAct ? T.accent : T.muted,
                fontSize: 13, fontWeight: isAct ? 600 : 400,
              }}
                onMouseEnter={e => { if (!isAct) (e.currentTarget as HTMLElement).style.background = T.isLight ? '#F1F5F9' : 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isAct) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Icon size={16} />
                <div>
                  <div style={{ color: T.text }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 1, fontWeight: 400 }}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Content panel */}
        <div>
          {tab === 'navigation' && <NavTab links={cust.nav_links} onChange={nl => setCust(c => c ? { ...c, nav_links: nl } : c)} />}
          {tab === 'footer' && <FooterTab tagline={cust.footer_tagline} copyright={cust.footer_copyright} columns={cust.footer_columns} socialLinks={cust.footer_social_links} badges={cust.footer_badges} onChange={p => setCust(c => c ? { ...c, ...p } : c)} />}
          {tab === 'hero' && <HeroTab slides={cust.hero_slides} onChange={hs => setCust(c => c ? { ...c, hero_slides: hs } : c)} />}
          {tab === 'identity' && <IdentityTab s={siteSt} onChange={p => setSiteSt(s => s ? { ...s, ...p } : s)} />}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: rgba(37,99,235,0.5) !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
        @media (max-width: 860px) {
          div[style*="gridTemplateColumns: '220px 1fr'"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: '190px 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
