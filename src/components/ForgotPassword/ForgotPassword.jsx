import React, { useState } from "react";
import axios from "axios";
import styles from "../../pages/Login/Login.module.css"; 

// 🔥 ADICIONE A URL DO SEU BACKEND AQUI (Ajuste se for outra)
const API_URL = process.env.REACT_APP_API_URL || "https://cotion.discloud.app";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleResetRequest(e) {
    e.preventDefault();
    try {
      // 🔥 AQUI ESTAVA O ERRO: Faltava o API_URL antes da rota
      await axios.post(`${API_URL}/auth/forgot_password`, { email });
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