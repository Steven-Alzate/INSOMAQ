import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Cortes() {
  const [cortes, setCortes] = useState([]);
  const [laminas, setLaminas] = useState([]);
  const [retazos, setRetazos] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [form, setForm] = useState({
    id_lamina: "",
    id_retazo: "",
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

  const [showLaminaModal, setShowLaminaModal] = useState(false);
  const [laminaQuery, setLaminaQuery] = useState("");
  const [modalMode, setModalMode] = useState('laminas'); // 'laminas' | 'retazos'

  const [editId, setEditId] = useState(null);
  const { user, token } = useContext(AuthContext);

  const API_URL = "http://localhost:4000/cortes";

  const fmtMeasure = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(String(v).replace(',', '.'));
    if (Number.isNaN(n)) return String(v);
    return Number(n.toFixed(2));
  };

  useEffect(() => {
    fetchCortes();
    fetchLaminas();
    fetchRetazos();
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

  const fetchRetazos = async () => {
    try {
      const res = await fetch("http://localhost:4000/retazos");
      if (!res.ok) throw new Error("Error al obtener retazos");
      const data = await res.json();
      setRetazos(Array.isArray(data) ? data.filter(r => r.disponible !== false) : []);
    } catch (err) {
      console.error("Error al obtener retazos:", err);
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
      // Primero intentar el endpoint público que no requiere token
      let res = await fetch("http://localhost:4000/usuarios/public");
      // Si el público no existe o devuelve 401/403 y tenemos token, reintentar con el endpoint protegido
      if ((res.status === 404 || res.status === 401 || res.status === 403) && token) {
        res = await fetch("http://localhost:4000/usuarios", { headers: { Authorization: `Bearer ${token}` } });
      }

      if (!res.ok) {
        console.error('Error al obtener usuarios, status:', res.status);
        return;
      }

      const data = await res.json();
      setUsuariosList(data || []);
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
    const { id_lamina, id_retazo, ancho_cortado, largo_cortado, id_maquina, id_usuario, fecha } = form;

    if ((!id_lamina && !id_retazo) || !ancho_cortado || !largo_cortado || !id_maquina || !id_usuario || !fecha) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Si seleccionó una lámina, validar medidas contra la lámina
    if (id_lamina) {
      const lam = laminas.find((l) => String(l.id) === String(id_lamina));
      if (lam) {
        const anchoLamina = Number(lam.ancho) || 0;
        const largoLamina = Number(lam.largo) || 0;
        const anchoReq = Number(ancho_cortado);
        const largoReq = Number(largo_cortado);

        if (anchoReq > anchoLamina || largoReq > largoLamina) {
          alert("No es posible: las medidas solicitadas superan las dimensiones de la lámina seleccionada.");
          return;
        }
      }
    }

    // Si seleccionó un retazo, validar medidas contra el retazo
    if (id_retazo) {
      const rz = retazos.find((r) => String(r.id) === String(id_retazo));
      if (rz) {
        const anchoR = Number(rz.ancho) || 0;
        const largoR = Number(rz.largo) || 0;
        if (Number(ancho_cortado) > anchoR || Number(largo_cortado) > largoR) {
          alert("No es posible: las medidas solicitadas superan las dimensiones del retazo seleccionado.");
          return;
        }
      }
    }

    try {
      // Asegurar que ancho_cortado y largo_cortado se envíen como números (decimales posibles)
      const corteData = {
        ...(id_retazo ? { id_retazo } : { id_lamina }),
        ancho_cortado: parseFloat(String(ancho_cortado).replace(',', '.')),
        largo_cortado: parseFloat(String(largo_cortado).replace(',', '.')),
        id_maquina,
        id_usuario,
        fecha
      };

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
        id_retazo: "",
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
            className="flex flex-wrap items-center gap-4"
          >
            {/* Botón que abre modal para seleccionar lámina */}
            <div className="flex-1 min-w-[200px]">
              <button 
                type="button" 
                onClick={() => setShowLaminaModal(true)} 
                className="w-full text-left border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-white hover:bg-gray-50 transition text-sm"
              >
                {(() => {
                  if (form.id_retazo) {
                    const rz = retazos.find((r) => String(r.id) === String(form.id_retazo));
                    if (rz) return `Retazo ID ${rz.id} - ${fmtMeasure(rz.largo)} x ${fmtMeasure(rz.ancho)}`;
                    return 'Retazo seleccionado';
                  }
                  const l = laminas.find((x) => String(x.id) === String(form.id_lamina));
                  if (l) return 'ID ' + l.id + ' - ' + (l.tipo || `${fmtMeasure(l.largo)} x ${fmtMeasure(l.ancho)}`);
                  return 'Selecciona lámina/retazo';
                })()}
              </button>
              <input type="hidden" name="id_lamina" value={form.id_lamina} />
              <input type="hidden" name="id_retazo" value={form.id_retazo} />
            </div>

            {/* Ancho cortado */}
            <div className="flex-1 min-w-[90px]">
              <input
                type="number"
                step="0.01"
                name="ancho_cortado"
                value={form.ancho_cortado}
                onChange={handleChange}
                placeholder="Ancho"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>

            {/* Largo cortado */}
            <div className="flex-1 min-w-[90px]">
              <input
                type="number"
                step="0.01"
                name="largo_cortado"
                value={form.largo_cortado}
                onChange={handleChange}
                placeholder="Largo"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>

            {/* Máquina */}
            <div className="flex-1 min-w-[140px]">
              <select
                name="id_maquina"
                value={form.id_maquina}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              >
                <option value="">Máquina</option>
                {maquinas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre || `ID ${m.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuario */}
            <div className="flex-1 min-w-[140px]">
              <select
                name="id_usuario"
                value={form.id_usuario}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              >
                <option value="">Usuario</option>
                {usuariosList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="flex-1 min-w-[140px]">
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>
          </form>

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all mt-4"
          >
            {editId ? "Actualizar Corte" : "Agregar Corte"}
          </button>
        </div>

        {/* Modal de selección de lámina */}
        {showLaminaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowLaminaModal(false)} />
            <div className="relative bg-white w-11/12 max-w-3xl rounded-lg shadow-lg p-4 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Selecciona</h3>
                  <div className="flex bg-gray-100 rounded overflow-hidden">
                    <button type="button" onClick={() => setModalMode('laminas')} className={`px-3 py-1 ${modalMode==='laminas' ? 'bg-white font-semibold' : 'text-gray-600'}`}>Láminas</button>
                    <button type="button" onClick={() => setModalMode('retazos')} className={`px-3 py-1 ${modalMode==='retazos' ? 'bg-white font-semibold' : 'text-gray-600'}`}>Retazos</button>
                  </div>
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
                {modalMode === 'laminas' ? (
                  laminas.length === 0 ? (
                    <p className="text-gray-500">No hay láminas disponibles.</p>
                  ) : (() => {
                    const q = (laminaQuery || "").toString().trim().toLowerCase();
                    const filtered = laminas.filter((l) => {
                      if (!q) return true;
                      const parts = [String(l.id), (l.tipo || "").toString(), String(l.ancho || ""), String(l.largo || ""), String(l.stock || "")].join(" ").toLowerCase();
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
                                <button type="button" onClick={() => { setForm((f) => ({ ...f, id_lamina: String(l.id), id_retazo: "" })); setShowLaminaModal(false); }} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Seleccionar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()
                ) : (
                  // Mostrar retazos
                  retazos.length === 0 ? (
                    <p className="text-gray-500">No hay retazos disponibles.</p>
                  ) : (() => {
                    const q = (laminaQuery || "").toString().trim().toLowerCase();
                    const filtered = retazos.filter((r) => {
                      if (!q) return true;
                      const parts = [String(r.id), String(r.id_lamina_original || ""), String(r.ancho || ""), String(r.largo || ""), String(r.id_maquina || "")].join(" ").toLowerCase();
                      return parts.includes(q);
                    });

                    if (filtered.length === 0) return <p className="text-gray-500">No se encontraron retazos para la búsqueda.</p>;

                    return (
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="text-left text-sm text-gray-600 border-b">
                            <th className="py-2">ID</th>
                            <th className="py-2">Lámina Orig.</th>
                            <th className="py-2">Ancho (m)</th>
                            <th className="py-2">Largo (m)</th>
                            <th className="py-2">Stock</th>
                            <th className="py-2">Máquina</th>
                            <th className="py-2 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="py-2">{(() => { const lam = laminas.find((x) => String(x.id) === String(r.id_lamina_original)); return lam ? (lam.tipo || `${fmtMeasure(lam.largo)} x ${fmtMeasure(lam.ancho)}`) : `Retazo ${r.id}` })()}</td>
                              <td className="py-2">{r.id_lamina_original ?? '-'}</td>
                              <td className="py-2">{r.ancho !== undefined && r.ancho !== null ? (Number.isNaN(Number(r.ancho)) ? '-' : Number(parseFloat(r.ancho).toFixed(1))) : '-'}</td>
                              <td className="py-2">{r.largo !== undefined && r.largo !== null ? (Number.isNaN(Number(r.largo)) ? '-' : Number(parseFloat(r.largo).toFixed(1))) : '-'}</td>
                              <td className="py-2">{r.stock !== undefined && r.stock !== null ? r.stock : '1'}</td>
                              <td className="py-2">{(() => { const m = maquinas.find((x) => String(x.id) === String(r.id_maquina)); return m ? m.nombre : (r.id_maquina ?? '-'); })()}</td>
                              <td className="py-2 text-right">
                                <button type="button" onClick={() => { setForm((f) => ({ ...f, id_retazo: String(r.id), id_lamina: String(r.id_lamina_original || '') })); setShowLaminaModal(false); }} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Seleccionar retazo</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        )}

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
                        <td className="p-3">{fmtMeasure(corte.ancho_cortado)}</td>
                        <td className="p-3">{fmtMeasure(corte.largo_cortado)}</td>
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
