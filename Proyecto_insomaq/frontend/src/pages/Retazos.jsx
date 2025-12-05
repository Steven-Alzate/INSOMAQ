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
    stock: "",
  });

  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({ id_lamina_original: "", id_maquina: "", fecha_from: "", fecha_to: "" });
  const [showLaminaModal, setShowLaminaModal] = useState(false);
  const [laminaQuery, setLaminaQuery] = useState("");
  const API_URL = "http://localhost:4000/retazos";

  const fmtMeasure = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(String(v).replace(',', '.'));
    if (Number.isNaN(n)) return String(v);
    return Number(n.toFixed(2));
  };

  useEffect(() => {
    fetchRetazos();
    fetchLaminas();
    fetchMaquinas();
  }, []);

  

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ id_lamina_original: "", id_maquina: "", fecha_from: "", fecha_to: "" });
  };

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
      // incluir stock si existe
      if (form.stock !== undefined && form.stock !== "") payload.stock = Number(form.stock);
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
      stock: retazo.stock !== undefined && retazo.stock !== null ? String(retazo.stock) : "",
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
        <h1 className="text-3xl font-semibold text-center">RETAZOS</h1>
      </header>

      <main className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-10">
        
        {/* Formulario */}
        <section className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">
            {editId ? "Editar Retazo" : "Registrar Nuevo Retazo"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">

            {/* Lámina Original */}
            <div className="flex-1 min-w-[140px]">
              <button type="button" onClick={() => setShowLaminaModal(true)} className="border border-gray-300 rounded-lg px-4 py-3 w-full text-left bg-white">
                {(() => {
                  const l = laminas.find((x) => String(x.id) === String(form.id_lamina_original));
                  if (l) return `${l.tipo ?? 'Sin tipo'} - ${fmtMeasure(l.largo)}m x ${fmtMeasure(l.ancho)}m`;
                  return 'Selecciona lámina';
                })()}
              </button>
              <input type="hidden" name="id_lamina_original" value={form.id_lamina_original} />
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

            {/* Stock */}
            <div className="relative flex-1 min-w-[90px]">
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
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

        {/* Modal de selección de lámina/retazo (copiado de Cortes) */}
        {showLaminaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowLaminaModal(false)} />
            <div className="relative bg-white w-11/12 max-w-3xl rounded-lg shadow-lg p-4 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">Selecciona lámina</h3>
                  </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={laminaQuery}
                    onChange={(e) => setLaminaQuery(e.target.value)}
                    placeholder="Buscar por ID, tipo, ancho, largo, stock o retazo"
                    className="border border-gray-300 rounded-md p-2 w-full sm:w-80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLaminaModal(false)}
                    className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-auto">
                {laminas.length === 0 ? (
                  <p className="text-gray-500">No hay láminas disponibles.</p>
                ) : (() => {
                  const q = (laminaQuery || "").toString().trim().toLowerCase();
                  const filtered = laminas.filter((l) => {
                    if (!q) return true;
                    const parts = [String(l.id), (l.tipo || ""), String(l.ancho || ""), String(l.largo || ""), String(l.stock || "")].join(" ").toLowerCase();
                    return parts.includes(q);
                  });

                  if (filtered.length === 0) return <p className="text-gray-500">No se encontraron láminas para la búsqueda.</p>;

                  return (
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="text-left text-sm text-gray-600 border-b">
                          <th className="py-2">ID</th>
                          <th className="py-2">Tipo</th>
                          <th className="py-2">Ancho (m)</th>
                          <th className="py-2">Largo (m)</th>
                          <th className="py-2">Stock</th>
                          <th className="py-2 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((l) => (
                          <tr key={l.id} className="hover:bg-gray-50">
                            <td className="py-2">{l.id}</td>
                            <td className="py-2">{l.tipo || '-'}</td>
                            <td className="py-2">{l.ancho !== undefined && l.ancho !== null ? (Number.isNaN(Number(l.ancho)) ? '-' : Number(parseFloat(l.ancho).toFixed(2))) : '-'}</td>
                            <td className="py-2">{l.largo !== undefined && l.largo !== null ? (Number.isNaN(Number(l.largo)) ? '-' : Number(parseFloat(l.largo).toFixed(2))) : '-'}</td>
                            <td className="py-2">{l.stock ?? '-'}</td>
                            <td className="py-2 text-right">
                              <button type="button" onClick={() => { setForm((f) => ({ ...f, id_lamina_original: String(l.id) })); setShowLaminaModal(false); }} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Seleccionar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tabla */}
        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[#2a3f54] text-2xl font-semibold">Lista de Retazos</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-center">
              <select
                name="id_lamina_original"
                value={filters.id_lamina_original}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
              >
                <option value="">Todas las láminas</option>
                {laminas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {`ID ${l.id} - ${l.tipo || `${fmtMeasure(l.largo)}x${fmtMeasure(l.ancho)}`}`}
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

              <input
                type="date"
                name="fecha_from"
                value={filters.fecha_from}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/6"
                placeholder="Desde"
              />

              <input
                type="date"
                name="fecha_to"
                value={filters.fecha_to}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/6"
                placeholder="Hasta"
              />

              <div className="w-full md:w-auto">
                <button onClick={clearFilters} type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Limpiar filtros</button>
              </div>
            </div>
          </div>

          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-800 uppercase text-left">
              <tr>
                <th className="p-3 border-b border-gray-300">ID</th>
                <th className="p-3 border-b border-gray-300">Lámina Original</th>
                <th className="p-3 border-b border-gray-300">Largo</th>
                <th className="p-3 border-b border-gray-300">Ancho</th>
                <th className="p-3 border-b border-gray-300">Stock</th>
                <th className="p-3 border-b border-gray-300">Máquina</th>
                <th className="p-3 border-b border-gray-300">Fecha Corte</th>
                <th className="p-3 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {(() => {
                const filteredByFilters = retazos.filter((r) => {
                  const matchLamina = !filters.id_lamina_original || String(r.id_lamina_original) === String(filters.id_lamina_original);
                  const matchMaquina = !filters.id_maquina || String(r.id_maquina) === String(filters.id_maquina);
                  const fechaVal = r.fecha ? r.fecha.split("T")[0] : (r.fecha_corte ? r.fecha_corte.split("T")[0] : null);
                  const matchFechaFrom = !filters.fecha_from || (fechaVal && fechaVal >= filters.fecha_from);
                  const matchFechaTo = !filters.fecha_to || (fechaVal && fechaVal <= filters.fecha_to);
                  return matchLamina && matchMaquina && matchFechaFrom && matchFechaTo;
                });

                if (filteredByFilters.length === 0) {
                  return (
                    <tr>
                      <td colSpan="8" className="text-center text-gray-500 py-6 italic">
                        No hay retazos que coincidan con los filtros
                      </td>
                    </tr>
                  );
                }

                return filteredByFilters.map((retazo) => (
                  <tr key={retazo.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">{retazo.id}</td>
                    <td className="p-3">
                      {laminas.find((l) => l.id === retazo.id_lamina_original)?.tipo || "Desconocida"}
                    </td>
                    <td className="p-3">{fmtMeasure(retazo.largo)} m</td>
                    <td className="p-3">{fmtMeasure(retazo.ancho)} m</td>
                    <td className="p-3">{retazo.stock !== undefined && retazo.stock !== null ? retazo.stock : '1'}</td>
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
                ));
              })()}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
