import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import { FiLogOut } from "react-icons/fi";

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <nav className={styles.navbar}>
      <img src="logo_grande.png" alt="" width="150px"/>

      <div className={styles.menu}>

        {!user ? (
          <>
            <Link to="/">Home</Link>
          <Link to="/sobre">Sobre</Link>
          <Link to="/contato">Contato</Link>
            <Link to="/login">Login</Link>
            <Link to="/registro">Registro</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Home</Link>
            <Link to="/caixaDiario">Caixa</Link>
          <Link to="/sobre">Sobre</Link>
          <Link to="/contato">Contato</Link>
            < FiLogOut onClick={logout} className={styles.iconLogout}/>
          </>
        )}
      </div>
    </nav>
  );
}