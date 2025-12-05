import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
} from 'lucide-react';
import type { PolicyStatistics, PolicySimulation } from '../types';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/mathUtils';

interface StatisticsProps {
  policy1Stats: PolicyStatistics | null;
  policy2Stats: PolicyStatistics | null;
  optimalStats: PolicyStatistics | null;
  policy1Simulation: PolicySimulation | null;
  policy2Simulation: PolicySimulation | null;
  optimalSimulation: PolicySimulation | null;
}

const Statistics: React.FC<StatisticsProps> = ({
  policy1Stats,
  policy2Stats,
  optimalStats,
  policy1Simulation,
  policy2Simulation,
  optimalSimulation,
}) => {
  if (!policy1Stats || !policy2Stats || !optimalStats) {
    return (
      <section id="statistics" className="card animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="section-title mb-0">📊 Mediciones y Estadísticas</h2>
        </div>
        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            Ejecuta las simulaciones en la sección anterior para ver las estadísticas y gráficos.
          </p>
        </div>
      </section>
    );
  }

  const StatCard = ({
    icon: Icon,
    label,
    value1,
    value2,
    value3,
    format = 'number',
    gradient,
  }: {
    icon: any;
    label: string;
    value1: number;
    value2: number;
    value3: number;
    format?: 'number' | 'currency' | 'percentage';
    gradient: string;
  }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') return formatCurrency(val);
      if (format === 'percentage') return formatPercentage(val);
      return formatNumber(val, 2);
    };

    return (
      <div className={`card ${gradient}`}>
        <div className="flex items-center gap-3 mb-4">
          <Icon className="w-6 h-6" />
          <h3 className="font-semibold text-sm">{label}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Política 1:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{formatValue(value1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Política 2:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{formatValue(value2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Óptima:</span>
            <span className="font-bold text-green-600 dark:text-green-400">{formatValue(value3)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Preparar datos para histograma de ganancias
  const prepareHistogramData = (simulation: PolicySimulation) => {
    const profits = simulation.results.map((r) => r.profit || 0);
    const min = Math.min(...profits);
    const max = Math.max(...profits);

    // Reducir bins si hay pocas simulaciones para mejor rendimiento
    const bins = simulation.results.length > 500 ? 15 : 10;

    // Evitar división por cero si todos los valores son iguales
    const binSize = (max - min) === 0 ? 1 : (max - min) / bins;

    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: `${Math.round(min + i * binSize)} - ${Math.round(min + (i + 1) * binSize)}`,
      count: 0,
      midpoint: min + (i + 0.5) * binSize,
    }));

    profits.forEach((profit) => {
      if (binSize === 1) {
        // Si todos los valores son iguales, ponerlos en el primer bin
        histogram[0].count++;
      } else {
        const binIndex = Math.min(Math.floor((profit - min) / binSize), bins - 1);
        if (binIndex >= 0 && binIndex < bins) {
          histogram[binIndex].count++;
        }
      }
    });

    return histogram;
  };

  // Datos para comparación de políticas - memoizado para evitar re-renders infinitos
  const comparisonData = useMemo(() => [
    {
      metric: 'Ganancia Promedio',
      'Política 1': policy1Stats.averageProfit,
      'Política 2': policy2Stats.averageProfit,
      'Óptima': optimalStats.averageProfit,
    },
    {
      metric: 'Sobrantes Promedio',
      'Política 1': policy1Stats.averageExcess,
      'Política 2': policy2Stats.averageExcess,
      'Óptima': optimalStats.averageExcess,
    },
    {
      metric: 'Faltantes Promedio',
      'Política 1': policy1Stats.averageShortage,
      'Política 2': policy2Stats.averageShortage,
      'Óptima': optimalStats.averageShortage,
    },
  ], [policy1Stats, policy2Stats, optimalStats]);

  // Limitar datos drásticamente para evitar problemas de rendimiento con Recharts - MEMOIZADO
  const maxDataPoints = useMemo(
    () => Math.min(policy1Simulation?.results.length || 0, 30),
    [policy1Simulation?.results.length]
  );
  const lineDataPoints = useMemo(
    () => Math.min(policy1Simulation?.results.length || 0, 20),
    [policy1Simulation?.results.length]
  );

  // Datos para gráfico de dispersión (máximo 30 puntos) - memoizado para evitar re-renders
  const scatterData = useMemo(() => {
    const p1Results = policy1Simulation?.results;
    const p2Results = policy2Simulation?.results;
    const optResults = optimalSimulation?.results;

    return p1Results?.slice(0, maxDataPoints).map((r, idx) => ({
      demanda: r.demand,
      ganancia1: r.profit,
      ganancia2: p2Results?.[idx]?.profit || 0,
      gananciaOpt: optResults?.[idx]?.profit || 0,
    })) || [];
  }, [policy1Simulation?.results, policy2Simulation?.results, optimalSimulation?.results, maxDataPoints]);

  // Datos para gráfico de líneas (máximo 20 puntos) - memoizado para evitar re-renders
  const lineData = useMemo(() => {
    const p1Results = policy1Simulation?.results;
    const p2Results = policy2Simulation?.results;
    const optResults = optimalSimulation?.results;

    return p1Results?.slice(0, lineDataPoints).map((r, idx) => ({
      sim: r.simulationNumber,
      'Política 1': r.profit,
      'Política 2': p2Results?.[idx]?.profit || 0,
      'Óptima': optResults?.[idx]?.profit || 0,
    })) || [];
  }, [policy1Simulation?.results, policy2Simulation?.results, optimalSimulation?.results, lineDataPoints]);

  // Memoizar datos de histogramas para evitar recalculos en cada render
  const histData1 = useMemo(() =>
    policy1Simulation ? prepareHistogramData(policy1Simulation) : [],
    [policy1Simulation?.results]
  );

  const histData2 = useMemo(() =>
    policy2Simulation ? prepareHistogramData(policy2Simulation) : [],
    [policy2Simulation?.results]
  );

  const histDataOpt = useMemo(() =>
    optimalSimulation ? prepareHistogramData(optimalSimulation) : [],
    [optimalSimulation?.results]
  );

  return (
    <section id="statistics" className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="section-title mb-0">📊 Mediciones y Estadísticas</h2>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="💰 Ganancia Promedio"
          value1={policy1Stats.averageProfit}
          value2={policy2Stats.averageProfit}
          value3={optimalStats.averageProfit}
          format="currency"
          gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
        />

        <StatCard
          icon={Package}
          label="📦 Sobrantes Promedio"
          value1={policy1Stats.averageExcess}
          value2={policy2Stats.averageExcess}
          value3={optimalStats.averageExcess}
          format="number"
          gradient="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"
        />

        <StatCard
          icon={AlertTriangle}
          label="❌ Faltantes Promedio"
          value1={policy1Stats.averageShortage}
          value2={policy2Stats.averageShortage}
          value3={optimalStats.averageShortage}
          format="number"
          gradient="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
        />

        <StatCard
          icon={Target}
          label="🎯 % Ventas Completas"
          value1={policy1Stats.selloutPercentage}
          value2={policy2Stats.selloutPercentage}
          value3={optimalStats.selloutPercentage}
          format="percentage"
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
        />

        <StatCard
          icon={ArrowUp}
          label="📈 Ganancia Máxima"
          value1={policy1Stats.maxProfit}
          value2={policy2Stats.maxProfit}
          value3={optimalStats.maxProfit}
          format="currency"
          gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
        />

        <StatCard
          icon={ArrowDown}
          label="📉 Ganancia Mínima"
          value1={policy1Stats.minProfit}
          value2={policy2Stats.minProfit}
          value3={optimalStats.minProfit}
          format="currency"
          gradient="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20"
        />

        <StatCard
          icon={Activity}
          label="📊 Desviación Estándar"
          value1={policy1Stats.stdDevProfit}
          value2={policy2Stats.stdDevProfit}
          value3={optimalStats.stdDevProfit}
          format="currency"
          gradient="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20"
        />

        <div className="card bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6" />
            <h3 className="font-semibold text-sm">🔢 Total Simulaciones</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
              {policy1Stats.totalSimulations.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="space-y-8">
        {/* Gráfico de barras comparativo */}
        <div className="card bg-white dark:bg-slate-800">
          <h3 className="text-xl font-semibold mb-4">📊 Comparación de Políticas</h3>
          <div className="flex gap-4 mb-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Política 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Política 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Óptima</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300} debounce={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Política 1" fill="#3b82f6" isAnimationActive={false} />
              <Bar dataKey="Política 2" fill="#a855f7" isAnimationActive={false} />
              <Bar dataKey="Óptima" fill="#22c55e" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Histogramas de distribución de ganancias */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { histData: histData1, title: 'Política 1', color: '#3b82f6' },
            { histData: histData2, title: 'Política 2', color: '#a855f7' },
            { histData: histDataOpt, title: 'Óptima', color: '#22c55e' },
          ].map(({ histData, title, color }) => {
            if (!histData || histData.length === 0) return null;

            return (
              <div key={title} className="card bg-white dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Distribución - {title}</h3>
                <ResponsiveContainer width="100%" height={200} debounce={300}>
                  <BarChart data={histData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="midpoint" hide />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} simulaciones`, 'Frecuencia']}
                      labelFormatter={(label) => `Ganancia: ${formatCurrency(Number(label))}`}
                    />
                    <Bar dataKey="count" fill={color} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>

        {/* Gráfico de líneas - Ganancia vs Simulación */}
        <div className="card bg-white dark:bg-slate-800">
          <h3 className="text-xl font-semibold mb-4">📈 Ganancia por Simulación (primeras 20)</h3>
          <div className="flex gap-4 mb-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span>Política 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-500"></div>
              <span>Política 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span>Óptima</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300} debounce={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sim" label={{ value: '# Simulación', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Ganancia (UM)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="Política 1" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Política 2" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Óptima" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de dispersión - Demanda vs Ganancia */}
        <div className="card bg-white dark:bg-slate-800">
          <h3 className="text-xl font-semibold mb-4">🎯 Demanda vs Ganancia (primeras 30 simulaciones)</h3>
          <div className="flex gap-4 mb-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Política 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Política 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Óptima</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300} debounce={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="demanda"
                name="Demanda"
                label={{ value: 'Demanda', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type="number"
                name="Ganancia"
                label={{ value: 'Ganancia (UM)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => formatCurrency(Number(value))} />
              <Scatter name="Política 1" data={scatterData} fill="#3b82f6" dataKey="ganancia1" isAnimationActive={false} />
              <Scatter name="Política 2" data={scatterData} fill="#a855f7" dataKey="ganancia2" isAnimationActive={false} />
              <Scatter name="Óptima" data={scatterData} fill="#22c55e" dataKey="gananciaOpt" isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen de análisis de riesgo */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
        <h3 className="text-xl font-semibold mb-4">🔍 Análisis de Riesgo</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Política 1', stats: policy1Stats, color: 'blue' },
            { name: 'Política 2', stats: policy2Stats, color: 'purple' },
            { name: 'Óptima', stats: optimalStats, color: 'green' },
          ].map(({ name, stats, color }) => {
            // Coeficiente de variación con validación para evitar división por cero
            const cv = stats.averageProfit !== 0 && !isNaN(stats.averageProfit) && isFinite(stats.averageProfit)
              ? (stats.stdDevProfit / stats.averageProfit) * 100
              : 0;
            const cvSafe = isNaN(cv) || !isFinite(cv) ? 0 : cv;

            return (
              <div key={name} className={`p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-${color}-300`}>
                <div className={`font-semibold text-${color}-700 dark:text-${color}-400 mb-2`}>{name}</div>
                <div className="text-sm space-y-1">
                  <div>Desv. Est.: {formatCurrency(stats.stdDevProfit)}</div>
                  <div>Coef. Variación: {cvSafe.toFixed(2)}%</div>
                  <div className={cvSafe < 5 ? 'text-green-600' : cvSafe < 10 ? 'text-yellow-600' : 'text-red-600'}>
                    Riesgo: {cvSafe < 5 ? 'Bajo' : cvSafe < 10 ? 'Medio' : 'Alto'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
