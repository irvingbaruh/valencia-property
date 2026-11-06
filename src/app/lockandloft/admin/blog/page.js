'use client';

import { BLOG_CATEGORIES } from '@/lib/blogCategories';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  FileText,
  X,
  Globe,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

const LANG_TABS = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
];

const CATEGORIES = BLOG_CATEGORIES.map((c) => c.tr);

// ============ BLOG EDITOR MODAL ============
function BlogEditorModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState({
    slug: '',
    status: 'draft',
    category: '',
    cover_image: '',
    tags: [],
    seo_title: '',
    seo_description: '',
    title_tr: '', excerpt_tr: '', content_tr: '',
    title_en: '', excerpt_en: '', content_en: '',
    title_es: '', excerpt_es: '', content_es: '',
    title_de: '', excerpt_de: '', content_de: '',
  });
  const [activeLang, setActiveLang] = useState('tr');
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('content'); // content | seo

  useEffect(() => {
    if (post) {
      setForm({
        slug: post.slug || '',
        status: post.status || 'draft',
        category: post.category || '',
        cover_image: post.cover_image || '',
        tags: post.tags || [],
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        title_tr: post.title_tr || '', excerpt_tr: post.excerpt_tr || '', content_tr: post.content_tr || '',
        title_en: post.title_en || '', excerpt_en: post.excerpt_en || '', content_en: post.content_en || '',
        title_es: post.title_es || '', excerpt_es: post.excerpt_es || '', content_es: post.content_es || '',
        title_de: post.title_de || '', excerpt_de: post.excerpt_de || '', content_de: post.content_de || '',
      });
    }
  }, [post]);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const generateSlug = () => {
    const title = form.title_tr || form.title_en || '';
    const slug = title
      .toLowerCase()
      .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    updateField('slug', slug);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    updateField('tags', form.tags.filter(t => t !== tag));
  };

  const handleSave = async (publishNow = false) => {
    if (!form.slug || !form.title_tr) {
      alert('Slug ve Türkçe başlık zorunludur.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publishNow) {
        payload.status = 'published';
        payload.published_at = new Date().toISOString();
      }
      // Get current user for author_id
      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.author_id = user.id;

      let error;
      if (post?.id) {
        payload.updated_at = new Date().toISOString();
        ({ error } = await supabase.from('blog_posts').update(payload).eq('id', post.id));
      } else {
        ({ error } = await supabase.from('blog_posts').insert(payload));
      }

      if (error) throw error;
      onSaved();
    } catch (err) {
      console.error('Blog save error:', err);
      alert('Kaydetme hatası: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl w-full max-w-4xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-[#C9A84C]" />
            <h2 className="text-lg font-semibold text-white">
              {post ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#9A9AAA] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Slug + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9A9AAA] mb-1.5 block">URL Slug *</label>
              <div className="flex gap-2">
                <input
                  value={form.slug}
                  onChange={e => updateField('slug', e.target.value)}
                  placeholder="ornek-blog-yazisi"
                  className="flex-1 bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none"
                />
                <button
                  onClick={generateSlug}
                  className="px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3A] rounded-lg text-xs text-[#9A9AAA] hover:text-white hover:border-[#C9A84C] transition-colors"
                  title="Başlıktan oluştur"
                >
                  Oluştur
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9A9AAA] mb-1.5 block">Kategori</label>
              <select
                value={form.category}
                onChange={e => updateField('category', e.target.value)}
                className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A84C] focus:outline-none"
              >
                <option value="">Seçiniz...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="text-xs text-[#9A9AAA] mb-1.5 block">Kapak Görseli URL</label>
            <div className="flex gap-2">
              <ImageIcon size={16} className="text-[#6A6A7A] mt-2.5" />
              <input
                value={form.cover_image}
                onChange={e => updateField('cover_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-[#9A9AAA] mb-1.5 block">Etiketler</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E1E2E] border border-[#2A2A3A] rounded-full text-xs text-[#9A9AAA]">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-[#DC1C2E]"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Etiket ekle..."
                className="flex-1 bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none"
              />
              <button onClick={addTag} className="px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3A] rounded-lg text-xs text-[#9A9AAA] hover:text-white transition-colors">
                Ekle
              </button>
            </div>
          </div>

          {/* Content / SEO tab switcher */}
          <div className="flex gap-1 bg-[#0B0B11] p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'content' ? 'bg-[#1E1E2E] text-white' : 'text-[#6A6A7A] hover:text-[#9A9AAA]'}`}
            >
              İçerik
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'seo' ? 'bg-[#1E1E2E] text-white' : 'text-[#6A6A7A] hover:text-[#9A9AAA]'}`}
            >
              SEO
            </button>
          </div>

          {activeTab === 'content' && (
            <>
              {/* Language tabs */}
              <div className="flex gap-1 bg-[#0B0B11] p-1 rounded-lg w-fit">
                {LANG_TABS.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                      activeLang === lang.code
                        ? 'bg-[#C9A84C] text-[#0B0B11] font-medium'
                        : 'text-[#6A6A7A] hover:text-[#9A9AAA]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="text-xs text-[#9A9AAA] mb-1.5 block">
                  Başlık ({LANG_TABS.find(l => l.code === activeLang)?.label})
                  {activeLang === 'tr' && ' *'}
                </label>
                <input
                  value={form[`title_${activeLang}`]}
                  onChange={e => updateField(`title_${activeLang}`, e.target.value)}
                  placeholder="Blog yazısı başlığı..."
                  className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs text-[#9A9AAA] mb-1.5 block">
                  Özet ({LANG_TABS.find(l => l.code === activeLang)?.label})
                </label>
                <textarea
                  value={form[`excerpt_${activeLang}`]}
                  onChange={e => updateField(`excerpt_${activeLang}`, e.target.value)}
                  placeholder="Kısa açıklama..."
                  rows={2}
                  className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs text-[#9A9AAA] mb-1.5 block">
                  İçerik ({LANG_TABS.find(l => l.code === activeLang)?.label})
                </label>
                <textarea
                  value={form[`content_${activeLang}`]}
                  onChange={e => updateField(`content_${activeLang}`, e.target.value)}
                  placeholder="Blog yazısının içeriği... (Markdown desteklenir)"
                  rows={12}
                  className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none resize-y font-mono"
                />
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <div>
                <label className="text-xs text-[#9A9AAA] mb-1.5 block">SEO Başlık</label>
                <input
                  value={form.seo_title}
                  onChange={e => updateField('seo_title', e.target.value)}
                  placeholder="Arama motorları için başlık..."
                  className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9A9AAA] mb-1.5 block">SEO Açıklama</label>
                <textarea
                  value={form.seo_description}
                  onChange={e => updateField('seo_description', e.target.value)}
                  placeholder="Meta description..."
                  rows={3}
                  className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#2A2A3A]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${form.status === 'published' ? 'bg-green-500' : 'bg-[#6A6A7A]'}`} />
            <span className="text-xs text-[#9A9AAA]">
              {form.status === 'published' ? 'Yayında' : 'Taslak'}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#9A9AAA] hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 bg-[#1E1E2E] border border-[#2A2A3A] rounded-lg text-sm text-white hover:border-[#C9A84C] transition-colors disabled:opacity-50"
            >
              <Save size={14} className="inline mr-1.5" />
              Taslak Kaydet
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 bg-[#C9A84C] rounded-lg text-sm text-[#0B0B11] font-medium hover:bg-[#D4B85C] transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Yayınla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editorPost, setEditorPost] = useState(undefined); // undefined=closed, null=new, object=edit
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (search.trim()) {
        query = query.or(`title_tr.ilike.%${search}%,title_en.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (!error) setPosts(data || []);
    } catch (err) {
      console.error('Blog fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) {
      setDeleteConfirm(null);
      fetchPosts();
    }
  };

  const togglePublish = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const update = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'published' && !post.published_at) {
      update.published_at = new Date().toISOString();
    }
    await supabase.from('blog_posts').update(update).eq('id', post.id);
    fetchPosts();
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
    } catch { return iso; }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Yönetimi</h1>
          <p className="text-sm text-[#9A9AAA] mt-1">Blog yazılarını oluşturun, düzenleyin ve yayınlayın.</p>
        </div>
        <button
          onClick={() => setEditorPost(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#0B0B11] rounded-xl text-sm font-medium hover:bg-[#D4B85C] transition-colors"
        >
          <Plus size={16} />
          Yeni Yazı
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A7A]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Başlık veya slug ara..."
            className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'published', label: 'Yayında' },
            { value: 'draft', label: 'Taslak' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors border ${
                statusFilter === opt.value
                  ? 'bg-[#C9A84C] text-[#0B0B11] font-medium border-[#C9A84C]'
                  : 'bg-[#151521] text-[#9A9AAA] border-[#2A2A3A] hover:border-[#C9A84C]/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_150px_120px_100px_80px] gap-4 px-6 py-3 border-b border-[#2A2A3A] text-xs text-[#6A6A7A] uppercase tracking-wider">
          <span>Başlık</span>
          <span>Kategori</span>
          <span>Durum</span>
          <span>Tarih</span>
          <span className="text-right">İşlem</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#6A6A7A]">
            <FileText size={40} className="mb-3 opacity-50" />
            <p className="text-sm">Henüz blog yazısı yok</p>
            <button
              onClick={() => setEditorPost(null)}
              className="mt-3 text-sm text-[#C9A84C] hover:underline"
            >
              İlk yazını oluştur →
            </button>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className="grid grid-cols-[1fr_150px_120px_100px_80px] gap-4 items-center px-6 py-4 border-b border-[#2A2A3A]/50 hover:bg-[#1E1E2E]/50 transition-colors"
            >
              {/* Title + slug */}
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{post.title_tr || post.title_en || 'Başlıksız'}</p>
                <p className="text-xs text-[#6A6A7A] truncate mt-0.5">/{post.slug}</p>
              </div>

              {/* Category */}
              <div>
                {post.category ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1E1E2E] border border-[#2A2A3A] rounded-full text-xs text-[#9A9AAA]">
                    <Tag size={10} />
                    {post.category}
                  </span>
                ) : (
                  <span className="text-xs text-[#6A6A7A]">—</span>
                )}
              </div>

              {/* Status */}
              <div>
                <button
                  onClick={() => togglePublish(post)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    post.status === 'published'
                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      : 'bg-[#6A6A7A]/10 text-[#9A9AAA] hover:bg-[#6A6A7A]/20'
                  }`}
                >
                  {post.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                  {post.status === 'published' ? 'Yayında' : 'Taslak'}
                </button>
              </div>

              {/* Date */}
              <span className="text-xs text-[#9A9AAA]">{formatDate(post.published_at || post.created_at)}</span>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setEditorPost(post)}
                  className="p-1.5 text-[#9A9AAA] hover:text-[#C9A84C] transition-colors"
                  title="Düzenle"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(post.id)}
                  className="p-1.5 text-[#9A9AAA] hover:text-[#DC1C2E] transition-colors"
                  title="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Footer */}
        {posts.length > 0 && (
          <div className="px-6 py-3 text-xs text-[#6A6A7A]">
            Toplam {posts.length} yazı
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editorPost !== undefined && (
        <BlogEditorModal
          post={editorPost}
          onClose={() => setEditorPost(undefined)}
          onSaved={() => { setEditorPost(undefined); fetchPosts(); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-white font-semibold mb-2">Yazıyı Sil</h3>
            <p className="text-sm text-[#9A9AAA] mb-6">Bu blog yazısı kalıcı olarak silinecek. Emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-[#9A9AAA] hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-[#DC1C2E] rounded-lg text-sm text-white font-medium hover:bg-[#DC1C2E]/80 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
