import { existsSync } from 'fs';
import { join } from 'path';
import { redirect } from 'next/navigation';
import { InstallWizard } from '@/components/install/InstallWizard';

export default async function InstallPage() {
  // Check if installation is already complete
  const installLockPath = join(process.cwd(), 'app', 'install', 'INSTALL_LOCK');
  const isInstalled = existsSync(installLockPath);

  if (isInstalled) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Building Survey - Telepítés</h1>
        <p className="text-gray-600 mb-8">
          Üdvözöljük a telepítőben. Kövesd a lépéseket az alkalmazás beállításához.
        </p>
        <InstallWizard />
      </div>
    </div>
  );
}

