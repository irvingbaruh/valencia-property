'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { addFavorite, removeFavorite, isFavorited } from '@/lib/favorites';
import { useLocale } from 'next-intl';

export default function FavoriteButton({ propertyId, className = '' }) {
  const { user } = useAuth();
  const locale = useLocale();
  const [favorited, setFavorited] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (user && propertyId) {
      isFavorited(user.id, String(propertyId))
        .then(setFavorited)
        .catch(() => {});
    }
  }, [user, propertyId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login
      window.location.href = `/${locale}/giris/`;
      return;
    }

    setAnimating(true);
    try {
      if (favorited) {
        await removeFavorite(user.id, String(propertyId));
        setFavorited(false);
      } else {
        await addFavorite(user.id, String(propertyId));
        setFavorited(true);
      }
    } catch {
      // silent
    }
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
        favorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/90 text-gray-400 hover:text-red-400 hover:bg-white'
      } ${animating ? 'scale-125' : 'scale-100'} ${className}`}
    >
      <Heart
        size={16}
        fill={favorited ? 'currentColor' : 'none'}
        strokeWidth={favorited ? 0 : 2}
      />
    </button>
  );
}
