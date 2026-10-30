import { supabase } from './supabase';

export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('property_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addFavorite(userId, propertyId) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, property_id: propertyId })
    .select()
    .single();

  if (error) {
    // Unique constraint violation = already favorited, not really an error
    if (error.code === '23505') return { alreadyExists: true };
    throw error;
  }
  return data;
}

export async function removeFavorite(userId, propertyId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) throw error;
}

export async function isFavorited(userId, propertyId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
