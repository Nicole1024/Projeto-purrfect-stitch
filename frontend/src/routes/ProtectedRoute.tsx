import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../contexts/AuthContext';

/** Só deixa passar quem está logado; senão manda para /login. */
export default function RotaProtegida() {
  const { autenticado } = useAutenticacao();
  const local = useLocation();
  if (!autenticado) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  return <Outlet />;
}
