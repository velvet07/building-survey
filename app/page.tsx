'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-24">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <span className="text-4xl sm:text-5xl">📋</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                MasterPlan
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Professzionális épületfelmérő rendszer minden projekted számára
            </p>

            <p className="text-base sm:text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Kezeld projektjeidet, készíts rajzokat, dokumentálj fotókkal és űrlapokkal – minden egy helyen, egyszerűen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🚀 Kezdjünk neki
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] bg-white text-gray-700 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:text-emerald-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Bejelentkezés
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Projektek
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Szervezd és kezeld projektjeidet egyszerűen és hatékonyan
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">✏️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Rajzok
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Készíts professzionális alaprajzokat és vázlatokat közvetlenül a böngészőben
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">📸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fotók
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dokumentálj minden részletet képekkel és jegyzetekkel
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Űrlapok
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Töltsd ki a speciális felmérési űrlapokat gyorsan és pontosan
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Miért a MasterPlan?
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Biztonságos és megbízható</h4>
                      <p className="text-gray-600 text-sm">Role-based hozzáférés és email megerősítés minden felhasználónak</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Gyors és modern</h4>
                      <p className="text-gray-600 text-sm">Villámgyors betöltés és zökkenőmentes felhasználói élmény</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Minden eszközön elérhető</h4>
                      <p className="text-gray-600 text-sm">Használd számítógépen, tableten vagy telefonon egyaránt</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Egyszerű kezelés</h4>
                      <p className="text-gray-600 text-sm">Intuitív felület, nincs szükség betanulásra</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl transform rotate-6 opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-8xl transform -rotate-6">
                    🎯
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
