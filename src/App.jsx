import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 1. ADICIONE O IMPORT AQUI (junto com os outros das páginas)
import Success from "./pages/Success/Success"; 

///components
import NavBar from "./components/NavBar/NavBar";
import NotFound from "./components/Notfound/Notfound";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

///pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from './pages/Dashboard/Dashboard';
import CaixaDiario from './pages/CaixaDiario/CaixaDiario';
import ReversePricing from "./pages/ReversePricing/ReversePricing";
import MachineComparator from "./pages/MachineComparator/MachineComparator";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sobre' element={<About />} />
        <Route path='/contato' element={<Contact />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registro' element={<Register />} />

        {/* 2. ADICIONE A NOVA ROTA AQUI EMBAIXO DO DASHBOARD */}
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

          <Route 
            path='/calculadora' 
            element={
              <PrivateRoute>
                <MachineComparator />
              </PrivateRoute>
            } 
          />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;