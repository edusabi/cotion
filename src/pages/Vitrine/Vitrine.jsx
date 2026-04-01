import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiShoppingCart, FiMinus, FiPlus, FiSend } from "react-icons/fi";
import styles from "./Vitrine.module.css";

const API_URL = "https://cotion.discloud.app";

const Vitrine = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const whatsappNumber = searchParams.get("w"); // Pega o WhatsApp da URL

  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitrine = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vitrine/${userId}`);
        setProdutos(res.data);
      } catch (error) {
        console.error("Erro ao carregar vitrine", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchVitrine();
  }, [userId]);

  // Mesmo cálculo do Dashboard para garantir o preço exato
  const calcularPrecoSugerido = (prod) => {
    const custo = prod.custo_raw / 100;
    const frete = prod.frete_raw / 100;
    const taxas = Number(prod.taxas) || 0;
    const margem = Number(prod.margem) || 0;
    const divisor = 1 - ((taxas + margem) / 100);
    if (divisor <= 0) return 0;
    return (custo + frete) / divisor;
  };

  const adicionarAoCarrinho = (produto) => {
    const preco = calcularPrecoSugerido(produto);
    const itemExistente = carrinho.find((item) => item.id === produto.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item => item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item));
    } else {
      setCarrinho([...carrinho, { ...produto, precoReal: preco, qtd: 1 }]);
    }
  };

  const alterarQuantidade = (id, delta) => {
    setCarrinho(carrinho.map(item => {
      if (item.id === id) {
        const novaQtd = item.qtd + delta;
        return novaQtd > 0 ? { ...item, qtd: novaQtd } : null;
      }
      return item;
    }).filter(Boolean)); // Remove itens com quantidade 0
  };

  const enviarPedidoWhatsApp = () => {
    if (!whatsappNumber) return alert("Número de WhatsApp da loja não encontrado.");
    if (carrinho.length === 0) return;

    let total = 0;
    let textoPedido = `*🛍️ NOVO PEDIDO - VITRINE*\n\n`;

    carrinho.forEach((item) => {
      const subtotal = item.precoReal * item.qtd;
      total += subtotal;
      textoPedido += `▪️ ${item.qtd}x *${item.nome}* - R$ ${subtotal.toFixed(2)}\n`;
    });

    textoPedido += `\n💰 *TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*\n\n`;
    textoPedido += `Olá! Gostaria de finalizar este pedido. Como podemos seguir com o pagamento e entrega?`;

    const textoCodificado = encodeURIComponent(textoPedido);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${textoCodificado}`, "_blank");
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.precoReal * item.qtd), 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);

  if (loading) return <div className={styles.loading}>Carregando catálogo...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Catálogo de Produtos</h1>
        <p>Escolha seus itens e faça o pedido direto pelo WhatsApp</p>
      </header>

      <div className={styles.gridProdutos}>
        {produtos.map(prod => {
          const preco = calcularPrecoSugerido(prod);
          return (
            <div key={prod.id} className={styles.cardProduto}>
              <div className={styles.imgContainer}>
                {prod.foto ? <img src={prod.foto} alt={prod.nome} /> : <div className={styles.semFoto}>📷</div>}
              </div>
              <div className={styles.infoProduto}>
                <h3>{prod.nome}</h3>
                <span className={styles.preco}>R$ {preco.toFixed(2)}</span>
                <button onClick={() => adicionarAoCarrinho(prod)} className={styles.btnComprar}>
                  Adicionar
                </button>
              </div>
            </div>
          );
        })}
        {produtos.length === 0 && <p className={styles.vazio}>Nenhum produto cadastrado no momento.</p>}
      </div>

      {carrinho.length > 0 && (
        <div className={styles.carrinhoFloat}>
          <div className={styles.carrinhoHeader}>
            <h3>🛒 Seu Carrinho ({totalItens})</h3>
            <span>Total: <strong>R$ {totalCarrinho.toFixed(2)}</strong></span>
          </div>
          <div className={styles.carrinhoItens}>
            {carrinho.map(item => (
              <div key={item.id} className={styles.carrinhoItem}>
                <span className={styles.itemNome}>{item.nome}</span>
                <div className={styles.controlesQtd}>
                  <button onClick={() => alterarQuantidade(item.id, -1)}><FiMinus /></button>
                  <span>{item.qtd}</span>
                  <button onClick={() => alterarQuantidade(item.id, 1)}><FiPlus /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={enviarPedidoWhatsApp} className={styles.btnFinalizar}>
            <FiSend /> Enviar Pedido por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default Vitrine;