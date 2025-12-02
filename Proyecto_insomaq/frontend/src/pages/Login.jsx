import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // renombrado
  const [mensaje, setMensaje] = useState("");
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 🔐 Enviar email para recuperación de clave
  const handleRecuperarClave = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const response = await fetch("http://localhost:4000/usuarios/recuperar-clave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("✅ Usuario encontrado. Ahora puedes cambiar tu clave.");
        setMostrarRecuperar(true); // Muestra formulario para cambiar clave
      } else {
        setMensaje(data.message || "Error al enviar la solicitud de recuperación.");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMensaje("Error al conectar con el servidor");
    }
  };

  // 🔑 Login normal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const response = await fetch("http://localhost:4000/usuarios/iniciar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contrasena: password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        navigate("/home");
      } else {
        setMensaje(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Error al conectar con el servidor");
    }
  };

  // 🔑 Cambiar clave (formulario de recuperación)
  const handleCambiarClave = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const response = await fetch(`http://localhost:4000/usuarios/1/cambiar-contrasena`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasenayActual: "", nuevaContrasena: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("✅ Clave actualizada correctamente. Ahora puedes iniciar sesión.");
        setMostrarRecuperar(false);
        setPassword("");
      } else {
        setMensaje(data.message || "Error al actualizar la clave.");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div className="flex h-screen font-inter bg-gray-100">
      {/* IZQUIERDA */}
      <div className="flex flex-col justify-center px-20 bg-white w-1/2">
        <img
          src="https://insomaq.com/wp-content/uploads/2023/09/cropped-logo-insomaq-horizontal-1.png"
          alt="Insomaq Logo"
          className="w-[350px] mb-8 mt-6"
        />

        {mostrarRecuperar ? (
          // 🔹 FORMULARIO DE RECUPERACIÓN
          <>
            <h2 className="text-2xl font-semibold mb-8 text-gray-800 leading-tight">
              Recuperar clave
            </h2>

            <form onSubmit={handleCambiarClave} className="max-w-lg">
              {mensaje && (
                <p
                  className={`mb-4 ${
                    mensaje.includes("✅") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {mensaje}
                </p>
              )}

              <label className="block mb-2 font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <label className="block mb-2 font-medium text-gray-700">
                Nueva clave
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-md font-medium transition"
              >
                Cambiar clave
              </button>

              <p
                onClick={() => setMostrarRecuperar(false)}
                className="text-sm text-cyan-600 hover:underline cursor-pointer mt-4"
              >
                ← Volver al inicio de sesión
              </p>
            </form>
          </>
        ) : (
          // 🔹 FORMULARIO DE LOGIN
          <>
            <h2 className="text-2xl font-semibold mb-8 text-gray-800 leading-tight">
              Bienvenido a Insomaq,
              <br /> Inicie sesión para continuar
            </h2>

            <form onSubmit={handleSubmit} className="max-w-lg">
              {mensaje && <p className="text-red-500 mb-4">{mensaje}</p>}

              <label className="block mb-2 font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <label className="block mb-2 font-medium text-gray-700">
                Clave
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <div className="flex justify-between items-center text-sm mb-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-cyan-500" /> Recuérdame
                </label>
                <span
                  onClick={() => setMostrarRecuperar(true)}
                  className="text-cyan-600 hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu clave?
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-md font-medium transition"
              >
                Iniciar sesión
              </button>
            </form>
          </>
        )}
      </div>

      {/* DERECHA */}
      <div
        className="flex flex-col justify-center items-center text-white w-1/2 bg-cyan-600 text-center px-10 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://insomaq.com/wp-content/uploads/2024/10/Insomaq-3-e1728386607604.webp")',
          backgroundBlendMode: "multiply",
        }}
      >
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
          ¡BIENVENIDOS A INSOMAQ!
        </h1>
        <p className="text-lg max-w-md text-gray-200">
          Metalizando tus sueños, construyendo realidades...
        </p>

        <h1
          onClick={() => navigate("/registrarse")}
          className="text-2xl font-bold text-cyan-500 hover:text-red-600 hover:underline cursor-pointer transition mt-6"
        >
          ¿No tienes una cuenta? Registrarse
        </h1>
      </div>
    </div>
  );
}
