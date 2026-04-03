import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"; 

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false); 

  // Função para alternar o menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Função para fechar o menu ao clicar em um link (apenas no mobile)
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar} id="menu-principal">
      <img src="logo_grande.png" alt="Logo" width="150px" />

      {/* Botão de Toggle visível apenas no mobile */}
      <div className={styles.toggleButton} onClick={toggleMenu}>
        {isOpen ? <FiX /> : <FiMenu />}
      </div>

      {/* Div do menu. A classe 'open' é injetada se isOpen for true */}
      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        
        {/* 🔥 A MUDANÇA ESTÁ AQUI: Se estiver carregando, não mostra os links ainda, 
            mas a logo e a barra já estão desenhadas na tela! */}
        {loading ? null : !user ? (
          <>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/calculadora" onClick={closeMenu}>Raio-X</Link>
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
            <Link to="/calculadora" onClick={closeMenu}>Raio-X</Link>
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