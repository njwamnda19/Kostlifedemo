const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data KostLife...');

  // Bersihkan data lama jika ada
  await prisma.schedule.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  // Buat User Dummy
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Rian Pratama',
      email: 'anak.kos@kostlife.com',
      password: hashedPassword,
    },
  });

  console.log(`✅ User dibuat: ${user.name} (${user.email})`);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  // Buat Transaksi Dummy (Bulan ini)
  const transactions = [
    {
      user_id: user.id,
      type: 'income',
      category: 'Gaji/Kiriman',
      description: 'Kiriman bulanan dari orang tua',
      amount: 2500000,
      transaction_date: new Date(currentYear, currentMonth, 1),
    },
    {
      user_id: user.id,
      type: 'income',
      category: 'Freelance',
      description: 'Fee project slicing landing page',
      amount: 750000,
      transaction_date: new Date(currentYear, currentMonth, 5),
    },
    {
      user_id: user.id,
      type: 'expense',
      category: 'Makan',
      description: 'Makan siang warteg komplit + es teh',
      amount: 22000,
      transaction_date: new Date(currentYear, currentMonth, currentDate, 12, 30),
    },
    {
      user_id: user.id,
      type: 'expense',
      category: 'Makan',
      description: 'Kopi susu gula aren buat nugas',
      amount: 18000,
      transaction_date: new Date(currentYear, currentMonth, currentDate, 15, 0),
    },
    {
      user_id: user.id,
      type: 'expense',
      category: 'Transport',
      description: 'Isi Pertalite motor seminggu',
      amount: 40000,
      transaction_date: new Date(currentYear, currentMonth, Math.max(1, currentDate - 2)),
    },
    {
      user_id: user.id,
      type: 'expense',
      category: 'Hiburan',
      description: 'Langganan Spotify Family + jajan',
      amount: 45000,
      transaction_date: new Date(currentYear, currentMonth, Math.max(1, currentDate - 3)),
    },
    {
      user_id: user.id,
      type: 'expense',
      category: 'Belanja',
      description: 'Sabun, sampo, deterjen, pasta gigi',
      amount: 85000,
      transaction_date: new Date(currentYear, currentMonth, Math.max(1, currentDate - 4)),
    },
    {
      user_id: user.id,
      type: 'expense',
      category: 'Laundry',
      description: 'Laundry kiloan 5kg selesai',
      amount: 35000,
      transaction_date: new Date(currentYear, currentMonth, Math.max(1, currentDate - 5)),
    },
  ];

  for (const trx of transactions) {
    await prisma.transaction.create({ data: trx });
  }
  console.log(`✅ ${transactions.length} transaksi berhasil ditambahkan.`);

  // Buat Tagihan Dummy
  // Tagihan terdekat H-2 (mendekati tempo untuk menguji alert H-3)
  const dueDateNear = new Date(currentYear, currentMonth, currentDate + 2);
  const dueDateNextWeek = new Date(currentYear, currentMonth, currentDate + 7);
  const dueDatePaid = new Date(currentYear, currentMonth, Math.max(1, currentDate - 5));

  const bills = [
    {
      user_id: user.id,
      name: 'Sewa Kamar Kos Bulan Ini',
      category: 'Kos',
      amount: 850000,
      due_date: dueDateNear,
      status: 'unpaid',
    },
    {
      user_id: user.id,
      name: 'Iuran Listrik & Token Kamar',
      category: 'Listrik',
      amount: 120000,
      due_date: dueDateNextWeek,
      status: 'unpaid',
    },
    {
      user_id: user.id,
      name: 'Iuran WiFi Kos Cepat',
      category: 'Internet',
      amount: 50000,
      due_date: dueDatePaid,
      status: 'paid',
    },
    {
      user_id: user.id,
      name: 'Laundry Bedcover & Selimut',
      category: 'Laundry',
      amount: 45000,
      due_date: new Date(currentYear, currentMonth, currentDate + 4),
      status: 'unpaid',
    },
  ];

  for (const bill of bills) {
    await prisma.bill.create({ data: bill });
  }
  console.log(`✅ ${bills.length} tagihan berhasil ditambahkan.`);

  // Buat Jadwal Dummy (Hari ini dan beberapa hari ke depan)
  const today = new Date(currentYear, currentMonth, currentDate);
  const tomorrow = new Date(currentYear, currentMonth, currentDate + 1);

  const schedules = [
    {
      user_id: user.id,
      title: 'Piket Bersih Dapur & Koridor Kos',
      description: 'Sapu, pel lantai depan kamar dan cuci tempat cuci piring bersama.',
      schedule_date: today,
      schedule_time: '07:30',
      reminder: true,
    },
    {
      user_id: user.id,
      title: 'Ambil Pakaian di Laundry Kiloan',
      description: 'Bawa struk laundry nomor 042 di Laundry Bersih Rapi.',
      schedule_date: today,
      schedule_time: '17:00',
      reminder: true,
    },
    {
      user_id: user.id,
      title: 'Beli Galon Air Mineral & Gas Portabel',
      description: 'Toko kelontong depan gang kos.',
      schedule_date: tomorrow,
      schedule_time: '19:00',
      reminder: false,
    },
    {
      user_id: user.id,
      title: 'Transfer Uang Kos ke Ibu Kost',
      description: 'Transfer via BCA dan kirim bukti transfer ke WhatsApp Ibu Kost.',
      schedule_date: dueDateNear,
      schedule_time: '09:00',
      reminder: true,
    },
  ];

  for (const schedule of schedules) {
    await prisma.schedule.create({ data: schedule });
  }
  console.log(`✅ ${schedules.length} jadwal kegiatan berhasil ditambahkan.`);

  console.log('🎉 Seeding selesai dengan sukses!');
  console.log('👉 Akun login demo:');
  console.log('   Email: anak.kos@kostlife.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
