'use client';

/*
 * DocumentManager — one member's documents: folders, upload, move, delete.
 * Used by the member panel (isAdmin = false, light theme, member's language) and by the
 * admin member page (isAdmin = true, dark theme, Turkish).
 *  - Moving a file between folders needs no approval (RPC move_document).
 *  - Admin deletes directly after a second "are you sure?" step.
 *  - A member can only ask for deletion, with a reason; the admin approves or declines.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadDocument, openDocument, adminDeleteDocument, DOC_ACCEPT } from '@/lib/documents';
import { notifyMember, TEXT } from '@/lib/adminServices';
import { FileText, Folder, FolderPlus, Upload, Download, Trash2, Check, X, Pencil } from 'lucide-react';

const STR = {
  tr: {
    upload: 'Belge yükle', choose: 'Dosya seç', uploading: 'Yükleniyor…', formats: 'PDF, Word, Excel, JPG, PNG, HEIC · en fazla 10 MB',
    all: 'Tümü', none: 'Klasörsüz', newFolder: 'Yeni klasör', folderName: 'Klasör adı', create: 'Oluştur', cancel: 'Vazgeç', save: 'Kaydet',
    renameFolder: 'Klasörü yeniden adlandır', deleteFolder: 'Klasörü sil', deleteFolderBody: 'Klasör silinir, içindeki dosyalar silinmez; “Klasörsüz”e taşınır.',
    moveTo: 'Taşı', noFolder: 'Klasörsüz', del: 'Sil', sure: 'Emin misiniz?', deleteBody: (n) => `“${n}” kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
    yesDelete: 'Evet, sil', requestTitle: 'Silme isteği gönder', requestBody: (n) => `“${n}” dosyasını silmek için yönetici onayı gerekir. Lütfen nedenini yazın.`,
    reasonPh: 'Neden silmek istiyorsunuz?', send: 'İsteği gönder', pending: 'Silme isteği onay bekliyor', cancelRequest: 'İsteği geri çek',
    reasonLabel: 'Neden', approveDelete: 'Silmeyi onayla', declineDelete: 'Reddet', empty: 'Bu klasörde dosya yok.', emptyAll: 'Henüz dosya yok.',
    service: 'Dosyanın hizmeti', noService: 'Hizmetten bağımsız', approve: 'Onayla', reject: 'Reddet', rejectReason: 'Ret nedeni (üyeye gösterilir)',
    open: 'Dosyayı aç', uploadForMember: 'Üye adına yükle',
    st: { uploaded: 'Yüklendi', reviewing: 'İnceleniyor', approved: 'Onaylandı', rejected: 'Reddedildi' },
    err: { too_big: 'Dosya 10 MB sınırını aşıyor.', no_session: 'Oturum bulunamadı.', save_failed: 'Dosya kaydedilemedi.', bad_type: 'Bu dosya türü desteklenmiyor.', upload_failed: 'Yükleme başarısız.', folder_exists: 'Bu adla bir klasör zaten var.', generic: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.' },
  },
  es: {
    upload: 'Subir documento', choose: 'Elegir archivo', uploading: 'Subiendo…', formats: 'PDF, Word, Excel, JPG, PNG, HEIC · máx. 10 MB',
    all: 'Todos', none: 'Sin carpeta', newFolder: 'Nueva carpeta', folderName: 'Nombre de la carpeta', create: 'Crear', cancel: 'Cancelar', save: 'Guardar',
    renameFolder: 'Renombrar carpeta', deleteFolder: 'Eliminar carpeta', deleteFolderBody: 'Se elimina la carpeta, no los archivos: pasan a «Sin carpeta».',
    moveTo: 'Mover', noFolder: 'Sin carpeta', del: 'Eliminar', sure: '¿Está seguro?', deleteBody: (n) => `«${n}» se eliminará definitivamente. No se puede deshacer.`,
    yesDelete: 'Sí, eliminar', requestTitle: 'Solicitar eliminación', requestBody: (n) => `Para eliminar «${n}» se necesita la aprobación del administrador. Indique el motivo.`,
    reasonPh: '¿Por qué quiere eliminarlo?', send: 'Enviar solicitud', pending: 'Solicitud de eliminación pendiente', cancelRequest: 'Retirar solicitud',
    reasonLabel: 'Motivo', approveDelete: 'Aprobar eliminación', declineDelete: 'Rechazar', empty: 'No hay archivos en esta carpeta.', emptyAll: 'Aún no hay archivos.',
    service: 'Servicio del archivo', noService: 'Sin servicio', approve: 'Aprobar', reject: 'Rechazar', rejectReason: 'Motivo del rechazo',
    open: 'Abrir archivo', uploadForMember: 'Subir en nombre del miembro',
    st: { uploaded: 'Subido', reviewing: 'En revisión', approved: 'Aprobado', rejected: 'Rechazado' },
    err: { too_big: 'El archivo supera el límite de 10 MB.', no_session: 'No se encontró la sesión.', save_failed: 'No se pudo guardar el archivo.', bad_type: 'Este tipo de archivo no es compatible.', upload_failed: 'La subida ha fallado.', folder_exists: 'Ya existe una carpeta con ese nombre.', generic: 'No se pudo completar la acción. Inténtelo de nuevo.' },
  },
  en: {
    upload: 'Upload a document', choose: 'Choose file', uploading: 'Uploading…', formats: 'PDF, Word, Excel, JPG, PNG, HEIC · max 10 MB',
    all: 'All', none: 'No folder', newFolder: 'New folder', folderName: 'Folder name', create: 'Create', cancel: 'Cancel', save: 'Save',
    renameFolder: 'Rename folder', deleteFolder: 'Delete folder', deleteFolderBody: 'The folder is deleted, not its files: they move to “No folder”.',
    moveTo: 'Move', noFolder: 'No folder', del: 'Delete', sure: 'Are you sure?', deleteBody: (n) => `“${n}” will be permanently deleted. This cannot be undone.`,
    yesDelete: 'Yes, delete', requestTitle: 'Request deletion', requestBody: (n) => `Deleting “${n}” needs the administrator's approval. Please tell us why.`,
    reasonPh: 'Why do you want to delete it?', send: 'Send request', pending: 'Deletion request awaiting approval', cancelRequest: 'Withdraw request',
    reasonLabel: 'Reason', approveDelete: 'Approve deletion', declineDelete: 'Decline', empty: 'No files in this folder.', emptyAll: 'No files yet.',
    service: 'File belongs to service', noService: 'No service', approve: 'Approve', reject: 'Reject', rejectReason: 'Rejection reason',
    open: 'Open file', uploadForMember: 'Upload on behalf of member',
    st: { uploaded: 'Uploaded', reviewing: 'In review', approved: 'Approved', rejected: 'Rejected' },
    err: { too_big: 'The file exceeds the 10 MB limit.', no_session: 'Session not found.', save_failed: 'The file could not be saved.', bad_type: 'This file type is not supported.', upload_failed: 'Upload failed.', folder_exists: 'A folder with this name already exists.', generic: 'Could not complete the action. Please try again.' },
  },
  de: {
    upload: 'Dokument hochladen', choose: 'Datei wählen', uploading: 'Wird hochgeladen…', formats: 'PDF, Word, Excel, JPG, PNG, HEIC · max. 10 MB',
    all: 'Alle', none: 'Ohne Ordner', newFolder: 'Neuer Ordner', folderName: 'Ordnername', create: 'Erstellen', cancel: 'Abbrechen', save: 'Speichern',
    renameFolder: 'Ordner umbenennen', deleteFolder: 'Ordner löschen', deleteFolderBody: 'Der Ordner wird gelöscht, nicht seine Dateien: Sie wandern zu „Ohne Ordner“.',
    moveTo: 'Verschieben', noFolder: 'Ohne Ordner', del: 'Löschen', sure: 'Sind Sie sicher?', deleteBody: (n) => `„${n}“ wird endgültig gelöscht. Das kann nicht rückgängig gemacht werden.`,
    yesDelete: 'Ja, löschen', requestTitle: 'Löschung beantragen', requestBody: (n) => `Zum Löschen von „${n}“ ist die Zustimmung der Verwaltung nötig. Bitte nennen Sie den Grund.`,
    reasonPh: 'Warum möchten Sie es löschen?', send: 'Antrag senden', pending: 'Löschantrag wartet auf Freigabe', cancelRequest: 'Antrag zurückziehen',
    reasonLabel: 'Grund', approveDelete: 'Löschung freigeben', declineDelete: 'Ablehnen', empty: 'Keine Dateien in diesem Ordner.', emptyAll: 'Noch keine Dateien.',
    service: 'Leistung der Datei', noService: 'Ohne Leistung', approve: 'Genehmigen', reject: 'Ablehnen', rejectReason: 'Ablehnungsgrund',
    open: 'Datei öffnen', uploadForMember: 'Im Namen des Mitglieds hochladen',
    st: { uploaded: 'Hochgeladen', reviewing: 'In Prüfung', approved: 'Genehmigt', rejected: 'Abgelehnt' },
    err: { too_big: 'Die Datei überschreitet das Limit von 10 MB.', no_session: 'Sitzung nicht gefunden.', save_failed: 'Die Datei konnte nicht gespeichert werden.', bad_type: 'Dieser Dateityp wird nicht unterstützt.', upload_failed: 'Upload fehlgeschlagen.', folder_exists: 'Ein Ordner mit diesem Namen existiert bereits.', generic: 'Aktion nicht möglich. Bitte erneut versuchen.' },
  },
};

const STATUS_COLOR = { uploaded: '#3B82F6', reviewing: '#F59E0B', approved: '#22C55E', rejected: '#DC1C2E' };

const THEMES = {
  dark: {
    wrap: 'space-y-4',
    box: 'rounded-lg bg-[#0B0B11] border border-[#1E1E2E]',
    text: 'text-white',
    muted: 'text-[#9A9AAA]',
    faint: 'text-[#6A6A7A]',
    input: 'bg-[#0E0E18] border border-[#2A2A3C] text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C]',
    chip: 'bg-[#0B0B11] border border-[#1E1E2E] text-[#9A9AAA] hover:text-white',
    chipOn: 'bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C]',
    primary: 'bg-[#C9A84C] text-[#0B0B11]',
    soft: 'bg-[#C9A84C]/15 text-[#C9A84C]',
    modal: 'bg-[#151521] border border-[#1E1E2E] text-white',
    icon: 'text-[#9A9AAA] hover:text-white hover:bg-white/10',
    select: 'bg-[#0B0B11] border border-[#1E1E2E] text-white',
  },
  light: {
    wrap: 'space-y-4',
    box: 'rounded-2xl bg-white shadow-sm',
    text: 'text-[var(--color-dark)]',
    muted: 'text-[var(--color-charcoal)]',
    faint: 'text-[var(--color-charcoal)]/70',
    input: 'bg-white border border-gray-200 text-[var(--color-dark)] focus:border-[var(--color-gold)]',
    chip: 'bg-white border border-gray-200 text-[var(--color-charcoal)] hover:text-[var(--color-dark)]',
    chipOn: 'bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/50 text-[var(--color-dark)]',
    primary: 'bg-[var(--color-gold)] text-white',
    soft: 'bg-[var(--color-gold)]/15 text-[var(--color-dark)]',
    modal: 'bg-white text-[var(--color-dark)]',
    icon: 'text-gray-500 hover:text-[var(--color-dark)] hover:bg-gray-100',
    select: 'bg-white border border-gray-200 text-[var(--color-dark)]',
  },
};

const fmtDate = (d, lang) =>
  d ? new Date(d).toLocaleDateString({ tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' }[lang], { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function DocumentManager({ memberId, isAdmin = false, lang = 'tr', services = [], onChanged }) {
  const L = STR[lang] || STR.en;
  const T = THEMES[isAdmin ? 'dark' : 'light'];
  const [docs, setDocs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState('all'); // 'all' | 'none' | folder id
  const [serviceId, setServiceId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState(null); // null = closed
  const [renaming, setRenaming] = useState(null); // { id, name }
  const [modal, setModal] = useState(null); // { type: 'delete'|'request'|'folder'|'reject', doc?, folder? }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [d, f] = await Promise.all([
      supabase.from('documents').select('*').eq('user_id', memberId).order('created_at', { ascending: false }),
      supabase.from('document_folders').select('*').eq('user_id', memberId).order('name'),
    ]);
    setDocs(d.data || []);
    setFolders(f.data || []);
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const done = () => {
    setModal(null);
    setReason('');
    setBusy(false);
    load();
    onChanged?.();
  };
  const fail = (key = 'generic') => {
    setBusy(false);
    setError(L.err[key] || L.err.generic);
  };

  const serviceName = (id) => services.find((s) => s.id === id)?.name;
  const folderName = (id) => folders.find((f) => f.id === id)?.name;
  const count = (id) => docs.filter((d) => (id === 'all' ? true : id === 'none' ? !d.folder_id : d.folder_id === id)).length;
  const shown = docs.filter((d) => (folder === 'all' ? true : folder === 'none' ? !d.folder_id : d.folder_id === folder));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    const targetFolder = folder !== 'all' && folder !== 'none' ? folder : null;
    const { error: err, code } = await uploadDocument({ memberId, file, clientServiceId: serviceId || null, folderId: targetFolder });
    setUploading(false);
    if (err) return setError(L.err[code] || L.err.upload_failed);
    if (isAdmin) await notifyMember({ userId: memberId, type: 'document_added', ...TEXT.documentAdded(file.name) });
    load();
    onChanged?.();
  };

  const createFolder = async () => {
    const name = (newName || '').trim();
    if (!name) return;
    setError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error: err } = await supabase.from('document_folders').insert({ user_id: memberId, name, created_by: user?.id }).select('id').single();
    if (err) return setError(err.code === '23505' ? L.err.folder_exists : L.err.generic);
    setNewName(null);
    setFolder(data.id);
    load();
  };

  const renameFolder = async () => {
    const name = (renaming?.name || '').trim();
    if (!name) return;
    const { error: err } = await supabase.from('document_folders').update({ name }).eq('id', renaming.id);
    if (err) return setError(err.code === '23505' ? L.err.folder_exists : L.err.generic);
    setRenaming(null);
    load();
  };

  const removeFolder = async () => {
    setBusy(true);
    const { error: err } = await supabase.from('document_folders').delete().eq('id', modal.folder.id);
    if (err) return fail();
    if (folder === modal.folder.id) setFolder('all');
    done();
  };

  const move = async (doc, target) => {
    setError('');
    const { error: err } = await supabase.rpc('move_document', { p_doc: doc.id, p_folder: target || null });
    if (err) return setError(L.err.generic);
    load();
  };

  const review = async (doc, status, why) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from('documents')
      .update({
        status,
        rejection_reason: status === 'rejected' ? why || null : null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', doc.id);
    await notifyMember({
      userId: memberId,
      type: status === 'approved' ? 'document_approved' : 'document_rejected',
      ...TEXT.document(status === 'approved', doc.file_name, why),
      clientServiceId: doc.client_service_id,
    });
    done();
  };

  const confirmDelete = async () => {
    setBusy(true);
    const { error: err } = await adminDeleteDocument(modal.doc);
    if (err) return fail();
    await notifyMember({ userId: memberId, type: 'document_deleted', ...TEXT.documentDeleted(modal.doc.file_name) });
    done();
  };

  const sendRequest = async () => {
    setBusy(true);
    const { error: err } = await supabase.rpc('request_document_deletion', { p_doc: modal.doc.id, p_reason: reason });
    if (err) return fail();
    done();
  };

  const withdrawRequest = async (doc) => {
    await supabase.rpc('cancel_document_deletion', { p_doc: doc.id });
    load();
  };

  const declineDeletion = async (doc) => {
    await supabase.rpc('cancel_document_deletion', { p_doc: doc.id });
    await notifyMember({ userId: memberId, type: 'document_deletion_declined', ...TEXT.deletionRejected(doc.file_name) });
    load();
    onChanged?.();
  };

  const btn = `px-3 py-2 rounded-lg text-sm font-medium`;

  if (loading) return <p className={`text-sm ${T.muted}`}>…</p>;

  return (
    <div className={T.wrap}>
      {/* Upload */}
      <div className={`${T.box} px-5 py-4 flex flex-wrap items-center gap-3`}>
        <div className="flex-1 min-w-[12rem]">
          <p className={`font-medium ${T.text}`}>{isAdmin ? L.uploadForMember : L.upload}</p>
          <p className={`text-xs ${T.muted}`}>{L.formats}</p>
        </div>
        {services.length > 0 && (
          <select aria-label={L.service} value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={`text-sm rounded-lg px-3 py-2 max-w-[12rem] ${T.select}`}>
            <option value="">{L.noService}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${T.primary}`}>
          <Upload className="w-4 h-4" />
          {uploading ? L.uploading : L.choose}
          <input type="file" accept={DOC_ACCEPT} className="hidden" disabled={uploading} onChange={onFile} />
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* Folders */}
      <div className="flex flex-wrap items-center gap-2">
        {[['all', L.all], ['none', L.none]].map(([id, label]) => (
          <button key={id} onClick={() => setFolder(id)} className={`px-3 py-1.5 rounded-full text-sm ${folder === id ? T.chipOn : T.chip}`}>
            {label} <span className="opacity-60 text-xs">({count(id)})</span>
          </button>
        ))}
        {folders.map((f) =>
          renaming?.id === f.id ? (
            <span key={f.id} className="flex items-center gap-1">
              <input autoFocus value={renaming.name} maxLength={80} onChange={(e) => setRenaming({ ...renaming, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && renameFolder()} className={`px-3 py-1.5 rounded-full text-sm outline-none ${T.input}`} />
              <button onClick={renameFolder} aria-label={L.save} className={`p-1.5 rounded-full ${T.icon}`}><Check className="w-4 h-4" /></button>
              <button onClick={() => setRenaming(null)} aria-label={L.cancel} className={`p-1.5 rounded-full ${T.icon}`}><X className="w-4 h-4" /></button>
            </span>
          ) : (
            <span key={f.id} className="inline-flex items-center">
              <button onClick={() => setFolder(f.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${folder === f.id ? T.chipOn : T.chip}`}>
                <Folder className="w-3.5 h-3.5" />
                {f.name} <span className="opacity-60 text-xs">({count(f.id)})</span>
              </button>
              {folder === f.id && (
                <>
                  <button onClick={() => setRenaming({ id: f.id, name: f.name })} aria-label={L.renameFolder} className={`p-1.5 rounded-full ${T.icon}`}><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setModal({ type: 'folder', folder: f })} aria-label={L.deleteFolder} className={`p-1.5 rounded-full ${T.icon}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </>
              )}
            </span>
          )
        )}
        {newName === null ? (
          <button onClick={() => setNewName('')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${T.chip}`}>
            <FolderPlus className="w-3.5 h-3.5" />
            {L.newFolder}
          </button>
        ) : (
          <span className="flex items-center gap-1">
            <input autoFocus value={newName} maxLength={80} placeholder={L.folderName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createFolder()} className={`px-3 py-1.5 rounded-full text-sm outline-none ${T.input}`} />
            <button onClick={createFolder} className={`px-3 py-1.5 rounded-full text-sm ${T.primary}`}>{L.create}</button>
            <button onClick={() => setNewName(null)} aria-label={L.cancel} className={`p-1.5 rounded-full ${T.icon}`}><X className="w-4 h-4" /></button>
          </span>
        )}
      </div>

      {/* Files */}
      {shown.length === 0 ? (
        <div className={`${T.box} p-8 text-center ${T.muted}`}>
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          {docs.length === 0 ? L.emptyAll : L.empty}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {shown.map((d) => {
            const st = STATUS_COLOR[d.status] ? d.status : 'uploaded';
            const pending = Boolean(d.delete_requested_at);
            return (
              <li key={d.id} className={`${T.box} px-5 py-3.5`}>
                <div className="flex flex-wrap items-center gap-3">
                  <FileText className={`w-4 h-4 shrink-0 ${T.muted}`} />
                  <div className="flex-1 min-w-0">
                    <button onClick={() => openDocument(d.storage_path)} className={`text-sm font-medium truncate max-w-full text-left hover:underline ${T.text}`}>
                      {d.file_name}
                    </button>
                    <p className={`text-[11px] ${T.faint}`}>
                      {fmtDate(d.created_at, lang)}
                      {serviceName(d.client_service_id) ? ` • ${serviceName(d.client_service_id)}` : ''}
                      {folderName(d.folder_id) ? ` • ${folderName(d.folder_id)}` : ''}
                    </p>
                    {d.status === 'rejected' && d.rejection_reason && <p className="text-xs text-red-500 mt-0.5">{d.rejection_reason}</p>}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: `${STATUS_COLOR[st]}20`, color: STATUS_COLOR[st] }}>
                    {L.st[st]}
                  </span>
                  <select
                    aria-label={L.moveTo}
                    value={d.folder_id || ''}
                    onChange={(e) => move(d, e.target.value)}
                    className={`text-xs rounded-lg px-2 py-1.5 max-w-[9rem] ${T.select}`}
                    title={L.moveTo}
                  >
                    <option value="">{L.noFolder}</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => openDocument(d.storage_path)} aria-label={L.open} className={`p-2 rounded-lg ${T.icon}`}>
                    <Download className="w-4 h-4" />
                  </button>
                  {isAdmin && d.status !== 'approved' && (
                    <button onClick={() => review(d, 'approved')} aria-label={L.approve} className="p-2 rounded-lg text-green-500 hover:bg-green-500/10">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {isAdmin && d.status !== 'rejected' && (
                    <button onClick={() => { setModal({ type: 'reject', doc: d }); setReason(''); }} aria-label={L.reject} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {(isAdmin || !pending) && (
                    <button
                      onClick={() => { setModal({ type: isAdmin ? 'delete' : 'request', doc: d }); setReason(''); }}
                      aria-label={isAdmin ? L.del : L.requestTitle}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {pending && (
                  <div className={`mt-3 rounded-lg px-4 py-3 text-sm ${isAdmin ? 'bg-[#DC1C2E]/10' : 'bg-red-50'}`}>
                    <p className="font-medium text-red-500">{L.pending}</p>
                    <p className={`mt-1 ${T.text}`}>
                      <span className={T.muted}>{L.reasonLabel}: </span>
                      {d.delete_reason}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {isAdmin ? (
                        <>
                          <button onClick={() => setModal({ type: 'delete', doc: d })} className={`${btn} bg-[#DC1C2E] text-white`}>{L.approveDelete}</button>
                          <button onClick={() => declineDeletion(d)} className={`${btn} ${T.chip}`}>{L.declineDelete}</button>
                        </>
                      ) : (
                        <button onClick={() => withdrawRequest(d)} className={`${btn} ${T.chip}`}>{L.cancelRequest}</button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Dialogs */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" onClick={() => !busy && setModal(null)}>
          <div className={`w-full max-w-md rounded-2xl p-6 space-y-4 ${T.modal}`} onClick={(e) => e.stopPropagation()}>
            {modal.type === 'delete' && (
              <>
                <h3 className="text-lg font-semibold">{L.sure}</h3>
                <p className={`text-sm ${T.muted}`}>{L.deleteBody(modal.doc.file_name)}</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setModal(null)} disabled={busy} className={`${btn} ${T.chip}`}>{L.cancel}</button>
                  <button onClick={confirmDelete} disabled={busy} className={`${btn} bg-[#DC1C2E] text-white disabled:opacity-50`}>{L.yesDelete}</button>
                </div>
              </>
            )}
            {modal.type === 'request' && (
              <>
                <h3 className="text-lg font-semibold">{L.requestTitle}</h3>
                <p className={`text-sm ${T.muted}`}>{L.requestBody(modal.doc.file_name)}</p>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} placeholder={L.reasonPh} className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none ${T.input}`} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setModal(null)} disabled={busy} className={`${btn} ${T.chip}`}>{L.cancel}</button>
                  <button onClick={sendRequest} disabled={busy || reason.trim().length < 3} className={`${btn} ${T.primary} disabled:opacity-50`}>{L.send}</button>
                </div>
              </>
            )}
            {modal.type === 'folder' && (
              <>
                <h3 className="text-lg font-semibold">{L.deleteFolder}: {modal.folder.name}</h3>
                <p className={`text-sm ${T.muted}`}>{L.deleteFolderBody}</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setModal(null)} disabled={busy} className={`${btn} ${T.chip}`}>{L.cancel}</button>
                  <button onClick={removeFolder} disabled={busy} className={`${btn} bg-[#DC1C2E] text-white disabled:opacity-50`}>{L.del}</button>
                </div>
              </>
            )}
            {modal.type === 'reject' && (
              <>
                <h3 className="text-lg font-semibold">{L.reject}</h3>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={L.rejectReason} className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none ${T.input}`} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setModal(null)} className={`${btn} ${T.chip}`}>{L.cancel}</button>
                  <button onClick={() => review(modal.doc, 'rejected', reason)} className={`${btn} bg-[#DC1C2E] text-white`}>{L.reject}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
