import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// components
import NavBar from "./components/NavBar/NavBar";
import NotFound from "./components/Notfound/Notfound";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";

// pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from './pages/Dashboard/Dashboard';
import CaixaDiario from './pages/CaixaDiario/CaixaDiario';
import ReversePricing from "./pages/ReversePricing/ReversePricing";
import MachineComparator from "./pages/MachineComparator/MachineComparator";
import Vitrine from "./pages/Vitrine/Vitrine";
import Success from "./pages/Success/Success";


// 🔥 ESSE CARA CONTROLA A NAVBAR
function AppContent() {
  const location = useLocation();

  const esconderNavbar = location.pathname.startsWith("/vitrine");

  return (
    <>
      {!esconderNavbar && <NavBar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sobre' element={<About />} />
        <Route path='/contato' element={<Contact />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registro' element={<Register />} />
        <Route path='/calculadora' element={<MachineComparator />}/>
        <Route path='/vitrine/:userId' element={<Vitrine />} />
        <Route path='/recuperar-senha' element={<ForgotPassword />} />

        <Route 
          path='/sucesso' 
          element={
            <PrivateRoute>
              <Success />
            </PrivateRoute>
          } 
        />

        <Route 
          path='/dashboard' 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path='/caixaDiario' 
          element={
            <PrivateRoute>
              <CaixaDiario />
            </PrivateRoute>
          } 
        />

        <Route 
          path='/reverse_pricing' 
          element={
            <PrivateRoute>
              <ReversePricing />
            </PrivateRoute>
          } 
        />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
}


// 🔥 APP PRINCIPAL
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;