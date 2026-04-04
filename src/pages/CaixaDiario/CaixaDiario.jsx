import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart 
} from "recharts";
import styles from "./CaixaDiario.module.css";

const api = axios.create({
  baseURL: "/api/cash/",
  withCredentials: true,
});

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
      // 🔥 CORREÇÃO: Verifica se 'data' é realmente um array antes de salvar
      if (Array.isArray(data)) {
        setRegistros(data);
      } else {
        console.warn("A API não retornou uma lista válida:", data);
        setRegistros([]); // Força ser um array vazio se der erro
      }
    } catch (err) {
      console.error("Erro ao buscar registros:", err);
      setRegistros([]); // Zera a lista em caso de erro de rede
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

  const resumoMensal = useMemo(() => {
    // 🔥 CORREÇÃO: Trava de segurança. Se não for array, retorna array vazio e para por aqui.
    if (!Array.isArray(registros)) return [];

    const resumo = {};

    registros.forEach(reg => {
      // Prevenção extra caso o dado venha sem data
      if (!reg.data) return; 

      const [ano, mes] = reg.data.split('-'); 
      const chave = `${ano}-${mes}`;

      if (!resumo[chave]) {
        resumo[chave] = {
          mesAnoExibicao: `${NOME_MESES[Number(mes) - 1]} / ${ano}`,
          ordenacao: Number(`${ano}${mes}`), 
          vendas: 0,
          gastos: 0,
          lucro: 0
        };
      }

      const lucroDoDia = reg.lucro !== undefined ? reg.lucro : (reg.vendas_total - reg.gastos_total);

      resumo[chave].vendas += Number(reg.vendas_total) || 0;
      resumo[chave].gastos += Number(reg.gastos_total) || 0;
      resumo[chave].lucro += Number(lucroDoDia) || 0;
    });

    return Object.values(resumo).sort((a, b) => b.ordenacao - a.ordenacao);
  }, [registros]);

  const gerarTextoRelatorio = () => {
    let texto = "📊 *Resumo de Faturamento Mensal*\n\n";
    
    resumoMensal.forEach(mes => {
      texto += `📅 *${mes.mesAnoExibicao}*\n`;
      texto += `📈 Vendas: R$ ${mes.vendas.toFixed(2)}\n`;
      texto += `📉 Gastos: R$ ${mes.gastos.toFixed(2)}\n`;
      texto += `💰 Lucro: R$ ${mes.lucro.toFixed(2)}\n\n`;
    });
    
    texto += "Gerado pelo Sistema do Cotion ";
    return encodeURIComponent(texto); 
  };

  const compartilharWhatsApp = () => {
    const texto = gerarTextoRelatorio();
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  // 🔥 CORREÇÃO DEFINITIVA DO E-MAIL
  const compartilharEmail = () => {
    const texto = gerarTextoRelatorio();
    const assunto = encodeURIComponent("Relatório de Faturamento Mensal");
    const mailtoLink = `mailto:?subject=${assunto}&body=${texto}`;

    // Cria um elemento <a> invisível e força o clique nele
    const link = document.createElement("a");
    link.href = mailtoLink;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {resumoMensal.length > 0 && (
        <section className={styles.listCard} style={{ marginBottom: "2rem" }}>
          
          <div className={styles.headerMensal}>
            <h3>📅 Faturamento Mensal</h3>
            <div className={styles.botoesCompartilhar}>
              <button onClick={compartilharWhatsApp} className={`${styles.btnCompartilhar} ${styles.bgZap}`}>
                📱 Enviar via Whatsapp
              </button>
              <button onClick={compartilharEmail} className={`${styles.btnCompartilhar} ${styles.bgEmail}`}>
                ✉️ Enviar por E-mail
              </button>
            </div>
          </div>
          
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dadosGrafico} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis dataKey="mesAnoExibicao" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#38bdf8', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => `R$ ${value.toFixed(2)}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="vendas" name="Vendas" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.tabelaWrapper} style={{ marginTop: '2rem' }}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Vendas Totais</th>
                  <th>Gastos Totais</th>
                  <th>Lucro Líquido</th>
                </tr>
              </thead>
              <tbody>
                {resumoMensal.map(mes => {
                  const margem = mes.vendas > 0 ? (mes.lucro / mes.vendas) * 100 : 0;

                  return (
                    <tr key={mes.ordenacao}>
                      <td><strong>{mes.mesAnoExibicao}</strong></td>
                      <td>R$ {mes.vendas.toFixed(2)}</td>
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
    </div>
  );
};

export default CaixaDiario;