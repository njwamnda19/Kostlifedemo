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
    const { title, description, schedule_date, schedule_time, reminder } = body;

    const existing = await prisma.schedule.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Jadwal tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 }
      );
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        description: description !== undefined ? description.trim() : existing.description,
        schedule_date: schedule_date ? new Date(schedule_date) : existing.schedule_date,
        schedule_time: schedule_time ? schedule_time.trim() : existing.schedule_time,
        reminder: reminder !== undefined ? Boolean(reminder) : existing.reminder,
      },
    });

    return NextResponse.json({ schedule: updated });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui jadwal.' },
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

    const existing = await prisma.schedule.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Jadwal tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 }
      );
    }

    await prisma.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jadwal berhasil dihapus.' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus jadwal.' },
      { status: 500 }
    );
  }
}
