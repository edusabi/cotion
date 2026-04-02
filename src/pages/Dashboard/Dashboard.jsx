import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import styles from "./Dashboard.module.css";
import { FiStar, FiAlertCircle, FiTrash2, FiPrinter, FiFileText, FiLink, FiMessageCircle } from "react-icons/fi";

const API_URL = "https://cotion.discloud.app"; 

const Dashboard = () => {
  const [produtos, setProdutos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [produtoAtual, setProdutoAtual] = useState({
    id: null,
    foto: "",
    nome: "",
    custo_raw: 0,
    frete_raw: 0,
    taxas: "",
    margem: ""
  });

  const [produtoMultiCanal, setProdutoMultiCanal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, prodRes] = await Promise.all([
        axios.get(`${API_URL}/me`, { withCredentials: true }),
        axios.get(`${API_URL}/products`, { withCredentials: true })
      ]);
      
      setUser(userRes.data);
      setProdutos(prodRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar seu acesso Premium? Você perderá o acesso às ferramentas exclusivas imediatamente."
    );
    
    if (confirmar) {
      try {
        await axios.post(`${API_URL}/api/cancel_subscription`, {}, { withCredentials: true });
        alert("Assinatura cancelada com sucesso.");
        window.location.reload();
      } catch (err) {
        alert("Erro ao processar cancelamento. Tente novamente.");
      }
    }
  };

  // 🔥 NOVA FUNÇÃO: Gerar Link da Vitrine Pública
  const gerarLinkVitrine = async () => {
    try {
      if (!user?.id) return alert("Erro ao carregar usuário");

      let slug = user.slug;

      // 🔥 cria se não existir
      if (!slug) {
        const res = await axios.post(`${API_URL}/api/create-slug`, {
          userId: user.id,
          nome: user.name || "minhaloja"
        });

        slug = res.data.slug;

        // atualiza estado
        setUser(prev => ({ ...prev, slug }));
      }

      const zap = prompt("Digite seu WhatsApp com DDD:");
      if (!zap) return;

      const numero = zap.replace(/\D/g, "");

      const link = `${window.location.origin}/vitrine/${slug}?w=55${numero}`;

      navigator.clipboard.writeText(link);

      alert("✅ Link copiado:\n\n" + link);

    } catch (err) {
      console.error(err);
      alert("Erro ao gerar link");
    }
  };

  // 🔥 NOVA FUNÇÃO: Enviar Orçamento Rápido via WhatsApp
  const enviarParaWhatsApp = (prod) => {
    const calc = calcularResultados(prod);
    const valorSugerido = calc.precoIdeal;

    if (!valorSugerido || valorSugerido <= 0) {
      alert("⚠️ Calcule as taxas e margem deste produto antes de enviar o orçamento.");
      return;
    }

    const mensagem = `Olá! Tudo bem? 🤝\n\nSegue o orçamento para o item: *${prod.nome}*\n\n💰 *Valor de Investimento:* R$ ${valorSugerido.toFixed(2).replace('.', ',')}\n💳 Aceitamos Pix, Dinheiro e Cartões.\n\nQualquer dúvida, estou à disposição para fecharmos!\n\n_Orçamento gerado via Cotion_`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  const formatarParaMoeda = (valorNumerico) => {
    if (!valorNumerico) return "";
    return (valorNumerico / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  const lidarComMudancaMoeda = (e, campo) => {
    const apenasNumeros = e.target.value.replace(/\D/g, "");
    setProdutoAtual({ ...produtoAtual, [campo]: Number(apenasNumeros) });
  };

  const calcularResultados = (prod) => {
    const custo = prod.custo_raw / 100;
    const frete = prod.frete_raw / 100;
    const taxas = Number(prod.taxas) || 0;
    const margem = Number(prod.margem) || 0;
    
    if (taxas + margem >= 100 || (custo === 0 && frete === 0)) {
      return { precoIdeal: 0, lucroReal: 0 };
    }

    const divisor = 1 - ((taxas + margem) / 100);
    const precoIdeal = (custo + frete) / divisor;
    const lucroReal = precoIdeal * (margem / 100);

    return { precoIdeal, lucroReal };
  };

  const CANAIS_MARKETPLACE = [
    { nome: "Mercado Livre (Clássico)", taxaPerc: 13.0, taxaFixa: 6.00, isML: true },
    { nome: "Mercado Livre (Premium)", taxaPerc: 18.0, taxaFixa: 6.00, isML: true },
    { nome: "Shopee (Frete Extra)", taxaPerc: 20.0, taxaFixa: 4.00, isShopee: true },
    { nome: "Shopee (Padrão)", taxaPerc: 14.0, taxaFixa: 4.00, isShopee: true },
    { nome: "Amazon (Individual)", taxaPerc: 15.0, taxaFixa: 2.00, isML: false },
  ];

  const calcularPrecoCanal = (prod, canal) => {
    const custo = prod.custo_raw / 100;
    const frete = prod.frete_raw / 100;
    const margem = Number(prod.margem) || 0;
    
    let divisor = 1 - ((canal.taxaPerc + margem) / 100);
    if (divisor <= 0) return { precoIdeal: 0, lucroReal: 0 }; 

    let precoIdeal = (custo + frete + canal.taxaFixa) / divisor;

    if (canal.isML && precoIdeal >= 79) {
      const freteObrigatorioML = 21.45; 
      precoIdeal = (custo + frete + freteObrigatorioML) / divisor;
    }

    if (canal.isShopee) {
      let comissaoCalculada = precoIdeal * (canal.taxaPerc / 100);
      if (comissaoCalculada > 100) {
        precoIdeal = (custo + frete + 104.00) / (1 - (margem / 100));
      }
    }

    const lucroReal = precoIdeal * (margem / 100);
    return { precoIdeal, lucroReal };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdutoAtual({ ...produtoAtual, foto: reader.result });
      };
      reader.readAsDataURL(file); 
    }
  };

  const limparFormulario = () => {
    setProdutoAtual({ id: null, foto: "", nome: "", custo_raw: 0, frete_raw: 0, taxas: "", margem: "" });
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    if (!produtoAtual.nome) return alert("Dê um nome ao produto!");

    try {
      const method = produtoAtual.id ? "put" : "post";
      const url = produtoAtual.id ? `${API_URL}/products/${produtoAtual.id}` : `${API_URL}/products`;

      await axios[method](url, produtoAtual, { withCredentials: true });
      
      await fetchData(); 
      limparFormulario();
    } catch (error) {
      alert("Ocorreu um erro ao salvar o produto.");
    }
  };

  const excluirProduto = async (id) => {
    if(!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, { withCredentials: true });
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const exportarExcel = () => {
    if (produtos.length === 0) return alert("Adicione produtos primeiro.");

    const dados = produtos.map(p => {
      const calc = calcularResultados(p);
      const linhaTabela = {
        "Nome do Produto": p.nome,
        "Custo Base (R$)": (p.custo_raw + p.frete_raw) / 100,
        "Meta Margem (%)": Number(p.margem),
        "Preço Sugerido Padrão (R$)": calc.precoIdeal,
      };

      CANAIS_MARKETPLACE.forEach(canal => {
        const calculoCanal = calcularPrecoCanal(p, canal);
        linhaTabela[`Preço ${canal.nome} (R$)`] = calculoCanal.precoIdeal;
      });

      return linhaTabela;
    });

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const colWidths = [{wch: 40}, {wch: 15}, {wch: 15}, {wch: 25}, {wch: 25}, {wch: 25}, {wch: 25}, {wch: 25}];
    worksheet['!cols'] = colWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Precificação Multi-Canal");
    XLSX.writeFile(workbook, "relatorio_multicanal.xlsx");
  };

  // 🔥 NOVA FUNÇÃO: Gerar PDF direto (Substitui o window.print falho)
  const exportarPDF = () => {
    if (produtos.length === 0) return alert("Adicione produtos primeiro.");

    const doc = new jsPDF("landscape"); 

    doc.text("Relatório de Precificação Multi-Canal", 14, 15);

    const tableColumn = ["Produto", "Custo Base", "Preço Padrão", ...CANAIS_MARKETPLACE.map(c => c.nome)];
    const tableRows = [];

    produtos.forEach(prod => {
      const calcPadrao = calcularResultados(prod);
      
      const rowData = [
        prod.nome,
        `R$ ${((prod.custo_raw + prod.frete_raw) / 100).toFixed(2)}`,
        `R$ ${calcPadrao.precoIdeal.toFixed(2)}`
      ];

      CANAIS_MARKETPLACE.forEach(canal => {
        const calcCanal = calcularPrecoCanal(prod, canal);
        rowData.push(`R$ ${calcCanal.precoIdeal.toFixed(2)}`);
      });

      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 }, 
      headStyles: { fillColor: [41, 128, 185] } 
    });

    doc.save("relatorio_multicanal.pdf");
  };

  if (loading) return <div className={styles.container}>Carregando sistema...</div>;

  return (
    <div className={styles.container}>
      <section className={`${styles.subscriptionCard} ${styles.noPrint}`}>
        <div className={styles.subInfo}>
          <div className={styles.subHeader}>
            <FiStar className={user?.is_premium ? styles.iconGold : ""} />
            <h3>Status da Conta: {user?.is_premium ? "Premium" : "Gratuito"}</h3>
          </div>
          {user?.is_premium ? (
            <p>Seu acesso premium está ativo e garante todas as funcionalidades liberadas.</p>
          ) : (
            <p>Você está usando a versão limitada. Assine para liberar relatórios e multi-canais.</p>
          )}
        </div>
        
        <div className={styles.subActions}>
          {user?.is_premium ? (
            <button onClick={handleCancelSubscription} className={styles.btnCancelSub}>
              Cancelar Assinatura
            </button>
          ) : (
            <button onClick={() => window.location.href = '/'} className={styles.btnUpgrade}>
              Seja Premium
            </button>
          )}
        </div>
      </section>

      <header className={`${styles.header} ${styles.noPrint}`}>
        <h1>🥇 Sistema de Precificação</h1>
        <p>Cadastre seus produtos, calcule margens e exporte seus relatórios.</p>
        
        <div className={styles.acoesTop}>
          <button onClick={gerarLinkVitrine} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLink /> Criar Minha Vitrine
          </button>
          
          <button onClick={exportarExcel} className={styles.btnSecundario} disabled={produtos.length === 0}>
            <FiFileText /> Baixar Excel
          </button>
          {/* 🔥 BOTÃO PDF ATUALIZADO AQUI */}
          <button onClick={exportarPDF} className={styles.btnSecundario} disabled={produtos.length === 0}>
            <FiPrinter /> Salvar PDF
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>{produtoAtual.id ? "✏️ Editar Produto" : "➕ Novo Produto"}</h2>
          <form onSubmit={salvarProduto}>
            <div className={styles.fotoUpload}>
              <label htmlFor="fotoInput" className={styles.fotoLabel}>
                {produtoAtual.foto ? (
                  <img src={produtoAtual.foto} alt="Preview" className={styles.fotoPreview} />
                ) : (
                  <span>📷 Clique para adicionar foto</span>
                )}
              </label>
              <input id="fotoInput" type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </div>

            <div className={styles.inputGroup}>
              <label>Nome do Produto</label>
              <input type="text" value={produtoAtual.nome} onChange={(e) => setProdutoAtual({...produtoAtual, nome: e.target.value})} placeholder="Ex: Tênis Esportivo" />
            </div>

            <div className={styles.inputGroup}>
              <label>Custo do Produto (R$)</label>
              <input type="text" value={formatarParaMoeda(produtoAtual.custo_raw)} onChange={(e) => lidarComMudancaMoeda(e, "custo_raw")} placeholder="0,00" />
            </div>

            <div className={styles.inputGroup}>
              <label>Frete / Embalagem Padrão (R$)</label>
              <input type="text" value={formatarParaMoeda(produtoAtual.frete_raw)} onChange={(e) => lidarComMudancaMoeda(e, "frete_raw")} placeholder="0,00" />
            </div>

            <div className={styles.inputGroup}>
              <label>Taxas Genéricas (%)</label>
              <input type="number" step="any" value={produtoAtual.taxas} onChange={(e) => setProdutoAtual({...produtoAtual, taxas: e.target.value})} placeholder="Ex: 18" />
            </div>

            <div className={styles.inputGroup}>
              <label>Sua Margem de Lucro Desejada (%)</label>
              <input type="number" step="any" value={produtoAtual.margem} onChange={(e) => setProdutoAtual({...produtoAtual, margem: e.target.value})} placeholder="Ex: 20" />
            </div>

            <button type="submit" className={styles.btnPrincipal}>
              {produtoAtual.id ? "Atualizar Produto" : "Salvar Produto"}
            </button>
            {produtoAtual.id && <button type="button" onClick={limparFormulario} className={styles.btnCancelar}>Cancelar Edição</button>}
          </form>
        </section>

        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>📦 Seus Produtos ({produtos.length})</h2>
          
          {produtos.length === 0 ? (
            <p className={styles.vazio}>Nenhum produto cadastrado ainda.</p>
          ) : (
            <div className={styles.listaProdutos}>
              {produtos.map(prod => {
                const calc = calcularResultados(prod);
                return (
                  <div key={prod.id} className={styles.produtoItem}>
                    <div className={styles.prodInfo}>
                      {prod.foto ? <img src={prod.foto} alt={prod.nome} className={styles.prodThumb} /> : <div className={styles.prodThumbPlaceholder}>📷</div>}
                      <div>
                        <h3>{prod.nome}</h3>
                        <p>Custo Base: R$ {((prod.custo_raw + prod.frete_raw)/100).toFixed(2)} | Meta Margem: {prod.margem}%</p>
                      </div>
                    </div>

                    <div className={styles.prodValores}>
                      <div>
                        <span>Preço Sugerido Padrão</span>
                        <strong className={styles.txtVerde}>R$ {calc.precoIdeal.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className={styles.prodAcoes}>
                      <button onClick={() => enviarParaWhatsApp(prod)} className={styles.btnZap} title="Enviar Orçamento WhatsApp">
                        <FiMessageCircle /> Orçar
                      </button>

                      <button onClick={() => setProdutoMultiCanal(prod)} className={styles.btnMultiCanal} title="Simular Preços">
                        🛒 Canais
                      </button>
                      <button onClick={() => setProdutoAtual(prod)} title="Editar Produto" className={styles.btnAcaoIcon}>✏️</button>
                      <button onClick={() => excluirProduto(prod.id)} title="Excluir Produto" className={styles.btnAcaoIcon}><FiTrash2 /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {produtoMultiCanal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>🛒 Inteligência Multi-Canal</h2>
              <button onClick={() => setProdutoMultiCanal(null)} className={styles.closeBtn}>X</button>
            </div>
            <div className={styles.modalProdInfo}>
              {produtoMultiCanal.foto && <img src={produtoMultiCanal.foto} alt="Produto" />}
              <div>
                <h3>{produtoMultiCanal.nome}</h3>
                <p>Custo base: <strong>R$ {((produtoMultiCanal.custo_raw + produtoMultiCanal.frete_raw) / 100).toFixed(2)}</strong> | Meta de Margem: <strong>{produtoMultiCanal.margem}%</strong></p>
              </div>
            </div>
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>Canal de Venda</th>
                  <th>Taxa Cobrada</th>
                  <th>Preço de Venda</th>
                  <th>Lucro (Bolso)</th>
                </tr>
              </thead>
              <tbody>
                {CANAIS_MARKETPLACE.map((canal, index) => {
                  const calculo = calcularPrecoCanal(produtoMultiCanal, canal);
                  const passouDe79 = canal.isML && calculo.precoIdeal >= 79;
                  return (
                    <tr key={index}>
                      <td><strong>{canal.nome}</strong></td>
                      <td>
                        {canal.taxaPerc}% 
                        <span className={styles.taxaFixa}>
                          {passouDe79 ? ' + Frete Mínimo' : ` + R$ ${canal.taxaFixa.toFixed(2)}`}
                        </span>
                      </td>
                      <td><strong className={styles.modalPrice}>R$ {calculo.precoIdeal.toFixed(2)}</strong></td>
                      <td><strong className={styles.modalProfit}>R$ {calculo.lucroReal.toFixed(2)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.modalFooter}>
              <button onClick={() => setProdutoMultiCanal(null)} className={styles.btnFecharModal}>Fechar Simulação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;