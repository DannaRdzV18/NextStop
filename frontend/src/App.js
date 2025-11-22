// src/App.js
import Registro from './components/Registro';
import Verificar from './components/Verificar';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Soporte from './pages/Soporte';
import ItinerariosCreados from './components/ItinerariosCreados';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import{ validateToken,logout} from "./utils/auth";
import{useEffect} from "react";

function App() {
   useEffect(() => {
    async function checkLoginStatus() {
      const user = await validateToken();
      if (!user) {
        console.warn("Token inválido → cerrando sesión");
        logout();
      }
    }

    checkLoginStatus();
  }, []);
  return (
    <Router basename="/nextstop-frontend2">
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar" element={<Verificar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/itinerarios" element={<ItinerariosCreados />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
