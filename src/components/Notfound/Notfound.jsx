import { useNavigate } from "react-router-dom";
import styles from "./Notfound.module.css";

const Notfound = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      <div className={styles.glassCard}>
        <h1 className={styles.errorCode}>404</h1>
        <div className={styles.divider}></div>
        <h2>Ops! Página não encontrada</h2>
        <p>
          Parece que você se perdeu nos cálculos. A página que você está procurando 
          não existe ou foi movida.
        </p>
        
        <button 
          className={styles.primaryBtn} 
          onClick={() => navigate("/dashboard")}
        >
          Voltar para o Início
        </button>
      </div>
    </main>
  );
};

export default Notfound;