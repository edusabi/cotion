import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiShoppingCart, FiMinus, FiPlus, FiSend, FiX } from "react-icons/fi";
import styles from "./Vitrine.module.css";

const API_URL = "https://cotion.discloud.app";

const Vitrine = () => {
  const { userId } = useParams(); // slug
  const [searchParams] = useSearchParams();
  const whatsappNumber = searchParams.get("w");

  const [produtos, setProdutos] = useState([]);
  const [loja, setLoja] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 NOVO ESTADO: Controla se o modal do carrinho está aberto ou fechado
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Se o carrinho esvaziar, fecha o modal automaticamente
  useEffect(() => {
    if (carrinho.length === 0) setIsCartOpen(false);
  }, [carrinho]);

  useEffect(() => {
    const fetchVitrine = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vitrine/${userId}`);
        setProdutos(res.data.produtos || res.data); // Ajuste caso a API retorne direto o array
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
        i.id === prod.id ? { ...i, qtd: i.qtd + 1 } : i
      ));
    } else {
      setCarrinho([...carrinho, { ...prod, preco, qtd: 1 }]);
    }
  };

  const alterar = (id, delta) => {
    setCarrinho(carrinho
      .map(i => {
        if (i.id === id) {
          const q = i.qtd + delta;
          return q > 0 ? { ...i, qtd: q } : null;
        }
        return i;
      })
      .filter(Boolean)
    );
  };

  const enviar = () => {
    if (!whatsappNumber) return alert("Sem WhatsApp configurado.");
    if (carrinho.length === 0) return;

    let total = 0;
    let texto = "*🛍️ NOVO PEDIDO*\n\n";

    carrinho.forEach(i => {
      const sub = i.preco * i.qtd;
      total += sub;
      texto += `▪️ ${i.qtd}x *${i.nome || i.name}* - R$ ${sub.toFixed(2)}\n`;
    });

    texto += `\n💰 TOTAL: R$ ${total.toFixed(2)}`;

    window.open(
      `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(texto)}`
    );
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.container}>

      {/* HERO / CABEÇALHO */}
      <header className={styles.hero}>
        <h1>{loja?.name || "Catálogo de Produtos"}</h1>
        <p>Escolha seus produtos e peça pelo WhatsApp 🚀</p>
      </header>

      {/* GRID DE PRODUTOS */}
      <div className={styles.grid}>
        {produtos.length === 0 && (
          <p style={{ textAlign: "center", width: "100%", opacity: 0.5 }}>Nenhum produto encontrado</p>
        )}

        {produtos.map(p => {
          const preco = calcularPreco(p);
          return (
            <div key={p.id} className={styles.card}>
              <div className={styles.imgWrap}>
                {p.foto
                  ? <img src={p.foto} alt={p.nome || p.name} />
                  : <div className={styles.noImg}>📷</div>}
              </div>

              <div className={styles.info}>
                <h3>{p.nome || p.name}</h3>
                <span className={styles.price}>
                  R$ {preco.toFixed(2)}
                </span>

                <button onClick={() => adicionar(p)}>
                  Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 SISTEMA DO CARRINHO (BOLINHA + MODAL) */}
      {carrinho.length > 0 && (
        <>
          {/* BOLINHA FLUTUANTE (FAB) */}
          <button 
            className={styles.cartFab} 
            onClick={() => setIsCartOpen(true)}
          >
            <FiShoppingCart />
            <span className={styles.cartBadge}>{totalItens}</span>
          </button>

          {/* MODAL DO CARRINHO */}
          {isCartOpen && (
            <div className={styles.cartModalOverlay} onClick={() => setIsCartOpen(false)}>
              
              {/* Impede que o clique dentro do modal feche ele */}
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
                      <span className={styles.itemNome}>{i.nome || i.name}</span>

                      <div className={styles.controlesQtd}>
                        <button onClick={() => alterar(i.id, -1)}><FiMinus /></button>
                        <span>{i.qtd}</span>
                        <button onClick={() => alterar(i.id, 1)}><FiPlus /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.cartTotalRow}>
                  <span>Total:</span>
                  <strong>R$ {totalCarrinho.toFixed(2)}</strong>
                </div>

                <button className={styles.btnFinal} onClick={enviar}>
                  <FiSend /> Enviar Pedido
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