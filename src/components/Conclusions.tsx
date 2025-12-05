import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Copy, CheckCircle, BarChart3, FileDown } from 'lucide-react';
import type { PolicyStatistics, AnalyticalSolution, PolicySimulation, SimulationParameters } from '../types';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/mathUtils';
import { generateAutoConclusions, copyToClipboard, exportToExcel, exportToPDF } from '../utils/exportUtils';

interface ConclusionsProps {
  policy1Stats: PolicyStatistics | null;
  policy2Stats: PolicyStatistics | null;
  optimalStats: PolicyStatistics | null;
  analyticalSolution: AnalyticalSolution | null;
  policy1Simulation: PolicySimulation | null;
  policy2Simulation: PolicySimulation | null;
  optimalSimulation: PolicySimulation | null;
  params: SimulationParameters;
}

const Conclusions: React.FC<ConclusionsProps> = ({
  policy1Stats,
  policy2Stats,
  optimalStats,
  analyticalSolution,
  policy1Simulation,
  policy2Simulation,
  optimalSimulation,
  params,
}) => {
  const [userConclusions, setUserConclusions] = useState('');
  const [copied, setCopied] = useState(false);

  // Usar useMemo para evitar recalcular las conclusiones en cada render
  const autoConclusions = useMemo(() => {
    if (policy1Stats && policy2Stats && optimalStats && analyticalSolution) {
      return generateAutoConclusions(
        policy1Stats,
        policy2Stats,
        optimalStats,
        analyticalSolution
      );
    }
    return '';
  }, [policy1Stats, policy2Stats, optimalStats, analyticalSolution]);

  // Usar useMemo para calcular la mejor política (ANTES del early return)
  const bestPolicy = useMemo(() => {
    if (!policy1Stats || !policy2Stats || !optimalStats) return null;

    const validPolicies = [policy1Stats, policy2Stats, optimalStats].filter(p =>
      p && !isNaN(p.averageProfit) && isFinite(p.averageProfit)
    );

    return validPolicies.length > 0
      ? validPolicies.reduce((best, current) =>
          (current.averageProfit || 0) > (best.averageProfit || 0) ? current : best
        )
      : policy1Stats;
  }, [policy1Stats, policy2Stats, optimalStats]);

  // Usar useMemo para calcular la política más estable (ANTES del early return)
  const mostStable = useMemo(() => {
    if (!policy1Stats || !policy2Stats || !optimalStats) return null;

    const validStablePolicies = [policy1Stats, policy2Stats, optimalStats].filter(p =>
      p && !isNaN(p.stdDevProfit) && isFinite(p.stdDevProfit)
    );

    return validStablePolicies.length > 0
      ? validStablePolicies.reduce((stable, current) =>
          (current.stdDevProfit || Infinity) < (stable.stdDevProfit || Infinity) ? current : stable
        )
      : policy1Stats;
  }, [policy1Stats, policy2Stats, optimalStats]);

  const handleCopy = async () => {
    const fullText = autoConclusions + '\n\n' + (userConclusions ? '--- CONCLUSIONES ADICIONALES ---\n\n' + userConclusions : '');
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportExcel = () => {
    if (policy1Simulation && policy2Simulation && optimalSimulation && policy1Stats && policy2Stats && optimalStats) {
      exportToExcel(
        policy1Simulation.results,
        policy2Simulation.results,
        optimalSimulation.results,
        policy1Stats,
        policy2Stats,
        optimalStats
      );
    }
  };

  const handleExportPDF = () => {
    if (policy1Stats && policy2Stats && optimalStats && analyticalSolution) {
      const fullConclusions = autoConclusions + (userConclusions ? '\n\n--- CONCLUSIONES ADICIONALES ---\n\n' + userConclusions : '');
      exportToPDF(params, policy1Stats, policy2Stats, optimalStats, analyticalSolution, fullConclusions);
    }
  };

  const canExport = policy1Simulation && policy2Simulation && optimalSimulation && policy1Stats && policy2Stats && optimalStats;

  // Early return DESPUÉS de todos los hooks
  if (!policy1Stats || !policy2Stats || !optimalStats || !analyticalSolution || !bestPolicy || !mostStable) {
    return (
      <section id="conclusions" className="card animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="section-title mb-0">📝 Conclusiones y Recomendaciones</h2>
        </div>
        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            Ejecuta las simulaciones y calcula la solución analítica para ver las conclusiones.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="conclusions" className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="section-title mb-0">📝 Conclusiones y Recomendaciones</h2>
      </div>

      {/* Tabla Comparativa Final */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Tabla Comparativa de las Tres Políticas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <th className="p-4 text-left">Métrica</th>
                <th className="p-4 text-center">Política 1<br/>(Q={policy1Stats.orderQuantity})</th>
                <th className="p-4 text-center">Política 2<br/>(Q={policy2Stats.orderQuantity})</th>
                <th className="p-4 text-center">Política Óptima<br/>(Q*={optimalStats.orderQuantity})</th>
                <th className="p-4 text-center">Mejor</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-semibold">💰 Ganancia Promedio</td>
                <td className={`p-4 text-center ${policy1Stats.averageProfit === bestPolicy.averageProfit ? 'bg-green-100 dark:bg-green-900/30 font-bold' : ''}`}>
                  {formatCurrency(policy1Stats.averageProfit)}
                </td>
                <td className={`p-4 text-center ${policy2Stats.averageProfit === bestPolicy.averageProfit ? 'bg-green-100 dark:bg-green-900/30 font-bold' : ''}`}>
                  {formatCurrency(policy2Stats.averageProfit)}
                </td>
                <td className={`p-4 text-center ${optimalStats.averageProfit === bestPolicy.averageProfit ? 'bg-green-100 dark:bg-green-900/30 font-bold' : ''}`}>
                  {formatCurrency(optimalStats.averageProfit)}
                </td>
                <td className="p-4 text-center">
                  <span className="inline-block px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                    {bestPolicy.policyName}
                  </span>
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-semibold">📦 Sobrantes Promedio</td>
                <td className="p-4 text-center">{formatNumber(policy1Stats.averageExcess, 2)}</td>
                <td className="p-4 text-center">{formatNumber(policy2Stats.averageExcess, 2)}</td>
                <td className="p-4 text-center">{formatNumber(optimalStats.averageExcess, 2)}</td>
                <td className="p-4 text-center text-sm text-gray-500">
                  Menor es mejor
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-semibold">❌ Faltantes Promedio</td>
                <td className="p-4 text-center">{formatNumber(policy1Stats.averageShortage, 2)}</td>
                <td className="p-4 text-center">{formatNumber(policy2Stats.averageShortage, 2)}</td>
                <td className="p-4 text-center">{formatNumber(optimalStats.averageShortage, 2)}</td>
                <td className="p-4 text-center text-sm text-gray-500">
                  Menor es mejor
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-semibold">📊 Desviación Estándar</td>
                <td className={`p-4 text-center ${policy1Stats.stdDevProfit === mostStable.stdDevProfit ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                  {formatCurrency(policy1Stats.stdDevProfit)}
                </td>
                <td className={`p-4 text-center ${policy2Stats.stdDevProfit === mostStable.stdDevProfit ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                  {formatCurrency(policy2Stats.stdDevProfit)}
                </td>
                <td className={`p-4 text-center ${optimalStats.stdDevProfit === mostStable.stdDevProfit ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                  {formatCurrency(optimalStats.stdDevProfit)}
                </td>
                <td className="p-4 text-center">
                  <span className="inline-block px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                    {mostStable.policyName}
                  </span>
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-semibold">📈 Ganancia Máxima</td>
                <td className="p-4 text-center">{formatCurrency(policy1Stats.maxProfit)}</td>
                <td className="p-4 text-center">{formatCurrency(policy2Stats.maxProfit)}</td>
                <td className="p-4 text-center">{formatCurrency(optimalStats.maxProfit)}</td>
                <td className="p-4 text-center text-sm text-gray-500">-</td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-semibold">📉 Ganancia Mínima</td>
                <td className="p-4 text-center">{formatCurrency(policy1Stats.minProfit)}</td>
                <td className="p-4 text-center">{formatCurrency(policy2Stats.minProfit)}</td>
                <td className="p-4 text-center">{formatCurrency(optimalStats.minProfit)}</td>
                <td className="p-4 text-center text-sm text-gray-500">-</td>
              </tr>

              <tr>
                <td className="p-4 font-semibold">🎯 % Ventas Completas</td>
                <td className="p-4 text-center">{formatPercentage(policy1Stats.selloutPercentage)}</td>
                <td className="p-4 text-center">{formatPercentage(policy2Stats.selloutPercentage)}</td>
                <td className="p-4 text-center">{formatPercentage(optimalStats.selloutPercentage)}</td>
                <td className="p-4 text-center text-sm text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Comparativo de Ganancias */}
      <div className="mb-8 card bg-white dark:bg-slate-800">
        <h3 className="text-xl font-semibold mb-4">📊 Comparación Visual de Ganancias Promedio</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Política 1</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(policy1Stats.averageProfit)}
            </div>
          </div>
          <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Política 2</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(policy2Stats.averageProfit)}
            </div>
          </div>
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Óptima</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(optimalStats.averageProfit)}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación Principal */}
      <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-10 h-10" />
          <h3 className="text-2xl font-bold">Recomendación Principal</h3>
        </div>
        <div className="text-lg space-y-3">
          <p>
            Basándose en {policy1Stats.totalSimulations.toLocaleString()} simulaciones Monte Carlo,
            se recomienda implementar la <strong>{bestPolicy.policyName}</strong> con una cantidad
            de pedido de <strong className="text-3xl">{bestPolicy.orderQuantity.toLocaleString()}</strong> unidades.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm opacity-90">Ganancia Esperada</div>
              <div className="text-3xl font-bold">{formatCurrency(bestPolicy.averageProfit)}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm opacity-90">Mejor que {bestPolicy.policyName === policy1Stats.policyName ? 'Política 2' : 'Política 1'} en</div>
              <div className="text-3xl font-bold">
                {formatCurrency(bestPolicy.averageProfit - (bestPolicy.policyName === policy1Stats.policyName ? policy2Stats.averageProfit : policy1Stats.averageProfit))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Riesgo */}
      <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
          🎯 Análisis de Riesgo
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          La política más estable (menor variabilidad) es <strong>{mostStable.policyName}</strong> con
          una desviación estándar de {formatCurrency(mostStable.stdDevProfit)}.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          {mostStable.policyName === bestPolicy.policyName
            ? '✅ Esta política combina la mejor ganancia esperada con la menor variabilidad, siendo la opción más segura y rentable.'
            : `⚠️ Aunque ${bestPolicy.policyName} ofrece mayor ganancia promedio, ${mostStable.policyName} presenta menor riesgo. La elección depende del apetito de riesgo de la empresa.`}
        </p>
      </div>

      {/* Conclusiones Automáticas */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-xl font-semibold">📄 Conclusiones Generadas Automáticamente</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              disabled={!canExport}
              className="btn-success flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canExport ? "Ejecuta las simulaciones primero" : "Descargar tablas en Excel"}
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!canExport}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 text-sm"
              title={!canExport ? "Ejecuta las simulaciones primero" : "Descargar reporte en PDF"}
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
        {!canExport && (
          <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg text-sm">
            ⚠️ Para habilitar la exportación, primero debes ejecutar las simulaciones en la Sección 3.
          </div>
        )}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
            {autoConclusions}
          </pre>
        </div>
      </div>

      {/* Área para conclusiones del estudiante */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">✍️ Tus Conclusiones Adicionales</h3>
        <textarea
          value={userConclusions}
          onChange={(e) => setUserConclusions(e.target.value)}
          placeholder="Escribe aquí tus propias conclusiones, análisis y observaciones sobre los resultados obtenidos..."
          className="w-full h-64 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          💡 Puedes agregar observaciones sobre limitaciones del modelo, sugerencias de mejora,
          o aplicaciones prácticas en la empresa.
        </p>
      </div>

      {/* Puntos Clave para el Informe */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border-l-4 border-amber-500">
        <h3 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-300">
          📚 Puntos Clave para tu Informe Académico
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
            <span>
              <strong>Función de Ganancia:</strong> Se construyó considerando ganancias por ventas
              y pérdidas por liquidación de sobrantes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
            <span>
              <strong>Números Aleatorios:</strong> Se utilizó la transformación inversa de la
              distribución normal para generar demandas aleatorias.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
            <span>
              <strong>Simulaciones Monte Carlo:</strong> Se ejecutaron {policy1Stats.totalSimulations.toLocaleString()} escenarios
              para cada política, proporcionando resultados estadísticamente significativos.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
            <span>
              <strong>Mediciones Estadísticas:</strong> Se calcularon medias, desviaciones estándar,
              valores extremos y porcentajes de satisfacción de demanda.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
            <span>
              <strong>Solución Analítica:</strong> Se aplicó el modelo Newsvendor con razón crítica
              de {(analyticalSolution.criticalRatio * 100).toFixed(2)}%, resultando en Q* = {analyticalSolution.optimalQuantity} unidades.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
            <span>
              <strong>Validación:</strong> La simulación Monte Carlo validó la solución analítica,
              mostrando que la política óptima genera la mayor ganancia esperada.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Conclusions;
