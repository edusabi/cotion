import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors = {};

    if (!name) newErrors.name = "Nome obrigatório";

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

    if (confirm !== password) {
      newErrors.confirm = "As senhas não coincidem";
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      // sucesso
      setSuccess("Conta criada com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setServerError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Criar conta</h1>
        <p className={styles.subtitle}>
          Comece a calcular seu lucro de verdade 💰
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
              type="text"
              placeholder="Seu nome"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

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
              placeholder="Crie uma senha"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirme a senha"
              className={styles.input}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.confirm && (
              <span className={styles.error}>{errors.confirm}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar conta grátis"}
          </button>
        </form>

        <p className={styles.switch}>
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </div>
    </div>
  );
}