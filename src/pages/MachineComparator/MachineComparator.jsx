import React, { useState } from "react";
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiLock, FiArrowRight, FiXOctagon } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext"; 
import styles from "./MachineComparator.module.css";

const MachineComparator = () => {
  // 🔥 AGORA PUXAMOS O LOADING TAMBÉM
  const { user, loading } = useAuth();

  const [precoVenda, setPrecoVenda] = useState("");
  const [custoProduto, setCustoProduto] = useState("");
  const [taxaPlataforma, setTaxaPlataforma] = useState("");

  const lidarComMudancaMoeda = (e, setter) => {
    let valor = e.target.value.replace(/\D/g, "");
    valor = (valor / 100).toFixed(2);
    setter(valor === "0.00" ? "" : valor);
  };

  const venda = parseFloat(precoVenda) || 0;
  const custo = parseFloat(custoProduto) || 0;
  const taxa = parseFloat(taxaPlataforma) || 0;

  const valorDescontoTaxa = venda * (taxa / 100);
  const lucroReal = venda - custo - valorDescontoTaxa;
  const margemReal = venda > 0 ? (lucroReal / venda) * 100 : 0;

  let status = null;
  if (venda > 0) {
    if (lucroReal <= 0) {
      status = {
        tipo: "prejuizo",
        icone: <FiXOctagon />,
        cor: "#ef4444", 
        titulo: "ALERTA VERMELHO: Você está pagando para trabalhar!",
        mensagem: "Com essa configuração, você está tendo PREJUÍZO a cada venda realizada. Você precisa ajustar seu preço urgentemente."
      };
    } else if (margemReal < 15) {
      status = {
        tipo: "alerta",
        icone: <FiAlertTriangle />,
        cor: "#eab308", 
        titulo: "ATENÇÃO: Sua margem está no limite do perigo!",
        mensagem: "Você até tem lucro, mas a margem está tão espremida que qualquer devolução ou embalagem extra te joga no vermelho."
      };
    } else {
      status = {
        tipo: "sucesso",
        icone: <FiCheckCircle />,
        cor: "#22c55e", 
        titulo: "Bom trabalho! Mas dá para melhorar?",
        mensagem: "Você tem uma margem saudável. Mas será que você está cobrando o preço ideal para maximizar suas vendas na Shopee ou ML?"
      };
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><FiActivity className={styles.titleIcon} /> Raio-X do Lucro</h2>
        <p>Descubra em segundos se você está realmente ganhando dinheiro ou pagando para trabalhar.</p>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.calculatorCard}>
          <div className={styles.inputGroup}>
            <label>Por quanto você vende hoje? (R$)</label>
            <input 
              type="text" 
              placeholder="0.00" 
              value={precoVenda} 
              onChange={(e) => lidarComMudancaMoeda(e, setPrecoVenda)} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Qual o custo do produto? (R$)</label>
            <input 
              type="text" 
              placeholder="0.00" 
              value={custoProduto} 
              onChange={(e) => lidarComMudancaMoeda(e, setCustoProduto)} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Taxa cobrada (Maquininha, Shopee, etc) (%)</label>
            <input 
              type="number" 
              placeholder="Ex: 15" 
              value={taxaPlataforma} 
              onChange={(e) => setTaxaPlataforma(e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.resultPanel}>
          {!status ? (
            <div className={styles.emptyState}>
              <FiActivity size={40} color="#cbd5e1" />
              <p>Preencha os dados ao lado para revelar seu lucro real.</p>
            </div>
          ) : (
            <div className={styles.resultCard}>
              <div className={styles.financialSummary}>
                <div className={styles.summaryItem}>
                  <span>Lucro em Bolso:</span>
                  <strong style={{ color: status.cor }}>R$ {lucroReal.toFixed(2)}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Margem Real:</span>
                  <strong style={{ color: status.cor }}>{margemReal.toFixed(1)}%</strong>
                </div>
              </div>

              <div className={styles.alertBox} style={{ backgroundColor: `${status.cor}15`, border: `1px solid ${status.cor}` }}>
                <div className={styles.alertHeader} style={{ color: status.cor }}>
                  {status.icone}
                  <strong>{status.titulo}</strong>
                </div>
                <p>{status.mensagem}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 MÁGICA AQUI: O banner só aparece se o loading acabou E o usuário não for premium */}
      {!loading && !user?.is_premium && (
        <div className={styles.upsellBanner}>
          <div className={styles.upsellInfo}>
            <FiLock className={styles.upsellIcon} />
            <div>
              <h3>Pare de chutar preços. Tenha certeza matemática.</h3>
              <p>Assine o Premium e libere o Simulador Multi-Canais que diz o preço exato que você deve cobrar no Mercado Livre, Shopee e Instagram para ter lucro garantido.</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/login '} className={styles.upsellBtn}>
            Quero o Premium <FiArrowRight />
          </button>
        </div>
      )}

    </div>
  );
};

export default MachineComparator;