'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell from '@/components/LayoutShell';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Calendar,
  Lock,
  LogOut,
  Wallet,
  Receipt,
  CalendarCheck2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilPage() {
  const { user, logout, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const json = await res.json();
        setProfileData(json);
        setName(json.user?.name || '');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Gagal memperbarui profil.');
      } else {
        setMessage('Profil berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await refreshUser();
        await fetchProfile();
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutShell>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Profil & Pengaturan Akun
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Informasi identitas akun KostLife dan ringkasan aktivitas.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-400">Memuat profil...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* USER INFO CARD (KIRI) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md shadow-emerald-200 mb-3">
                {profileData?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                {profileData?.user?.name || 'Anak Kos'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {profileData?.user?.email}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Terdaftar sejak {formatDate(profileData?.user?.created_at)}</span>
              </div>

              <button
                onClick={logout}
                className="mt-6 w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200/60"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>

            {/* RINGKASAN DATA TERCATAT */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Statistik KostLife
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Transaksi Tercatat</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {profileData?.stats?.transactionsCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Tagihan Kos</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {profileData?.stats?.billsCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <CalendarCheck2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Jadwal Agenda</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {profileData?.stats?.schedulesCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT FORM (KANAN) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Edit Profil & Keamanan</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui nama tampilan atau perbarui password akunmu.
                </p>
              </div>

              {message && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Email (Permanen)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={profileData?.user?.email || ''}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Ganti Password (Biarkan kosong jika tidak ingin mengubah)</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          placeholder="Minimal 6 karakter"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Ulangi Password Baru
                        </label>
                        <input
                          type="password"
                          placeholder="Ketik ulang password baru"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-xs shadow-emerald-200 flex items-center gap-1.5 transition-colors"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
