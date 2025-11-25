import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Regisztráció | Épületfelmérő Rendszer',
  description: 'Hozz létre egy új fiókot',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl" padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl mb-4 shadow-lg shadow-success-500/20">
            <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-secondary-900 mb-2">
            Regisztráció
          </h1>
          <p className="text-secondary-600 text-base">
            Hozz létre egy új fiókot
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Már van fiókod?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
            >
              Bejelentkezés
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}