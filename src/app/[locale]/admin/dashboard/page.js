'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  UserPlus,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, change, changeType, color }) {
  return (
    <div
      className="rounded-xl p-5 transition-all hover:scale-[1.02]"
      style={{ background: '#151521', border: '1px solid #1E1E2E' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              changeType === 'up'
                ? 'text-emerald-400 bg-emerald-500/10'
                : changeType === 'down'
                ? 'text-red-400 bg-red-500/10'
                : 'text-[#9A9AAA] bg-white/5'
            }`}
          >
            {changeType === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : changeType === 'down' ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-[#9A9AAA] mt-1">{label}</p>
    </div>
  );
}

function RecentMemberRow({ member }) {
  const initials = (member.full_name || 'U').charAt(0).toUpperCase();
  const createdAt = new Date(member.created_at);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors rounded-lg"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)', color: '#0B0B11' }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">
          {member.full_name || 'İsimsiz Üye'}
        </p>
        <p className="text-xs text-[#9A9AAA] truncate">{member.email}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-[#9A9AAA] shrink-0">
        <Clock className="w-3 h-3" />
        {timeAgo}
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'şimdi';
  if (diffMins < 60) return `${diffMins}dk`;
  if (diffHours < 24) return `${diffHours}sa`;
  if (diffDays < 7) return `${diffDays}g`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newThisWeek: 0,
    activeServices: 0,
    totalProperties: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch total members
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch new members this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: newThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Fetch active services count
      const { count: activeServices } = await supabase
        .from('client_services')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'in_progress']);

      // Fetch total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch recent members
      const { data: recent } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, role')
        .order('created_at', { ascending: false })
        .limit(8);

      setStats({
        totalMembers: totalMembers || 0,
        newThisWeek: newThisWeek || 0,
        activeServices: activeServices || 0,
        totalProperties: totalProperties || 0,
      });
      setRecentMembers(recent || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout activeSection="dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dashboard
          </h1>
          <p className="text-sm text-[#9A9AAA] mt-1">
            Valencia Property yönetim paneli genel görünümü
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl h-32 animate-pulse"
                style={{ background: '#151521' }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Users}
                label="Toplam Üye"
                value={stats.totalMembers}
                color="#C9A84C"
              />
              <StatCard
                icon={UserPlus}
                label="Bu Hafta Yeni"
                value={stats.newThisWeek}
                change={stats.newThisWeek > 0 ? `+${stats.newThisWeek}` : '0'}
                changeType={stats.newThisWeek > 0 ? 'up' : 'neutral'}
                color="#22C55E"
              />
              <StatCard
                icon={Briefcase}
                label="Aktif Hizmetler"
                value={stats.activeServices}
                color="#3B82F6"
              />
              <StatCard
                icon={TrendingUp}
                label="Toplam Mülk"
                value={stats.totalProperties}
                color="#DC1C2E"
              />
            </div>

            {/* Recent Members */}
            <div className="rounded-xl" style={{ background: '#151521', border: '1px solid #1E1E2E' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
                <h2 className="text-base font-semibold text-white">Son Kayıt Olan Üyeler</h2>
                <a
                  href="#"
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#C9A84C' }}
                >
                  Tümünü Gör →
                </a>
              </div>
              <div className="p-2">
                {recentMembers.length === 0 ? (
                  <p className="text-center text-sm text-[#9A9AAA] py-8">Henüz üye yok</p>
                ) : (
                  recentMembers.map((member) => (
                    <RecentMemberRow key={member.id} member={member} />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
