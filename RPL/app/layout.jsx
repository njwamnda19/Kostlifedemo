import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'KostLife - Your Life, Your Budget, Your Space',
  description: 'Sistem Manajemen Keuangan, Tagihan, dan Jadwal Harian Khusus Anak Kos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
