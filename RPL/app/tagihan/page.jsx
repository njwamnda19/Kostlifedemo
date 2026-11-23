'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell from '@/components/LayoutShell';
import { formatRupiah, formatDate, getRelativeDays } from '@/lib/utils';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  X,
  Loader2,
  Check,
  Undo2,
  Calendar,
} from 'lucide-react';

const BILL_CATEGORIES = ['Kos', 'Listrik', 'Internet', 'Air', 'Laundry', 'Lainnya'];

export default function TagihanPage() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({ totalUnpaid: 0, totalPaid: 0, unpaidCount: 0, paidCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'unpaid' | 'paid'

  // Modal Form State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [activeBillId, setActiveBillId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Kos',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'unpaid',
  });

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const res = await fetch(`/api/bills?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setBills(json.bills || []);
        setSummary(json.summary || { totalUnpaid: 0, totalPaid: 0, unpaidCount: 0, paidCount: 0 });
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filterStatus]);

  const openAddModal = () => {
    setModalMode('add');
    setActiveBillId(null);
    setFormData({
      name: '',
      category: 'Kos',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      status: 'unpaid',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bill) => {
    setModalMode('edit');
    setActiveBillId(bill.id);
    const dateFormatted = new Date(bill.due_date).toISOString().split('T')[0];
    setFormData({
      name: bill.name,
      category: bill.category,
      amount: bill.amount.toString(),
      due_date: dateFormatted,
      status: bill.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchBills();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal menyimpan tagihan');
        }
      } else {
        const res = await fetch(`/api/bills/${activeBillId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchBills();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal memperbarui tagihan');
        }
      }
    } catch (err) {
      console.error('Submit bill error:', err);
      alert('Terjadi kesalahan saat memproses data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (bill) => {
    const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
    setActionLoadingId(bill.id);
    try {
      const res = await fetch(`/api/bills/${bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchBills();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchBills();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <LayoutShell>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Tagihan & Kewajiban Kos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau sewa kos, listrik token, internet, dan iuran agar tidak terlewat jatuh tempo.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tagihan</span>
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Belum Dibayar</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-amber-600">
            {formatRupiah(summary.totalUnpaid)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.unpaidCount} tagihan pending
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sudah Lunas</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-emerald-600">
            {formatRupiah(summary.totalPaid)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.paidCount} tagihan terselesaikan
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Kewajiban</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-800">
            {formatRupiah(summary.totalUnpaid + summary.totalPaid)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.unpaidCount + summary.paidCount} total tagihan tercatat
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs w-fit mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua ({summary.unpaidCount + summary.paidCount})
        </button>
        <button
          onClick={() => setFilterStatus('unpaid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'unpaid'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Belum Lunas ({summary.unpaidCount})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'paid'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sudah Lunas ({summary.paidCount})
        </button>
      </div>

      {/* BILLS LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-400">Memuat tagihan...</p>
          </div>
        ) : bills.length > 0 ? (
          bills.map((bill) => {
            const isPaid = bill.status === 'paid';
            const urgency = bill.urgency;

            // Indikator Warna Berdasarkan Status & Urgensi
            let cardBorder = 'border-slate-200/80 bg-white';
            let badgeBg = 'bg-slate-100 text-slate-700';
            let statusText = 'Mendatang';

            if (isPaid) {
              cardBorder = 'border-emerald-200/70 bg-emerald-50/20';
              badgeBg = 'bg-emerald-100 text-emerald-800';
              statusText = 'Lunas';
            } else if (urgency === 'overdue') {
              cardBorder = 'border-rose-300 bg-rose-50/40';
              badgeBg = 'bg-rose-600 text-white animate-pulse';
              statusText = `Lewat Jatuh Tempo (${Math.abs(bill.daysLeft)} Hari)`;
            } else if (urgency === 'today') {
              cardBorder = 'border-amber-400 bg-amber-50/50';
              badgeBg = 'bg-amber-500 text-white';
              statusText = 'Jatuh Tempo Hari Ini!';
            } else if (urgency === 'soon') {
              cardBorder = 'border-amber-300 bg-amber-50/20';
              badgeBg = 'bg-amber-100 text-amber-800';
              statusText = `H-${bill.daysLeft} Menjelang Tempo`;
            }

            return (
              <div
                key={bill.id}
                className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardBorder}`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-700'
                        : urgency === 'overdue'
                        ? 'bg-rose-100 text-rose-700'
                        : urgency === 'soon' || urgency === 'today'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isPaid ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}
                      >
                        {bill.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {bill.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {formatRupiah(bill.amount)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Jatuh Tempo: {formatDate(bill.due_date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AKSI CEPAT */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleStatus(bill)}
                    disabled={actionLoadingId === bill.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                      isPaid
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {actionLoadingId === bill.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPaid ? (
                      <>
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Batalkan Lunas</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tandai Lunas</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(bill)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(bill.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada tagihan pada filter ini</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Semua tagihanmu tercatat rapi</p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT TAGIHAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                {modalMode === 'add' ? 'Tambah Tagihan Baru' : 'Edit Tagihan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Tagihan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sewa Kamar Kos Bulan Depan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori Tagihan
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {BILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Contoh: 850000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'unpaid' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      formData.status === 'unpaid'
                        ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Belum Lunas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'paid' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      formData.status === 'paid'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sudah Lunas</span>
                  </button>
                </div>
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">Hapus Tagihan?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tagihan ini akan dihapus permanen dari daftar pengingat.
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
