import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { FiMail, FiMessageSquare, FiSend, FiClock, FiHelpCircle } from "react-icons/fi";
import styles from "./Contact.module.css";

const Contact = () => {
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatus("");

    const SERVICE_ID = "service_tegvp85"; 
    const TEMPLATE_ID = "template_p9792e3";
    const PUBLIC_KEY = "efo4cNIuJBev4wu7O";

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then(() => {
        setStatus("success");
        setTimeout(() => setStatus(""), 5000);
        e.target.reset();
      }, (error) => {
        console.error(error.text);
        setStatus("error");
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h2><FiMessageSquare className={styles.titleIcon} /> Como podemos ajudar?</h2>
        <p>Suporte técnico, dúvidas financeiras ou sugestões. Fale com a nossa equipe.</p>
      </div>

      <div className={styles.contentWrapper}>
        
        {/* Painel de Informações Laterais */}
        <aside className={styles.infoPanel}>
          <div className={styles.infoCard}>
            <div className={styles.iconCircle}><FiMail /></div>
            <div>
              <h3>E-mail Direto</h3>
              <p>luiseduardodevv@gmail.com</p>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconCircle}><FiClock /></div>
            <div>
              <h3>Tempo de Resposta</h3>
              <p>Até 24h úteis</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconCircle}><FiHelpCircle /></div>
            <div>
              <h3>Central de Ajuda</h3>
              <p>Precisa de algo urgente? Descreva os detalhes na mensagem ao lado.</p>
            </div>
          </div>
        </aside>

        {/* Formulário Principal */}
        <section className={styles.formSection}>
          <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Seu Nome</label>
                <input type="text" name="from_name" placeholder="Ex: Eduardo Silva" required />
              </div>

              <div className={styles.inputGroup}>
                <label>Seu E-mail</label>
                <input type="email" name="from_email" placeholder="seu@email.com" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Assunto</label>
              <select name="subject" required>
                <option value="Dúvida Técnica">Dúvida Técnica / Bug</option>
                <option value="Financeiro">Financeiro / Assinatura</option>
                <option value="Sugestão">Sugestão de Recurso</option>
                <option value="Parceria">Parceria / Negócios</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Mensagem</label>
              <textarea 
                name="message"
                placeholder="Como o Cotion pode te ajudar hoje? Escreva os detalhes..." 
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSending}>
              {isSending ? "Enviando Mensagem..." : <><FiSend /> Enviar Mensagem</>}
            </button>

            {/* Alertas de Sucesso e Erro */}
            {status === "success" && (
              <div className={styles.alertSuccess}>
                Mensagem enviada com sucesso! Retornaremos o mais breve possível.
              </div>
            )}
            {status === "error" && (
              <div className={styles.alertError}>
                Erro ao enviar mensagem. Por favor, tente novamente ou use o e-mail direto.
              </div>
            )}
          </form>
        </section>

      </div>
    </main>
  );
};

export default Contact;