import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const API_URL = "https://cotion.discloud.app"; // Lembre-se de mudar para sua URL real no deploy

const messages = [
  "💰 Economize centenas de reais fugindo de taxas abusivas",
  "🚀 A suíte financeira definitiva para o comércio local e digital",
];

// Atualizado com TODAS as funcionalidades matadoras do seu app
const cards = [
  {
    title: "🎯 Precificação Inteligente",
    description: "Insira custos, fretes e impostos. O sistema calcula o preço exato para você bater sua meta de margem de lucro.",
  },
  {
    title: "🕵️‍♂️ Espião de Concorrente",
    description: "Engenharia reversa pura: descubra instantaneamente se vale a pena cobrir a oferta da concorrência ou se é prejuízo na certa.",
  },
  {
    title: "💳 Comparador de Maquininhas",
    description: "Digite o valor da venda e saiba na hora qual das suas maquininhas vai colocar mais dinheiro no seu bolso. Pare de perder para as taxas.",
  },
  {
    title: "📊 Caixa Diário Inteligente",
    description: "Registre suas entradas e saídas de forma simples e tenha clareza absoluta de quanto a sua empresa realmente lucrou no dia.",
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
          <h1>Parem de roubar o seu lucro.</h1>
          <p>
            Assuma o controle financeiro do seu negócio. Compare maquininhas, espione os custos para cobrir a concorrência e precifique com precisão cirúrgica.
          </p>
          <div className={styles.ctaRow}>
            <button 
              onClick={() => user?.is_premium ? navigate("/dashboard") : document.getElementById('inscreva').scrollIntoView()} 
              className={styles.primaryBtn}
              style={{cursor: "pointer"}}>
              {user?.is_premium ? "Acessar meu Dashboard 📊" : "Proteger meu lucro agora 💰"}
            </button>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.visor}>Economia real em cada venda</div>
          <div className={styles.images}>
            {/* Você pode trocar essa imagem por um print da sua tela do Comparador depois! */}
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=640&q=80" alt="dashboard financeiro" />
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=640&q=80" alt="dashboard financeiro" />
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
        <h2>Tudo que você precisa em um só lugar</h2>
        <p>Desenvolvido para empreendedores que não têm tempo a perder.</p>
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
          <h2>{user?.is_premium ? "Você já é Premium! ⭐" : "O sistema que se paga no primeiro dia."}</h2>
          <p>Acesso ilimitado ao Comparador de Maquininhas, Espião de Concorrentes, Precificação e Caixa Diário.</p>
          
          {!user?.is_premium && (
            <div className={styles.priceBox}>
              <span className={styles.originalPrice}>De R$ 49,90</span>
              <span className={styles.priceValue}>R$ 24,99</span>
              <span className={styles.priceFreq}>/ mês</span>
            </div>
          )}

          <button 
            className={styles.buyBtn} 
            onClick={handlePurchase}
            disabled={isProcessing} 
            style={{ 
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? "wait" : "pointer",
                width: "100%",
                padding: "1.2rem",
                fontSize: "1.1rem"
            }}
          >
            {isProcessing ? "Gerando Pagamento Seguro..." : user?.is_premium ? "Ir para o Sistema" : "Assinar Premium Agora"}
          </button>
          
          {!user && (
            <p className={styles.loginAlert} style={{ marginTop: "1rem", fontSize: "0.85rem", color: "rgba(226, 232, 240, 0.6)" }}>
              * Crie sua conta ou faça login no momento do checkout. Cancelamento a qualquer momento.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;