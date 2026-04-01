import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FiDollarSign, FiTrendingUp, FiAlertCircle, FiSettings, FiX } from "react-icons/fi";
import styles from "./MachineComparator.module.css";
import modalStyles from "./MinhasTaxas.module.css"; // Importando os estilos do modal

const MachineComparator = () => {
  const [machinesList, setMachinesList] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("credit");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do Modal

  // Estado para o formulário dentro do modal
  const [formData, setFormData] = useState({
    name: "", color: "#38bdf8", debit: "", credit_1x: "", credit_2x: "", credit_6x: "", credit_10x: "", credit_12x: ""
  });

  const fetchMachines = async () => {
    try {
      const response = await axios.get("https://cotion.discloud.app/machines", { withCredentials: true });
      setMachinesList(response.data);
    } catch (error) {
      console.error("Erro ao carregar taxas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Lógica do Modal
  const handleSubmitTaxas = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://cotion.discloud.app/machines", formData, { withCredentials: true });
      setFormData({ name: "", color: "#38bdf8", debit: "", credit_1x: "", credit_2x: "", credit_6x: "", credit_10x: "", credit_12x: "" });
      fetchMachines();
    } catch (err) {
      console.error("Erro ao salvar", err);
    }
  };

  const handleDeleteMachine = async (id) => {
    try {
      await axios.delete(`https://cotion.discloud.app/machines/${id}`, { withCredentials: true });
      fetchMachines();
    } catch (err) {
      console.error("Erro ao deletar", err);
    }
  };

  const getRateForInstallment = (machine, installments) => {
    if (installments === 1) return parseFloat(machine.credit_1x || 0);
    if (installments === 2) return parseFloat(machine.credit_2x || 0);
    if (installments <= 6) return parseFloat(machine.credit_6x || 0);
    if (installments <= 10) return parseFloat(machine.credit_10x || 0);
    return parseFloat(machine.credit_12x || 0);
  };

  const results = useMemo(() => {
    const saleValue = parseFloat(amount);
    if (isNaN(saleValue) || saleValue <= 0 || machinesList.length === 0) return null;

    const calculations = machinesList.map((machine) => {
      let currentRate = paymentType === "debit" 
        ? parseFloat(machine.debit || 0) 
        : getRateForInstallment(machine, installments);

      const feeValue = saleValue * (currentRate / 100);
      const netValue = saleValue - feeValue;

      return { ...machine, rateApplied: currentRate, feeValue, netValue };
    });

    const sortedCalculations = calculations.sort((a, b) => b.netValue - a.netValue);
    const bestMachine = sortedCalculations[0];
    const worstMachine = sortedCalculations[sortedCalculations.length - 1];
    const maxSavings = sortedCalculations.length > 1 ? bestMachine.netValue - worstMachine.netValue : 0;

    return { list: sortedCalculations, bestMachine, worstMachine, maxSavings };
  }, [amount, paymentType, installments, machinesList]);

  if (loading) return <div className={styles.container}>Carregando sistema...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2><FiDollarSign className={styles.titleIcon} /> Comparador Relâmpago</h2>
          <button className={styles.configBtn} onClick={() => setIsModalOpen(true)} title="Configurar Taxas">
            <FiSettings />
          </button>
        </div>
        <p>Descubra em qual maquininha você ganha mais dinheiro.</p>
      </div>

      {/* MODAL DE CONFIGURAÇÕES */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={modalStyles.container + " " + styles.modalContent}>
            <button className={styles.closeModal} onClick={() => setIsModalOpen(false)}>
              <FiX />
            </button>
            <div className={modalStyles.header}>
              <h2>Configurar Maquininhas</h2>
              <p>Ajuste as taxas do seu contrato.</p>
            </div>

            <div className={modalStyles.formSection}>
              <form onSubmit={handleSubmitTaxas} className={modalStyles.form}>
                <div className={modalStyles.mainInputs}>
                  <div className={modalStyles.inputGroup}>
                    <label>Nome da Maquininha</label>
                    <input type="text" placeholder="Stone, Ton..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className={modalStyles.inputGroup}>
                    <label>Cor</label>
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                </div>
                <div className={modalStyles.ratesGrid}>
                  <div className={modalStyles.inputGroup}><label>Débito</label><input type="number" step="0.01" value={formData.debit} onChange={e => setFormData({...formData, debit: e.target.value})} required /></div>
                  <div className={modalStyles.inputGroup}><label>1x</label><input type="number" step="0.01" value={formData.credit_1x} onChange={e => setFormData({...formData, credit_1x: e.target.value})} required /></div>
                  <div className={modalStyles.inputGroup}><label>10x</label><input type="number" step="0.01" value={formData.credit_10x} onChange={e => setFormData({...formData, credit_10x: e.target.value})} required /></div>
                </div>
                <button type="submit" className={modalStyles.button}>Salvar Taxas</button>
              </form>
            </div>

            <div className={modalStyles.listSection}>
              <h3>Cadastradas</h3>
              <div className={modalStyles.machinesList}>
                {machinesList.map(m => (
                  <div key={m.id} className={modalStyles.machineCard}>
                    <div className={modalStyles.machineInfo}>
                      <div className={modalStyles.machineBadge} style={{ backgroundColor: m.color }}></div>
                      <span>{m.name}</span>
                    </div>
                    <button onClick={() => handleDeleteMachine(m.id)} className={modalStyles.deleteBtn}>Remover</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DO COMPARADOR */}
      {machinesList.length === 0 ? (
        <div className={styles.emptyState}>
          <FiSettings size={40} color="#38bdf8" />
          <h3>Nenhuma maquininha configurada</h3>
          <p>Clique na engrenagem acima para configurar suas taxas.</p>
        </div>
      ) : (
        <>
          <div className={styles.calculatorPanel}>
            <div className={styles.inputGroup}>
              <label>Valor da Venda (R$)</label>
              <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className={styles.controlsRow}>
              <div className={styles.inputGroup}>
                <label>Pagamento</label>
                <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                </select>
              </div>
              {paymentType === "credit" && (
                <div className={styles.inputGroup}>
                  <label>Parcelas</label>
                  <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {results && (
            <div className={styles.resultsArea}>
              {results.maxSavings > 0 && (
                <div className={styles.savingsAlert}>
                  <FiTrendingUp className={styles.savingsIcon} />
                  <p className={styles.savingsText}>
                    Use <strong>{results.bestMachine.name}</strong> e ganhe <strong>R$ {results.maxSavings.toFixed(2)}</strong> a mais!
                  </p>
                </div>
              )}
              <div className={styles.rankingList}>
                {results.list.map((item, index) => (
                  <div key={item.id} className={`${styles.machineCard} ${index === 0 ? styles.winnerCard : ''}`}>
                    <div className={styles.machineInfo}>
                      <div className={styles.machineBadge} style={{ backgroundColor: item.color }}></div>
                      <div>
                        <h4>{item.name}</h4>
                        <span className={styles.rateUsed}>{item.rateApplied.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className={styles.machineValues}>
                      <div className={styles.netAmount}>
                        <span>Recebe:</span>
                        <strong>R$ {item.netValue.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MachineComparator;