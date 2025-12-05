import React, { useState } from 'react';
import { Play, Download, Loader } from 'lucide-react';
import type { SimulationParameters, SimulationResult, PolicySimulation } from '../types';
import { runMonteCarloSimulation, formatCurrency, formatNumber } from '../utils/mathUtils';

interface SimulationsProps {
  params: SimulationParameters;
  onSimulationsComplete: (
    policy1: PolicySimulation,
    policy2: PolicySimulation,
    optimal: PolicySimulation
  ) => void;
  optimalQuantity?: number;
}

const Simulations: React.FC<SimulationsProps> = ({
  params,
  onSimulationsComplete,
  optimalQuantity,
}) => {
  const [numSimulations, setNumSimulations] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [policy1Results, setPolicy1Results] = useState<SimulationResult[]>([]);
  const [policy2Results, setPolicy2Results] = useState<SimulationResult[]>([]);
  const [optimalResults, setOptimalResults] = useState<SimulationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);

  const policy1Q = 7000;
  const policy2Q = 6800;

  const handleRunSimulations = async () => {
    setIsRunning(true);
    setShowResults(false);

    // Simular un pequeño delay para mostrar el loader
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ejecutar simulaciones
    const p1Results = runMonteCarloSimulation(policy1Q, params, numSimulations);
    const p2Results = runMonteCarloSimulation(policy2Q, params, numSimulations);
    const optResults = runMonteCarloSimulation(
      optimalQuantity || policy1Q,
      params,
      numSimulations
    );

    setPolicy1Results(p1Results);
    setPolicy2Results(p2Results);
    setOptimalResults(optResults);
    setShowResults(true);
    setIsRunning(false);

    // Notificar al componente padre
    onSimulationsComplete(
      { policyName: 'Política 1', orderQuantity: policy1Q, results: p1Results },
      { policyName: 'Política 2', orderQuantity: policy2Q, results: p2Results },
      {
        policyName: 'Política Óptima',
        orderQuantity: optimalQuantity || policy1Q,
        results: optResults,
      }
    );
  };

  const downloadCSV = (results: SimulationResult[], policyName: string) => {
    const headers = ['#', 'Aleatorio', 'Z-Score', 'Demanda', 'Vendidas', 'Sobrantes', 'Faltantes', 'Ganancia'];
    const rows = results.map(r => [
      r.simulationNumber,
      r.randomNumber.toFixed(4),
      r.zScore.toFixed(4),
      r.demand,
      r.unitsSold,
      r.excessUnits,
      r.shortageUnits,
      r.profit.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${policyName.replace(/\s+/g, '_')}_Simulaciones.csv`;
    link.click();
  };

  const renderTable = (results: SimulationResult[], title: string, color: string) => {
    const displayedResults = results.slice(0, displayLimit);
    const hasMore = results.length > displayLimit;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold text-${color}-600 dark:text-${color}-400`}>
            {title}
          </h3>
          <button
            onClick={() => downloadCSV(results, title)}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">Aleatorio</th>
                <th className="text-center">Z-Score</th>
                <th className="text-center">Demanda</th>
                <th className="text-center">Vendidas</th>
                <th className="text-center">Sobrantes</th>
                <th className="text-center">Faltantes</th>
                <th className="text-center">Ganancia</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800">
              {displayedResults.map((result) => (
                <tr key={result.simulationNumber}>
                  <td className="text-center font-semibold text-blue-600 dark:text-blue-400">
                    {result.simulationNumber}
                  </td>
                  <td className="text-center font-mono text-xs">
                    {result.randomNumber.toFixed(4)}
                  </td>
                  <td className="text-center font-mono text-xs">
                    {result.zScore.toFixed(4)}
                  </td>
                  <td className="text-center font-semibold">
                    {formatNumber(result.demand)}
                  </td>
                  <td className="text-center text-green-600 dark:text-green-400">
                    {formatNumber(result.unitsSold)}
                  </td>
                  <td className="text-center text-amber-600 dark:text-amber-400">
                    {formatNumber(result.excessUnits)}
                  </td>
                  <td className="text-center text-red-600 dark:text-red-400">
                    {formatNumber(result.shortageUnits)}
                  </td>
                  <td className="text-center font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(result.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setDisplayLimit(prev => Math.min(prev + 20, results.length))}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mostrar más resultados... ({displayLimit} de {results.length})
            </button>
          </div>
        )}

        {displayLimit > 10 && (
          <div className="mt-2 text-center">
            <button
              onClick={() => setDisplayLimit(10)}
              className="text-gray-600 dark:text-gray-400 hover:underline text-sm"
            >
              Mostrar menos
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="simulations" className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg">
          <Play className="w-8 h-8 text-white" />
        </div>
        <h2 className="section-title mb-0">🔄 Simulaciones Detalladas</h2>
      </div>

      {/* Descripción */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Ejecuta simulaciones Monte Carlo para diferentes políticas de inventario. Cada
          simulación genera una demanda aleatoria y calcula la ganancia resultante.
        </p>
      </div>

      {/* Políticas a simular */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Política 1
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Q = {policy1Q.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Cantidad igual a la media
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
              Política 2
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              Q = {policy2Q.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Política conservadora
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-300 dark:border-green-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
              Política Óptima
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              Q* = {optimalQuantity?.toLocaleString() || '?'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Calculada analíticamente
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Número de simulaciones:
            </label>
            <input
              type="number"
              min="3"
              max="10000"
              value={numSimulations}
              onChange={(e) => setNumSimulations(Math.max(3, Math.min(10000, parseInt(e.target.value) || 100)))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 w-32"
              disabled={isRunning}
            />
          </div>

          <button
            onClick={handleRunSimulations}
            disabled={isRunning || !optimalQuantity}
            className="btn-primary flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Ejecutar Simulaciones
              </>
            )}
          </button>
        </div>

        {!optimalQuantity && (
          <div className="mt-4 text-amber-600 dark:text-amber-400 text-sm">
            ⚠️ Primero debes calcular la solución analítica en la Sección 5 para obtener Q*
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            💡 <strong>Recomendación:</strong> Comienza con 100 simulaciones para pruebas rápidas.
            Para resultados más precisos, usa 1000 o más simulaciones.
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      {isRunning && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-400">
            Generando {numSimulations.toLocaleString()} escenarios aleatorios...
          </p>
        </div>
      )}

      {/* Resultados */}
      {showResults && (
        <div className="animate-fade-in">
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
            <p className="text-green-800 dark:text-green-300 font-semibold">
              ✅ Simulaciones completadas exitosamente! Se generaron {numSimulations.toLocaleString()} escenarios para cada política.
            </p>
          </div>

          {renderTable(policy1Results, `Política 1 (Q = ${policy1Q})`, 'blue')}
          {renderTable(policy2Results, `Política 2 (Q = ${policy2Q})`, 'purple')}
          {renderTable(optimalResults, `Política Óptima (Q* = ${optimalQuantity})`, 'green')}
        </div>
      )}
    </section>
  );
};

export default Simulations;
