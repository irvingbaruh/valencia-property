import { supabase } from '@/lib/supabase';

export const DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.heic,.heif';
const MIME_BY_EXT = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
};
const extOf = (name) => (String(name).split('.').pop() || '').toLowerCase();
const MAX_BYTES = 10 * 1024 * 1024;

// Uploads to the private "documents" bucket under <memberId>/ and records it in the documents table.
export async function uploadDocument({ memberId, file, clientServiceId = null, folderId = null }) {
  const mime = MIME_BY_EXT[extOf(file.name)];
  if (!mime) return { error: 'bad_type', code: 'bad_type' };
  if (file.size > MAX_BYTES) return { error: 'too_big', code: 'too_big' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'no_session', code: 'no_session' };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${memberId}/${Date.now()}-${safeName}`;
  const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { contentType: mime });
  if (upErr) return { error: 'upload_failed', code: 'upload_failed' };

  const { error: dbErr } = await supabase.from('documents').insert({
    user_id: memberId,
    client_service_id: clientServiceId,
    file_name: file.name,
    file_type: mime,
    folder_id: folderId,
    file_size: file.size,
    storage_path: path,
    uploaded_by: user.id,
  });
  if (dbErr) {
    await supabase.storage.from('documents').remove([path]);
    return { error: 'save_failed', code: 'save_failed' };
  }
  return {};
}

// Opens a short-lived signed link in a new tab.
export async function openDocument(storagePath) {
  const { data } = await supabase.storage.from('documents').createSignedUrl(storagePath, 60);
  if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
}

// Admin only: removes the stored file and the record.
export async function adminDeleteDocument(doc) {
  await supabase.storage.from('documents').remove([doc.storage_path]);
  const { error } = await supabase.from('documents').delete().eq('id', doc.id);
  return { error };
}
