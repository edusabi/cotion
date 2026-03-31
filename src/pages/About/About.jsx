import { FiTarget, FiZap, FiShield, FiTrendingUp, FiCpu } from "react-icons/fi";
import styles from "./About.module.css";

const About = () => {
  return (
    <main className={styles.container}>
      <section className={styles.aboutCard}>
        <div className={styles.header}>
          <span className={styles.badge}>Nossa Missão</span>
          <h1>Inteligência que protege o seu lucro.</h1>
          <p className={styles.subtitle}>
            O Cotion nasceu para substituir o "achismo" por dados reais na vida de quem empreende.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.mainText}>
            <p>
              Em um mercado onde as taxas de maquininhas mudam constantemente e a guerra de preços nos marketplaces é implacável, 
              o <strong>Cotion</strong> surge como o braço direito do lojista moderno. 
            </p>
            <p>
              Não somos apenas uma calculadora. Somos uma suíte de ferramentas projetada para resolver os desafios de Surubim ao e-commerce global: 
              saber exatamente quanto sobra no bolso após cada venda.
            </p>
          </div>

          <div className={styles.gridFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiCpu /></div>
              <h3>Algoritmo de Reversão</h3>
              <p>Engenharia reversa que disseca o preço do concorrente e revela sua viabilidade real.</p>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiZap /></div>
              <h3>Cálculo Relâmpago</h3>
              <p>Compare suas maquininhas em segundos e fuja das taxas que corroem sua margem.</p>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiShield /></div>
              <h3>Segurança de Dados</h3>
              <p>Seus custos, taxas e histórico de caixa protegidos com tecnologia de ponta.</p>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.iconBox}><FiTrendingUp /></div>
              <h3>Foco em Escala</h3>
              <p>Ferramentas preparadas para acompanhar o seu crescimento, do micro ao grande negócio.</p>
            </div>
          </div>

          <div className={styles.manifesto}>
            <h3>Por que o Cotion existe?</h3>
            <p>
              Porque nenhum empreendedor deveria "pagar para trabalhar". Acreditamos que a clareza financeira 
              é o primeiro passo para o sucesso sustentável. O Cotion entrega essa clareza através de uma 
              interface intuitiva, transformando cálculos complexos em decisões estratégicas.
            </p>
          </div>

          <div className={styles.footerBrand}>
            <p><strong>Cotion</strong> — Onde cada centavo é valorizado.</p>
          </div>

          <div className={styles.transparencyBox}>
            <div className={styles.transparencyHeader}>
              <FiShield className={styles.shieldIcon} />
              <h3>Compromisso Cotion de Transparência</h3>
            </div>
            <p>
              "O Cotion <strong>não faz cobranças automáticas</strong> no seu cartão. 
              Ao fim dos 30 dias, você escolhe se deseja renovar por mais um mês. 
              Sem letras miúdas, sem renovações escondidas e sem burocracia."
            </p>
          </div>

          <div className={styles.footerBrand}>
            <p><strong>Cotion</strong> — Onde cada centavo é valorizado.</p>
          </div>

        </div>
      </section>
    </main>
  );
};

export default About;