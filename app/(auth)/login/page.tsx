import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Bejelentkezés | Épületfelmérő Rendszer',
  description: 'Jelentkezz be a fiókodba',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl" padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-4 shadow-lg shadow-primary-500/20">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-secondary-900 mb-2">
            Bejelentkezés
          </h1>
          <p className="text-secondary-600 text-base">
            Jelentkezz be a fiókodba
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Még nincs fiókod?{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
            >
              Regisztráció
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}