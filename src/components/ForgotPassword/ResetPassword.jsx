import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../pages/Login/Login.module.css"; 

export default function ResetPassword() {
  // Pega o ID e o Token dinâmicos direto da URL
  const { id, token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage("As senhas não coincidem!");
    }

    try {
      // Enviamos o ID, o Token e a Nova Senha para o backend
      await axios.post("/auth/reset_password", { 
        id, 
        token, 
        newPassword 
      });
      
      setMessage("Senha atualizada com sucesso! Redirecionando...");
      setTimeout(() => navigate('/login'), 2500); // Manda pro login após 2.5s
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