import React, { useEffect, useState } from 'react';
import { obtenerAlertasLowStock, obtenerAlertas, marcarAlertaLeida } from '../services/api';

function fmt(num) {
  if (num === null || num === undefined) return '';
  const n = Number.parseFloat(num);
  if (Number.isNaN(n)) return '';
  // Mostrar hasta 2 decimales, quitar ceros innecesarios
  return n.toFixed(2).replace(/\.0+$|(?<=(\.\d+?))0+$/,'');
}

export default function Alertas() {
  const [low, setLow] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingLow, setLoadingLow] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [error, setError] = useState(null);

  const fetchLow = async () => {
    try {
      setLoadingLow(true);
      setError(null);
      const data = await obtenerAlertasLowStock();
      // data.laminas expected
      setLow(data.laminas || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al obtener láminas con stock bajo');
    } finally {
      setLoadingLow(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      setError(null);
      const data = await obtenerAlertas();
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al obtener alertas');
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchLow();
    fetchAlerts();
  }, []);

  const handleMarcarLeida = async (id) => {
    try {
      await marcarAlertaLeida(id);
      // refrescar lista de alertas
      fetchAlerts();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al marcar alerta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-[#2a3f54] text-white py-5 shadow-lg">
        <h1 className="text-3xl font-semibold text-center">ALERTAS</h1>
      </header>

      {/* Botones de Refresh */}
      <div className="w-full px-7 py-4 bg-white shadow-sm flex gap-3 justify-center">
        <button 
          onClick={fetchLow} 
          disabled={loadingLow}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition"
        >
          {loadingLow ? 'Cargando...' : 'Refrescar Stock Bajo'}
        </button>
        <button 
          onClick={fetchAlerts} 
          disabled={loadingAlerts}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
        >
          {loadingAlerts ? 'Cargando...' : 'Refrescar Alertas'}
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 w-full mx-auto px-7 py-8 flex flex-col gap-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Láminas con Stock Bajo */}
        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">Láminas con Stock Bajo</h2>
          {loadingLow ? (
            <div className="text-center text-gray-600 py-6">Cargando...</div>
          ) : low.length === 0 ? (
            <div className="text-center text-gray-600 py-6">No hay láminas con stock bajo.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {low.map(l => (
                <div key={l.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="font-semibold text-lg text-[#2a3f54] mb-2">ID: {l.id}</div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><span className="font-medium">Tipo:</span> {l.tipo || 'Sin especificar'}</div>
                    <div><span className="font-medium">Dimensiones:</span> {fmt(l.ancho)} × {fmt(l.largo)} m</div>
                    <div className="text-red-600 font-semibold"><span className="font-medium">Stock:</span> {l.stock}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Alertas Creadas */}
        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-[#2a3f54] text-2xl font-semibold mb-6 border-b pb-2">Alertas Creadas</h2>
          {loadingAlerts ? (
            <div className="text-center text-gray-600 py-6">Cargando alertas...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center text-gray-600 py-6">No hay alertas registradas.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map(a => (
                <div 
                  key={a.id} 
                  className={`border rounded-lg p-4 transition ${
                    a.leida 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-2">{a.mensaje}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium">Tipo:</span> {a.tipo}</div>
                        <div><span className="font-medium">Fecha:</span> {new Date(a.fecha).toLocaleString('es-ES')}</div>
                        {a.lamina && (
                          <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
                            <div className="font-medium text-gray-800">Lámina ID: {a.lamina.id}</div>
                            <div className="text-sm mt-2 space-y-1">
                              <div><span className="font-medium">Tipo:</span> {a.lamina.tipo || 'Sin tipo'}</div>
                              <div><span className="font-medium">Dimensiones:</span> {fmt(a.lamina.ancho)} × {fmt(a.lamina.largo)} m</div>
                              <div className="text-red-600"><span className="font-medium">Stock:</span> {a.lamina.stock}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!a.leida && (
                        <button 
                          onClick={() => handleMarcarLeida(a.id)} 
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap"
                        >
                          Marcar Leída
                        </button>
                      )}
                      {a.leida && (
                        <div className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold text-center">
                          Leída
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
