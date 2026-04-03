import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"; 

export default function NavBar() {
  const { user, logout } = useAuth(); // Removemos o loading daqui para não travar a tela
  const [isOpen, setIsOpen] = useState(false); 

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar} id="menu-principal">
      <img src="logo_grande.png" alt="Logo" width="150px" />

      <div className={styles.toggleButton} onClick={toggleMenu}>
        {isOpen ? <FiX /> : <FiMenu />}
      </div>

      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        
        {/* 🔥 SEM DELAY: Renderiza os menus diretos com base no usuário */}
        {user?.is_premium ? (
          /* ==========================================
             1. USUÁRIO LOGADO E PREMIUM (ACESSO TOTAL)
             ========================================== */
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
              title="Sair"
            />
          </>
        ) : user ? (
          /* ==========================================
             2. USUÁRIO LOGADO MAS GRATUITO (LIMITADO)
             ========================================== */
          <>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/calculadora" onClick={closeMenu}>Raio-X</Link>
            <Link to="/sobre" onClick={closeMenu}>Sobre</Link>
            <Link to="/contato" onClick={closeMenu}>Contato</Link>
            <FiLogOut 
              onClick={() => { logout(); closeMenu(); }} 
              className={styles.iconLogout}
              title="Sair"
            />
          </>
        ) : (
          /* ==========================================
             3. VISITANTE DESLOGADO (Padrão ao carregar)
             ========================================== */
          <>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/calculadora" onClick={closeMenu}>Raio-X</Link>
            <Link to="/sobre" onClick={closeMenu}>Sobre</Link>
            <Link to="/contato" onClick={closeMenu}>Contato</Link>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/registro" onClick={closeMenu}>Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}