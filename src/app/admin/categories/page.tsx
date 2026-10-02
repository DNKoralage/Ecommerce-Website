'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/store';
import { Category } from '@/types';

interface CategoryFormProps {
  category: Partial<Category> | null;
  onClose: () => void;
  onSave: (c: Category) => void;
}

const LOCAL_KEY = 'luxe_categories';

function saveCategories(cats: Category[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cats));
  }
}

function CategoryForm({ category, onClose, onSave }: CategoryFormProps) {
  const isEdit = !!category?.id;
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: String(category?.sort_order || ''),
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'name' && !isEdit) {
      setForm(f => ({ ...f, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const saved: Category = {
      id: category?.id || `cat-${Date.now()}`,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description || null,
      image_url: form.image_url || null,
      parent_id: null,
      sort_order: parseInt(form.sort_order) || 99,
      created_at: category?.created_at || now,
      product_count: category?.product_count || 0,
    };
    onSave(saved);
    setSaving(false);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#E8E6E1', fontSize: 13,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#6B6760', letterSpacing: '0.08em',
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 520, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#E8E6E1' }}>{isEdit ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input value={form.name} onChange={e => handleChange('name', e.target.value)} style={inputStyle} placeholder="e.g. Timepieces" />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input value={form.slug} onChange={e => handleChange('slug', e.target.value)} style={inputStyle} placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short description" />
          </div>
          <div>
            <label style={labelStyle}>Image URL</label>
            <input value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} style={inputStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => handleChange('sort_order', e.target.value)} style={inputStyle} placeholder="1" />
          </div>
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9A9490', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #C9A96E, #8B6914)', border: 'none', color: '#0A0A0F', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState<Partial<Category> | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then(c => { setCategories(c); setLoading(false); });
  }, []);

  const handleSave = (saved: Category) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      let next;
      if (idx >= 0) { next = [...prev]; next[idx] = saved; }
      else { next = [saved, ...prev]; }
      saveCategories(next);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      saveCategories(next);
      return next;
    });
    setDeleteId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Categories</h1>
          <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>{categories.length} categories</p>
        </div>
        <button onClick={() => setEditCat({})} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #C9A96E, #8B6914)', border: 'none', color: '#0A0A0F', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16,
      }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6B6760', padding: 48 }}>Loading…</div>
        ) : categories.map(cat => (
          <div key={cat.id} style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            {cat.image_url && (
              <div style={{ height: 120, overflow: 'hidden' }}>
                <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#E8E6E1' }}>{cat.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#C9A96E', fontFamily: 'monospace' }}>/{cat.slug}</p>
                </div>
                <span style={{ fontSize: 11, color: '#6B6760', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 20 }}>
                  {cat.product_count ?? 0} products
                </span>
              </div>
              {cat.description && (
                <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9A9490', lineHeight: 1.5 }}>
                  {cat.description.slice(0, 80)}{cat.description.length > 80 ? '…' : ''}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => setEditCat(cat)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9A9490', fontSize: 12, cursor: 'pointer' }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setDeleteId(cat.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', fontSize: 12, cursor: 'pointer' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editCat !== undefined && (
        <CategoryForm category={editCat} onClose={() => setEditCat(undefined)} onSave={handleSave} />
      )}

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111118', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <AlertCircle size={34} color="#F87171" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ color: '#E8E6E1', margin: '0 0 8px', fontSize: 16 }}>Delete Category?</h3>
            <p style={{ color: '#6B6760', fontSize: 13, margin: '0 0 22px' }}>Products in this category won&apos;t be deleted, but they will lose their category assignment.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9A9490', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', color: '#F87171', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
