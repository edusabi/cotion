import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CaixaDiario.module.css";

const api = axios.create({
  baseURL: "http://localhost:3000/cash/",
  withCredentials: true,
});

const CaixaDiario = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para o formulário de NOVO registro (usando o nome novoRegistro)
  const [novoRegistro, setNovoRegistro] = useState({ 
    vendas: "", 
    gastos: "", 
    data: new Date().toISOString().split('T')[0] 
  });
  
  const [editandoId, setEditandoId] = useState(null);
  const [dadosEditados, setDadosEditados] = useState({ vendas: "", gastos: "" });

  useEffect(() => {
    buscarRegistros();
  }, []);

  const buscarRegistros = async () => {
    try {
      const { data } = await api.get("/");
      setRegistros(data);
    } catch (err) {
      console.error("Erro ao buscar registros:", err);
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DE SALVAR CORRIGIDA
  const salvarNovo = async (e) => {
    e.preventDefault();
    try {
      await api.post("/", {
        vendas_total: Number(novoRegistro.vendas),
        gastos_total: Number(novoRegistro.gastos),
        data_registro: novoRegistro.data 
      });
      
      // Limpa os campos após salvar
      setNovoRegistro({ 
        vendas: "", 
        gastos: "", 
        data: new Date().toISOString().split('T')[0] 
      });
      buscarRegistros(); // Nome correto da função
    } catch (err) { 
      alert("Erro ao salvar."); 
    }
  };

  const iniciarEdicao = (registro) => {
    setEditandoId(registro.id);
    setDadosEditados({
      vendas: registro.vendas_total,
      gastos: registro.gastos_total
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setDadosEditados({ vendas: "", gastos: "" });
  };

  const salvarEdicao = async (id) => {
    try {
      await api.put(`/${id}`, {
        vendas_total: Number(dadosEditados.vendas),
        gastos_total: Number(dadosEditados.gastos)
      });
      setEditandoId(null);
      buscarRegistros();
    } catch (err) {
      alert("Erro ao salvar edição.");
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro de caixa?")) return;
    try {
      await api.delete(`/${id}`);
      setRegistros(registros.filter(r => r.id !== id));
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  if (loading) return <div className={styles.loading}>Carregando caixa...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.formCard}>
        <h2>💸 Caixa Diário</h2>
        <p className={styles.subtitle}>Registre o movimento de hoje para ver seu lucro real</p>
        
        <form onSubmit={salvarNovo} className={styles.formInline}>
          <input 
            type="date" 
            className={styles.inputField} 
            value={novoRegistro.data} 
            onChange={e => setNovoRegistro({...novoRegistro, data: e.target.value})} 
          />
          <input 
            type="number" 
            className={styles.inputField} 
            placeholder="Vendas R$" 
            value={novoRegistro.vendas} 
            onChange={e => setNovoRegistro({...novoRegistro, vendas: e.target.value})} 
          />
          <input 
            type="number" 
            className={styles.inputField} 
            placeholder="Gastos R$" 
            value={novoRegistro.gastos} 
            onChange={e => setNovoRegistro({...novoRegistro, gastos: e.target.value})} 
          />
          <button type="submit" className={styles.btnPrincipal}>
            Salvar Dia
          </button>
        </form>
      </section>

      <section className={styles.listCard}>
        <h3>📊 Histórico de Fechamentos</h3>
        <div className={styles.tabelaWrapper}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Vendas</th>
                <th>Gastos</th>
                <th>Lucro Líquido</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(reg => {
                const ehEdicao = editandoId === reg.id;
                const margem = reg.vendas_total > 0 ? (reg.lucro / reg.vendas_total) * 100 : 0;
                
                return (
                  <tr key={reg.id} className={ehEdicao ? styles.linhaEditando : ''}>
                    {/* Formatação de data sem fuso horário para evitar o erro de "1 dia antes" */}
                    <td>{reg.data.split('-').reverse().join('/')}</td>
                    
                    <td>
                      {ehEdicao ? (
                        <input 
                          type="number" 
                          value={dadosEditados.vendas} 
                          onChange={(e) => setDadosEditados({...dadosEditados, vendas: e.target.value})}
                          className={styles.inputEdicao}
                        />
                      ) : (
                        `R$ ${reg.vendas_total.toFixed(2)}`
                      )}
                    </td>

                    <td>
                      {ehEdicao ? (
                        <input 
                          type="number" 
                          value={dadosEditados.gastos} 
                          onChange={(e) => setDadosEditados({...dadosEditados, gastos: e.target.value})}
                          className={styles.inputEdicao}
                        />
                      ) : (
                        `R$ ${reg.gastos_total.toFixed(2)}`
                      )}
                    </td>

                    <td className={reg.lucro < 0 ? styles.lucroNegativo : styles.lucroPositivo}>
                      <strong>R$ {reg.lucro.toFixed(2)}</strong>
                      <span className={styles.margemTag}>({margem.toFixed(0)}%)</span>
                    </td>

                    <td className={styles.acoes}>
                      {ehEdicao ? (
                        <>
                          <button onClick={() => salvarEdicao(reg.id)} className={styles.btnSalvar}>💾</button>
                          <button onClick={cancelarEdicao} className={styles.btnCancelar}>✖️</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => iniciarEdicao(reg)} title="Editar" className={styles.btnIcon}>✏️</button>
                          <button onClick={() => handleExcluir(reg.id)} title="Excluir" className={styles.btnIcon}>🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {registros.length === 0 && (
            <p className={styles.vazio}>Nenhum fechamento registrado ainda. Comece acima!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CaixaDiario;