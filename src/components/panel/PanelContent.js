'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { getFavorites, removeFavorite } from '@/lib/favorites';
import { supabase } from '@/lib/supabase';
import MemberPushSettings from '@/components/panel/MemberPushSettings';
import DocumentManager from '@/components/documents/DocumentManager';
import { User, Heart, Settings, LogOut, Trash2, MapPin, BedDouble, Maximize2, Phone, Globe, Save, Check, Flag, FileCheck, MessageCircle, Shield, Briefcase, Clock, CheckCircle2, ArrowRight, ChevronRight, Bell, FileText } from 'lucide-react';
import Link from 'next/link';
import { localePath } from '@/lib/routes';
import { propertyTitle } from '@/lib/propertyText';

// Same static property data used across the site
const allProperties = [
  { id: '1', hood: 'Eixample', type: 'apartment', location: 'Eixample, Valencia', price: '€185.000', rooms: 3, sqm: 95, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80&auto=format' },
  { id: '2', hood: 'Ruzafa', type: 'penthouse', location: 'Ruzafa, Valencia', price: '€320.000', rooms: 4, sqm: 140, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format' },
  { id: '3', hood: 'Cabanyal', type: 'beachHouse', location: 'Cabanyal, Valencia', price: '€245.000', rooms: 2, sqm: 80, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format' },
  { id: '4', hood: 'El Carmen', type: 'apartment', location: 'El Carmen, Valencia', price: '€185.000', rooms: 2, sqm: 78, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format' },
  { id: '5', hood: 'Benimaclet', type: 'house', location: 'Benimaclet, Valencia', price: '€145.000', rooms: 3, sqm: 92, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80&auto=format' },
  { id: '6', hood: 'Ciutat Vella', type: 'residence', location: 'Ciutat Vella, Valencia', price: '€265.000', rooms: 3, sqm: 110, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&auto=format' },
  { id: '7', hood: 'Poblats Marítims', type: 'seaApartment', location: 'Poblats Marítims, Valencia', price: '€198.000', rooms: 2, sqm: 85, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80&auto=format' },
  { id: '8', hood: 'Patraix', type: 'studio', location: 'Patraix, Valencia', price: '€155.000', rooms: 2, sqm: 70, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80&auto=format' },
  { id: '9', hood: 'Extramurs', type: 'familyHome', location: 'Extramurs, Valencia', price: '€220.000', rooms: 4, sqm: 125, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80&auto=format' },
];

function ProfileField({ icon: Icon, label, value, editMode, inputProps }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
        <Icon className="inline w-4 h-4 mr-1.5" />{label}
      </label>
      {editMode ? (
        <input
          {...inputProps}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-sm"
        />
      ) : (
        <p className="text-[var(--color-dark)] py-3">{value || '—'}</p>
      )}
    </div>
  );
}

const SERVICE_STATUS = {
  pending: { color: '#F59E0B', icon: Clock },
  active: { color: '#22C55E', icon: ArrowRight },
  completed: { color: '#C9A84C', icon: CheckCircle2 },
  on_hold: { color: '#F59E0B', icon: Clock },
  paused: { color: '#F59E0B', icon: Clock },
  cancelled: { color: '#DC1C2E', icon: Clock },
};

// name_xx columns exist for tr/es/en/de; fall back to Turkish
const pickName = (row, locale) => row?.[`name_${locale}`] || row?.name_tr || '';

const LOCALE_TAGS = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' };

const STAGE_STATUS_COLORS = {
  pending: '#9CA3AF',
  in_progress: '#3B82F6',
  completed: '#22C55E',
  skipped: '#9CA3AF',
};

function MyServicesTab({ userId }) {
  const t = useTranslations('panel');
  const locale = useLocale();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState(null);
  const [stages, setStages] = useState({});

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('client_services')
        .select(`
          id, status, notes, started_at, completed_at, created_at,
          service_template:service_template_id (id, name_tr, name_es, name_en, name_de, icon)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setServices(data || []);
      setLoading(false);
    };
    fetchServices();
  }, [userId]);

  const loadStages = async (serviceId) => {
    if (stages[serviceId]) {
      setExpandedService(expandedService === serviceId ? null : serviceId);
      return;
    }
    const { data } = await supabase
      .from('client_service_stages')
      .select(`
        id, status, started_at, completed_at, sort_order,
        stage_template:stage_template_id (name_tr, name_es, name_en, name_de, estimated_days)
      `)
      .eq('client_service_id', serviceId)
      .order('sort_order');
    setStages((prev) => ({ ...prev, [serviceId]: data || [] }));
    setExpandedService(serviceId);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="dark-card rounded-2xl shadow-sm p-12 text-center">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-serif text-[var(--color-dark)] mb-2">{t('noServices')}</h3>
        <p className="text-[var(--color-charcoal)]">
          {t('noServicesDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((svc) => {
        const conf = SERVICE_STATUS[svc.status] || SERVICE_STATUS.pending;
        const ConfIcon = conf.icon;
        const isExpanded = expandedService === svc.id;
        const svcStages = stages[svc.id] || [];
        const completedCount = svcStages.filter((s) => s.status === 'completed').length;
        const progress = svcStages.length > 0 ? Math.round((completedCount / svcStages.length) * 100) : 0;

        return (
          <div key={svc.id} className="dark-card rounded-2xl shadow-sm overflow-hidden">
            {/* Service Header */}
            <button
              onClick={() => loadStages(svc.id)}
              className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${conf.color}15` }}
              >
                <Briefcase className="w-5 h-5" style={{ color: conf.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[var(--color-dark)] font-medium">
                  {pickName(svc.service_template, locale)}
                </p>
                <p className="text-xs text-[var(--color-charcoal)] mt-0.5">
                  {new Date(svc.created_at).toLocaleDateString(LOCALE_TAGS[locale], {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                style={{ background: `${conf.color}15`, color: conf.color }}
              >
                {t(`svc_${svc.status in SERVICE_STATUS ? svc.status : 'pending'}`)}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>

            {/* Expanded Stages */}
            {isExpanded && (
              <div className="px-6 pb-5 border-t border-gray-100">
                {/* Progress bar */}
                {svcStages.length > 0 && (
                  <div className="pt-4 pb-3">
                    <div className="flex justify-between text-xs text-[var(--color-charcoal)] mb-1.5">
                      <span>{t('progress')}</span>
                      <span>{t('stagesDone', { done: completedCount, total: svcStages.length, pct: progress })}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: progress === 100 ? '#22C55E' : 'var(--color-gold)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Stage list */}
                <div className="space-y-2 mt-2">
                  {svcStages.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                        stage.status === 'in_progress' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          background: STAGE_STATUS_COLORS[stage.status] || '#9CA3AF',
                          color: '#fff',
                        }}
                      >
                        {stage.status === 'completed' ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${stage.status === 'completed' ? 'text-gray-400 line-through' : 'text-[var(--color-dark)]'}`}>
                          {pickName(stage.stage_template, locale)}
                        </p>
                        {stage.stage_template?.estimated_days && stage.status !== 'completed' && (
                          <p className="text-[10px] text-gray-400">{t('days', { n: stage.stage_template.estimated_days })}</p>
                        )}
                      </div>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${STAGE_STATUS_COLORS[stage.status]}15`,
                          color: STAGE_STATUS_COLORS[stage.status],
                        }}
                      >
                        {t(`stage_${stage.status}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {svc.notes && (
                  <div className="mt-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-800">{svc.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NotificationsTab({ userId, onUnreadChange }) {
  const t = useTranslations('panel');
  const locale = useLocale();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title_tr, title_es, title_en, title_de, body_tr, body_es, body_en, body_de, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const markRead = async (id) => {
    setItems((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      onUnreadChange?.(next.filter((n) => !n.is_read).length);
      return next;
    });
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="dark-card rounded-2xl shadow-sm p-12 text-center">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-serif text-[var(--color-dark)] mb-2">{t('noNotifications')}</h3>
        <p className="text-[var(--color-charcoal)]">{t('noNotificationsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <button
          key={n.id}
          onClick={() => !n.is_read && markRead(n.id)}
          className={`w-full text-left dark-card rounded-2xl shadow-sm px-6 py-4 flex gap-4 items-start ${n.is_read ? 'opacity-70' : 'border-l-4 border-[var(--color-gold)]'}`}
        >
          <Bell className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-gold)]" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--color-dark)]">{n[`title_${locale}`] || n.title_tr}</p>
            {(n[`body_${locale}`] || n.body_tr) && <p className="text-sm text-[var(--color-charcoal)] mt-0.5">{n[`body_${locale}`] || n.body_tr}</p>}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.created_at).toLocaleString(LOCALE_TAGS[locale], { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {!n.is_read && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-gold)] text-white shrink-0">{t('newBadge')}</span>}
        </button>
      ))}
    </div>
  );
}

const DOC_STATUS = {
  uploaded: { color: '#3B82F6' },
  reviewing: { color: '#F59E0B' },
  approved: { color: '#22C55E' },
  rejected: { color: '#DC1C2E' },
};

function DocumentsTab({ userId }) {
  const locale = useLocale();
  const [services, setServices] = useState(null);

  useEffect(() => {
    supabase
      .from('client_services')
      .select('id, service_template:service_template_id (name_tr, name_es, name_en, name_de)')
      .eq('user_id', userId)
      .then(({ data }) => setServices((data || []).map((s) => ({ id: s.id, name: pickName(s.service_template, locale) }))));
  }, [userId, locale]);

  if (services === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <DocumentManager memberId={userId} lang={locale} services={services} />;
}

export default function PanelContent() {
  const t = useTranslations('panel');
  const tType = useTranslations('propertyType');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { user, profile, loading, signOut, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('favorites');
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (['favorites', 'services', 'documents', 'notifications', 'profile', 'settings'].includes(tab)) setActiveTab(tab);
  }, []);
  const [unreadCount, setUnreadCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', preferred_language: 'tr', country: '', citizenship: '', has_residence_permit: '', whatsapp_phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasIntake, setHasIntake] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(localePath(locale, 'giris'));
    }
  }, [user, loading, locale, router]);

  // Unread notification count for the tab badge
  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user]);

  // Has the member filled in the consultation form yet?
  useEffect(() => {
    if (!user) return;
    supabase
      .from('client_intake')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count, error }) => setHasIntake(error ? true : (count || 0) > 0));
  }, [user]);

  // Load favorites
  useEffect(() => {
    if (user) {
      getFavorites(user.id)
        .then((favs) => {
          setFavorites(favs);
          setLoadingFavorites(false);
        })
        .catch(() => setLoadingFavorites(false));
    }
  }, [user]);

  // Populate form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language || 'tr',
        country: profile.country || '',
        citizenship: profile.citizenship || '',
        has_residence_permit: profile.has_residence_permit || '',
        whatsapp_phone: profile.whatsapp_phone || '',
      });
    }
  }, [profile]);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      await removeFavorite(user.id, propertyId);
      setFavorites(favorites.filter((f) => f.property_id !== propertyId));
    } catch {
      // silent fail
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    await updateProfile(formData);
    setSaving(false);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-soft)]">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const favoriteProperties = allProperties.filter((p) =>
    favorites.some((f) => f.property_id === p.id)
  );

  const tabs = [
    { id: 'favorites', label: t('favorites'), icon: Heart },
    { id: 'services', label: t('tabServices'), icon: Briefcase },
    { id: 'documents', label: t('tabDocuments'), icon: FileText },
    { id: 'notifications', label: t('tabNotifications'), icon: Bell, badge: unreadCount },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-soft)] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-[var(--color-dark)]">{t('title')}</h1>
            <p className="text-[var(--color-charcoal)] mt-1">
              {t('welcome')}, {profile?.full_name || user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-charcoal)] hover:text-red-600 border border-gray-200 rounded-xl hover:border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {tAuth('logout')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 dark-card rounded-xl p-1 shadow-sm mb-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === id
                  ? 'bg-[var(--color-gold)] text-white'
                  : 'text-[var(--color-charcoal)] hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-[var(--color-red,#DC1C2E)] text-white text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {!hasIntake && (
          <div className="mb-6 dark-card rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4 border border-[var(--color-gold)]/30">
            <div className="flex-1">
              <h3 className="font-serif text-lg text-[var(--color-dark)]">{t('completeTitle')}</h3>
              <p className="text-sm text-[var(--color-charcoal)] mt-1">{t('completeBody')}</p>
            </div>
            <Link
              href={localePath(locale, 'hizmetler', '#consultation-form')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-dark)] text-white text-sm font-medium hover:bg-black transition-colors"
            >
              {t('completeCta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {loadingFavorites ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : favoriteProperties.length === 0 ? (
              <div className="dark-card rounded-2xl shadow-sm p-12 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-[var(--color-dark)] mb-2">{t('noFavorites')}</h3>
                <p className="text-[var(--color-charcoal)] mb-6">{t('noFavoritesDesc')}</p>
                <Link
                  href={localePath(locale, 'mulkler')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-gold)] text-white rounded-xl font-medium hover:bg-[var(--color-gold)]/90 transition-colors"
                >
                  {t('browseMulkler')}
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {favoriteProperties.map((property) => (
                  <div key={property.id} className="dark-card rounded-2xl shadow-sm overflow-hidden group">
                    <div className="relative h-48">
                      <img
                        src={property.image}
                        alt={propertyTitle(property, tType, locale)}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(property.id)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-[var(--color-dark)] mb-1">{propertyTitle(property, tType, locale)}</h3>
                      <p className="flex items-center gap-1 text-sm text-[var(--color-charcoal)] mb-3">
                        <MapPin className="w-3.5 h-3.5" /> {property.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[var(--color-gold)]">{property.price}</span>
                        <div className="flex gap-3 text-sm text-[var(--color-charcoal)]">
                          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.rooms}</span>
                          <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {property.sqm}m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <MyServicesTab userId={user.id} />
        )}

        {activeTab === 'documents' && <DocumentsTab userId={user.id} />}

        {activeTab === 'notifications' && (
          <NotificationsTab userId={user.id} onUnreadChange={setUnreadCount} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dark-card rounded-2xl shadow-sm p-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-[var(--color-dark)]">{t('profile')}</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-sm text-[var(--color-gold)] font-medium hover:underline"
                >
                  {t('editProfile')}
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProfileField
                  icon={User}
                  label={tAuth('fullName')}
                  value={profile?.full_name}
                  editMode={editMode}
                  inputProps={{
                    type: 'text',
                    value: formData.full_name,
                    onChange: (e) => setFormData({ ...formData, full_name: e.target.value }),
                  }}
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                    {tAuth('email')}
                  </label>
                  <p className="text-[var(--color-dark)] py-3 text-sm bg-gray-50 rounded-xl px-4">{user.email}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProfileField
                  icon={Phone}
                  label={t('phone')}
                  value={profile?.phone}
                  editMode={editMode}
                  inputProps={{
                    type: 'tel',
                    value: formData.phone,
                    onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                    placeholder: '+90 5xx xxx xx xx',
                  }}
                />
                <ProfileField
                  icon={MessageCircle}
                  label="WhatsApp"
                  value={profile?.whatsapp_phone}
                  editMode={editMode}
                  inputProps={{
                    type: 'tel',
                    value: formData.whatsapp_phone,
                    onChange: (e) => setFormData({ ...formData, whatsapp_phone: e.target.value }),
                    placeholder: '+90 5xx xxx xx xx',
                  }}
                />
              </div>

              {/* Location & Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProfileField
                  icon={Flag}
                  label={t('country')}
                  value={profile?.country}
                  editMode={editMode}
                  inputProps={{
                    type: 'text',
                    value: formData.country,
                    onChange: (e) => setFormData({ ...formData, country: e.target.value }),
                    placeholder: t('countryPh'),
                  }}
                />
                <ProfileField
                  icon={Shield}
                  label={t('citizenship')}
                  value={profile?.citizenship}
                  editMode={editMode}
                  inputProps={{
                    type: 'text',
                    value: formData.citizenship,
                    onChange: (e) => setFormData({ ...formData, citizenship: e.target.value }),
                    placeholder: t('citizenshipPh'),
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProfileField
                  icon={FileCheck}
                  label={t('residence')}
                  value={profile?.has_residence_permit}
                  editMode={editMode}
                  inputProps={{
                    type: 'text',
                    value: formData.has_residence_permit,
                    onChange: (e) => setFormData({ ...formData, has_residence_permit: e.target.value }),
                    placeholder: t('residencePh'),
                  }}
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                    <Globe className="inline w-4 h-4 mr-1.5" />{t('language')}
                  </label>
                  {editMode ? (
                    <select
                      value={formData.preferred_language}
                      onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-sm"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  ) : (
                    <p className="text-[var(--color-dark)] py-3">
                      {{ tr: 'Türkçe', es: 'Español', en: 'English', de: 'Deutsch' }[profile?.preferred_language] || 'Türkçe'}
                    </p>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gold)] text-white rounded-xl font-medium hover:bg-[var(--color-gold)]/90 transition-colors disabled:opacity-60"
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? t('saved') : saving ? '...' : t('save')}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-[var(--color-charcoal)] hover:bg-gray-50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab — placeholder for now */}
        {activeTab === 'settings' && (
          <div className="dark-card rounded-2xl shadow-sm p-8 max-w-lg">
            <h2 className="text-xl font-serif text-[var(--color-dark)] mb-4">{t('mailingTitle')}</h2>
            <p className="text-[var(--color-charcoal)] text-sm mb-5">{t('mailingDesc')}</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(profile?.marketing_opt_in)}
                onChange={(e) => updateProfile({ marketing_opt_in: e.target.checked })}
                className="w-5 h-5 accent-[#C9A84C]"
              />
              <span className="text-sm font-medium text-[var(--color-dark)]">
                {profile?.marketing_opt_in ? t('mailingOn') : t('mailingOff')}
              </span>
            </label>
          </div>
        )}
        {activeTab === 'settings' && <MemberPushSettings />}
      </div>
    </div>
  );
}
