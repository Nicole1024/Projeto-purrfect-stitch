import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AutenticacaoProvedor } from './contexts/AuthContext';
import { NotificacaoProvedor } from './contexts/NotificationContext';
import { TemaProvedor } from './contexts/ThemeContext';
import RotaProtegida from './routes/ProtectedRoute';
import LayoutPrincipal from './components/layout/MainLayout';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Produtos from './pages/products/Products';
import ProdutoFormulario from './pages/products/ProductForm';
import ProdutoDetalhes from './pages/products/ProductDetails';
import Administradores from './pages/administrators/Administrators';
import AdministradorFormulario from './pages/administrators/AdministratorForm';
import Historico from './pages/history/History';
import NaoEncontrada from './pages/NotFound';

export default function App() {
  return (
    <TemaProvedor>
      <NotificacaoProvedor>
        <AutenticacaoProvedor>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<RotaProtegida />}>
                <Route element={<LayoutPrincipal />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/produtos/novo" element={<ProdutoFormulario />} />
                  <Route path="/produtos/:id" element={<ProdutoDetalhes />} />
                  <Route path="/produtos/:id/editar" element={<ProdutoFormulario />} />
                  <Route path="/administradores" element={<Administradores />} />
                  <Route path="/administradores/novo" element={<AdministradorFormulario />} />
                  <Route path="/administradores/:id/editar" element={<AdministradorFormulario />} />
                  <Route path="/historico" element={<Historico />} />
                  <Route path="*" element={<NaoEncontrada />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AutenticacaoProvedor>
      </NotificacaoProvedor>
    </TemaProvedor>
  );
}
