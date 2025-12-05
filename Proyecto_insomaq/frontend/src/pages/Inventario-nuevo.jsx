import React, { useEffect, useState } from "react";
import { obtenerLaminas, crearLamina, actualizarLamina, eliminarLamina, obtenerTipoLaminas } from "../services/api";

export default function Inventario() {
  const [laminas, setLaminas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({ id_tipo: "", largo: "", ancho: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [laminasData, tiposData] = await Promise.all([obtenerLaminas(), obtenerTipoLaminas()]);
      setLaminas(laminasData);
      setTipos(tiposData);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_tipo || !form.largo || !form.ancho) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const laminaData = {
        id_tipo: parseInt(form.id_tipo),
        largo: parseInt(form.largo),
        ancho: parseInt(form.ancho),
      };

      if (editId) {
        await actualizarLamina(editId, laminaData);
      } else {
        await crearLamina(laminaData);
      }

      await cargarDatos();
      setForm({ id_tipo: "", largo: "", ancho: "" });
      setEditId(null);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lamina) => {
    setForm({
      id_tipo: lamina.id_tipo,
      largo: lamina.largo,
      ancho: lamina.ancho,
    });
    setEditId(lamina.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta lámina?")) {
      try {
        setLoading(true);
        await eliminarLamina(id);
        await cargarDatos();
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-[#2a3f54] text-white py-5 shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          INVENTARIO DE LÁMINAS
        </h1>
      </header>

      <main className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-10">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Formulario */}
        <section className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            {editId ? "Editar Lámina" : "Registrar Nueva Lámina"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lámina</label>
              <select
                name="id_tipo"
                value={form.id_tipo}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecciona...</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Largo (m)</label>
              <input
                type="number"
                name="largo"
                value={form.largo}
                onChange={handleChange}
                placeholder="0"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ancho (m)</label>
              <input
                type="number"
                name="ancho"
                value={form.ancho}
                onChange={handleChange}
                placeholder="0"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all"
            >
              {loading ? "Guardando..." : editId ? "Actualizar" : "Agregar Lámina"}
            </button>
          </form>
        </section>

        {/* Tabla */}
        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            Lista de Láminas
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : (
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-800 uppercase text-left">
                <tr>
                  <th className="p-3 border-b border-gray-300">ID</th>
                  <th className="p-3 border-b border-gray-300">Tipo</th>
                  <th className="p-3 border-b border-gray-300">Largo (m)</th>
                  <th className="p-3 border-b border-gray-300">Ancho (m)</th>
                  <th className="p-3 border-b border-gray-300">Stock</th>
                  <th className="p-3 border-b border-gray-300">Stock Doble</th>
                  <th className="p-3 border-b border-gray-300">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {laminas.length > 0 ? (
                  laminas.map((lamina) => (
                    <tr key={lamina.id} className="hover:bg-gray-50 transition">
                      <td className="p-3">{lamina.id}</td>
                      <td className="p-3">{lamina.tipo_lamina?.nombre || "N/A"}</td>
                      <td className="p-3">{lamina.largo}</td>
                      <td className="p-3">{lamina.ancho}</td>
                      <td className="p-3">{lamina.stock}</td>
                      <td className="p-3">{lamina.stock_doble}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(lamina)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(lamina.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6 italic">
                      No hay láminas registradas
                    </td>
                  </tr>
                )}
              </tbody><table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-200 text-gray-800 uppercase text-left">
                  <tr>
                    <th className="p-3 border-b border-gray-300">ID</th>
                    <th className="p-3 border-b border-gray-300">Tipo</th>
                    <th className="p-3 border-b border-gray-300">Largo (m)</th>
                    <th className="p-3 border-b border-gray-300">Ancho (m)</th>
                    <th className="p-3 border-b border-gray-300">Stock</th>
                    <th className="p-3 border-b border-gray-300">Stock Doble</th>
                    <th className="p-3 border-b border-gray-300">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {laminas.length > 0 ? (
                    laminas.map((lamina) => (
                      <tr key={lamina.id} className="hover:bg-gray-50 transition">
                        <td className="p-3">{lamina.id}</td>
                        <td className="p-3">{lamina.tipo_lamina?.nombre || "N/A"}</td>
                        <td className="p-3">{lamina.largo}</td>
                        <td className="p-3">{lamina.ancho}</td>
                        <td className="p-3">{lamina.stock}</td>
                        <td className="p-3">{lamina.stock_doble}</td>

                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => handleEdit(lamina)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(lamina.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 py-6 italic">
                        No hay láminas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </table>
          )}
        </section>
      </main>
    </div>
  );
}
