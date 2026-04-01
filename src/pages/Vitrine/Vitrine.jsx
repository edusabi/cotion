import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiMinus, FiPlus, FiSend } from "react-icons/fi";
import styles from "./Vitrine.module.css";

const API_URL = "https://cotion.discloud.app";

const Vitrine = () => {
  const { userId } = useParams(); // agora é SLUG
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
        console.error("Erro:", error);
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
      texto += `▪️ ${i.qtd}x *${i.name}* - R$ ${sub.toFixed(2)}\n`;
    });

    texto += `\n💰 TOTAL: R$ ${total.toFixed(2)}`;

    window.open(
      `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(texto)}`
    );
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className={styles.container}>
      <h1>{loja?.name || "Loja"}</h1>

      <div className={styles.grid}>
        {produtos.map(p => {
          const preco = calcularPreco(p);

          return (
            <div key={p.id} className={styles.card}>
              {p.foto && <img src={p.foto} alt={p.name} />}
              <h3>{p.name}</h3>
              <p>R$ {preco.toFixed(2)}</p>
              <button onClick={() => adicionar(p)}>Adicionar</button>
            </div>
          );
        })}
      </div>

      {carrinho.length > 0 && (
        <div className={styles.carrinho}>
          {carrinho.map(i => (
            <div key={i.id}>
              <span>{i.name}</span>
              <button onClick={() => alterar(i.id, -1)}><FiMinus /></button>
              <span>{i.qtd}</span>
              <button onClick={() => alterar(i.id, 1)}><FiPlus /></button>
            </div>
          ))}

          <button onClick={enviar}>
            <FiSend /> Enviar Pedido
          </button>
        </div>
      )}
    </div>
  );
};

export default Vitrine;