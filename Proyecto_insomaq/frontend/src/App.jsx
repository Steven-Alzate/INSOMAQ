import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Home from "./pages/Home";
import Cortes from "./pages/Cortes";
import Retazos from "./pages/Retazos";
import Alertas from "./pages/Alertas";
import Inventario from "./pages/Inventario";
import Laminas from "./pages/Laminas";
import Maquinas from "./pages/Maquinas";
import PrivateRoute from "./components/Private"; 
import { AuthProvider } from "./context/AuthContext"; 


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública (login) */}
          <Route path="/" element={<Login />} />
           <Route path="/registrarse" element={<Register />} />
          {/* Rutas privadas */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Routes>
                    <Route path="home" element={<Home />} />
                    <Route path="inventario" element={<Inventario />} /> 
                    <Route path="laminas" element={<Laminas />} />
                    <Route path="cortes" element={<Cortes />} />
                    <Route path="retazos" element={<Retazos />} />
                    <Route path="alertas" element={<Alertas />} />
                    <Route path="maquinas" element={<Maquinas />} />
                    
                  </Routes>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
