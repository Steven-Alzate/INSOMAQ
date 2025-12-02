import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Cortes() {
  const [cortes, setCortes] = useState([]);
  const [laminas, setLaminas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [form, setForm] = useState({
    id_lamina: "",
    ancho_cortado: "",
    largo_cortado: "",
    id_maquina: "",
    id_usuario: "",
    fecha: "",
  });

  const [filters, setFilters] = useState({
    id_lamina: "",
    id_maquina: "",
    id_usuario: "",
    fecha_from: "",
    fecha_to: "",
  });

  const [editId, setEditId] = useState(null);
  const { user, token } = useContext(AuthContext);

  const API_URL = "http://localhost:4000/cortes";

  useEffect(() => {
    fetchCortes();
    fetchLaminas();
    fetchMaquinas();
    fetchUsuarios();
  }, []);

  // Si el token llega después (login), volver a cargar usuarios para poblar el filtro
  useEffect(() => {
    if (token) fetchUsuarios();
  }, [token]);

  // Si hay usuario logueado, prellenar id_usuario en el formulario
  useEffect(() => {
    if (user && user.id) {
      setForm((f) => ({ ...f, id_usuario: String(user.id) }));
    }
  }, [user]);

  const fetchCortes = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener cortes");
      const data = await res.json();
      setCortes(data);
    } catch (err) {
      console.error("Error al obtener cortes:", err);
    }
  };

  const fetchLaminas = async () => {
    try {
      const res = await fetch("http://localhost:4000/laminas");
      if (!res.ok) throw new Error("Error al obtener láminas");
      const data = await res.json();
      setLaminas(data);
    } catch (err) {
      console.error("Error al obtener láminas:", err);
    }
  };

  const fetchMaquinas = async () => {
    try {
      const res = await fetch("http://localhost:4000/maquinas");
      if (!res.ok) throw new Error("Error al obtener máquinas");
      const data = await res.json();
      setMaquinas(data);
    } catch (err) {
      console.error("Error al obtener máquinas:", err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      // Intentar sin token primero (por si el endpoint no requiere auth en tu entorno)
      let res = await fetch("http://localhost:4000/usuarios");
      if (res.status === 401 && token) {
        // Reintentar con token
        res = await fetch("http://localhost:4000/usuarios", { headers: { Authorization: `Bearer ${token}` } });
      }

      if (!res.ok) {
        console.error('Error al obtener usuarios, status:', res.status);
        return;
      }

      const data = await res.json();
      setUsuariosList(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ id_lamina: "", id_maquina: "", id_usuario: "", fecha_from: "", fecha_to: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_lamina, ancho_cortado, largo_cortado, id_maquina, id_usuario, fecha } = form;

    if (!id_lamina || !ancho_cortado || !largo_cortado || !id_maquina || !id_usuario || !fecha) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const corteData = { id_lamina, ancho_cortado, largo_cortado, id_maquina, id_usuario, fecha };

      const options = {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corteData),
      };

      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al guardar el corte");

      alert(data.message || "Corte registrado exitosamente");
      setForm({
        id_lamina: "",
        ancho_cortado: "",
        largo_cortado: "",
        id_maquina: "",
        id_usuario: "",
        fecha: "",
      });
      setEditId(null);
      fetchCortes();
    } catch (err) {
      console.error("Error al guardar el corte:", err);
      alert(err.message);
    }
  };

  const handleEdit = (corte) => {
    setForm({
      id_lamina: corte.id_lamina,
      ancho_cortado: corte.ancho_cortado,
      largo_cortado: corte.largo_cortado,
      id_maquina: corte.id_maquina,
      id_usuario: corte.id_usuario,
      fecha: corte.fecha ? corte.fecha.split("T")[0] : "",
    });
    setEditId(corte.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este corte?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al eliminar el corte");
        alert(data.message || "Corte eliminado");
        fetchCortes();
      } catch (err) {
        console.error("Error al eliminar el corte:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-[#2a3f54] text-white py-5 shadow-lg">
      <h1 className="text-3xl font-semibold text-center">
        Inventario de Cortes
      </h1>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-10">
        {/* Formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            Registrar Nuevo Corte
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3"
          >
            <select
              name="id_lamina"
              value={form.id_lamina}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Selecciona una lámina</option>
              {laminas.map((l) => (
                <option key={l.id} value={l.id}>
                  ID {l.id} - {l.tipo || `${l.largo} x ${l.ancho}`}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.01"
              name="ancho_cortado"
              value={form.ancho_cortado}
              onChange={handleChange}
              placeholder="Ancho (m)"
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              type="number"
              step="0.01"
              name="largo_cortado"
              value={form.largo_cortado}
              onChange={handleChange}
              placeholder="Largo (m)"
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              type="number"
              name="id_maquina"
              value={form.id_maquina}
              onChange={handleChange}
              placeholder="ID Máquina"
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              required
            />
            {user && user.nombre ? (
              <div>
                <input
                  type="text"
                  value={user.nombre}
                  readOnly
                  className="border border-gray-300 rounded-md p-2 bg-gray-100"
                />
                <input type="hidden" name="id_usuario" value={form.id_usuario} />
              </div>
            ) : (
              <select
                name="id_usuario"
                value={form.id_usuario}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecciona usuario</option>
                {usuariosList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              required
            />

            <button
              type="submit"
              className="col-span-full lg:col-span-1 bg-teal-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              {editId ? "Actualizar" : "Agregar"}
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div className=" bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            Lista de Cortes
          </h2>

          <div className="overflow-x-auto">
              {/* Controles de filtrado */}
              <div className="mb-4 flex flex-col md:flex-row gap-3 items-center">
                <select
                  name="id_lamina"
                  value={filters.id_lamina}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
                >
                  <option value="">Todas las láminas</option>
                  {laminas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {`ID ${l.id} - ${l.tipo || `${l.largo}x${l.ancho}`}`}
                    </option>
                  ))}
                </select>

                <select
                  name="id_maquina"
                  value={filters.id_maquina}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
                >
                  <option value="">Todas las máquinas</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre || `ID ${m.id}`}
                    </option>
                  ))}
                </select>

                <select
                  name="id_usuario"
                  value={filters.id_usuario}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
                >
                  <option value="">Todos los usuarios</option>
                  {usuariosList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>

                <div className="w-full md:w-auto">
                  <button onClick={clearFilters} type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Limpiar filtros</button>
                </div>
              </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Lámina</th>
                  <th className="p-3 text-left">Ancho (m)</th>
                  <th className="p-3 text-left">Largo (m)</th>
                  <th className="p-3 text-left">Máquina</th>
                  <th className="p-3 text-left">Usuario</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = cortes.filter((corte) => {
                    const matchLamina = !filters.id_lamina || String(corte.id_lamina) === String(filters.id_lamina);
                    const matchMaquina = !filters.id_maquina || String(corte.id_maquina) === String(filters.id_maquina);
                    const matchUsuario = !filters.id_usuario || String(corte.id_usuario) === String(filters.id_usuario);
                    const matchFechaFrom = !filters.fecha_from || (corte.fecha && corte.fecha.split("T")[0] >= filters.fecha_from);
                    const matchFechaTo = !filters.fecha_to || (corte.fecha && corte.fecha.split("T")[0] <= filters.fecha_to);
                    return matchLamina && matchMaquina && matchUsuario && matchFechaFrom && matchFechaTo;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="8" className="text-center text-gray-500 py-4">No hay cortes registrados</td>
                      </tr>
                    );
                  }

                  // Renderizar los cortes filtrados
                  return filtered.map((corte) => {
                    // Priorizar valores planos devueltos por el backend (lamina/maquina/usuario).
                    // Si no existen, buscar el registro correspondiente en las listas ya cargadas.
                    let laminaLabel = '-';
                    if (corte.lamina) laminaLabel = corte.lamina;
                    else {
                      const l = laminas.find((x) => String(x.id) === String(corte.id_lamina));
                      if (l) laminaLabel = l.tipo || `${l.largo || '-'} x ${l.ancho || '-'}`;
                    }

                    let maquinaLabel = '-';
                    if (corte.maquina) maquinaLabel = corte.maquina;
                    else {
                      const m = maquinas.find((x) => String(x.id) === String(corte.id_maquina));
                      if (m) maquinaLabel = m.nombre || `Máquina ${m.id}`;
                    }

                    let usuarioLabel = '-';
                    if (corte.usuario) usuarioLabel = corte.usuario;
                    else {
                      const u = usuariosList.find((x) => String(x.id) === String(corte.id_usuario));
                      if (u) usuarioLabel = u.nombre || `Usuario ${u.id}`;
                      // Si no hay info pero el corte pertenece al usuario logueado, mostrar su nombre
                      else if (user && user.id && String(corte.id_usuario) === String(user.id)) {
                        usuarioLabel = user.nombre || `Usuario ${user.id}`;
                      }
                    }

                    return (
                      <tr key={corte.id} className="border-t hover:bg-gray-50 transition">
                        <td className="p-3">{corte.id}</td>
                        <td className="p-3">{laminaLabel}</td>
                        <td className="p-3">{corte.ancho_cortado}</td>
                        <td className="p-3">{corte.largo_cortado}</td>
                        <td className="p-3">{maquinaLabel}</td>
                        <td className="p-3">{usuarioLabel}</td>
                        <td className="p-3">{corte.fecha ? corte.fecha.split("T")[0] : "-"}</td>
                        <td className="p-3 text-center space-x-2">
                          <button onClick={() => handleEdit(corte)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Editar</button>
                          <button onClick={() => handleDelete(corte.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Eliminar</button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
