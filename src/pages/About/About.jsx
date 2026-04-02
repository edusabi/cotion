import { FiTarget, FiZap, FiShield, FiTrendingUp, FiCpu } from "react-icons/fi";
import styles from "./About.module.css";

const About = () => {
  return (
    <main className={styles.container}>
      <section className={styles.aboutCard}>
        <div className={styles.header}>
          <span className={styles.badge}>Nossa Missão</span>
          <h1>Inteligência que blinda o seu lucro.</h1>
          <p className={styles.subtitle}>
            O Cotion nasceu para aniquilar o "achismo" e colocar dinheiro de verdade no bolso de quem empreende.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.mainText}>
            <p>
              Em um mercado onde as taxas invisíveis engolem suas margens e a guerra de preços nos marketplaces é implacável, 
              o <strong>Cotion</strong> surge como a arma secreta do lojista moderno. 
            </p>
            <p>
              Não somos apenas uma calculadora. Somos um ecossistema criado para resolver a maior dor de quem vende, desde os negócios locais em Surubim até o e-commerce global: 
              ter a certeza absoluta de que não está pagando para trabalhar.
            </p>
          </div>

          <div className={styles.gridFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiCpu /></div>
              <h3>Espião da Concorrência</h3>
              <p>Engenharia reversa que disseca o preço do vizinho e revela se cobrir a oferta dele é lucro ou armadilha.</p>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiZap /></div>
              <h3>Raio-X do Lucro</h3>
              <p>Descubra instantaneamente se você está realmente ganhando dinheiro ou sendo devorado pelas taxas em cada venda.</p>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiShield /></div>
              <h3>Segurança e Sigilo</h3>
              <p>Sua margem é o seu maior segredo. Seus custos, taxas e histórico ficam blindados com criptografia de ponta.</p>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiTrendingUp /></div>
              <h3>Foco em Escala</h3>
              <p>Esqueça as planilhas confusas. Ferramentas que acompanham o seu crescimento, da primeira venda ao grande faturamento.</p>
            </div>
          </div>

          <div className={styles.manifesto}>
            <h3>Por que o Cotion existe?</h3>
            <p>
              Porque nenhum empreendedor deveria trabalhar no escuro. Acreditamos que a clareza financeira é a única linha que separa os negócios que apenas sobrevivem daqueles que dominam o mercado. O Cotion entrega essa clareza de forma brutalmente simples, transformando contas difíceis em decisões estratégicas imediatas.
            </p>
          </div>

          <div className={styles.transparencyBox}>
            <div className={styles.transparencyHeader}>
              <FiShield className={styles.shieldIcon} />
              <h3>Compromisso Cotion de Transparência</h3>
            </div>
            <p>
              "Nós odiamos pegadinhas tanto quanto você. O Cotion <strong>não faz cobranças automáticas</strong> no seu cartão. 
              Ao fim dos 30 dias, você escolhe se deseja renovar seu acesso Premium. 
              Sem assinaturas forçadas, sem letras miúdas e sem dor de cabeça."
            </p>
          </div>

          <div className={styles.footerBrand}>
            <p><strong>Cotion</strong> — Onde cada centavo é valorizado e protegido.</p>
          </div>

        </div>
      </section>
    </main>
  );
};

export default About;