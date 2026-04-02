import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../pages/Login/Login.module.css"; // Reaproveitando seu estilo

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Quando a página carrega, nós pegamos o token que o Supabase colocou na URL
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove o "#"
      const accessToken = params.get("access_token");
      if (accessToken) {
        setToken(accessToken);
      }
    }
  }, []);

  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage("As senhas não coincidem!");
    }

    if (!token) {
      return setMessage("Token inválido ou expirado. Solicite a recuperação novamente.");
    }

    try {
      // Enviamos a nova senha E o token para o seu backend
      await axios.post("/auth/reset_password", { 
        newPassword, 
        accessToken: token 
      });
      setMessage("Senha atualizada com sucesso! Você já pode fazer login.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Erro ao atualizar senha.");
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleUpdatePassword} className={styles.card}>
        <h2>Criar Nova Senha</h2>
        
        <input 
          type="password" 
          placeholder="Digite a nova senha" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={styles.input}
          required
        />
        
        <input 
          type="password" 
          placeholder="Confirme a nova senha" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
          required
        />
        
        <button type="submit" className={styles.primaryBtn}>Salvar Senha</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}