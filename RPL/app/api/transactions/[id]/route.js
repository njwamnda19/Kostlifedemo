import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { type, category, description, amount, transaction_date } = body;

    const existing = await prisma.transaction.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 }
      );
    }

    const parsedAmount = amount ? parseFloat(amount) : existing.amount;
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal transaksi harus berupa angka positif.' },
        { status: 400 }
      );
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: type || existing.type,
        category: category !== undefined ? category.trim() : existing.category,
        description: description !== undefined ? description.trim() : existing.description,
        amount: parsedAmount,
        transaction_date: transaction_date ? new Date(transaction_date) : existing.transaction_date,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui transaksi.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);
    const id = parseInt(params.id, 10);

    const existing = await prisma.transaction.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Transaksi berhasil dihapus.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus transaksi.' },
      { status: 500 }
    );
  }
}
