'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { getFavorites, removeFavorite } from '@/lib/favorites';
import { User, Heart, Settings, LogOut, Trash2, MapPin, BedDouble, Maximize2, Phone, Globe, Save, Check } from 'lucide-react';
import Link from 'next/link';

// Same static property data used across the site
const allProperties = [
  { id: '1', title: 'Eixample Dairesi', location: 'Eixample, Valencia', price: '€185.000', rooms: 3, sqm: 95, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80&auto=format' },
  { id: '2', title: 'Ruzafa Çatı Katı', location: 'Ruzafa, Valencia', price: '€320.000', rooms: 4, sqm: 140, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format' },
  { id: '3', title: 'Cabanyal Sahil Evi', location: 'Cabanyal, Valencia', price: '€245.000', rooms: 2, sqm: 80, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format' },
  { id: '4', title: 'El Carmen Dairesi', location: 'El Carmen, Valencia', price: '€185.000', rooms: 2, sqm: 78, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format' },
  { id: '5', title: 'Benimaclet Evi', location: 'Benimaclet, Valencia', price: '€145.000', rooms: 3, sqm: 92, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80&auto=format' },
  { id: '6', title: 'Ciutat Vella Rezidansı', location: 'Ciutat Vella, Valencia', price: '€265.000', rooms: 3, sqm: 110, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&auto=format' },
  { id: '7', title: 'Poblats Marítims Sahil Dairesi', location: 'Poblats Marítims, Valencia', price: '€198.000', rooms: 2, sqm: 85, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80&auto=format' },
  { id: '8', title: 'Patraix Stüdyo Daire', location: 'Patraix, Valencia', price: '€155.000', rooms: 2, sqm: 70, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80&auto=format' },
  { id: '9', title: 'Extramurs Aile Evi', location: 'Extramurs, Valencia', price: '€220.000', rooms: 4, sqm: 125, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80&auto=format' },
];

export default function PanelContent() {
  const t = useTranslations('panel');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { user, profile, loading, signOut, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', preferred_language: 'tr' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/giris`);
    }
  }, [user, loading, locale, router]);

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
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-[var(--color-gold)] text-white'
                  : 'text-[var(--color-charcoal)] hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {loadingFavorites ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : favoriteProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-[var(--color-dark)] mb-2">{t('noFavorites')}</h3>
                <p className="text-[var(--color-charcoal)] mb-6">{t('noFavoritesDesc')}</p>
                <Link
                  href={`/${locale}/mulkler`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-gold)] text-white rounded-xl font-medium hover:bg-[var(--color-gold)]/90 transition-colors"
                >
                  {t('browseMulkler')}
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {favoriteProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                    <div className="relative h-48">
                      <img
                        src={property.image}
                        alt={property.title}
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
                      <h3 className="font-serif text-lg text-[var(--color-dark)] mb-1">{property.title}</h3>
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-lg">
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
              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                  <User className="inline w-4 h-4 mr-1.5" />{tAuth('fullName')}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none"
                  />
                ) : (
                  <p className="text-[var(--color-dark)] py-3">{profile?.full_name || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                  <Phone className="inline w-4 h-4 mr-1.5" />{t('phone')}
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none"
                  />
                ) : (
                  <p className="text-[var(--color-dark)] py-3">{profile?.phone || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                  <Globe className="inline w-4 h-4 mr-1.5" />{t('language')}
                </label>
                {editMode ? (
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none"
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

              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                  {tAuth('email')}
                </label>
                <p className="text-[var(--color-dark)] py-3">{user.email}</p>
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
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-lg">
            <h2 className="text-xl font-serif text-[var(--color-dark)] mb-4">{t('settings')}</h2>
            <p className="text-[var(--color-charcoal)]">
              {locale === 'tr' ? 'Ayarlar yakında eklenecek.' :
               locale === 'es' ? 'Las configuraciones se añadirán pronto.' :
               locale === 'de' ? 'Einstellungen werden bald hinzugefügt.' :
               'Settings coming soon.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
