import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const API_URL = "https://cotion.discloud.app"; // Lembre-se de mudar para sua URL real no deploy

const messages = [
  "💰 Pare de dar o seu lucro para as taxas: saiba exatamente para onde vai o seu dinheiro.",
  "🚀 A única ferramenta que te mostra se você está lucrando ou pagando para trabalhar.",
];

// Atualizado com a funcionalidade Raio-X do Lucro
const cards = [
  {
    title: "💀 Raio-X do Lucro",
    description: "Acha que está ganhando dinheiro? Descubra em segundos o seu lucro real e veja se a sua margem não está sendo engolida pelas taxas.",
  },
  {
    title: "🎯 Precificação à Prova de Prejuízo",
    description: "Nunca mais chute preços. Insira seus custos e o sistema te dá o valor exato de venda para garantir a sua margem de lucro, sem achismos.",
  },
  {
    title: "🕵️‍♂️ Espião da Concorrência",
    description: "O cliente disse que o vizinho faz mais barato? Descubra instantaneamente se cobrir o preço dele vai te dar lucro ou se é uma armadilha financeira.",
  },
  {
    title: "📊 Caixa Diário Blindado",
    description: "Feche o dia com tranquilidade. Registre entradas e saídas em segundos e saiba com clareza absoluta quanto dinheiro sobrou limpo para você.",
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
          <h1>Chega de trabalhar só para pagar boletos e taxas.</h1>
          <p>
            Assuma o controle total do seu negócio. Faça um Raio-X do seu lucro real, espione se vale a pena cobrir a concorrência e precifique seus produtos com precisão cirúrgica.
          </p>
          <div className={styles.ctaRow}>
            <button 
              onClick={() => user?.is_premium ? navigate("/dashboard") : document.getElementById('inscreva').scrollIntoView()} 
              className={styles.primaryBtn}
              style={{cursor: "pointer"}}>
              {user?.is_premium ? "Acessar meu Dashboard 📊" : "Quero blindar meu lucro agora 💰"}
            </button>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.visor}>Pare de perder dinheiro na hora</div>
          <div className={styles.images}>
            {/* Você pode trocar essa imagem por um print da sua tela do Comparador depois! */}
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=640&q=80" alt="dashboard financeiro" />
            <img src="/imgHome.png" alt="dashboard financeiro" />
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
        <h2>Um arsenal completo para o seu negócio</h2>
        <p>Feito para empreendedores que querem lucrar mais, trabalhando a mesma coisa.</p>
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
          <h2>{user?.is_premium ? "Você já é Premium! ⭐" : "O sistema que se paga já na sua primeira venda."}</h2>
          <p>Desbloqueie acesso total ao Raio-X do Lucro, Espião da Concorrência, Precificação Inteligente e Caixa Diário.</p>
          
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
            {isProcessing ? "Gerando Pagamento Seguro..." : user?.is_premium ? "Ir para o Sistema" : "Liberar Meu Acesso Premium"}
          </button>
          
          {!user && (
            <p className={styles.loginAlert} style={{ marginTop: "1rem", fontSize: "0.85rem", color: "rgba(226, 232, 240, 0.6)" }}>
              * Crie sua conta ou faça login no momento do checkout. Cancele quando quiser, sem letras miúdas.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;