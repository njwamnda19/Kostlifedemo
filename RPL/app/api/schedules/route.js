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
    const filter = searchParams.get('filter'); // 'today' | 'upcoming' | 'all'

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const whereClause = { user_id: userId };

    if (filter === 'today') {
      whereClause.schedule_date = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (filter === 'upcoming') {
      whereClause.schedule_date = {
        gte: startOfToday,
      };
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      orderBy: [
        { schedule_date: 'asc' },
        { schedule_time: 'asc' },
      ],
    });

    // Hitung status untuk hari ini
    const enriched = schedules.map((item) => {
      const itemDate = new Date(item.schedule_date);
      const isToday =
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate();

      const isPast = itemDate < startOfToday;

      return {
        ...item,
        isToday,
        isPast,
      };
    });

    return NextResponse.json({
      schedules: enriched,
      todayCount: enriched.filter((s) => s.isToday).length,
      totalCount: enriched.length,
    });
  } catch (error) {
    console.error('Fetch schedules error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data jadwal.' },
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
    const { title, description, schedule_date, schedule_time, reminder = true } = body;

    if (!title || !schedule_date || !schedule_time) {
      return NextResponse.json(
        { error: 'Judul aktivitas, tanggal, dan jam jadwal wajib diisi.' },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        user_id: userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        schedule_date: new Date(schedule_date),
        schedule_time: schedule_time.trim(),
        reminder: Boolean(reminder),
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan jadwal baru.' },
      { status: 500 }
    );
  }
}
