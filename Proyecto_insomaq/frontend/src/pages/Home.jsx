import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { obtenerAlertas, obtenerCortes } from "../services/api";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Estado para datos de cortes por máquina por mes
  const [barData, setBarData] = useState({ labels: [], datasets: [] });
  
  // Estado para alertas recientes
  const [alertasRecientes, setAlertasRecientes] = useState([]);
  
  // Estado para cortes recientes
  const [cortesRecientes, setCortesRecientes] = useState([]);
  
  // Estado para máquinas
  const [maquinas, setMaquinas] = useState([]);

  // Estado para datos de aprovechamiento
  const [pieData, setPieData] = useState({
    labels: ["Material en cortes", "Material en retazos (desperdicio)"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["#10b981", "#ef4444"],
      },
    ],
  });

  // Paleta simple para colores de datasets
  const palette = [
    '#0b9fbf', '#1f3b63', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'
  ];

  // Función para cargar y procesar historial de cortes por máquina
  const cargarCortesPorMaquina = async () => {
    try {
      const res = await fetch('http://localhost:4000/cortes');
      if (!res.ok) throw new Error('Error al obtener datos');
      const cortes = await res.json();

      // Agrupar cortes por máquina
      const cortesMap = {};
      cortes.forEach(c => {
        const maquina = maquinas.find(m => m.id === c.id_maquina);
        const maquinaLabel = maquina ? maquina.nombre : `Máquina ${c.id_maquina}`;
        cortesMap[maquinaLabel] = (cortesMap[maquinaLabel] || 0) + 1;
      });

      const labels = Object.keys(cortesMap);
      const data = Object.values(cortesMap);

      const datasets = [{
        label: 'Cortes realizados',
        data: data,
        backgroundColor: palette.slice(0, labels.length).length > 0 ? palette : ['#0b9fbf']
      }];

      setBarData({ labels, datasets });
    } catch (err) {
      console.error('Error cargando cortes por máquina:', err);
    }
  };

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    cargarCortesPorMaquina();
    const id = setInterval(cargarCortesPorMaquina, 30000);
    return () => clearInterval(id);
  }, [maquinas]);

  // Cargar alertas recientes
  const cargarAlertas = async () => {
    try {
      const data = await obtenerAlertas();
      // Tomar solo las últimas 5 alertas (ya vienen ordenadas por fecha DESC)
      const ultimas5 = (data || []).slice(0, 5);
      setAlertasRecientes(ultimas5);
    } catch (err) {
      console.error('Error cargando alertas:', err);
    }
  };

  useEffect(() => {
    cargarAlertas();
    const id = setInterval(cargarAlertas, 30000);
    return () => clearInterval(id);
  }, []);

  // Cargar cortes recientes
  const cargarCortes = async () => {
    try {
      const data = await obtenerCortes();
      // Tomar solo los últimos 10 cortes
      const ultimos10 = (data || []).slice(0, 10);
      setCortesRecientes(ultimos10);
    } catch (err) {
      console.error('Error cargando cortes:', err);
    }
  };

  useEffect(() => {
    cargarCortes();
    const id = setInterval(cargarCortes, 30000);
    return () => clearInterval(id);
  }, []);

  // Cargar máquinas
  const cargarMaquinas = async () => {
    try {
      const res = await fetch('http://localhost:4000/maquinas');
      if (!res.ok) throw new Error('Error al obtener máquinas');
      const data = await res.json();
      setMaquinas(data || []);
    } catch (err) {
      console.error('Error cargando máquinas:', err);
    }
  };

  useEffect(() => {
    cargarMaquinas();
  }, []);

  // Cargar y calcular aprovechamiento (cortes vs retazos)
  const cargarAprovechamiento = async () => {
    try {
      const resCor = await fetch('http://localhost:4000/cortes');
      const resRet = await fetch('http://localhost:4000/retazos');
      
      if (!resCor.ok || !resRet.ok) throw new Error('Error al obtener datos');
      
      const cortes = await resCor.json();
      const retazos = await resRet.json();

      // Calcular área total de cortes
      const areaCortes = cortes.reduce((sum, c) => {
        const area = (Number(c.ancho_cortado) || 0) * (Number(c.largo_cortado) || 0);
        return sum + area;
      }, 0);

      // Calcular área total de retazos
      const areaRetazos = retazos.reduce((sum, r) => {
        const area = (Number(r.ancho) || 0) * (Number(r.largo) || 0);
        return sum + area;
      }, 0);

      const areaTotal = areaCortes + areaRetazos;
      const porcentajeCortes = areaTotal > 0 ? Math.round((areaCortes / areaTotal) * 100) : 0;
      const porcentajeRetazos = 100 - porcentajeCortes;

      setPieData({
        labels: [`Material en cortes (${porcentajeCortes}%)`, `Material en retazos (${porcentajeRetazos}%)`],
        datasets: [
          {
            data: [porcentajeCortes, porcentajeRetazos],
            backgroundColor: ["#10b981", "#ef4444"],
          },
        ],
      });
    } catch (err) {
      console.error('Error cargando aprovechamiento:', err);
    }
  };

  useEffect(() => {
    cargarAprovechamiento();
    const id = setInterval(cargarAprovechamiento, 30000);
    return () => clearInterval(id);
  }, []);

  // Opciones para gráfico de barras
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true } },
      y: { ticks: { stepSize: 2 } },
    },
  };

  // Opciones para gráfico circular
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 10, padding: 8, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="max-w-full p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Gestión de Inventario de Láminas</h1>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <button
          onClick={() => navigate("/laminas")}
          className="bg-white p-5 rounded-xl shadow text-center hover:bg-cyan-50 hover:scale-105 transition transform"
        >
          <div className="text-4xl mb-2">⬜</div>
          <p className="text-2xl font-bold">300</p>
          <span className="text-lg font-medium">Láminas</span>
        </button>

        <button
          onClick={() => navigate("/cortes")}
          className="bg-white p-5 rounded-xl shadow text-center hover:bg-cyan-50 hover:scale-105 transition transform"
        >
          <div className="text-4xl mb-2">✂️</div>
          <p className="text-2xl font-bold">58</p>
          <span className="text-lg font-medium">Cortes</span>
        </button>

        <button
          onClick={() => navigate("/retazos")}
          className="bg-white p-5 rounded-xl shadow text-center hover:bg-cyan-50 hover:scale-105 transition transform"
        >
          <div className="text-4xl mb-2">🧩</div>
          <p className="text-2xl font-bold">120</p>
          <span className="text-lg font-medium">Retazos</span>
        </button>

        <button
          onClick={() => navigate("/alertas")}
          className="bg-white p-5 rounded-xl shadow text-center hover:bg-red-50 hover:scale-105 transition transform"
        >
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-2xl font-bold">12</p>
          <span className="text-lg font-medium text-red-600">Alertas</span>
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white p-5 rounded-xl shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Historial de cortes por máquina</h2>
          <div className="w-full h-56 md:h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">Aprovechamiento de material</h2>
          <div className="w-full h-48 md:h-72 flex items-center justify-center max-w-xs md:max-w-md mx-auto">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Tablas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">Últimas actividades</h2>
          {cortesRecientes.length === 0 ? (
            <p className="text-sm text-gray-600">No hay cortes registrados.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-2">Fecha</th>
                  <th className="p-2">ID Corte</th>
                  <th className="p-2">Máquina</th>
                  <th className="p-2">Medidas</th>
                </tr>
              </thead>
              <tbody>
                {cortesRecientes.map((corte) => {
                  const maquina = maquinas.find(m => m.id === corte.id_maquina);
                  return (
                    <tr key={corte.id} className="border-b border-gray-100">
                      <td className="p-2">{new Date(corte.fecha || corte.createdAt).toLocaleDateString('es-ES')}</td>
                      <td className="p-2 font-semibold">{corte.id}</td>
                      <td className="p-2">{maquina ? maquina.nombre : `Maq. ${corte.id_maquina}`}</td>
                      <td className="p-2 text-xs">{Number(corte.ancho_cortado).toFixed(2)} × {Number(corte.largo_cortado).toFixed(2)} m</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>  

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">Últimas alertas</h2>
          {alertasRecientes.length === 0 ? (
            <p className="text-sm text-gray-600">No hay alertas.</p>
          ) : (
            <ul className="space-y-2">
              {alertasRecientes.map((a) => (
                <li key={a.id} className={`p-3 rounded text-sm ${a.leida ? 'bg-gray-50 text-gray-700' : 'bg-red-50 text-red-700 font-semibold'}`}>
                  <div>{a.mensaje}</div>
                  {a.lamina && (
                    <div className="text-xs mt-1 opacity-80">
                      Lámina ID: {a.lamina.id} ({a.lamina.tipo || 'Sin tipo'}) - Stock: {a.lamina.stock}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => navigate("/alertas")}
            className="mt-3 w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Ver todas las alertas
          </button>
        </div>
      </div>
    </div>
  );
}
