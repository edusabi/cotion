import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiMinus, FiPlus, FiSend, FiShoppingCart } from "react-icons/fi";
import styles from "./Vitrine.module.css";

const API_URL = "https://cotion.discloud.app";

const Vitrine = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const whatsappNumber = searchParams.get("w");

  const [produtos, setProdutos] = useState([]);
  const [loja, setLoja] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vitrine/${userId}`);
        setProdutos(res.data.produtos);
        setLoja(res.data.loja);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId]);

  const calcularPreco = (p) => {
    const custo = p.custo_raw / 100;
    const frete = p.frete_raw / 100;
    const taxas = Number(p.taxas) || 0;
    const margem = Number(p.margem) || 0;

    const divisor = 1 - ((taxas + margem) / 100);
    if (divisor <= 0) return 0;

    return (custo + frete) / divisor;
  };

  const adicionar = (p) => {
    const preco = calcularPreco(p);
    const existe = carrinho.find(i => i.id === p.id);

    if (existe) {
      setCarrinho(carrinho.map(i =>
        i.id === p.id ? { ...i, qtd: i.qtd + 1 } : i
      ));
    } else {
      setCarrinho([...carrinho, { ...p, preco, qtd: 1 }]);
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

    let total = 0;
    let texto = "*🛍️ NOVO PEDIDO*\n\n";

    carrinho.forEach(i => {
      const sub = i.preco * i.qtd;
      total += sub;
      texto += `▪️ ${i.qtd}x *${i.nome}* - R$ ${sub.toFixed(2)}\n`;
    });

    texto += `\n💰 TOTAL: R$ ${total.toFixed(2)}`;

    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(texto)}`);
  };

  const total = carrinho.reduce((acc, i) => acc + i.preco * i.qtd, 0);

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.container}>

      {/* HERO */}
      <div className={styles.hero}>
        <h1>{loja?.name || "Minha Loja"}</h1>
        <p>Compre direto pelo WhatsApp 🚀</p>
      </div>

      {/* PRODUTOS */}
      <div className={styles.grid}>
        {produtos.map(p => {
          const preco = calcularPreco(p);

          return (
            <div key={p.id} className={styles.card}>
              <div className={styles.imgWrap}>
                {p.foto
                  ? <img src={p.foto} alt={p.nome} />
                  : <div className={styles.noImg}>📦</div>}
              </div>

              <div className={styles.info}>
                <h3>{p.nome}</h3>
                <span className={styles.price}>R$ {preco.toFixed(2)}</span>

                <button onClick={() => adicionar(p)}>
                  <FiShoppingCart /> Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CARRINHO */}
      {carrinho.length > 0 && (
        <div className={styles.cart}>
          <div className={styles.cartHeader}>
            <h3>🛒 {carrinho.length} itens</h3>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          {carrinho.map(i => (
            <div key={i.id} className={styles.cartItem}>
              <span>{i.nome}</span>

              <div>
                <button onClick={() => alterar(i.id, -1)}><FiMinus /></button>
                <span>{i.qtd}</span>
                <button onClick={() => alterar(i.id, 1)}><FiPlus /></button>
              </div>
            </div>
          ))}

          <button className={styles.btnFinal} onClick={enviar}>
            <FiSend /> Finalizar no WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default Vitrine;