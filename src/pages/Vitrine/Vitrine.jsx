import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiShoppingCart, FiMinus, FiPlus, FiSend, FiX, FiUser, FiTrash2, FiShoppingBag } from "react-icons/fi";
import styles from "./Vitrine.module.css";

const API_URL = "/api";

const Vitrine = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const whatsappNumber = searchParams.get("w");

  const [produtos, setProdutos] = useState([]);
  const [loja, setLoja] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");

  useEffect(() => {
    if (carrinho.length === 0) setIsCartOpen(false);
  }, [carrinho]);

  useEffect(() => {
    document.title = loja?.name ? `${loja.name} | Vitrine` : "Cotion - Vitrine";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = '/favicon.ico';
  }, [loja]);

  useEffect(() => {
    const fetchVitrine = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vitrine/${userId}`);
        setProdutos(res.data.produtos || res.data);
        setLoja(res.data.loja || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVitrine();
  }, [userId]);

  const calcularPreco = (prod) => {
    const custo = prod.custo_raw / 100;
    const frete = prod.frete_raw / 100;
    const taxas = Number(prod.taxas) || 0;
    const margem = Number(prod.margem) || 0;
    const divisor = 1 - ((taxas + margem) / 100);
    if (divisor <= 0) return 0;
    return (custo + frete) / divisor;
  };

  const adicionar = (prod) => {
    const preco = calcularPreco(prod);
    const existe = carrinho.find(i => i.id === prod.id);
    if (existe) {
      setCarrinho(carrinho.map(i =>
        i.id === prod.id ? { ...i, qtd: Number(i.qtd || 0) + 1 } : i
      ));
    } else {
      setCarrinho([...carrinho, { ...prod, preco, qtd: 1 }]);
    }
  };

  const alterar = (id, delta) => {
    setCarrinho(carrinho
      .map(i => {
        if (i.id === id) {
          const q = (Number(i.qtd) || 0) + delta;
          return q > 0 ? { ...i, qtd: q } : null;
        }
        return i;
      })
      .filter(Boolean)
    );
  };

  const alterarQuantidade = (id, valor) => {
    if (valor === "") {
      setCarrinho(carrinho.map(i => i.id === id ? { ...i, qtd: "" } : i));
      return;
    }
    const novaQtd = parseInt(valor, 10);
    if (!isNaN(novaQtd) && novaQtd > 0) {
      setCarrinho(carrinho.map(i => i.id === id ? { ...i, qtd: novaQtd } : i));
    }
  };

  const corrigirQuantidadeNoBlur = (id, qtdAtual) => {
    if (qtdAtual === "" || Number(qtdAtual) < 1) {
      setCarrinho(carrinho.map(i => i.id === id ? { ...i, qtd: 1 } : i));
    }
  };

  const removerItem = (id) => {
    setCarrinho(carrinho.filter(i => i.id !== id));
  };

  const enviar = () => {
    if (!whatsappNumber) return alert("Erro: WhatsApp da loja não configurado.");
    if (carrinho.length === 0) return;
    if (nomeCliente.trim() === "") return alert("Por favor, preencha o seu nome antes de enviar o pedido.");

    let total = 0;
    let texto = `Olá! Me chamo *${nomeCliente.trim()}* e vim pela vitrine digital.\n`;
    texto += `Gostaria de fechar o pedido abaixo: 👇\n\n`;
    texto += `*🛒 RESUMO DO PEDIDO:*\n`;
    texto += `------------------------------------\n`;

    carrinho.forEach(i => {
      const quantidade = Number(i.qtd) || 1; 
      const sub = i.preco * quantidade;
      total += sub;
      texto += `▪️ ${quantidade}x *${i.nome || i.name}*\n`;
      texto += `   _Subtotal: R$ ${sub.toFixed(2).replace('.', ',')}_\n`;
    });

    texto += `------------------------------------\n`;
    texto += `💰 *TOTAL A PAGAR: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    texto += `Como funciona para pagamento e envio/retirada? Fico no aguardo! 🚀`;

    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(texto)}`);
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * (Number(item.qtd) || 0)), 0);
  const totalItens = carrinho.reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);

  if (loading) return <div className={styles.loading}>Carregando a vitrine...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.glowBackground}></div>

      <header className={styles.hero}>
        <h1>{loja?.name || "Catálogo"}</h1>
        <p>Escolha seus produtos e peça pelo WhatsApp 🚀</p>
      </header>

      <div className={styles.grid}>
        {produtos.length === 0 && (
          <div className={styles.emptyState}>
            <p>Nenhum produto encontrado nesta loja.</p>
          </div>
        )}

        {produtos.map(p => {
          const preco = calcularPreco(p);
          return (
            <div key={p.id} className={styles.card}>
              <div className={styles.imgWrap}>
                {p.foto
                  ? <img src={p.foto} alt={p.nome || p.name} loading="lazy" />
                  : <div className={styles.noImg}>📷</div>}
              </div>

              <div className={styles.info}>
                <h3>{p.nome || p.name}</h3>
                <span className={styles.price}>
                  <small>R$</small> {preco.toFixed(2)}
                </span>

                <button className={styles.btnAdd} onClick={() => adicionar(p)}>
                  <FiShoppingBag className={styles.btnIcon} /> Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {carrinho.length > 0 && (
        <>
          <button 
            className={styles.cartFab} 
            onClick={() => setIsCartOpen(true)}
          >
            <FiShoppingCart />
            <span className={styles.cartBadge}>{totalItens}</span>
          </button>

          {isCartOpen && (
            <div className={styles.cartModalOverlay} onClick={() => setIsCartOpen(false)}>
              <div className={styles.cartModal} onClick={(e) => e.stopPropagation()}>
                
                <div className={styles.cartHeader}>
                  <h3>🛒 Seu Pedido</h3>
                  <button className={styles.closeCartBtn} onClick={() => setIsCartOpen(false)}>
                    <FiX />
                  </button>
                </div>

                <div className={styles.carrinhoItens}>
                  {carrinho.map(i => (
                    <div key={i.id} className={styles.cartItem}>
                      <span className={styles.itemNome} title={i.nome || i.name}>{i.nome || i.name}</span>

                      <div className={styles.controlesQtd}>
                        <button onClick={() => alterar(i.id, -1)}><FiMinus /></button>
                        <input
                          type="number"
                          min="1"
                          value={i.qtd}
                          onChange={(e) => alterarQuantidade(i.id, e.target.value)}
                          onBlur={() => corrigirQuantidadeNoBlur(i.id, i.qtd)}
                          className={styles.inputQtd}
                        />
                        <button onClick={() => alterar(i.id, 1)}><FiPlus /></button>
                        <button 
                          onClick={() => removerItem(i.id)} 
                          title="Remover produto"
                          className={styles.btnRemover}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.cartTotalRow}>
                  <span>Total do Pedido:</span>
                  <strong>R$ {totalCarrinho.toFixed(2)}</strong>
                </div>

                <div className={styles.identificacaoCliente}>
                  <label htmlFor="nomeCliente">Como você se chama?</label>
                  <div className={styles.inputWrapper}>
                    <FiUser className={styles.inputIcon} />
                    <input 
                      id="nomeCliente"
                      type="text" 
                      placeholder="Ex: Maria da Silva" 
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                    />
                  </div>
                </div>

                <button className={styles.btnFinal} onClick={enviar}>
                  <FiSend /> Concluir via WhatsApp
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Vitrine;