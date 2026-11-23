'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell from '@/components/LayoutShell';
import { formatRupiah, formatDate } from '@/lib/utils';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Search,
  Calendar,
  X,
  Loader2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const INCOME_CATEGORIES = [
  'Gaji/Kiriman',
  'Beasiswa',
  'Freelance',
  'Jual Barang',
  'Lainnya',
];

const EXPENSE_CATEGORIES = [
  'Makan',
  'Kos',
  'Transport',
  'Hiburan',
  'Belanja',
  'Laundry',
  'Kuota/Internet',
  'Kesehatan',
  'Lainnya',
];

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f97316', '#64748b', '#14b8a6', '#84cc16'
];

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Modal Form State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [activeTrxId, setActiveTrxId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Makan',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (selectedMonth) params.append('month', selectedMonth);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.transactions || []);
        setSummary(json.summary || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
        setCategoryStats(json.categoryStats || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, selectedMonth]);

  const openAddModal = () => {
    setModalMode('add');
    setActiveTrxId(null);
    setFormData({
      type: 'expense',
      category: 'Makan',
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trx) => {
    setModalMode('edit');
    setActiveTrxId(trx.id);
    const dateFormatted = new Date(trx.transaction_date).toISOString().split('T')[0];
    setFormData({
      type: trx.type,
      category: trx.category,
      amount: trx.amount.toString(),
      description: trx.description || '',
      transaction_date: dateFormatted,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchTransactions();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal menyimpan transaksi');
        }
      } else {
        const res = await fetch(`/api/transactions/${activeTrxId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchTransactions();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal memperbarui transaksi');
        }
      }
    } catch (err) {
      console.error('Submit transaction error:', err);
      alert('Terjadi kesalahan saat memproses data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchTransactions();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter pencarian client-side
  const filteredTransactions = transactions.filter((trx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const descMatch = trx.description?.toLowerCase().includes(q);
    const catMatch = trx.category?.toLowerCase().includes(q);
    return descMatch || catMatch;
  });

  return (
    <LayoutShell>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Manajemen Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Catat setiap rupiah uang masuk dan keluar agar tidak boncos di akhir bulan.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* STAT CARDS FOR CURRENT FILTER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pemasukan</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-emerald-600">
            {formatRupiah(summary.totalIncome)}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pengeluaran</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-rose-600">
            {formatRupiah(summary.totalExpense)}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Selisih Bulan Ini</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-xl font-black ${summary.netBalance < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatRupiah(summary.netBalance)}
          </h3>
        </div>
      </div>

      {/* GRAFIK PENGELUARAN JIKA ADA */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-3">
            Komposisi Pengeluaran Periode Ini
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatRupiah(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categoryStats.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-slate-50">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{formatRupiah(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS & FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* TABS TIPE */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* BULAN & PENCARIAN */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE / LIST OF TRANSACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-400">Memuat transaksi...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((trx) => {
                  const isIncome = trx.type === 'income';
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(trx.transaction_date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {trx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {trx.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-800'}>
                          {isIncome ? '+ ' : '- '}
                          {formatRupiah(trx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(trx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(trx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada transaksi ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ubah filter atau tambahkan transaksi baru</p>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT TRANSAKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                {modalMode === 'add' ? 'Catat Transaksi Baru' : 'Edit Transaksi'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* TIPE TRANSAKSI */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: 'expense',
                        category: EXPENSE_CATEGORIES[0],
                      });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      formData.type === 'expense'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: 'income',
                        category: INCOME_CATEGORIES[0],
                      });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      formData.type === 'income'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              {/* KATEGORI */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* NOMINAL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Contoh: 25000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* TANGGAL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) =>
                    setFormData({ ...formData, transaction_date: e.target.value })
                  }
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Keterangan / Catatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Makan siang warteg + es teh"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold shadow-xs shadow-emerald-200 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'add' ? 'Simpan' : 'Perbarui'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM DELETE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Hapus Transaksi?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Data transaksi ini akan dihapus secara permanen dan memengaruhi total saldo.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
