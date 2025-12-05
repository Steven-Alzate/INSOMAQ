import React, { useEffect, useState } from "react";

export default function Maquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:4000/maquinas";

  // 🔹 Cargar todas las máquinas
  useEffect(() => {
    fetchMaquinas();
  }, []);

  const fetchMaquinas = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener las máquinas");
      const data = await res.json();
      setMaquinas(data);
    } catch (err) {
      console.error("Error al obtener las máquinas:", err);
    }
  };

  // 🔹 Manejar inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Crear o actualizar máquina
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.descripcion) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Validar que no exista una máquina con el mismo nombre
    const nombreTrimmed = form.nombre.trim().toLowerCase();
    const maquinaExistente = maquinas.find(m => 
      m.nombre.toLowerCase() === nombreTrimmed && m.id !== editId
    );

    if (maquinaExistente) {
      alert("Ya existe una máquina con este nombre. Por favor, elige otro nombre.");
      return;
    }

    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/${editId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en la operación");

      alert(data.message || "Operación exitosa");
      setForm({ nombre: "", descripcion: "" });
      setEditId(null);
      fetchMaquinas();
    } catch (err) {
      console.error("Error al guardar la máquina:", err);
      alert(err.message);
    }
  };

  // 🔹 Editar máquina
  const handleEdit = (maq) => {
    setForm({ nombre: maq.nombre, descripcion: maq.descripcion });
    setEditId(maq.id);
  };

  // 🔹 Eliminar máquina
  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta máquina?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al eliminar la máquina");
        alert(data.message || "Máquina eliminada exitosamente");
        fetchMaquinas();
      } catch (err) {
        console.error("Error al eliminar la máquina:", err);
        alert(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-[#2a3f54] text-white py-5 shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          INVENTARIO DE MÁQUINAS
        </h1>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-10">
        {/* Formulario */}
        <section className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            {editId ? "Editar Máquina" : "Registrar Nueva Máquina"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Nombre */}
            <div>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre de la máquina"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción de la máquina"
                rows="3"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="md:col-span-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all"
            >
              {editId ? "Actualizar Máquina" : "Agregar Máquina"}
            </button>
          </form>
        </section>

        {/* Tabla */}
        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            Lista de Máquinas
          </h2>

          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-800 uppercase text-left">
              <tr>
                <th className="p-3 border-b border-gray-300">ID</th>
                <th className="p-3 border-b border-gray-300">Nombre</th>
                <th className="p-3 border-b border-gray-300">Descripción</th>
                <th className="p-3 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {maquinas.length > 0 ? (
                maquinas.map((maq) => (
                  <tr key={maq.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">{maq.id}</td>
                    <td className="p-3">{maq.nombre}</td>
                    <td className="p-3">{maq.descripcion}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(maq)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(maq.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No hay máquinas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
