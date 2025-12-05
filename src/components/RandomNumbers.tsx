import React, { useState } from 'react';
import { Dices, RefreshCw, Info } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import type { SimulationParameters, RandomNumberExample } from '../types';
import { generateRandomExamples } from '../utils/mathUtils';

interface RandomNumbersProps {
  params: SimulationParameters;
  showExplanations: boolean;
}

const RandomNumbers: React.FC<RandomNumbersProps> = ({ params, showExplanations }) => {
  const [count, setCount] = useState(10);
  const [examples, setExamples] = useState<RandomNumberExample[]>(() =>
    generateRandomExamples(params, 10)
  );

  const handleGenerate = () => {
    setExamples(generateRandomExamples(params, count));
  };

  return (
    <section id="random-numbers" className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg">
          <Dices className="w-8 h-8 text-white" />
        </div>
        <h2 className="section-title mb-0">🎲 Asignación de Números Aleatorios</h2>
      </div>

      {/* Explicación */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">¿Cómo funciona la generación de demanda?</p>
            <p className="text-sm leading-relaxed">
              Para simular la demanda aleatoria, generamos números uniformes [0,1] y los
              transformamos a una distribución Normal usando la transformación inversa. Cada
              número aleatorio representa un escenario posible de demanda.
            </p>
          </div>
        </div>
      </div>

      {/* Proceso de transformación */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">🔄 Proceso de Transformación</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">1️⃣</div>
              <div className="font-semibold text-blue-700 dark:text-blue-300">
                Número Uniforme
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
              <InlineMath math="U \sim \text{Uniforme}(0,1)" />
            </div>
            <p className="text-xs mt-2 text-center">
              Generado por computadora usando Math.random()
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">2️⃣</div>
              <div className="font-semibold text-green-700 dark:text-green-300">
                Transformación a Z
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
              <InlineMath math="Z = \Phi^{-1}(U)" />
            </div>
            <p className="text-xs mt-2 text-center">
              Z-score de distribución normal estándar
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">3️⃣</div>
              <div className="font-semibold text-purple-700 dark:text-purple-300">
                Demanda Generada
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
              <InlineMath math={`D = \\mu + Z \\times \\sigma`} />
            </div>
            <p className="text-xs mt-2 text-center">
              D ~ Normal({params.mean}, {params.stdDev})
            </p>
          </div>
        </div>
      </div>

      {/* Fórmula completa */}
      {showExplanations && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">📝 Fórmula Completa:</h4>
          <BlockMath math={`D = \\mu + \\Phi^{-1}(U) \\times \\sigma = ${params.mean} + Z \\times ${params.stdDev}`} />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Donde <InlineMath math="\Phi^{-1}" /> es la función inversa de la distribución
            acumulada normal estándar (también llamada función cuantil).
          </p>
        </div>
      )}

      {/* Controles */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-3">
          <label className="font-semibold">Cantidad de ejemplos:</label>
          <input
            type="number"
            min="5"
            max="100"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 w-20"
          />
        </div>
        <button
          onClick={handleGenerate}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Generar Nuevos Números
        </button>
      </div>

      {/* Tabla de ejemplos */}
      <div className="table-responsive">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">Número Aleatorio<br/>Uniforme [0,1]</th>
              <th className="text-center">Transformación<br/>a Z-Score</th>
              <th className="text-center">Demanda<br/>Generada (D)</th>
              <th className="text-center">Cálculo</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800">
            {examples.map((example) => (
              <tr key={example.index}>
                <td className="text-center font-semibold text-blue-600 dark:text-blue-400">
                  {example.index}
                </td>
                <td className="text-center font-mono">
                  {example.randomUniform.toFixed(4)}
                </td>
                <td className="text-center font-mono">
                  {example.zScore.toFixed(4)}
                </td>
                <td className="text-center font-semibold text-green-600 dark:text-green-400">
                  {example.demand.toLocaleString()}
                </td>
                <td className="text-center text-sm">
                  <InlineMath math={`${params.mean} + ${example.zScore.toFixed(2)} \\times ${params.stdDev}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estadísticas de los ejemplos */}
      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(examples.reduce((sum, e) => sum + e.demand, 0) / examples.length).toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Esperado: {params.mean}
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mínimo</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.min(...examples.map(e => e.demand)).toLocaleString()}
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Máximo</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.max(...examples.map(e => e.demand)).toLocaleString()}
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rango</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {(Math.max(...examples.map(e => e.demand)) - Math.min(...examples.map(e => e.demand))).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Nota educativa */}
      {showExplanations && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 Nota:</strong> En una simulación real, generarías miles de estos números.
            Con más números, el promedio se acercará más a μ={params.mean} y la distribución
            seguirá más fielmente una curva normal. Esto es la base de la{' '}
            <strong>Ley de los Grandes Números</strong>.
          </p>
        </div>
      )}
    </section>
  );
};

export default RandomNumbers;
