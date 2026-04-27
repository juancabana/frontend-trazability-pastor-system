import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/components/ProtectedRoute';
import { Home } from 'lucide-react';
import { SEO } from '@/shared/presentation/SEO';

export default function NotFoundPage() {
  const { role, isAuthenticated } = useAuth();

  const homeLink = isAuthenticated ? getRoleRedirect(role) : '/login';

  return (
    <>
      <SEO
        title="Página no encontrada"
        description="La página que buscas no existe o fue movida."
        noIndex
      />
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-gray-200 dark:text-slate-800">404</p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
          Pagina no encontrada
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 mb-6">
          La pagina que buscas no existe o fue movida.
        </p>
        <Link
          to={homeLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
    </>
  );
}
