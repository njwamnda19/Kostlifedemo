import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const existing = await prisma.bill.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Tagihan tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 }
      );
    }

    const updateData = {};
    if (body.status !== undefined) {
      updateData.status = body.status === 'paid' ? 'paid' : 'unpaid';
    }
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.amount !== undefined) {
      const amt = parseFloat(body.amount);
      if (isNaN(amt) || amt <= 0) {
        return NextResponse.json({ error: 'Nominal tidak valid.' }, { status: 400 });
      }
      updateData.amount = amt;
    }
    if (body.due_date !== undefined) {
      updateData.due_date = new Date(body.due_date);
    }

    const updated = await prisma.bill.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ bill: updated });
  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui tagihan.' },
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

    const existing = await prisma.bill.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Tagihan tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 }
      );
    }

    await prisma.bill.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tagihan berhasil dihapus.' });
  } catch (error) {
    console.error('Delete bill error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus tagihan.' },
      { status: 500 }
    );
  }
}
