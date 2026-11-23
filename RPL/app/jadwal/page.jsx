'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell from '@/components/LayoutShell';
import { formatDate } from '@/lib/utils';
import {
  CalendarCheck2,
  Plus,
  Clock,
  Bell,
  BellOff,
  Trash2,
  Edit2,
  X,
  Loader2,
  Sparkles,
  Calendar,
} from 'lucide-react';

const QUICK_TEMPLATES = [
  {
    title: 'Piket Bersih Dapur & Selasar Kos',
    time: '07:30',
    desc: 'Sapu, pel, dan buang sampah bersama.',
  },
  {
    title: 'Ambil / Antar Cucian Laundry Kiloan',
    time: '16:00',
    desc: 'Bawa pakaian kotor atau ambil hasil cuci.',
  },
  {
    title: 'Beli Galon Air Mineral & Token Listrik',
    time: '19:00',
    desc: 'Toko kelontong depan gang.',
  },
  {
    title: 'Bayar Iuran Uang Kos ke Ibu Kost',
    time: '09:00',
    desc: 'Transfer via M-Banking dan kirim bukti.',
  },
];

export default function JadwalPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'today' | 'upcoming' | 'all'

  // Modal Form State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule_date: new Date().toISOString().split('T')[0],
    schedule_time: '08:00',
    reminder: true,
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);

      const res = await fetch(`/api/schedules?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setSchedules(json.schedules || []);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [filter]);

  const openAddModal = (template = null) => {
    setModalMode('add');
    setActiveScheduleId(null);
    setFormData({
      title: template ? template.title : '',
      description: template ? template.desc : '',
      schedule_date: new Date().toISOString().split('T')[0],
      schedule_time: template ? template.time : '08:00',
      reminder: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setActiveScheduleId(item.id);
    const dateFormatted = new Date(item.schedule_date).toISOString().split('T')[0];
    setFormData({
      title: item.title,
      description: item.description || '',
      schedule_date: dateFormatted,
      schedule_time: item.schedule_time,
      reminder: item.reminder,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchSchedules();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal menambahkan jadwal');
        }
      } else {
        const res = await fetch(`/api/schedules/${activeScheduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await fetchSchedules();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal memperbarui jadwal');
        }
      }
    } catch (err) {
      console.error('Submit schedule error:', err);
      alert('Terjadi kesalahan saat memproses data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchSchedules();
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
            Jadwal Harian Kos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur piket kebersihan, jadwal laundry, dan rutinitas anak kos agar tetap teratur.
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {/* QUICK TEMPLATES ANAC KOS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Template Rutinitas Cepat Anak Kos (Klik untuk Tambah):
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {QUICK_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => openAddModal(tmpl)}
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700 truncate">
                  {tmpl.title}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                  {tmpl.time}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{tmpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs w-fit mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Jadwal
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'today'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hari Ini
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mendatang
        </button>
      </div>

      {/* SCHEDULES LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-400">Memuat jadwal...</p>
          </div>
        ) : schedules.length > 0 ? (
          schedules.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.isToday
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200/80 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center shrink-0 min-w-[64px] ${
                      item.isToday
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span className="text-xs font-extrabold">{item.schedule_time}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800">
                        {item.title}
                      </h3>
                      {item.isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          HARI INI
                        </span>
                      )}
                      {item.reminder ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Bell className="w-3 h-3 text-blue-600" /> Reminder Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          <BellOff className="w-3 h-3 text-slate-400" /> Tanpa Pengingat
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(item.schedule_date, 'full')}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
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
            <CalendarCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada jadwal pada filter ini</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gunakan template di atas untuk mencatat rutinitas
            </p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT JADWAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                {modalMode === 'add' ? 'Tambah Jadwal Kegiatan' : 'Edit Jadwal'}
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
                  Nama Aktivitas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Piket Dapur Kos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.schedule_date}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule_date: e.target.value })
                    }
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Jam (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.schedule_time}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule_time: e.target.value })
                    }
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan / Keterangan (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Detail tugas atau pengingat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              {/* TOGGLE REMINDER */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Aktifkan Pengingat</p>
                    <p className="text-[10px] text-slate-400">Tampilkan notifikasi di dashboard</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">Hapus Jadwal?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Jadwal kegiatan ini akan dihapus dari agenda harianmu.
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
