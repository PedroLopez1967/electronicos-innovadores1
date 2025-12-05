import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';
import type { SimulationParameters } from '../types';

interface ProfitFunctionProps {
  params: SimulationParameters;
  showExplanations: boolean;
}

const ProfitFunction: React.FC<ProfitFunctionProps> = ({ params, showExplanations }) => {
  return (
    <section id="profit-function" className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h2 className="section-title mb-0">📐 Función de Ganancia</h2>
      </div>

      {/* Introducción */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          La función de ganancia determina el beneficio económico según la demanda y la cantidad
          ordenada. Considerando que algunas unidades pueden quedar sin vender y liquidarse a
          precio reducido.
        </p>
      </div>

      {/* Fórmula General */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Fórmula General
        </h3>
        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <BlockMath math="G(Q, D) = \begin{cases} D \times g - (Q - D) \times p_s & \text{si } D < Q \\ Q \times g & \text{si } D \geq Q \end{cases}" />
        </div>
        {showExplanations && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Explicación:</strong> La ganancia depende de si la demanda (D) es menor o
              mayor que la cantidad ordenada (Q). Si sobran unidades, hay una pérdida por liquidación.
            </p>
          </div>
        )}
      </div>

      {/* Variables */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Variables del Problema
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="font-semibold text-green-800 dark:text-green-300 mb-2">
              <InlineMath math="Q" /> = Cantidad a ordenar
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Decisión de inventario (variable de control)
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
              <InlineMath math="D" /> = Demanda
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Variable aleatoria ~ Normal(μ={params.mean}, σ={params.stdDev})
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              <InlineMath math="g" /> = Ganancia unitaria = {params.profit} UM
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Beneficio por cada unidad vendida
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
            <div className="font-semibold text-red-800 dark:text-red-300 mb-2">
              <InlineMath math="p_s" /> = Pérdida por sobrante = {params.excessLoss} UM
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Costo de liquidación de unidades no vendidas
            </p>
          </div>
        </div>
      </div>

      {/* Deducción Paso a Paso */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">🔍 Deducción Paso a Paso</h3>

        {/* Paso 1 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Paso 1: Ingresos por ventas
          </div>
          <BlockMath math="I_v = \min(Q, D) \times p_v" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Donde <InlineMath math="p_v = {params.salePrice}" /> UM es el precio de venta
          </p>
        </div>

        {/* Paso 2 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Paso 2: Costo de compra
          </div>
          <BlockMath math="C_c = Q \times c" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Donde <InlineMath math="c = {params.purchaseCost}" /> UM es el costo unitario de compra
          </p>
        </div>

        {/* Paso 3 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Paso 3: Recuperación por liquidación (si hay sobrantes)
          </div>
          <BlockMath math="I_l = \max(0, Q - D) \times p_l" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Donde <InlineMath math="p_l = {params.liquidationPrice}" /> UM es el precio de liquidación
          </p>
        </div>

        {/* Paso 4 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Paso 4: Ganancia total
          </div>
          <BlockMath math="G = I_v - C_c + I_l" />
        </div>

        {/* Simplificación */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
          <div className="font-semibold text-green-700 dark:text-green-300 mb-3">
            ✨ Forma Simplificada (usada en las simulaciones):
          </div>
          <BlockMath math="G(Q, D) = \min(Q, D) \times g - \max(0, Q - D) \times p_s" />
          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold">Si D ≥ Q (no hay sobrantes):</div>
              <InlineMath math={`G = Q \\times ${params.profit} = ${params.profit}Q`} />
            </div>
            <div>
              <div className="font-semibold">Si D &lt; Q (hay sobrantes):</div>
              <InlineMath math={`G = D \\times ${params.profit} - (Q-D) \\times ${params.excessLoss}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplo Numérico */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">💡 Ejemplo Numérico</h3>
        <div className="space-y-4">
          <div>
            <div className="font-semibold mb-2">Ejemplo 1: Q = 7000, D = 6500 (sobran 500 unidades)</div>
            <div className="pl-4 text-sm space-y-1">
              <div>• Unidades vendidas: 6500</div>
              <div>• Ganancia por ventas: 6500 × {params.profit} = {6500 * params.profit} UM</div>
              <div>• Pérdida por sobrantes: 500 × {params.excessLoss} = {500 * params.excessLoss} UM</div>
              <div className="font-bold text-green-700 dark:text-green-400">
                • Ganancia total: {6500 * params.profit - 500 * params.excessLoss} UM
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Ejemplo 2: Q = 7000, D = 7500 (faltan 500 unidades)</div>
            <div className="pl-4 text-sm space-y-1">
              <div>• Unidades vendidas: 7000 (todo el inventario)</div>
              <div>• Ganancia por ventas: 7000 × {params.profit} = {7000 * params.profit} UM</div>
              <div>• Pérdida por sobrantes: 0 UM</div>
              <div className="font-bold text-green-700 dark:text-green-400">
                • Ganancia total: {7000 * params.profit} UM
              </div>
              <div className="text-amber-600 dark:text-amber-400">
                • Nota: Se pierden 500 ventas potenciales (costo de oportunidad)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfitFunction;
