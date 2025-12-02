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

  // Paleta simple para colores de datasets
  const palette = [
    '#0b9fbf', '#1f3b63', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'
  ];

  // Función para cargar datos desde backend
  const cargarCortesPorMes = async () => {
    try {
      const res = await fetch('http://localhost:4000/cortes/por-mes');
      if (!res.ok) throw new Error('Error al obtener datos');
      const json = await res.json();

      // json: { labels: ['2024-01', ...], datasets: [{ id, label, data: [...] }, ...] }
      const datasets = (json.datasets || []).map((d, idx) => ({
        label: d.label,
        data: d.data,
        backgroundColor: palette[idx % palette.length]
      }));

      // Formatear labels a 'MMM YYYY' para mostrar si se desea
      const labels = (json.labels || []).map(l => {
        const [y, m] = l.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        return date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
      });

      setBarData({ labels, datasets });
    } catch (err) {
      console.error('Error cargando cortes por mes:', err);
    }
  };

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    cargarCortesPorMes();
    const id = setInterval(cargarCortesPorMes, 30000);
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

  // Datos para gráfico circular
  const pieData = {
    labels: ["Usado 65%", "Desperdicio 35%"],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ["#0b9fbf", "#1f3b63"],
      },
    ],
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
        <div className="text-2xl">🔔 👤</div>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <button
          onClick={() => navigate("/laminas")}
          className="bg-white p-5 rounded-xl shadow text-center hover:bg-cyan-50 hover:scale-105 transition transform"
        >
          <div className="text-4xl mb-2">📚</div>
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
          <div className="text-4xl mb-2">⛏️</div>
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
          <h2 className="text-xl font-semibold mb-3">Cortes por máquina</h2>
          <div className="w-full h-56 md:h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">% de aprovechamiento</h2>
          <div className="w-full h-48 md:h-72 flex items-center justify-center max-w-xs md:max-w-md mx-auto">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Tablas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">Últimas actividades</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-2">Fecha</th>
                <th className="p-2">Acción</th>
                <th className="p-2">Usuario</th>
                <th className="p-2">Máquina</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-2">15/09/2025</td>
                <td className="p-2">Corte realizado (L001)</td>
                <td className="p-2">Juan</td>
                <td className="p-2">CNC-01</td>
              </tr>
              <tr>
                <td className="p-2">15/09/2025</td>
                <td className="p-2">Nueva lámina registrada</td>
                <td className="p-2">María</td>
                <td className="p-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>  

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">Alertas</h2>
          <ul className="list-disc pl-5 text-sm">
            <li>Lámina de acero 2mm: stock bajo (2 unidades).</li>
            <li>Lamina de aluminio 3mm: stock bajo (1 unidad).</li>
            <li className="text-red-600 font-bold">
              Lamina de acero inoxidable 2mm: sin stock (0 unidades).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
