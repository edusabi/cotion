import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import styles from "./Contact.module.css";

const Contact = () => {
  const [status, setStatus] = useState("");
  const formRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Enviando...");

    // SUBSTITUA PELOS SEUS IDS DO EMAILJS
    const SERVICE_ID = "service_tegvp85"; 
    const TEMPLATE_ID = "template_p9792e3";
    const PUBLIC_KEY = "efo4cNIuJBev4wu7O";

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then(() => {
        setStatus("Mensagem enviada com sucesso! Em breve entraremos em contato.");
        setTimeout(()=>{
          setStatus("");
        }, 3000);
        e.target.reset();
      }, (error) => {
        console.error(error.text);
        setStatus("Erro ao enviar mensagem. Tente novamente mais tarde.");
      });
  };

  return (
    <main className={styles.container}>
      <section className={styles.contactCard}>
        <div className={styles.header}>
          <h1>Contato & Suporte</h1>
          <p className={styles.subtitle}>
            Dúvidas sobre precificação ou sugestões? Estamos prontos para ajudar.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Seu Nome</label>
            {/* O atributo 'name' deve ser igual ao que você colocar no template do EmailJS */}
            <input type="text" name="from_name" placeholder="Ex: Eduardo Silva" className={styles.input} required />
          </div>

          <div className={styles.inputGroup}>
            <label>E-mail Profissional</label>
            <input type="email" name="from_email" placeholder="seu@email.com" className={styles.input} required />
          </div>

          <div className={styles.inputGroup}>
            <label>Assunto</label>
            <select name="subject" className={styles.input}>
              <option value="Dúvida Técnica">Dúvida Técnica</option>
              <option value="Financeiro">Financeiro / Assinatura</option>
              <option value="Sugestão">Sugestão de Recurso</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Mensagem</label>
            <textarea 
              name="message"
              placeholder="Como podemos ajudar você hoje?" 
              className={styles.textarea} 
              rows="5"
              required
            ></textarea>
          </div>

          <button type="submit" className={styles.primaryBtn}>
            Enviar Mensagem
          </button>

          {status && (
            <p className={status.includes("sucesso") ? styles.success : styles.error}>
              {status}
            </p>
          )}
        </form>

        <div className={styles.footerInfo}>
          <p>📧 luiseduardodevv@gmail.com</p>
          <p>⏱️ Resposta média: 24h úteis</p>
        </div>
      </section>
    </main>
  );
};

export default Contact;