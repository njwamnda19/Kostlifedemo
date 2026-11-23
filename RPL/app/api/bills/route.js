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
    const statusFilter = searchParams.get('status'); // 'all' | 'unpaid' | 'paid'

    const whereClause = { user_id: userId };
    if (statusFilter && (statusFilter === 'unpaid' || statusFilter === 'paid')) {
      whereClause.status = statusFilter;
    }

    const bills = await prisma.bill.findMany({
      where: whereClause,
      orderBy: [
        { status: 'desc' }, // 'unpaid' comes before 'paid' in alphabetical desc (u > p)
        { due_date: 'asc' },
      ],
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Hitung status jatuh tempo untuk setiap tagihan
    const enrichedBills = bills.map((bill) => {
      const dueDate = new Date(bill.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let urgency = 'safe'; // 'overdue' | 'today' | 'soon' | 'safe' | 'paid'
      if (bill.status === 'paid') {
        urgency = 'paid';
      } else if (diffDays < 0) {
        urgency = 'overdue';
      } else if (diffDays === 0) {
        urgency = 'today';
      } else if (diffDays <= 3) {
        urgency = 'soon';
      }

      return {
        ...bill,
        daysLeft: diffDays,
        urgency,
      };
    });

    // Ringkasan tagihan
    const totalUnpaid = enrichedBills
      .filter((b) => b.status === 'unpaid')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalPaid = enrichedBills
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    return NextResponse.json({
      bills: enrichedBills,
      summary: {
        totalUnpaid,
        totalPaid,
        unpaidCount: enrichedBills.filter((b) => b.status === 'unpaid').length,
        paidCount: enrichedBills.filter((b) => b.status === 'paid').length,
        overdueCount: enrichedBills.filter((b) => b.urgency === 'overdue').length,
      },
    });
  } catch (error) {
    console.error('Fetch bills error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data tagihan.' },
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
    const { name, category, amount, due_date, status = 'unpaid' } = body;

    if (!name || !category || !amount || !due_date) {
      return NextResponse.json(
        { error: 'Nama tagihan, kategori, nominal, dan tanggal jatuh tempo wajib diisi.' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal tagihan harus berupa angka positif.' },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.create({
      data: {
        user_id: userId,
        name: name.trim(),
        category: category.trim(),
        amount: parsedAmount,
        due_date: new Date(due_date),
        status: status === 'paid' ? 'paid' : 'unpaid',
      },
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan tagihan baru.' },
      { status: 500 }
    );
  }
}
