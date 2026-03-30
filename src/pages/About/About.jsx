import styles from "./About.module.css";

const About = () => {
  return (
    <main className={styles.container}>
      <section className={styles.aboutCard}>
        <div className={styles.header}>
          <span className={styles.badge}>Nossa Missão</span>
          <h1>Precificação inteligente para qualquer negócio.</h1>
        </div>

        <div className={styles.content}>
          <p>
            O <strong>Cotion</strong> nasceu para acabar com a incerteza financeira de quem empreende. 
            Seja você um prestador de serviços, dono de loja física, freelancer ou vendedor de e-commerce, 
            o desafio é o mesmo: saber se o preço cobrado cobre os custos e gera lucro real.
          </p>

          <div className={styles.gridFeatures}>
            <div className={styles.featureItem}>
              <h3>🎯 Universal</h3>
              <p>Ideal para produtos físicos e serviços digitais.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>📊 Lucro Real</h3>
              <p>Calcule impostos, custos fixos e variáveis para ver o que realmente sobra no bolso.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>⚡ Simplicidade</h3>
              <p>Uma interface intuitiva que entrega resultados profissionais em segundos.</p>
            </div>
          </div>

          <p className={styles.footerText}>
            Não deixe o seu lucro ao acaso. O Cotion é o braço direito estratégico 
            para o seu crescimento sustentável, ajudando você a tomar decisões baseadas em dados 
            e não em suposições. Pare de "pagar para trabalhar" e comece a valorizar o seu negócio.
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;