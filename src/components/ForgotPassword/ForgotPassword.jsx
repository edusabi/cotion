import React, { useState } from "react";
import axios from "axios";
import styles from "../../pages/Login/Login.module.css"; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleResetRequest(e) {
    e.preventDefault();
    try {
      // Chame a rota do seu backend que criamos acima
      await axios.post("/auth/forgot_password", { email });
      setMessage("Verifique sua caixa de entrada!");
    } catch (err) {
      setMessage("Erro ao enviar e-mail. Tente novamente.");
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleResetRequest} className={styles.card}>
        <h2>Recuperar Senha</h2>
        <input 
          type="email" 
          placeholder="Digite seu e-mail" 
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.primaryBtn}>Enviar Link</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}