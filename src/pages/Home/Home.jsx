import { useEffect, useState } from "react";
import styles from "./Home.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const messages = [
  "💰 Economize centenas por mês",
  "🚀 Ferramenta 100% para todos os negócios",
];

const cards = [
  {
    title: "Acerte no preço em 3 minutos",
    description: "Insira custo, despesas e meta de margem e veja o valor ideal na hora.",
  },
  {
    title: "Menos tempo, mais lucro",
    description: "Saiba quanto está perdendo hoje e qual o impacto real na sua lucratividade.",
  },
  {
    title: "Resultados para todos os negócios",
    description: "Seja ecommerce, loja física ou serviços, você precifica com confiança.",
  },
];

const Home = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário já é premium ao carregar a página
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/me", { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    checkUser();
    setIsProcessing(false);
  }, []);

  const handlePurchase = async () => {
    // Se não estiver logado, manda para o login
    if (!user) {
      navigate("/login");
      return;
    }

    // Se já for premium, manda para o dashboard
    if (user.is_premium) {
      navigate("/dashboard");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/checkout",
        {}, 
        { withCredentials: true }
      );

      if (response.data.checkoutUrl) {
        // Redireciona para o fluxo de ASSINATURA do Mercado Pago
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Erro ao gerar checkout:", error);
      alert("Erro ao gerar link de assinatura. Tente novamente.");
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.homeWrap}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>Venda com preço certo. Lucro de verdade.</h1>
          <p>
            Descubra rapidamente quanto deve cobrar para cobrir custos e sair no
            lucro. Focado em resultados reais para empreendedores.
          </p>
          <div className={styles.ctaRow}>
            <a href="#inscreva" className={styles.primaryBtn}>
              {user?.is_premium ? "Acessar Dashboard 📊" : "Descobrir meu lucro agora 💰"}
            </a>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visor}>+12% de margem em 5 minutos</div>
          <div className={styles.images}>
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=640&q=80" alt="dashboard" />
          </div>
          <div className={styles.pulse}></div>
        </div>
      </section>

      <section className={styles.stats} id="features">
        {messages.map((msg) => (
          <article key={msg} className={styles.messageBox}>
            <p>{msg}</p>
          </article>
        ))}
      </section>

      <section className={styles.pricing} id="inscreva">
        <div className={styles.priceCard}>
          <h2>{user?.is_premium ? "Você já é Premium! ⭐" : "Pronto para começar?"}</h2>
          <p>Acesso ilimitado à ferramenta de precificação e caixa diário.</p>
          
          {!user?.is_premium && (
            <div className={styles.priceBox}>
              <span className={styles.originalPrice}>R$ 20,00</span>
              <span className={styles.priceValue}>R$ 9,99</span>
              <span className={styles.priceFreq}>por mês</span>
            </div>
          )}

          <button 
            className={styles.buyBtn} 
            onClick={handlePurchase}
            disabled={isProcessing} 
            style={{ opacity: isProcessing ? 0.7 : 1 }}
          >
            {isProcessing ? "Processando..." : user?.is_premium ? "Ir para o Sistema" : "Assinar Agora"}
          </button>
          
          {!user && <p style={{marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8'}}>* Necessário estar logado para assinar</p>}
        </div>
      </section>
    </main>
  );
};

export default Home;