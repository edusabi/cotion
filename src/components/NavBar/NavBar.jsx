import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"; // Importando os novos ícones

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar o menu

  if (loading) return null;

  // Função para alternar o menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Função para fechar o menu ao clicar em um link (apenas no mobile)
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar}>
      <img src="logo_grande.png" alt="Logo" width="150px" />

      {/* Botão de Toggle visível apenas no mobile */}
      <div className={styles.toggleButton} onClick={toggleMenu}>
        {isOpen ? <FiX /> : <FiMenu />}
      </div>

      {/* Div do menu. A classe 'open' é injetada se isOpen for true */}
      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        {!user ? (
          <>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/sobre" onClick={closeMenu}>Sobre</Link>
            <Link to="/contato" onClick={closeMenu}>Contato</Link>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/registro" onClick={closeMenu}>Registro</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" onClick={closeMenu}>Home</Link>
            <Link to="/caixaDiario" onClick={closeMenu}>Caixa</Link>
            <Link to="/reverse_pricing" onClick={closeMenu}>Preço Reverso</Link>
            <Link to="/calculadora" onClick={closeMenu}>Maquininhas</Link>
            {/* <Link to="/taxas" onClick={closeMenu}>Taxas</Link> */}
            <Link to="/sobre" onClick={closeMenu}>Sobre</Link>
            <Link to="/contato" onClick={closeMenu}>Contato</Link>
            <FiLogOut 
              onClick={() => { logout(); closeMenu(); }} 
              className={styles.iconLogout}
            />
          </>
        )}
      </div>
    </nav>
  );
}