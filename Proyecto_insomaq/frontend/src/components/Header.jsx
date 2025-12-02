import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
  logout(); // limpia contexto
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/"); // vuelve al login
};

  return (
    <header className="bg-black text-white p-4">
      <div className="flex items-center w-full">
        <span className="font-bold text-xl mr-6">Insomaq</span>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col space-y-1 ml-auto"
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>

        <nav
          className={`${
            menuOpen ? "block" : "hidden"
          } absolute top-full left-0 w-full bg-black md:static md:flex md:flex-row md:items-center md:space-x-6 md:w-auto text-sm`}
        >
          <Link to="/home" className="block px-4 py-2 md:px-0 hover:text-cyan-500">Inicio</Link>
          <Link to="/Cortes" className="block px-4 py-2 md:px-0 hover:text-cyan-500">Cortes</Link>
          <Link to="/retazos" className="block px-4 py-2 md:px-0 hover:text-cyan-500">Retazos</Link>
          <Link to="/inventario" className="block px-4 py-2 md:px-0 hover:text-cyan-500">Láminas</Link>
          <Link to="/alertas" className="block px-4 py-2 md:px-0 hover:text-cyan-500">Alertas</Link>
          <Link to="/maquinas" className="block px-4 py-2 md:px-0 hover:text-cyan-500">Maquinas</Link>

        </nav>

        <div className="hidden md:flex items-center space-x-4 ml-auto">
          <span className="font-semibold">{user?.email || "Usuario"}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
