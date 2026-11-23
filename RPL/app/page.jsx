'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LayoutShell from '@/components/LayoutShell';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah, formatDate, getRelativeDays } from '@/lib/utils';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Receipt,
  CalendarCheck2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#64748b', // slate
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkBillAsPaid = async (billId) => {
    try {
      setActionLoadingId(billId);
      const res = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      if (res.ok) {
        // Refresh dashboard data secara real-time
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Error marking bill paid:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <LayoutShell>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Halo, {user?.name || 'Anak Kos'}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau arus kas, kewajiban kos, dan rutinitasmu hari ini.
          </p>
        </div>

        {/* QUICK SHORTCUT BUTTONS */}
        <div className="flex items-center gap-2">
          <Link
            href="/keuangan"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Transaksi</span>
          </Link>
          <Link
            href="/tagihan"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Tambah Tagihan</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Memuat ringkasan KostLife...</p>
        </div>
      ) : (
        <>
          {/* ALERT PENGINGAT JATUH TEMPO (H-3 atau Overdue) */}
          {data?.dueSoonBills && data.dueSoonBills.length > 0 && (
            <div className="mb-6 space-y-2.5">
              {data.dueSoonBills.map((bill) => {
                const isOverdue = bill.isOverdue;
                const isToday = bill.isDueToday;

                return (
                  <div
                    key={bill.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition-all ${
                      isOverdue
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : isToday
                        ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base">
                            Pengingat Tagihan: {bill.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-600 text-white'
                                : isToday
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-200 text-amber-800'
                            }`}
                          >
                            {isOverdue
                              ? `LEWAT TEMPO (${Math.abs(bill.daysLeft)} Hari Lalu)`
                              : isToday
                              ? 'JATUH TEMPO HARI INI!'
                              : `H-${bill.daysLeft} Menjelang Tempo`}
                          </span>
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">
                          Nominal: <strong>{formatRupiah(bill.amount)}</strong> • Batas:{' '}
                          {formatDate(bill.due_date, 'medium')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkBillAsPaid(bill.id)}
                      disabled={actionLoadingId === bill.id}
                      className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      {actionLoadingId === bill.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>Tandai Lunas</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4 KARTU RINGKASAN UTAMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* 1. TOTAL SALDO */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Saldo
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <h2
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  (data?.summary?.totalSaldo || 0) < 0
                    ? 'text-rose-600'
                    : 'text-slate-800'
                }`}
              >
                {formatRupiah(data?.summary?.totalSaldo || 0)}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
                <span>Pemasukan - Pengeluaran</span>
              </div>
            </div>

            {/* 2. TOTAL PENGELUARAN BULAN INI */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pengeluaran Bulan Ini
                </span>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                {formatRupiah(data?.summary?.monthExpense || 0)}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Masuk: {formatRupiah(data?.summary?.monthIncome || 0)}</span>
              </div>
            </div>

            {/* 3. TAGIHAN TERDEKAT */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tagihan Terdekat
                </span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              {data?.summary?.nearestBill ? (
                <div>
                  <h2 className="text-base font-bold text-slate-800 truncate" title={data.summary.nearestBill.name}>
                    {data.summary.nearestBill.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {formatRupiah(data.summary.nearestBill.amount)}
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    Batas: {getRelativeDays(data.summary.nearestBill.due_date)}
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-base font-bold text-emerald-600">Lunas Semua 🎉</h2>
                  <p className="text-xs text-slate-400 mt-1">Tidak ada tagihan tertunggak</p>
                </div>
              )}
            </div>

            {/* 4. JADWAL KOS HARI INI */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Jadwal Hari Ini
                </span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                {data?.summary?.todaySchedulesCount || 0} Agenda
              </h2>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {data?.summary?.todaySchedulesCount > 0
                    ? 'Lihat detail di bawah'
                    : 'Tidak ada agenda tersisa'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION GRAFIK & DETAIL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* GRAFIK PENGELUARAN PER KATEGORI (2 Kolom di Desktop) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Distribusi Pengeluaran Bulan Ini
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Berdasarkan kategori pengeluaran anak kos
                  </p>
                </div>
                <Link
                  href="/keuangan"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Detail <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.expenseByCategory && data.expenseByCategory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.expenseByCategory}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {data.expenseByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatRupiah(value), 'Nominal']}
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* LEGEND LIST */}
                  <div className="space-y-2">
                    {data.expenseByCategory.map((item, idx) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                            }}
                          ></span>
                          <span className="font-medium text-slate-700">{item.category}</span>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-52 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl">
                  <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada pengeluaran bulan ini</p>
                  <p className="text-[11px] text-slate-400 mt-1">Catat transaksi pertamamu di menu Keuangan</p>
                </div>
              )}
            </div>

            {/* JADWAL HARI INI */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Jadwal Hari Ini</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rutinitas & piket kos</p>
                </div>
                <Link
                  href="/jadwal"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.todaySchedules && data.todaySchedules.length > 0 ? (
                <div className="space-y-3">
                  {data.todaySchedules.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 font-bold text-xs shrink-0">
                        {item.schedule_time}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl">
                  <CalendarCheck2 className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Tidak ada jadwal hari ini</p>
                  <p className="text-[11px] text-slate-400 mt-1">Waktunya bersantai atau belajar!</p>
                </div>
              )}
            </div>
          </div>

          {/* TRANSAKSI TERAKHIR */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Transaksi Terbaru</h3>
                <p className="text-xs text-slate-400 mt-0.5">Riwayat mutasi keuangan terakhir</p>
              </div>
              <Link
                href="/keuangan"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.recentTransactions.map((trx) => {
                  const isIncome = trx.type === 'income';
                  return (
                    <div
                      key={trx.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {trx.description || trx.category}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                              {trx.category}
                            </span>
                            <span>•</span>
                            <span>{formatDate(trx.transaction_date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            isIncome ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatRupiah(trx.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi tercatat.
              </div>
            )}
          </div>
        </>
      )}
    </LayoutShell>
  );
}
