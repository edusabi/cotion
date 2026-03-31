// components/MachineComparator/MachineComparator.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FiDollarSign, FiTrendingUp, FiAlertCircle, FiSettings } from "react-icons/fi";
import styles from "./MachineComparator.module.css";

const MachineComparator = () => {
  const [machinesList, setMachinesList] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("credit");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(true);

  // Busca as maquininhas cadastradas pelo usuário ao abrir a tela
  useEffect(() => {
    const loadUserMachines = async () => {
      try {
        const response = await axios.get("https://cotion.discloud.app/machines", { 
          withCredentials: true 
        });
        setMachinesList(response.data);
      } catch (error) {
        console.error("Erro ao carregar taxas reais do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserMachines();
  }, []);

  // Função auxiliar para pegar a taxa correta baseada no número de parcelas
  const getRateForInstallment = (machine, installments) => {
    if (installments === 1) return parseFloat(machine.credit_1x || 0);
    if (installments === 2) return parseFloat(machine.credit_2x || 0);
    if (installments <= 6) return parseFloat(machine.credit_6x || 0);
    if (installments <= 10) return parseFloat(machine.credit_10x || 0);
    return parseFloat(machine.credit_12x || 0);
  };

  // Motor de Cálculo Relâmpago
  const results = useMemo(() => {
    const saleValue = parseFloat(amount);
    
    // Se não digitou valor válido ou não tem maquininhas, não calcula
    if (isNaN(saleValue) || saleValue <= 0 || machinesList.length === 0) return null;

    const calculations = machinesList.map((machine) => {
      let currentRate = 0;

      if (paymentType === "debit") {
        currentRate = parseFloat(machine.debit || 0);
      } else {
        currentRate = getRateForInstallment(machine, installments);
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

    // Ordena da mais lucrativa para a menos lucrativa
    const sortedCalculations = calculations.sort((a, b) => b.netValue - a.netValue);
    const bestMachine = sortedCalculations[0];
    const worstMachine = sortedCalculations[sortedCalculations.length - 1];
    
    // Se só tiver 1 maquininha cadastrada, a economia é 0 (não tem com quem comparar)
    const maxSavings = sortedCalculations.length > 1 
      ? bestMachine.netValue - worstMachine.netValue 
      : 0;

    return { list: sortedCalculations, bestMachine, worstMachine, maxSavings };
  }, [amount, paymentType, installments, machinesList]);

  if (loading) {
    return <div className={styles.container} style={{ textAlign: 'center' }}>Carregando suas taxas...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><FiDollarSign className={styles.titleIcon} /> Comparador Relâmpago</h2>
        <p>Descubra em qual maquininha você ganha mais dinheiro nessa venda.</p>
      </div>

      {/* AVISO SE NÃO TIVER MAQUININHA CADASTRADA */}
      {machinesList.length === 0 ? (
        <div className={styles.emptyState}>
          <FiSettings size={40} color="#38bdf8" style={{ marginBottom: '16px' }} />
          <h3>Nenhuma maquininha configurada</h3>
          <p>Para o comparador funcionar, você precisa cadastrar as taxas reais das suas maquininhas.</p>
          {/* Aqui você pode colocar um Link do react-router-dom apontando para a tela de configurações */}
        </div>
      ) : (
        <>
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
              
              {/* CARD DE ECONOMIA - SÓ MOSTRA SE TIVER MAIS DE UMA MAQUININHA */}
              {machinesList.length > 1 && results.maxSavings > 0 && (
                <div className={styles.savingsAlert}>
                  <div className={styles.savingsIcon}><FiTrendingUp /></div>
                  <div>
                    <p className={styles.savingsText}>
                      Se você passar essa venda na <strong>{results.bestMachine.name}</strong> ao invés da {results.worstMachine.name}, você coloca <strong className={styles.highlight}>R$ {results.maxSavings.toFixed(2)}</strong> a mais no bolso agora!
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.rankingList}>
                {results.list.map((item, index) => {
                  const isWinner = index === 0;
                  const isLoser = index === results.list.length - 1 && results.list.length > 1;

                  return (
                    <div key={item.id} className={`${styles.machineCard} ${isWinner ? styles.winnerCard : ''} ${isLoser ? styles.loserCard : ''}`}>
                      
                      <div className={styles.machineInfo}>
                        <div className={styles.machineBadge} style={{ backgroundColor: item.color || '#38bdf8' }}></div>
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

                      {isWinner && machinesList.length > 1 && <div className={styles.winnerTag}>🏆 Melhor Opção</div>}
                      {isLoser && <div className={styles.loserTag}><FiAlertCircle /> Pior Opção</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MachineComparator;