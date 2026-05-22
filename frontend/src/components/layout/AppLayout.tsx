import { Outlet, useNavigate } from 'react-router-dom';
import { Battery, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/useAppStore';

export function AppLayout() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, isAuthenticated, setAuthenticated } =
    useAppStore();

  function handleLogout() {
    setAuthenticated(false);
    navigate('/login', { replace: true });
  }
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Battery className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                PaaS4Bat Dashboard
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
