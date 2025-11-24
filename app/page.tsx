import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Header */}
          <h1 className="text-6xl font-extrabold text-secondary-900 mb-6 leading-tight">
            Épületfelmérő Rendszer
          </h1>
          <p className="text-xl text-secondary-600 mb-16 max-w-2xl mx-auto leading-relaxed">
            Moduláris webalkalmazás épületfelmérés és dokumentációs célokra
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg shadow-secondary-900/5 hover:shadow-xl hover:shadow-secondary-900/10 p-8 transition-all duration-300 hover:-translate-y-1 border border-secondary-100">
              <div className="text-primary-500 text-5xl mb-5">🏢</div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Projekt Kezelés
              </h3>
              <p className="text-secondary-600 text-base leading-relaxed">
                Hozz létre és kezelj projekteket egyszerűen
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-secondary-900/5 hover:shadow-xl hover:shadow-secondary-900/10 p-8 transition-all duration-300 hover:-translate-y-1 border border-secondary-100">
              <div className="text-primary-500 text-5xl mb-5">🔒</div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Biztonságos
              </h3>
              <p className="text-secondary-600 text-base leading-relaxed">
                Role-based hozzáférés és email megerősítés
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-secondary-900/5 hover:shadow-xl hover:shadow-secondary-900/10 p-8 transition-all duration-300 hover:-translate-y-1 border border-secondary-100">
              <div className="text-primary-500 text-5xl mb-5">⚡</div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Gyors & Modern
              </h3>
              <p className="text-secondary-600 text-base leading-relaxed">
                Next.js 14 és MySQL/MariaDB technológiával
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Regisztráció
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Bejelentkezés
              </Button>
            </Link>
          </div>

          {/* Tech Stack */}
          <div className="mt-20 pt-10 border-t border-secondary-200">
            <p className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-6">Technológiák:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-secondary-600">
              <span className="bg-white px-5 py-2.5 rounded-full shadow-md font-medium hover:shadow-lg transition-shadow">Next.js 14</span>
              <span className="bg-white px-5 py-2.5 rounded-full shadow-md font-medium hover:shadow-lg transition-shadow">TypeScript</span>
              <span className="bg-white px-5 py-2.5 rounded-full shadow-md font-medium hover:shadow-lg transition-shadow">MySQL</span>
              <span className="bg-white px-5 py-2.5 rounded-full shadow-md font-medium hover:shadow-lg transition-shadow">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}