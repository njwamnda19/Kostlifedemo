import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);

    // Hitung range tanggal bulan ini
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Hitung range hari ini (00:00:00 s/d 23:59:59)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Ambil data transaksi secara paralel
    const [
      allTransactions,
      monthTransactions,
      unpaidBills,
      todaySchedules,
      recentTransactions,
    ] = await Promise.all([
      // Semua transaksi untuk hitung total saldo
      prisma.transaction.findMany({
        where: { user_id: userId },
        select: { type: true, amount: true },
      }),

      // Transaksi bulan ini untuk statistik bulanan & grafik kategori
      prisma.transaction.findMany({
        where: {
          user_id: userId,
          transaction_date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          id: true,
          type: true,
          category: true,
          amount: true,
          transaction_date: true,
        },
      }),

      // Tagihan yang belum lunas (urutkan dari tanggal paling dekat)
      prisma.bill.findMany({
        where: {
          user_id: userId,
          status: 'unpaid',
        },
        orderBy: { due_date: 'asc' },
      }),

      // Jadwal hari ini
      prisma.schedule.findMany({
        where: {
          user_id: userId,
          schedule_date: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        orderBy: { schedule_time: 'asc' },
      }),

      // 5 transaksi terakhir
      prisma.transaction.findMany({
        where: { user_id: userId },
        orderBy: { transaction_date: 'desc' },
        take: 5,
      }),
    ]);

    // 1. Hitung Total Saldo Keseluruhan
    let totalIncomeAll = 0;
    let totalExpenseAll = 0;
    for (const trx of allTransactions) {
      if (trx.type === 'income') totalIncomeAll += trx.amount;
      else if (trx.type === 'expense') totalExpenseAll += trx.amount;
    }
    const totalSaldo = totalIncomeAll - totalExpenseAll;

    // 2. Hitung Pengeluaran & Pemasukan Bulan Ini
    let monthExpense = 0;
    let monthIncome = 0;
    const categoryExpenseMap = {};

    for (const trx of monthTransactions) {
      if (trx.type === 'expense') {
        monthExpense += trx.amount;
        categoryExpenseMap[trx.category] = (categoryExpenseMap[trx.category] || 0) + trx.amount;
      } else if (trx.type === 'income') {
        monthIncome += trx.amount;
      }
    }

    const expenseByCategory = Object.entries(categoryExpenseMap).map(([category, amount]) => ({
      category,
      amount,
    }));

    // 3. Identifikasi tagihan terdekat & alert jatuh tempo H-3
    const nearestBill = unpaidBills.length > 0 ? unpaidBills[0] : null;

    // Periksa tagihan yang jatuh tempo <= 3 hari ke depan atau sudah lewat
    const dueSoonBills = unpaidBills
      .map((bill) => {
        const dueDate = new Date(bill.due_date);
        // Selisih hari
        const diffTime = dueDate.getTime() - startOfToday.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...bill,
          daysLeft: diffDays,
          isOverdue: diffDays < 0,
          isDueToday: diffDays === 0,
          isDueSoon: diffDays > 0 && diffDays <= 3,
        };
      })
      .filter((b) => b.isOverdue || b.isDueToday || b.isDueSoon);

    return NextResponse.json({
      summary: {
        totalSaldo,
        monthExpense,
        monthIncome,
        unpaidBillsCount: unpaidBills.length,
        nearestBill,
        todaySchedulesCount: todaySchedules.length,
      },
      dueSoonBills,
      todaySchedules,
      recentTransactions,
      expenseByCategory,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data dashboard.' },
      { status: 500 }
    );
  }
}
