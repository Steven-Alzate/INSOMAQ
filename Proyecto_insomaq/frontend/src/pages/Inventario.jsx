import React, { useEffect, useState } from "react";

export default function Inventario() {
  const [laminas, setLaminas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({ largo: "", ancho: "", tipo_lamina: "", stock: "" });
  const [filters, setFilters] = useState({ largo: "", ancho: "", tipo: "" });
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:4000/laminas";

  useEffect(() => {
    fetchLaminas();
    fetchTipos();
  }, []);

  const fetchLaminas = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener láminas");
      const data = await res.json();
      setLaminas(data);
    } catch (err) {
      console.error("Error al obtener las láminas:", err);
    }
  };

  const fetchTipos = async () => {
    try {
      const res = await fetch("http://localhost:4000/tipo-laminas");
      if (!res.ok) throw new Error("Error al obtener tipos");
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      console.error("Error al obtener tipos:", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  // Formatea un valor numérico solo para mostrar en UI (sin truncar)
  const formatDisplay = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const n = parseFloat(val);
    if (Number.isNaN(n)) return "";
    return String(n);
  };

  const handleDecimalBlur = (e) => {
    const { name, value } = e.target;
    if (value === undefined || value === null || value === "") return;
    // Solo validar que sea número, no redondear
    const n = parseFloat(value);
    if (!Number.isNaN(n)) {
      setForm((prev) => ({ ...prev, [name]: String(n) }));
    }
  };
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ largo: "", ancho: "", tipo: "" });

  const filtered = laminas.filter((lamina) => {
    const matchesLargo = !filters.largo || String(lamina.largo).includes(String(filters.largo));
    const matchesAncho = !filters.ancho || String(lamina.ancho).includes(String(filters.ancho));
    const matchesTipo = !filters.tipo || (lamina.tipo || "").toLowerCase().includes(filters.tipo.toLowerCase());
    return matchesLargo && matchesAncho && matchesTipo;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Si estamos creando, validar todos los campos; si estamos editando, solo stock es obligatorio
    if (!editId && (!form.largo || !form.ancho || !form.tipo_lamina)) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      let tipoExistente = tipos.find((t) => t.tipo_lamina.toLowerCase() === form.tipo_lamina.toLowerCase());
      let id_tipo;
      if (tipoExistente) {
        id_tipo = tipoExistente.id;
      } else {
        const resTipo = await fetch("http://localhost:4000/tipo-laminas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo_lamina: form.tipo_lamina }),
        });
        const dataTipo = await resTipo.json();
        if (!resTipo.ok) throw new Error(dataTipo.error || "Error al crear tipo");
        id_tipo = dataTipo.id;
        await fetchTipos();
      }

      // Pasar valores directos sin redondear
      const laminaData = {
        largo: form.largo === "" || form.largo === null || form.largo === undefined ? null : Number(parseFloat(form.largo)),
        ancho: form.ancho === "" || form.ancho === null || form.ancho === undefined ? null : Number(parseFloat(form.ancho)),
        id_tipo,
        stock: form.stock ? Number(form.stock) : 0
      };

      const options = {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(laminaData),
      };

      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al guardar la lámina");

      alert(data.message || "Operación exitosa");
      setForm({ largo: "", ancho: "", tipo_lamina: "", stock: "" });
      setEditId(null);
      fetchLaminas();
    } catch (err) {
      console.error("Error al guardar la lámina:", err);
      alert(err.message || err);
    }
  };

  const handleEdit = (lamina) => {
    setForm({
      largo: lamina.largo !== undefined && lamina.largo !== null ? String(lamina.largo) : "",
      ancho: lamina.ancho !== undefined && lamina.ancho !== null ? String(lamina.ancho) : "",
      tipo_lamina: lamina.tipo || "",
      stock: lamina.stock !== undefined && lamina.stock !== null ? String(lamina.stock) : "",
    });
    setEditId(lamina.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta lámina?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Error al eliminar");
      }
      alert(data.message || "Lámina eliminada");
      fetchLaminas();
    } catch (err) {
      console.error("Error al eliminar la lámina:", err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-[#2a3f54] text-white py-5 shadow-lg">
        <h1 className="text-3xl font-semibold text-center">INVENTARIO DE LÁMINAS</h1>
      </header>

      <main className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-10">
        <section className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">{editId ? "Editar Lámina" : "Registrar Nueva Lámina"}</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <input type="number" name="largo" value={form.largo} onChange={handleChange} onBlur={handleDecimalBlur} placeholder="Largo" disabled={!!editId} className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">m</span>
            </div>

            <div className="relative">
              <input type="number" name="ancho" value={form.ancho} onChange={handleChange} onBlur={handleDecimalBlur} placeholder="Ancho" disabled={!!editId} className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">m</span>
            </div>

            <div>
              <input list="tipos-lista" name="tipo_lamina" value={form.tipo_lamina || ""} onChange={(e) => setForm({ ...form, tipo_lamina: e.target.value })} placeholder="Selecciona o escribe un tipo de lámina" disabled={!!editId} className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <datalist id="tipos-lista">{tipos.map((tipo) => (<option key={tipo.id} value={tipo.tipo_lamina} />))}</datalist>
            </div>

            <div>
              <input type="number" name="stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <button type="submit" className="md:col-span-4 bg-teal-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all">{editId ? "Actualizar Lámina" : "Agregar Lámina"}</button>
          </form>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">Lista de Láminas</h2>

          <div className="mb-4 flex flex-col md:flex-row gap-3 items-center">
            <input type="number" name="largo" value={filters.largo} onChange={handleFilterChange} placeholder="Filtrar por largo (m)" className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4" />
            <input type="number" name="ancho" value={filters.ancho} onChange={handleFilterChange} placeholder="Filtrar por ancho (m)" className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4" />
            <select name="tipo" value={filters.tipo} onChange={handleFilterChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4"><option value="">Todos los tipos</option>{tipos.map((t) => (<option key={t.id} value={t.tipo_lamina}>{t.tipo_lamina}</option>))}</select>
            <div className="w-full md:w-auto"><button onClick={clearFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded" type="button">Limpiar filtros</button></div>
          </div>

          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-800 uppercase text-left">
              <tr>
                <th className="p-3 border-b border-gray-300">ID</th>
                <th className="p-3 border-b border-gray-300">Largo</th>
                <th className="p-3 border-b border-gray-300">Ancho</th>
                <th className="p-3 border-b border-gray-300">Tipo</th>
                <th className="p-3 border-b border-gray-300">Stock</th>
                <th className="p-3 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((lamina) => (
                  <tr key={lamina.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">{lamina.id}</td>
                    <td className="p-3">{lamina.largo !== undefined && lamina.largo !== "" ? `${lamina.largo} m` : "0 mts"}</td>
                    <td className="p-3">{lamina.ancho !== undefined && lamina.ancho !== "" ? `${lamina.ancho} m` : "0 mts"}</td>
                    <td className="p-3">{lamina.tipo}</td>
                    <td className="p-3">{lamina.stock !== undefined && lamina.stock !== null ? lamina.stock : "0"}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEdit(lamina)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Editar</button>
                      <button onClick={() => handleDelete(lamina.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-6 italic">No hay láminas que coincidan con los filtros</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
