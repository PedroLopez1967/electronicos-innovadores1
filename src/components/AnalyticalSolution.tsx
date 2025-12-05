import React, { useEffect } from 'react';
import { Calculator, Lightbulb, CheckCircle } from 'lucide-react';
import { BlockMath } from 'react-katex';
import type { SimulationParameters, AnalyticalSolution as AnalyticalSolutionType } from '../types';
import { calculateAnalyticalSolution, formatCurrency } from '../utils/mathUtils';

interface AnalyticalSolutionProps {
  params: SimulationParameters;
  showExplanations: boolean;
  onSolutionCalculated: (solution: AnalyticalSolutionType) => void;
}

const AnalyticalSolution: React.FC<AnalyticalSolutionProps> = ({
  params,
  showExplanations,
  onSolutionCalculated,
}) => {
  const solution = calculateAnalyticalSolution(params);

  useEffect(() => {
    onSolutionCalculated(solution);
  }, [solution, onSolutionCalculated]);

  return (
    <section id="analytical-solution" className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h2 className="section-title mb-0">🧮 Solución Analítica</h2>
      </div>

      {/* Introducción */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">Modelo de Newsvendor (Vendedor de Periódicos)</p>
            <p className="text-sm leading-relaxed">
              Cuando la demanda es incierta, podemos calcular la cantidad óptima a ordenar balanceando
              el costo de quedarse corto (perder ventas) con el costo de sobrestimar (exceso de inventario).
            </p>
          </div>
        </div>
      </div>

      {/* Paso 1: Costos */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Identificar los Costos
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cu - Costo de quedarse corto */}
          <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-300 dark:border-green-700">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
              Cu = Costo Unitario de Quedarse Corto
            </h4>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-3">
              <BlockMath math={`C_u = \\text{Ganancia perdida} = ${params.profit} \\text{ UM}`} />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si ordenamos muy poco y nos quedamos sin inventario, perdemos la ganancia de cada
              unidad que pudimos vender.
            </p>
            <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Valor calculado:</div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(solution.Cu)}
              </div>
            </div>
          </div>

          {/* Co - Costo de sobrestimar */}
          <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700">
            <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">
              Co = Costo de Sobrestimar
            </h4>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-3">
              <BlockMath math={`C_o = \\text{Pérdida por sobrante} = ${params.excessLoss} \\text{ UM}`} />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si ordenamos demasiado, las unidades sobrantes se liquidan a precio reducido,
              resultando en una pérdida.
            </p>
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Valor calculado:</div>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(solution.Co)}
              </div>
            </div>
          </div>
        </div>

        {showExplanations && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Explicación:</strong> Cu &gt; Co significa que es más costoso quedarse corto
              que sobrestimar. Esto influye en la decisión de ordenar una cantidad mayor.
            </p>
          </div>
        )}
      </div>

      {/* Paso 2: Razón Crítica */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            2
          </span>
          Calcular la Razón Crítica
        </h3>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-700 mb-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
              Fórmula de la Razón Crítica
            </h4>
            <BlockMath math="P = \\frac{C_u}{C_u + C_o}" />
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sustituyendo valores:</div>
              <BlockMath math={`P = \\frac{${solution.Cu}}{${solution.Cu} + ${solution.Co}} = \\frac{${solution.Cu}}{${solution.Cu + solution.Co}} = ${solution.criticalRatio.toFixed(4)}`} />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg text-center">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Razón Crítica (P):</div>
          <div className="text-5xl font-bold text-purple-700 dark:text-purple-300">
            {(solution.criticalRatio * 100).toFixed(2)}%
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            o equivalentemente: {solution.criticalRatio.toFixed(4)}
          </div>
        </div>

        {showExplanations && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Interpretación:</strong> Esto significa que debemos ordenar una cantidad tal
              que la probabilidad de satisfacer toda la demanda sea de {(solution.criticalRatio * 100).toFixed(2)}%.
              En otras palabras, en el {(solution.criticalRatio * 100).toFixed(2)}% de los casos deberíamos
              tener suficiente inventario.
            </p>
          </div>
        )}
      </div>

      {/* Paso 3: Valor Z */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            3
          </span>
          Encontrar el Valor Z
        </h3>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-green-300 dark:border-green-700 mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Necesitamos encontrar el valor Z de la distribución normal estándar tal que:
          </p>
          <div className="text-center mb-4">
            <BlockMath math={`\\Phi(Z) = P = ${solution.criticalRatio.toFixed(4)}`} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Donde Φ es la función de distribución acumulada de la normal estándar
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg text-center">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Valor Z correspondiente:</div>
          <div className="text-5xl font-bold text-green-700 dark:text-green-300">
            {solution.zValue.toFixed(4)}
          </div>
        </div>

        {showExplanations && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Explicación:</strong> El valor Z se obtiene usando la función inversa de la
              distribución normal estándar (también llamada función cuantil). Puedes verificar este
              valor en tablas de distribución normal o calculadoras estadísticas.
            </p>
          </div>
        )}
      </div>

      {/* Paso 4: Cantidad Óptima */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            4
          </span>
          Calcular la Cantidad Óptima Q*
        </h3>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-amber-300 dark:border-amber-700 mb-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-3">
              Fórmula de la Cantidad Óptima
            </h4>
            <BlockMath math="Q^* = \\mu + Z \\times \\sigma" />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sustituyendo valores:</div>
              <BlockMath math={`Q^* = ${params.mean} + ${solution.zValue.toFixed(4)} \\times ${params.stdDev}`} />
              <BlockMath math={`Q^* = ${params.mean} + ${(solution.zValue * params.stdDev).toFixed(2)}`} />
              <BlockMath math={`Q^* = ${(params.mean + solution.zValue * params.stdDev).toFixed(2)} \\approx ${solution.optimalQuantity}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Resultado Final */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl text-white shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-12 h-12" />
          <h3 className="text-3xl font-bold">Solución Óptima</h3>
        </div>

        <div className="text-center mb-6">
          <div className="text-xl mb-3">La cantidad óptima a ordenar es:</div>
          <div className="text-7xl font-bold mb-2">
            {solution.optimalQuantity.toLocaleString()}
          </div>
          <div className="text-2xl">unidades</div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-sm opacity-90">Comparado con μ</div>
            <div className="text-2xl font-bold">
              {solution.optimalQuantity > params.mean ? '+' : ''}
              {solution.optimalQuantity - params.mean} unidades
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-sm opacity-90">Razón Crítica</div>
            <div className="text-2xl font-bold">{(solution.criticalRatio * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-sm opacity-90">Valor Z</div>
            <div className="text-2xl font-bold">{solution.zValue.toFixed(4)}</div>
          </div>
        </div>
      </div>

      {/* Interpretación */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
          📚 Interpretación del Resultado
        </h4>
        <div className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
          <p>
            • La cantidad óptima Q* = {solution.optimalQuantity.toLocaleString()} unidades maximiza
            la ganancia esperada considerando tanto el riesgo de sobrantes como de faltantes.
          </p>
          <p>
            • Esta cantidad es {solution.optimalQuantity > params.mean ? 'mayor' : 'menor'} que
            la demanda promedio (μ = {params.mean}) porque el costo de quedarse corto (
            {formatCurrency(solution.Cu)}) es {solution.Cu > solution.Co ? 'mayor' : 'menor'} que
            el costo de sobrestimar ({formatCurrency(solution.Co)}).
          </p>
          <p>
            • Con esta política, en aproximadamente el {(solution.criticalRatio * 100).toFixed(2)}%
            de los casos tendremos suficiente inventario para satisfacer toda la demanda.
          </p>
          <p>
            • En el {((1 - solution.criticalRatio) * 100).toFixed(2)}% restante de los casos,
            tendremos exceso de inventario que se liquidará a precio reducido.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnalyticalSolution;
