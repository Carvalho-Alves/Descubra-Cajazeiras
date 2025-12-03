import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/auth.jsx';
import Eventos from './pages/eventos.jsx';
import Servicos from './pages/servicos.jsx';
import PontoModel from './pages/pontoModel.jsx';
import TelaLogin from './pages/telaLogin.jsx';
import TelaCadastros from './pages/telaCadastros.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/pontoModel" element={<PontoModel />} />
        <Route path="/telaLogin" element={<TelaLogin />} />
        <Route path="/telaCadastros" element={<TelaCadastros />} />
        <Route path="/" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;