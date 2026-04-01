import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
   const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

   function validate() {
    const newErrors = {};

    if (!email) {
      newErrors.email = "E-mail obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!password) {
      newErrors.password = "Senha obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setServerError("");
    setSuccess("");

    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email, password);

      setSuccess("Login realizado com sucesso!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch {
      setServerError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Entrar</h1>
        <p className={styles.subtitle}>
          Acesse sua conta e continue lucrando 🚀
        </p>

        {serverError && (
          <div className={styles.serverError}>{serverError}</div>
        )}

        {success && (
          <div className={styles.success}>{success}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <input
              type="email"
              placeholder="Seu e-mail"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Sua senha"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* FRASE "ESQUECI A SENHA" ADICIONADA AQUI */}
            <div className={styles.forgotPasswordContainer}>
              <a href="/recuperar-senha" className={styles.forgotLink}>
                Esqueceu a senha?
              </a>
            </div>

            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar agora"}
          </button>
        </form>

        <p className={styles.switch}>
          Não tem conta? <a href="/registro">Criar conta</a>
        </p>
      </div>
    </div>
  );
}