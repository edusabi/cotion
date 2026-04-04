// components/ReversePricing/ReversePricing.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiTrendingDown, FiTarget } from "react-icons/fi";
import styles from "./ReversePricing.module.css";

const ReversePricing = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [competitorPrice, setCompetitorPrice] = useState("");
  const [salesChannel, setSalesChannel] = useState("mercadolivre");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products", { withCredentials: true });
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
        "/api/products/reverse_pricing",
        {
          productId: selectedProductId,
          precoConcorrente: competitorPrice,
          canal: salesChannel
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

  // Funções de apoio visual
  const getStatusVisuals = (status) => {
    switch (status) {
      case "PERIGO": return { icon: <FiXCircle />, colorClass: styles.statusDanger, text: "Prejuízo na certa. Não cubra esse preço!" };
      case "ALERTA": return { icon: <FiAlertTriangle />, colorClass: styles.statusWarning, text: "Cuidado. Margem muito apertada." };
      case "EXCELENTE": return { icon: <FiCheckCircle />, colorClass: styles.statusSuccess, text: "Sinal Verde! Você pode cobrir a oferta." };
      default: return { icon: <FiTarget />, colorClass: styles.statusSuccess, text: "Análise concluída." };
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><FiTarget className={styles.titleIcon} /> Radar de Precificação</h2>
        <p>Descubra instantaneamente se vale a pena entrar na guerra de preços.</p>
      </div>

      <form onSubmit={handleCalculate} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Qual produto você quer analisar?</label>
          <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
            <option value="">-- Selecione no seu estoque --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Canal de Venda</label>
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
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Processando Inteligência..." : "Rodar Engenharia Reversa"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={`${styles.dashboardCard} ${getStatusVisuals(result.status).colorClass}`}>
          
          {/* VEREDITO PRINCIPAL - O Fator UAU */}
          <div className={styles.verdictSection}>
            <div className={styles.verdictIcon}>
              {getStatusVisuals(result.status).icon}
            </div>
            <div className={styles.verdictText}>
              <span className={styles.verdictLabel}>Veredito do Sistema</span>
              <h3>{getStatusVisuals(result.status).text}</h3>
            </div>
          </div>

          {/* O NÚMERO DE OURO (Break-even) */}
          <div className={styles.breakEvenBox}>
            <div className={styles.breakEvenInfo}>
              <span className={styles.breakEvenTitle}>Preço Mínimo (Zero Lucro/Zero Prejuízo)</span>
              <p>Você nunca deve vender abaixo deste valor na {result.canalAnalise}:</p>
            </div>
            <div className={styles.breakEvenValue}>
              R$ {result.precoEmpate.toFixed(2)}
            </div>
          </div>

          {/* OS NÚMEROS REAIS */}
          <div className={styles.financialGrid}>
            <div className={styles.financeItem}>
              <span>Margem Real</span>
              <strong className={result.margemPercentual > 0 ? styles.textGreen : styles.textRed}>
                {result.margemPercentual.toFixed(2)}%
              </strong>
            </div>
            
            <div className={styles.financeItem}>
              <span>Lucro Líquido (No Bolso)</span>
              <strong className={result.lucroReais > 0 ? styles.textGreen : styles.textRed}>
                R$ {result.lucroReais.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* RAIO-X DOS CUSTOS */}
          <div className={styles.costBreakdown}>
            <div className={styles.costItem}>
              <span>Custo Produto + Frete</span>
              <span>- R$ {result.custoBase.toFixed(2)}</span>
            </div>
            <div className={styles.costItem}>
              <span>
                {result.canalAnalise.includes("Física") ? "Taxas da Maquininha" : "Comissão da Plataforma"} 
                {result.taxasDoCanal.percentualAplicado > 0 && ` (${result.taxasDoCanal.percentualAplicado}%)`}
              </span>
              <span>- R$ {result.taxasDoCanal.totalDescontado.toFixed(2)}</span>
            </div>
            <div className={styles.costTotal}>
              <span>Custo Total da Operação</span>
              <span>R$ {(result.custoBase + result.taxasDoCanal.totalDescontado).toFixed(2)}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReversePricing;