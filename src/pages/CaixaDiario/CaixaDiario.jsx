import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./CaixaDiario.module.css";

const api = axios.create({
  baseURL: "https://cotion.discloud.app/cash/",
  withCredentials: true,
});

// Nomes dos meses para deixar bonito (Ex: 04 vira "Abril")
const NOME_MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CaixaDiario = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const salvarNovo = async (e) => {
    e.preventDefault();
    try {
      await api.post("/", {
        vendas_total: Number(novoRegistro.vendas),
        gastos_total: Number(novoRegistro.gastos),
        data_registro: novoRegistro.data 
      });
      
      setNovoRegistro({ 
        vendas: "", 
        gastos: "", 
        data: new Date().toISOString().split('T')[0] 
      });
      buscarRegistros(); 
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

  // 🔥 LÓGICA DO GRÁFICO / RESUMO MENSAL
  const resumoMensal = useMemo(() => {
    const resumo = {};

    registros.forEach(reg => {
      // Pega "YYYY-MM" do formato "YYYY-MM-DD"
      const [ano, mes] = reg.data.split('-'); 
      const chave = `${ano}-${mes}`;

      if (!resumo[chave]) {
        resumo[chave] = {
          mesAnoExibicao: `${NOME_MESES[Number(mes) - 1]} / ${ano}`,
          ordenacao: Number(`${ano}${mes}`), // Para ordenar fácil
          vendas: 0,
          gastos: 0,
          lucro: 0
        };
      }

      // Calcula o lucro caso não venha calculado (Vendas - Gastos)
      const lucroDoDia = reg.lucro !== undefined ? reg.lucro : (reg.vendas_total - reg.gastos_total);

      resumo[chave].vendas += Number(reg.vendas_total);
      resumo[chave].gastos += Number(reg.gastos_total);
      resumo[chave].lucro += Number(lucroDoDia);
    });

    // Transforma objeto em array e ordena do mais recente para o mais antigo
    return Object.values(resumo).sort((a, b) => b.ordenacao - a.ordenacao);
  }, [registros]);

  // Pegar o maior mês de vendas para criar a barrinha visual de gráfico
  const maxVendasMensal = resumoMensal.length > 0 ? Math.max(...resumoMensal.map(m => m.vendas)) : 1;

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
            required
          />
          <input 
            type="number" 
            className={styles.inputField} 
            placeholder="Gastos R$" 
            value={novoRegistro.gastos} 
            onChange={e => setNovoRegistro({...novoRegistro, gastos: e.target.value})} 
            required
          />
          <button type="submit" className={styles.btnPrincipal}>
            Salvar Dia
          </button>
        </form>
      </section>

      {/* 🔥 NOVA SEÇÃO: GRÁFICO EM TABELA MENSAL */}
      {resumoMensal.length > 0 && (
        <section className={styles.listCard} style={{ marginBottom: "2rem" }}>
          <h3>📅 Faturamento Mensal</h3>
          <div className={styles.tabelaWrapper}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Vendas Totais</th>
                  <th style={{ width: "25%" }}>Gráfico (Vendas)</th>
                  <th>Gastos Totais</th>
                  <th>Lucro Líquido</th>
                </tr>
              </thead>
              <tbody>
                {resumoMensal.map(mes => {
                  const margem = mes.vendas > 0 ? (mes.lucro / mes.vendas) * 100 : 0;
                  const tamanhoBarra = (mes.vendas / maxVendasMensal) * 100; // Porcentagem pro gráfico

                  return (
                    <tr key={mes.ordenacao}>
                      <td><strong>{mes.mesAnoExibicao}</strong></td>
                      <td>R$ {mes.vendas.toFixed(2)}</td>
                      
                      {/* CÉLULA DO GRÁFICO VISUAL */}
                      <td>
                        <div className={styles.graficoFundo}>
                          <div 
                            className={styles.graficoBarra} 
                            style={{ width: `${tamanhoBarra}%` }}
                          ></div>
                        </div>
                      </td>

                      <td style={{ color: '#ef4444' }}>R$ {mes.gastos.toFixed(2)}</td>
                      <td className={mes.lucro < 0 ? styles.lucroNegativo : styles.lucroPositivo}>
                        <strong>R$ {mes.lucro.toFixed(2)}</strong>
                        <span className={styles.margemTag}> ({margem.toFixed(0)}%)</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SEÇÃO HISTÓRICO DIÁRIO */}
      <section className={styles.listCard}>
        <h3>📊 Histórico de Fechamentos (Diário)</h3>
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
                const lucroCalc = reg.lucro !== undefined ? reg.lucro : (reg.vendas_total - reg.gastos_total);
                const margem = reg.vendas_total > 0 ? (lucroCalc / reg.vendas_total) * 100 : 0;
                
                return (
                  <tr key={reg.id} className={ehEdicao ? styles.linhaEditando : ''}>
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

                    <td className={lucroCalc < 0 ? styles.lucroNegativo : styles.lucroPositivo}>
                      <strong>R$ {lucroCalc.toFixed(2)}</strong>
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