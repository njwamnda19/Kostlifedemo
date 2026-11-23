import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type'); // 'income' | 'expense' | 'all'
    const monthFilter = searchParams.get('month'); // 'YYYY-MM'
    const categoryFilter = searchParams.get('category'); // string

    const whereClause = { user_id: userId };

    if (typeFilter && (typeFilter === 'income' || typeFilter === 'expense')) {
      whereClause.type = typeFilter;
    }

    if (categoryFilter && categoryFilter !== 'all') {
      whereClause.category = categoryFilter;
    }

    if (monthFilter) {
      const [yearStr, monthStr] = monthFilter.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // 0-indexed
      if (!isNaN(year) && !isNaN(month)) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
        whereClause.transaction_date = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { transaction_date: 'desc' },
    });

    // Hitung ringkasan transaksi hasil filter
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    for (const trx of transactions) {
      if (trx.type === 'income') {
        totalIncome += trx.amount;
      } else {
        totalExpense += trx.amount;
        categoryBreakdown[trx.category] = (categoryBreakdown[trx.category] || 0) + trx.amount;
      }
    }

    const categoryStats = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        count: transactions.length,
      },
      categoryStats,
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);
    const body = await request.json();
    const { type, category, description, amount, transaction_date } = body;

    if (!type || !category || !amount || !transaction_date) {
      return NextResponse.json(
        { error: 'Tipe, kategori, nominal, dan tanggal transaksi wajib diisi.' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe transaksi harus "income" atau "expense".' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal transaksi harus berupa angka positif.' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        type,
        category: category.trim(),
        description: description ? description.trim() : null,
        amount: parsedAmount,
        transaction_date: new Date(transaction_date),
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat transaksi baru.' },
      { status: 500 }
    );
  }
}
