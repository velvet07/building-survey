'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getProjects } from '@/lib/projects';
import { Project } from '@/types/project.types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await getProjects();
    setProjects(data || []);
    setIsLoading(false);
  };

  const totalProjects = projects.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Üdvözlünk az Épületfelmérő Rendszerben!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stat Card 1 */}
        <Card className="hover:border-primary-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wider">Összes projekt</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">
                {isLoading ? '...' : totalProjects}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl shadow-sm">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-bold text-secondary-900 mb-5">
          Gyors műveletek
        </h2>
        <div className="space-y-3">
          <Link href="/dashboard/projects">
            <Button variant="primary" className="w-full justify-start text-left">
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Új projekt létrehozása
            </Button>
          </Link>

          <Link href="/dashboard/projects">
            <Button variant="secondary" className="w-full justify-start text-left">
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Projektek megtekintése
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}