import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie, hashPassword, comparePassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);

    const [user, transactionsCount, billsCount, schedulesCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
        },
      }),
      prisma.transaction.count({ where: { user_id: userId } }),
      prisma.bill.count({ where: { user_id: userId } }),
      prisma.schedule.count({ where: { user_id: userId } }),
    ]);

    return NextResponse.json({
      user,
      stats: {
        transactionsCount,
        billsCount,
        schedulesCount,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data profil.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.userId);
    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    const updateData = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Password saat ini harus diisi untuk mengubah password.' },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Password saat ini tidak cocok.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password baru minimal 6 karakter.' },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      message: 'Profil berhasil diperbarui.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profil.' },
      { status: 500 }
    );
  }
}
