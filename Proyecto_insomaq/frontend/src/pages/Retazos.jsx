import React, { useEffect, useState } from "react";

export default function Retazos() {
  const [retazos, setRetazos] = useState([]);
  const [laminas, setLaminas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);

  const [form, setForm] = useState({
    id_lamina_original: "",
    largo: "",
    ancho: "",
    id_maquina: "",
    fecha: "",
  });

  const [editId, setEditId] = useState(null);
  const API_URL = "http://localhost:4000/retazos";

  const fmtMeasure = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(String(v).replace(',', '.'));
    if (Number.isNaN(n)) return String(v);
    const rounded = Math.round(n * 1000) / 1000;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  };

  useEffect(() => {
    fetchRetazos();
    fetchLaminas();
    fetchMaquinas();
  }, []);

  const fetchRetazos = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener retazos");
      const data = await res.json();
      setRetazos(data);
    } catch (err) {
      console.error("Error al obtener retazos:", err);
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
      if (!res.ok) throw new Error("Error al obtener las máquinas");
      const data = await res.json();
      setMaquinas(data);
    } catch (err) {
      console.error("Error al obtener máquinas:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_lamina_original, largo, ancho, id_maquina, fecha } = form;

    if (!id_lamina_original || !largo || !ancho || !id_maquina) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      // Enviar largo/ancho como números (aceptar coma o punto como separador)
      const payload = {
        ...form,
        largo: parseFloat(String(largo).replace(',', '.')),
        ancho: parseFloat(String(ancho).replace(',', '.'))
      };
      // Si el frontend usa 'fecha' mapeamos a lo que el backend espera (campo fecha)
      const options = {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el retazo");

      alert(data.message || "Operación exitosa");
      setForm({ id_lamina_original: "", largo: "", ancho: "", id_maquina: "", fecha: "" });
      setEditId(null);
      fetchRetazos();
    } catch (err) {
      console.error("Error al guardar retazo:", err);
      alert(err.message);
    }
  };

  const handleEdit = (retazo) => {
    setForm({
      id_lamina_original: retazo.id_lamina_original,
      largo: retazo.largo,
      ancho: retazo.ancho,
      id_maquina: retazo.id_maquina,
      fecha: retazo.fecha ? retazo.fecha.split("T")[0] : "",
    });
    setEditId(retazo.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este retazo?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al eliminar");
        alert(data.message || "Retazo eliminado");
        fetchRetazos();
      } catch (err) {
        console.error("Error al eliminar retazo:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-[#2a3f54] text-white py-5 shadow-lg">
        <h1 className="text-3xl font-semibold text-center">Retazos</h1>
      </header>

      <main className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-10">
        
        {/* Formulario */}
        <section className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            {editId ? "Editar Retazo" : "Registrar Nuevo Retazo"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">

            {/* Lámina Original */}
            <div className="flex-1 min-w-[180px]">
              <select
                name="id_lamina_original"
                value={form.id_lamina_original}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecciona lámina</option>
                {laminas.map((lamina) => (
                  <option key={lamina.id ?? `lam-${Math.random()}`} value={lamina.id}>
                    {lamina.tipo ?? "Sin tipo"} - {fmtMeasure(lamina.largo)}m x {fmtMeasure(lamina.ancho)}m
                  </option>
                ))}
              </select>
            </div>

            {/* Largo */}
            <div className="relative flex-1 min-w-[90px]">
              <input
                type="number"
                step="0.01"
                name="largo"
                value={form.largo}
                onChange={handleChange}
                placeholder="Largo"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">m</span>
            </div>

            {/* Ancho */}
            <div className="relative flex-1 min-w-[90px]">
              <input
                type="number"
                step="0.01"
                name="ancho"
                value={form.ancho}
                onChange={handleChange}
                placeholder="Ancho"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">m</span>
            </div>

            {/* Máquina */}
            <div className="flex-1 min-w-[140px]">
              <select
                name="id_maquina"
                value={form.id_maquina}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecciona máquina</option>
                {maquinas.map((maq) => (
                  <option key={maq.id ?? `maq-${Math.random()}`} value={maq.id}>
                    {maq.nombre ?? maq.tipo ?? `Máquina #${maq.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Corte */}
            <div className="flex-1 min-w-[140px]">
              <input
                type="date"
                name="fecha_corte"
                value={form.fecha_corte}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Botón grande abajo */}
            <div className="w-full mt-4">
              <button
                type="submit"
                className="md:col-span-3 bg-teal-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all w-full"
              >
                {editId ? "Actualizar Retazo" : "Agregar Retazo"}
              </button>
            </div>
          </form>
        </section>

        {/* Tabla */}
        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            Lista de Retazos
          </h2>

          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-800 uppercase text-left">
              <tr>
                <th className="p-3 border-b border-gray-300">ID</th>
                <th className="p-3 border-b border-gray-300">Lámina Original</th>
                <th className="p-3 border-b border-gray-300">Largo</th>
                <th className="p-3 border-b border-gray-300">Ancho</th>
                <th className="p-3 border-b border-gray-300">Máquina</th>
                <th className="p-3 border-b border-gray-300">Fecha Corte</th>
                <th className="p-3 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {retazos.length > 0 ? (
                retazos.map((retazo) => (
                  <tr key={retazo.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">{retazo.id}</td>
                    <td className="p-3">
                      {laminas.find((l) => l.id === retazo.id_lamina_original)?.tipo || "Desconocida"}
                    </td>
                    <td className="p-3">{fmtMeasure(retazo.largo)} m</td>
                    <td className="p-3">{fmtMeasure(retazo.ancho)} m</td>
                    <td className="p-3">{retazo.maquina || (maquinas.find((m) => m.id === retazo.id_maquina)?.nombre) || retazo.id_maquina}</td>
                    <td className="p-3">{retazo.fecha ? retazo.fecha.split("T")[0] : (retazo.fecha_corte ? retazo.fecha_corte.split("T")[0] : "-")}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(retazo)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(retazo.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-6 italic">
                    No hay retazos registrados
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
