'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Globe,
  X,
  Check,
  UserCircle,
} from 'lucide-react';

const ROLES = [
  { value: 'user', label: 'Üye', color: '#9A9AAA' },
  { value: 'admin', label: 'Admin', color: '#C9A84C' },
];

const LANGUAGES = {
  tr: 'Türkçe',
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
};

function MemberDetailModal({ member, onClose, onRoleChange }) {
  const [newRole, setNewRole] = useState(member.role);
  const [saving, setSaving] = useState(false);

  const handleSaveRole = async () => {
    if (newRole === member.role) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', member.id);

      if (!error) {
        onRoleChange(member.id, newRole);
      }
    } catch (err) {
      console.error('Role update error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#151521', border: '1px solid #1E1E2E' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9AAA] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)', color: '#0B0B11' }}
          >
            {(member.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{member.full_name || 'İsimsiz Üye'}</h2>
            <p className="text-sm text-[#9A9AAA]">{member.email}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-3 mb-6">
          <InfoRow icon={Mail} label="E-posta" value={member.email} />
          <InfoRow icon={Phone} label="Telefon" value={member.phone || '—'} />
          <InfoRow icon={Globe} label="Dil" value={LANGUAGES[member.preferred_language] || member.preferred_language || '—'} />
          <InfoRow
            icon={Calendar}
            label="Kayıt Tarihi"
            value={new Date(member.created_at).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <InfoRow
            icon={member.role === 'admin' ? ShieldCheck : Shield}
            label="Mevcut Rol"
            value={member.role === 'admin' ? 'Admin' : 'Üye'}
          />
        </div>

        {/* Role Change */}
        <div className="rounded-lg p-4 mb-4" style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}>
          <p className="text-sm font-medium text-white mb-3">Rol Değiştir</p>
          <div className="flex gap-2">
            {ROLES.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setNewRole(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  newRole === value
                    ? 'text-white ring-2'
                    : 'text-[#9A9AAA] hover:text-white'
                }`}
                style={{
                  background: newRole === value ? `${color}20` : 'transparent',
                  borderColor: color,
                  ringColor: color,
                  ...(newRole === value ? { boxShadow: `0 0 0 2px ${color}` } : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {newRole !== member.role && (
            <button
              onClick={handleSaveRole}
              disabled={saving}
              className="w-full mt-3 py-2 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
              style={{ background: '#C9A84C' }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Rolü Kaydet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-[#9A9AAA] shrink-0" />
      <span className="text-xs text-[#9A9AAA] w-24 shrink-0">{label}</span>
      <span className="text-sm text-white truncate">{value}</span>
    </div>
  );
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, phone, whatsapp_phone, role, preferred_language, country, citizenship, has_residence_permit, created_at, updated_at')
        .order(sortField, { ascending: sortDir === 'asc' });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (!error) {
        setMembers(data || []);
      }
    } catch (err) {
      console.error('Members fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, sortField, sortDir]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setSelectedMember(null);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  return (
    <AdminLayout activeSection="uyeler">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Üye Yönetimi
          </h1>
          <p className="text-sm text-[#9A9AAA] mt-1">
            Kayıtlı üyeleri görüntüle, ara ve yönet
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9AAA]" />
            <input
              type="text"
              placeholder="İsim veya e-posta ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-[#6A6A7A] outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              style={{ background: '#151521', border: '1px solid #1E1E2E' }}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'user', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === role
                    ? 'text-white'
                    : 'text-[#9A9AAA] hover:text-white hover:bg-white/5'
                }`}
                style={
                  roleFilter === role
                    ? { background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C' }
                    : { background: '#151521', border: '1px solid #1E1E2E' }
                }
              >
                <Filter className="w-3.5 h-3.5 inline mr-1.5" />
                {role === 'all' ? 'Tümü' : role === 'admin' ? 'Admin' : 'Üye'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#151521', border: '1px solid #1E1E2E' }}>
          {/* Table Header */}
          <div
            className="hidden md:grid grid-cols-[1fr_1.5fr_100px_100px_80px] gap-4 px-5 py-3 text-xs font-medium text-[#9A9AAA] uppercase tracking-wider"
            style={{ borderBottom: '1px solid #1E1E2E' }}
          >
            <button onClick={() => handleSort('full_name')} className="text-left hover:text-white transition-colors">
              İsim <SortIcon field="full_name" />
            </button>
            <button onClick={() => handleSort('email')} className="text-left hover:text-white transition-colors">
              E-posta <SortIcon field="email" />
            </button>
            <button onClick={() => handleSort('role')} className="text-left hover:text-white transition-colors">
              Rol <SortIcon field="role" />
            </button>
            <button onClick={() => handleSort('created_at')} className="text-left hover:text-white transition-colors">
              Tarih <SortIcon field="created_at" />
            </button>
            <span className="text-right">İşlem</span>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center">
              <UserCircle className="w-12 h-12 text-[#6A6A7A] mx-auto mb-3" />
              <p className="text-sm text-[#9A9AAA]">
                {search ? 'Arama sonucu bulunamadı' : 'Henüz kayıtlı üye yok'}
              </p>
            </div>
          ) : (
            <div>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_100px_100px_80px] gap-2 md:gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid #1E1E2E' }}
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)', color: '#0B0B11' }}
                    >
                      {(member.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white truncate">
                      {member.full_name || 'İsimsiz'}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center">
                    <span className="text-sm text-[#9A9AAA] truncate">{member.email}</span>
                  </div>

                  {/* Role */}
                  <div className="flex items-center">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={
                        member.role === 'admin'
                          ? { background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C' }
                          : { background: 'rgba(154, 154, 170, 0.15)', color: '#9A9AAA' }
                      }
                    >
                      {member.role === 'admin' ? 'Admin' : 'Üye'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center">
                    <span className="text-xs text-[#9A9AAA]">
                      {new Date(member.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                      }}
                      className="p-1.5 rounded-lg text-[#9A9AAA] hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && members.length > 0 && (
            <div className="px-5 py-3 text-xs text-[#9A9AAA]" style={{ borderTop: '1px solid #1E1E2E' }}>
              Toplam {members.length} üye
            </div>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onRoleChange={handleRoleChange}
        />
      )}
    </AdminLayout>
  );
}
