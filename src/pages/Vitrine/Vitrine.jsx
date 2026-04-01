import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiMinus, FiPlus, FiSend } from "react-icons/fi";
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

  useEffect(() => {
    const fetchVitrine = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vitrine/${userId}`);
        setProdutos(res.data.produtos);
        setLoja(res.data.loja);
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
    if (!whatsappNumber) return alert("Sem WhatsApp");
    if (carrinho.length === 0) return;

    let total = 0;
    let texto = "*🛍️ NOVO PEDIDO*\n\n";

    carrinho.forEach(i => {
      const sub = i.preco * i.qtd;
      total += sub;
      texto += `▪️ ${i.qtd}x *${i.nome}* - R$ ${sub.toFixed(2)}\n`;
    });

    texto += `\n💰 TOTAL: R$ ${total.toFixed(2)}`;

    window.open(
      `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(texto)}`
    );
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.container}>

      {/* HEADER BONITO */}
      <header className={styles.header}>
        <h1>{loja?.name || "Loja"}</h1>
        <p>Escolha seus produtos e peça pelo WhatsApp</p>
      </header>

      {/* GRID CORRETO */}
      <div className={styles.gridProdutos}>
        {produtos.length === 0 && (
          <p className={styles.vazio}>Nenhum produto encontrado</p>
        )}

        {produtos.map(p => {
          const preco = calcularPreco(p);

          return (
            <div key={p.id} className={styles.cardProduto}>
              <div className={styles.imgContainer}>
                {p.foto
                  ? <img src={p.foto} alt={p.nome} />
                  : <div className={styles.semFoto}>📷</div>}
              </div>

              <div className={styles.infoProduto}>
                <h3>{p.nome}</h3>
                <span className={styles.preco}>
                  R$ {preco.toFixed(2)}
                </span>

                <button
                  className={styles.btnComprar}
                  onClick={() => adicionar(p)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CARRINHO */}
      {carrinho.length > 0 && (
        <div className={styles.carrinhoFloat}>
          <div className={styles.carrinhoHeader}>
            <h3>🛒 Carrinho</h3>
          </div>

          <div className={styles.carrinhoItens}>
            {carrinho.map(i => (
              <div key={i.id} className={styles.carrinhoItem}>
                <span className={styles.itemNome}>{i.nome}</span>

                <div className={styles.controlesQtd}>
                  <button onClick={() => alterar(i.id, -1)}>
                    <FiMinus />
                  </button>

                  <span>{i.qtd}</span>

                  <button onClick={() => alterar(i.id, 1)}>
                    <FiPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className={styles.btnFinalizar} onClick={enviar}>
            <FiSend /> Enviar Pedido
          </button>
        </div>
      )}
    </div>
  );
};

export default Vitrine;