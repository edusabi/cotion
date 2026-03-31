// components/ReversePricing/ReversePricing.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ReversePricing.module.css";

const ReversePricing = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [competitorPrice, setCompetitorPrice] = useState("");
  const [salesChannel, setSalesChannel] = useState("mercadolivre"); // Novo estado
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/products", { withCredentials: true });
        setProducts(response.data);
      } catch (err) {
        console.error("Erro ao buscar produtos", err);
      }
    };
    fetchProducts();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/products/reverse-pricing",
        {
          productId: selectedProductId,
          precoConcorrente: competitorPrice,
          canal: salesChannel // Enviando o canal para o backend
        },
        { withCredentials: true }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao calcular.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🕵️‍♂️ Espião de Concorrente</h2>
        <p>Analise se vale a pena cobrir o preço da concorrência em cada plataforma.</p>
      </div>

      <form onSubmit={handleCalculate} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Selecione seu Produto</label>
          <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
            <option value="">-- Escolha um produto --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* NOVO CAMPO: Seleção de Canal */}
        <div className={styles.inputGroup}>
          <label>Onde está o concorrente?</label>
          <select value={salesChannel} onChange={(e) => setSalesChannel(e.target.value)} required>
            <option value="mercadolivre">Mercado Livre</option>
            <option value="shopee">Shopee</option>
            <option value="shein">Shein</option>
            <option value="fisica">Loja Física / Presencial</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Preço do Concorrente (R$)</label>
          <input
            type="number" step="0.01" placeholder="Ex: 149.90"
            value={competitorPrice} onChange={(e) => setCompetitorPrice(e.target.value)} required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Analisando Plataforma..." : "Analisar Margem Real"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={`${styles.resultCard} ${result.viavel ? styles.success : styles.danger}`}>
          <h3>Resultado na {result.canalAnalise}</h3>
          <p className={styles.summaryText}>
            Vendendo a <strong>R$ {result.precoConcorrente.toFixed(2)}</strong>, sua margem real é de <strong>{result.margemPercentual.toFixed(2)}%</strong>.
          </p>
          
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span>Custo Base (Produto + Frete)</span>
              <strong>R$ {result.custoBase.toFixed(2)}</strong>
            </div>
            <div className={styles.detailItem}>
              <span>Comissão da Plataforma ({result.taxasDoCanal.percentualAplicado}%)</span>
              <strong>R$ {result.taxasDoCanal.valorPercentual.toFixed(2)}</strong>
            </div>
            {result.taxasDoCanal.taxaFixaAplicada > 0 && (
              <div className={styles.detailItem}>
                <span>Tarifa Fixa da Plataforma</span>
                <strong>R$ {result.taxasDoCanal.taxaFixaAplicada.toFixed(2)}</strong>
              </div>
            )}
            <div className={styles.detailItem}>
              <span>Lucro Líquido no Bolso</span>
              <strong className={result.viavel ? styles.textGreen : styles.textRed}>
                R$ {result.lucroReais.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReversePricing;