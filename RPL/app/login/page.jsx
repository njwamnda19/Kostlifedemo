'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Home, Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('anak.kos@kostlife.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="w-full max-w-md">
        {/* BRAND LOGO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-200 mb-3">
            <Home className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            KostLife
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 italic">
            &ldquo;Your Life, Your Budget, Your Space&rdquo;
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Masuk ke Akun</h2>
            <p className="text-xs text-slate-500 mt-1">
              Kelola uang saku, tagihan kamar, dan jadwal harianmu dengan mudah.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <span className="font-semibold">Perhatian:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* QUICK DEMO FILL */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gunakan Akun Demo (1-Klik)</span>
            </button>
          </div>

          {/* FOOTER */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
