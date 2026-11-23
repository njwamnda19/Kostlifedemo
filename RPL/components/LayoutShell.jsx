'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  CalendarCheck2,
  User,
  LogOut,
  Home,
  Sparkles,
} from 'lucide-react';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Keuangan',
      href: '/keuangan',
      icon: Wallet,
    },
    {
      label: 'Tagihan',
      href: '/tagihan',
      icon: Receipt,
    },
    {
      label: 'Jadwal Kos',
      href: '/jadwal',
      icon: CalendarCheck2,
    },
    {
      label: 'Profil',
      href: '/profil',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between bg-white border-r border-slate-200 p-5 shrink-0 fixed top-0 bottom-0 left-0 z-30 shadow-sm">
        <div>
          {/* LOGO & SLOGAN */}
          <Link href="/" className="flex items-center gap-3 group px-2 py-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Home className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-800">KostLife</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-full">Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium italic">
                Your Life, Your Budget, Your Space
              </p>
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav className="mt-8 space-y-1.5">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER CARD */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || 'Anak Kos'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@kostlife.com'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base text-slate-800">KostLife</span>
            <p className="text-[9px] text-slate-400 font-medium">Your Life, Your Space</p>
          </div>
        </Link>
        <Link
          href="/profil"
          className="flex items-center gap-2 p-1 pl-2 bg-slate-100 rounded-full text-xs font-medium text-slate-700"
        >
          <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0] || 'Profil'}</span>
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>
        </Link>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 lg:ml-72 pb-24 md:pb-12 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-emerald-600 font-semibold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
