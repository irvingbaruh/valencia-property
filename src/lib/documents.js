import { supabase } from '@/lib/supabase';

export const DOC_ACCEPT = '.pdf,.jpg,.jpeg,.png,.docx';
const MAX_BYTES = 10 * 1024 * 1024;

// Uploads to the private "documents" bucket under <memberId>/ and records it in the documents table.
export async function uploadDocument({ memberId, file, clientServiceId = null }) {
  if (file.size > MAX_BYTES) return { error: 'Dosya 10 MB sınırını aşıyor.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Oturum bulunamadı.' };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${memberId}/${Date.now()}-${safeName}`;
  const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type });
  if (upErr) return { error: 'Yükleme başarısız. PDF, JPG, PNG veya DOCX (en fazla 10 MB) yükleyin.' };

  const { error: dbErr } = await supabase.from('documents').insert({
    user_id: memberId,
    client_service_id: clientServiceId,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    storage_path: path,
    uploaded_by: user.id,
  });
  if (dbErr) {
    await supabase.storage.from('documents').remove([path]);
    return { error: 'Dosya kaydedilemedi.' };
  }
  return {};
}

// Opens a short-lived signed link in a new tab.
export async function openDocument(storagePath) {
  const { data } = await supabase.storage.from('documents').createSignedUrl(storagePath, 60);
  if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
}
