import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registro from './components/Registro';
import Verificar from './components/Verificar';
import Login from './components/Login';
import VerificacionEnlace from './components/VerificacionEnlace'; // 👈 importar nuevo componente
import VerificacionCodigo from './components/VerificacionCodigo';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar" element={<Verificar />} />
          <Route path="/verificar-codigo" element={<VerificacionCodigo />} />
          <Route path="/verificar-enlace" element={<VerificacionEnlace />} /> {/* 👈 nueva ruta */}
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
