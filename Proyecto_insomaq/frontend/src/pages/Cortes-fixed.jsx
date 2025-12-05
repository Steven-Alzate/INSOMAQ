import React, { useEffect, useState } from "react";

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

  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:4000/cortes";

  useEffect(() => {
    fetchCortes();
    fetchLaminas();
    fetchMaquinas();
    fetchUsuarios();
  }, []);

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
      const res = await fetch("http://localhost:4000/usuarios");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuariosList(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          INVENTARIO DE CORTES
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
            <select
              name="id_maquina"
              value={form.id_maquina}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Selecciona máquina</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>

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
        <div className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            Lista de Cortes
          </h2>

          <div className="overflow-x-auto">
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
                {cortes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-500 py-4">
                      No hay cortes registrados
                    </td>
                  </tr>
                ) : (
                  cortes.map((corte) => (
                    <tr
                      key={corte.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{corte.id}</td>
                      <td className="p-3">{corte.id_lamina}</td>
                      <td className="p-3">{corte.ancho_cortado}</td>
                      <td className="p-3">{corte.largo_cortado}</td>
                      <td className="p-3">{corte.maquinas?.nombre || corte.id_maquina}</td>
                      <td className="p-3">{corte.usuarios?.nombre || corte.id_usuario}</td>
                      <td className="p-3">
                        {corte.fecha ? corte.fecha.split("T")[0] : "-"}
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(corte)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(corte.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
