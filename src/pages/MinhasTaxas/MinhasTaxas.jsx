// components/MachineSettings/MachineSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./MinhasTaxas.module.css";

const MinhasTaxas = () => {
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    name: "", color: "#38bdf8", debit: "", credit_1x: "", credit_2x: "", credit_6x: "", credit_10x: "", credit_12x: ""
  });

  const fetchMachines = async () => {
    try {
      const res = await axios.get("https://cotion.discloud.app/machines", { withCredentials: true });
      setMachines(res.data);
    } catch (err) {
      console.error("Erro ao buscar maquininhas", err);
    }
  };

  useEffect(() => { fetchMachines(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://cotion.discloud.app/machines", formData, { withCredentials: true });
      setFormData({ name: "", color: "#38bdf8", debit: "", credit_1x: "", credit_2x: "", credit_6x: "", credit_10x: "", credit_12x: "" });
      fetchMachines();
    } catch (err) {
      console.error("Erro ao salvar", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://cotion.discloud.app/machines/${id}`, { withCredentials: true });
      fetchMachines();
    } catch (err) {
      console.error("Erro ao deletar", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Configurar Maquininhas</h2>
        <p>Cadastre as taxas reais do seu contrato para cálculos precisos.</p>
      </div>

      <div className={styles.formSection}>
        <h3>Nova Maquininha</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.mainInputs}>
            <div className={styles.inputGroup}>
              <label>Nome (Ex: Stone, PagBank)</label>
              <input type="text" placeholder="Nome da Maquininha" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Cor de Identificação</label>
              <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
            </div>
          </div>

          <div className={styles.ratesGrid}>
            <div className={styles.inputGroup}>
              <label>Débito (%)</label>
              <input type="number" step="0.01" placeholder="Ex: 1.99" value={formData.debit} onChange={e => setFormData({...formData, debit: e.target.value})} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Crédito à Vista (%)</label>
              <input type="number" step="0.01" placeholder="Ex: 4.99" value={formData.credit_1x} onChange={e => setFormData({...formData, credit_1x: e.target.value})} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Crédito 2x (%)</label>
              <input type="number" step="0.01" placeholder="Ex: 6.50" value={formData.credit_2x} onChange={e => setFormData({...formData, credit_2x: e.target.value})} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Crédito 6x (%)</label>
              <input type="number" step="0.01" placeholder="Ex: 12.40" value={formData.credit_6x} onChange={e => setFormData({...formData, credit_6x: e.target.value})} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Crédito 10x (%)</label>
              <input type="number" step="0.01" placeholder="Ex: 18.50" value={formData.credit_10x} onChange={e => setFormData({...formData, credit_10x: e.target.value})} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Crédito 12x (%)</label>
              <input type="number" step="0.01" placeholder="Ex: 21.60" value={formData.credit_12x} onChange={e => setFormData({...formData, credit_12x: e.target.value})} required />
            </div>
          </div>

          <button type="submit" className={styles.button}>Salvar Taxas</button>
        </form>
      </div>

      <div className={styles.listSection}>
        <h3>Maquininhas Cadastradas</h3>
        {machines.length === 0 ? (
          <p style={{ color: 'rgba(226, 232, 240, 0.6)' }}>Você ainda não cadastrou nenhuma maquininha.</p>
        ) : (
          <div className={styles.machinesList}>
            {machines.map(m => (
              <div key={m.id} className={styles.machineCard}>
                <div className={styles.machineInfo}>
                  <div className={styles.machineBadge} style={{ backgroundColor: m.color || '#38bdf8' }}></div>
                  <div className={styles.machineDetails}>
                    <h4>{m.name}</h4>
                    <div className={styles.machineRatesSummary}>
                      <span>Débito: {m.debit}%</span>
                      <span>1x: {m.credit_1x}%</span>
                      <span>12x: {m.credit_12x}%</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(m.id)} className={styles.deleteBtn}>Excluir</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasTaxas;