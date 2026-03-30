import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const API_URL = "https://cotion.discloud.app/"; // Lembre-se de mudar para sua URL real no deploy

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
    description: "Seja e-commerce, loja física ou serviços, você precifica com confiança.",
  },
];

const Home = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`, { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handlePurchase = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  if (user.is_premium) {
    navigate("/dashboard");
    return;
  }

  setIsProcessing(true);
  try {
    const response = await axios.post(
      `${API_URL}/api/checkout`,
      {}, 
      { withCredentials: true }
    );

    if (response.data.checkoutUrl) {
      // O replace garante que o usuário não fique preso no histórico ao voltar
      window.location.assign(response.data.checkoutUrl);
    }
  } catch (error) {
    console.error("Erro ao gerar checkout:", error);
    alert("Erro ao gerar link de pagamento. Tente novamente.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <main className={styles.homeWrap}>
      {/* SEÇÃO HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>Venda com preço certo. Lucro de verdade.</h1>
          <p>
            Descubra rapidamente quanto deve cobrar para cobrir custos e sair no
            lucro. Focado em resultados reais para empreendedores.
          </p>
          <div className={styles.ctaRow}>
            <button 
              onClick={() => user?.is_premium ? navigate("/dashboard") : document.getElementById('inscreva').scrollIntoView()} 
              className={styles.primaryBtn}
            >
              {user?.is_premium ? "Acessar Dashboard 📊" : "Descobrir meu lucro agora 💰"}
            </button>
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

      {/* SEÇÃO STATS/MENSAGENS */}
      <section className={styles.stats}>
        {messages.map((msg) => (
          <article key={msg} className={styles.messageBox}>
            <p>{msg}</p>
          </article>
        ))}
      </section>

      {/* SEÇÃO CARDS DE BENEFÍCIOS */}
      <section className={styles.featureList} id="features">
        <div className={styles.cardGrid}>
          {cards.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE PREÇO / ASSINATURA */}
      <section className={styles.pricing} id="inscreva">
        <div className={styles.priceCard}>
          <h2>{user?.is_premium ? "Você já é Premium! ⭐" : "Pronto para começar?"}</h2>
          <p>Acesso ilimitado à ferramenta de precificação e caixa diário.</p>
          
          {!user?.is_premium && (
            <div className={styles.priceBox}>
              <span className={styles.originalPrice}>R$ 20,00</span>
              <span className={styles.priceValue}>R$ 9,99</span>
              <span className={styles.priceFreq}>/ mês</span>
            </div>
          )}

          <button 
            className={styles.buyBtn} 
            onClick={handlePurchase}
            disabled={isProcessing} 
            style={{ 
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? "wait" : "pointer"
            }}
          >
            {isProcessing ? "Processando..." : user?.is_premium ? "Ir para o Sistema" : "Assinar Agora"}
          </button>
          
          {!user && (
            <p className={styles.loginAlert}>
              * Você precisa estar logado para realizar a assinatura.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;