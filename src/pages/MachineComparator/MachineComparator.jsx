// components/MachineComparator/MachineComparator.jsx
import React, { useState, useMemo } from "react";
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import styles from "./MachineComparator.module.css";

// 🏦 TABELA DE TAXAS (Você pode editar isso depois ou puxar do banco de dados)
// Valores simulados para recebimento na hora/1 dia útil.
const MACHINES = [
  {
    id: "ton",
    name: "Ton (MegaTon)",
    color: "#00d700",
    rates: { debit: 1.69, credit1x: 3.49, credit2x: 4.99, credit6x: 9.99, credit10x: 13.99, credit12x: 15.99 }
  },
  {
    id: "infinitepay",
    name: "InfinitePay",
    color: "#202020",
    rates: { debit: 1.38, credit1x: 3.16, credit2x: 4.19, credit6x: 7.49, credit10x: 11.20, credit12x: 12.41 }
  },
  {
    id: "stone",
    name: "Stone",
    color: "#00b55e",
    rates: { debit: 1.99, credit1x: 4.98, credit2x: 6.50, credit6x: 12.40, credit10x: 18.50, credit12x: 21.60 }
  },
  {
    id: "pagbank",
    name: "PagBank",
    color: "#ffc800",
    rates: { debit: 1.99, credit1x: 4.99, credit2x: 6.99, credit6x: 13.99, credit10x: 19.99, credit12x: 22.59 }
  }
];

// Função auxiliar para interpolar taxas (ex: se não tem 3x, pega uma média entre 2x e 6x para simulação)
// Em um cenário real perfeito, você cadastraria a taxa exata de 1 a 12.
const getRateForInstallment = (rates, installments) => {
  if (installments === 1) return rates.credit1x;
  if (installments === 2) return rates.credit2x;
  if (installments <= 6) return rates.credit6x; // Simplificação para o exemplo
  if (installments <= 10) return rates.credit10x;
  return rates.credit12x;
};

const MachineComparator = () => {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("credit"); // 'debit' ou 'credit'
  const [installments, setInstallments] = useState(1);

  // O useMemo faz o cálculo relâmpago toda vez que o lojista digita um número
  const results = useMemo(() => {
    const saleValue = parseFloat(amount);
    if (isNaN(saleValue) || saleValue <= 0) return null;

    const calculations = MACHINES.map((machine) => {
      let currentRate = 0;

      if (paymentType === "debit") {
        currentRate = machine.rates.debit;
      } else {
        currentRate = getRateForInstallment(machine.rates, installments);
      }

      const feeValue = saleValue * (currentRate / 100);
      const netValue = saleValue - feeValue;

      return {
        ...machine,
        rateApplied: currentRate,
        feeValue,
        netValue
      };
    });

    // Ordena da mais lucrativa (maior netValue) para a menos lucrativa
    const sortedCalculations = calculations.sort((a, b) => b.netValue - a.netValue);
    
    // Calcula o "Fator Venda" (quanto ele economiza usando a melhor vs a pior)
    const bestMachine = sortedCalculations[0];
    const worstMachine = sortedCalculations[sortedCalculations.length - 1];
    const maxSavings = bestMachine.netValue - worstMachine.netValue;

    return { list: sortedCalculations, bestMachine, worstMachine, maxSavings };
  }, [amount, paymentType, installments]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><FiDollarSign className={styles.titleIcon} /> Comparador Relâmpago</h2>
        <p>Descubra em qual maquininha você ganha mais dinheiro nessa venda.</p>
      </div>

      <div className={styles.calculatorPanel}>
        <div className={styles.inputGroup}>
          <label>Valor da Venda (R$)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Ex: 500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.inputGroup}>
            <label>Forma de Pagamento</label>
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
            </select>
          </div>

          {paymentType === "credit" && (
            <div className={styles.inputGroup}>
              <label>Parcelas</label>
              <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>{num}x</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className={styles.resultsArea}>
          {/* CARD DE ECONOMIA - O GATILHO MENTAL */}
          <div className={styles.savingsAlert}>
            <div className={styles.savingsIcon}><FiTrendingUp /></div>
            <div>
              <p className={styles.savingsText}>
                Se você passar essa venda na <strong>{results.bestMachine.name}</strong> ao invés da {results.worstMachine.name}, você coloca <strong className={styles.highlight}>R$ {results.maxSavings.toFixed(2)}</strong> a mais no bolso agora!
              </p>
            </div>
          </div>

          <div className={styles.rankingList}>
            {results.list.map((item, index) => {
              const isWinner = index === 0;
              const isLoser = index === results.list.length - 1;

              return (
                <div key={item.id} className={`${styles.machineCard} ${isWinner ? styles.winnerCard : ''} ${isLoser ? styles.loserCard : ''}`}>
                  
                  <div className={styles.machineInfo}>
                    <div className={styles.machineBadge} style={{ backgroundColor: item.color }}></div>
                    <div>
                      <h4 className={styles.machineName}>{item.name}</h4>
                      <span className={styles.rateUsed}>Taxa: {item.rateApplied.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className={styles.machineValues}>
                    <div className={styles.feeDiscount}>
                      <span>Taxa:</span>
                      <span className={styles.negativeValue}>- R$ {item.feeValue.toFixed(2)}</span>
                    </div>
                    <div className={styles.netAmount}>
                      <span>Você recebe:</span>
                      <strong className={isWinner ? styles.textGreen : ''}>
                        R$ {item.netValue.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {isWinner && <div className={styles.winnerTag}>🏆 Melhor Opção</div>}
                  {isLoser && <div className={styles.loserTag}><FiAlertCircle /> Pior Opção</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineComparator;