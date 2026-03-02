import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  title?: string;
}

export function AppLayout({ title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <AppHeader title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
