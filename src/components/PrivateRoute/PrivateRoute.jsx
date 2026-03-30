import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Ajuste o caminho se precisar

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. Espera a requisição do /me terminar
  if (loading) return <p>Carregando...</p>;

  // 2. Se o cara não tem conta ou não fez login, chuta pro /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. A BARREIRA DO PAGAMENTO: Logou, mas não passou o cartão/PIX
  if (!user.is_premium) {
    // Joga ele de volta pra Home (onde tem o botão de Comprar)
    // Usamos o replace para ele não conseguir voltar clicando na seta do navegador
    return <Navigate to="/" replace />; 
  }

  // 4. Se chegou aqui, ele tá logado e pagou. Libera o acesso!
  return children;
}