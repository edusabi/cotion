import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Success.module.css";

const Success = () => {
  const navigate = useNavigate();

  // Opcional: Redirecionar automaticamente após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className={styles.successWrap}>
      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <span className={styles.checkIcon}>✓</span>
        </div>
        <h1>Pagamento Confirmado!</h1>
        <p>
          Seu acesso ao <strong>Cotion Premium</strong> foi liberado com sucesso. 
          Prepare-se para precificar com lucro real.
        </p>
        
        <div className={styles.infoBox}>
          <span>Status: Ativo</span>
          <span>Plano: Mensal</span>
        </div>

        <button 
          className={styles.goBtn} 
          onClick={() => navigate("/dashboard")}
        >
          Acessar meu Dashboard agora
        </button>
        
        <p className={styles.footerNote}>
          Você será redirecionado automaticamente em instantes...
        </p>
      </div>
    </main>
  );
};

export default Success;