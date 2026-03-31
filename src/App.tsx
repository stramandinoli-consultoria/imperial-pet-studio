import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { SwaggerButton } from "@/components/dev/SwaggerButton";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Agendamento from "@/pages/Agendamento";
import MeusPets from "@/pages/MeusPets";
import Profile from "@/pages/Profile";
import Roleta from "@/pages/Roleta";
import RoletaAdmin from "@/pages/RoletaAdmin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminAgendamentos from "@/pages/admin/AdminAgendamentos";
import AdminRoleta from "@/pages/admin/AdminRoleta";
import AdminPremios from "@/pages/admin/AdminPremios";
import AdminClientes from "@/pages/admin/AdminClientes";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/agendamento" element={<Agendamento />} />
                <Route path="/meus-pets" element={<MeusPets />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/roleta" element={<Roleta />} />
                <Route path="/roleta/admin" element={<RoletaAdmin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/agendamentos" element={<AdminAgendamentos />} />
                <Route path="/admin/roleta" element={<AdminRoleta />} />
                <Route path="/admin/premios" element={<AdminPremios />} />
                <Route path="/admin/clientes" element={<AdminClientes />} />
                <Route path="/servicos" element={<Index initialSection="servicos" />} />
                <Route path="/produtos" element={<Index initialSection="produtos" />} />
                <Route path="/contato" element={<Index initialSection="contato" />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Router>
            <Toaster />
            <SwaggerButton />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
