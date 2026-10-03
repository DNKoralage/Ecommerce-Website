'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Edit2, Trash2, Eye, ToggleLeft, ToggleRight,
  Package, AlertCircle, Star,
} from 'lucide-react';
import { api } from '@/lib/store';
import { Product, Category } from '@/types';

function formatCurrency(n: number) {
  return 'Rs. ' + n.toLocaleString('en-LK');
}

interface ProductFormProps {
  product: Partial<Product> | null;
  categories: Category[];
  onClose: () => void;
  onSave: (p: Product) => void;
}

function ProductForm({ product, categories, onClose, onSave }: ProductFormProps) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    price: String(product?.price || ''),
    sale_price: String(product?.sale_price || ''),
    sku: product?.sku || '',
    stock_quantity: String(product?.stock_quantity || '0'),
    category_id: product?.category_id || '',
    status: product?.status || 'active',
    tags: product?.tags?.join(', ') || '',
    description: product?.description || '',
    image_url: product?.images?.[0]?.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'title' && !isEdit) {
      setForm(f => ({ ...f, title: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.price) { setError('Title and price are required.'); return; }
    setSaving(true);
    const now = new Date().toISOString();
    const productData: Product = {
      id: product?.id || '',
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      sku: form.sku,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id || null,
      status: form.status as 'active' | 'draft',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: form.description,
      track_inventory: true,
      allow_backorders: false,
      created_at: product?.created_at || now,
      updated_at: now,
      images: form.image_url ? [{ id: 'img-1', image_url: form.image_url, sort_order: 1 }] : (product?.images || []),
      options: product?.options || [],
      variants: product?.variants || [],
    };
    const saved = await api.saveProduct(productData);
    setSaving(false);
    onSave(saved);
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
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div
        style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, width: '100%', maxWidth: 640,
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#E8E6E1' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
          {error && <div style={{ padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#F87171', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => handleChange('title', e.target.value)} style={inputStyle} placeholder="Product name" />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input value={form.slug} onChange={e => handleChange('slug', e.target.value)} style={inputStyle} placeholder="auto-generated" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Price (Rs.) *</label>
              <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Sale Price (Rs.)</label>
              <input type="number" value={form.sale_price} onChange={e => handleChange('sale_price', e.target.value)} style={inputStyle} placeholder="Optional" />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input type="number" value={form.stock_quantity} onChange={e => handleChange('stock_quantity', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>SKU</label>
              <input value={form.sku} onChange={e => handleChange('sku', e.target.value)} style={inputStyle} placeholder="SKU-001" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="" style={{ background: '#111118' }}>No category</option>
                {categories.map(c => <option key={c.id} value={c.id} style={{ background: '#111118' }}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="active" style={{ background: '#111118' }}>Active</option>
                <option value="draft" style={{ background: '#111118' }}>Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Image URL</label>
            <input value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} style={inputStyle} placeholder="https://..." />
          </div>

          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => handleChange('tags', e.target.value)} style={inputStyle} placeholder="luxury, new-arrival, bestseller" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Product description (HTML supported)"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9A9490', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: '11px', borderRadius: 10,
              background: saving ? 'rgba(201,169,110,0.4)' : 'linear-gradient(135deg, #C9A96E, #8B6914)',
              border: 'none', color: '#0A0A0F', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>{saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Product')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Partial<Product> | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const handleToggleStatus = async (product: Product) => {
    const updated: Product = { ...product, status: product.status === 'active' ? 'draft' : 'active' };
    await api.saveProduct(updated);
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Products</h1>
          <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>{products.length} total products</p>
        </div>
        <button
          onClick={() => setEditProduct({})}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg, #C9A96E, #8B6914)',
            border: 'none', color: '#0A0A0F', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 20 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B6760' }} />
        <input
          placeholder="Search by title or SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: '#E8E6E1', fontSize: 13,
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>Loading products…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Package size={32} style={{ margin: '0 auto 12px', color: '#6B6760' }} />
            <p style={{ color: '#6B6760', fontSize: 13 }}>No products found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#6B6760', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                          {product.images?.[0]?.image_url && (
                            <img src={product.images[0].image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#E8E6E1', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</div>
                          <div style={{ fontSize: 11, color: '#6B6760', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={9} fill="#C9A96E" color="#C9A96E" /> {product.rating ?? '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#6B6760', fontFamily: 'monospace', fontSize: 12 }}>{product.sku}</td>
                    <td style={{ padding: '14px 20px', color: '#E8E6E1', fontWeight: 600 }}>
                      {product.sale_price ? (
                        <div>
                          <span style={{ color: '#C9A96E' }}>{formatCurrency(product.sale_price)}</span>
                          <span style={{ fontSize: 11, color: '#6B6760', textDecoration: 'line-through', marginLeft: 6 }}>{formatCurrency(product.price)}</span>
                        </div>
                      ) : formatCurrency(product.price)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        color: product.stock_quantity > 10 ? '#4ADE80' : product.stock_quantity > 0 ? '#FCD34D' : '#F87171',
                        fontWeight: 600,
                      }}>{product.stock_quantity}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => handleToggleStatus(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {product.status === 'active'
                          ? <ToggleRight size={22} color="#4ADE80" />
                          : <ToggleLeft size={22} color="#6B6760" />}
                        <span style={{ fontSize: 12, color: product.status === 'active' ? '#4ADE80' : '#6B6760' }}>
                          {product.status === 'active' ? 'Active' : 'Draft'}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/products/${product.slug}`} target="_blank" style={{ color: '#6B6760', display: 'flex' }}><Eye size={15} /></Link>
                        <button onClick={() => setEditProduct(product)} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', padding: 0, display: 'flex' }}><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteId(product.id)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 0, display: 'flex' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product form modal */}
      {editProduct !== undefined && (
        <ProductForm
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(undefined)}
          onSave={(saved) => {
            setProducts(prev => {
              const idx = prev.findIndex(p => p.id === saved.id);
              if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
              return [saved, ...prev];
            });
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#111118', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center',
          }}>
            <AlertCircle size={36} color="#F87171" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#E8E6E1', margin: '0 0 8px', fontSize: 16 }}>Delete Product?</h3>
            <p style={{ color: '#6B6760', fontSize: 13, margin: '0 0 24px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#9A9490', fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)',
                color: '#F87171', fontWeight: 700, cursor: 'pointer',
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
