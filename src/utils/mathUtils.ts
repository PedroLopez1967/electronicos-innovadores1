import type {
  SimulationParameters,
  SimulationResult,
  PolicyStatistics,
  AnalyticalSolution,
  RandomNumberExample,
} from '../types';

/**
 * Genera un número aleatorio con distribución normal usando Box-Muller
 * @param mean - Media de la distribución
 * @param stdDev - Desviación estándar
 * @param uniform - Número aleatorio uniforme [0,1] (opcional)
 * @returns Objeto con el número aleatorio, Z-score y valor generado
 */
export function generateNormalRandom(
  mean: number,
  stdDev: number,
  uniform?: number
): { uniform: number; zScore: number; value: number } {
  // Si no se proporciona uniform, generar uno
  const u = uniform !== undefined ? uniform : Math.random();

  // Box-Muller transform
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());

  // Transformar a la distribución deseada
  const value = mean + z * stdDev;

  return {
    uniform: u,
    zScore: z,
    value: Math.round(value), // Redondeamos porque la demanda es entera
  };
}

/**
 * Calcula la inversa de la función de distribución acumulada normal estándar
 * Aproximación de Beasley-Springer-Moro
 */
export function inverseNormalCDF(p: number): number {
  // Constantes para la aproximación
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.383577518672690e2,
    -3.066479806614716e1,
    2.506628277459239
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416
  ];

  // Límites
  const p_low = 0.02425;
  const p_high = 1 - p_low;

  let q: number, r: number, z: number;

  if (p < p_low) {
    // Región de cola izquierda
    q = Math.sqrt(-2 * Math.log(p));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= p_high) {
    // Región central
    q = p - 0.5;
    r = q * q;
    z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    // Región de cola derecha
    q = Math.sqrt(-2 * Math.log(1 - p));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return z;
}

/**
 * Genera ejemplos de números aleatorios para demostración
 */
export function generateRandomExamples(
  params: SimulationParameters,
  count: number = 10,
  seed?: number
): RandomNumberExample[] {
  const examples: RandomNumberExample[] = [];

  // Si hay seed, usarlo para Math.random (limitación de JS)
  if (seed !== undefined) {
    // Usar un generador simple con seed
    let currentSeed = seed;
    for (let i = 0; i < count; i++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const uniform = currentSeed / 233280;
      const { zScore, value } = generateNormalRandom(params.mean, params.stdDev, uniform);

      examples.push({
        index: i + 1,
        randomUniform: uniform,
        zScore,
        demand: value,
      });
    }
  } else {
    for (let i = 0; i < count; i++) {
      const { uniform, zScore, value } = generateNormalRandom(params.mean, params.stdDev);

      examples.push({
        index: i + 1,
        randomUniform: uniform,
        zScore,
        demand: value,
      });
    }
  }

  return examples;
}

/**
 * Calcula la ganancia para una simulación individual
 */
export function calculateProfit(
  demand: number,
  orderQuantity: number,
  params: SimulationParameters
): {
  unitsSold: number;
  excessUnits: number;
  shortageUnits: number;
  profit: number;
} {
  const unitsSold = Math.min(demand, orderQuantity);
  const excessUnits = Math.max(0, orderQuantity - demand);
  const shortageUnits = Math.max(0, demand - orderQuantity);

  // Ganancia = (Unidades vendidas × Ganancia unitaria) - (Sobrantes × Pérdida por sobrante)
  const profit = unitsSold * params.profit - excessUnits * params.excessLoss;

  return {
    unitsSold,
    excessUnits,
    shortageUnits,
    profit,
  };
}

/**
 * Ejecuta una simulación Monte Carlo completa para una política
 */
export function runMonteCarloSimulation(
  orderQuantity: number,
  params: SimulationParameters,
  numSimulations: number,
  seed?: number
): SimulationResult[] {
  const results: SimulationResult[] = [];

  if (seed !== undefined) {
    let currentSeed = seed;
    for (let i = 0; i < numSimulations; i++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const uniform = currentSeed / 233280;
      const { zScore, value: demand } = generateNormalRandom(
        params.mean,
        params.stdDev,
        uniform
      );

      const { unitsSold, excessUnits, shortageUnits, profit } = calculateProfit(
        demand,
        orderQuantity,
        params
      );

      results.push({
        simulationNumber: i + 1,
        randomNumber: uniform,
        zScore,
        demand,
        unitsSold,
        excessUnits,
        shortageUnits,
        profit,
      });
    }
  } else {
    for (let i = 0; i < numSimulations; i++) {
      const { uniform, zScore, value: demand } = generateNormalRandom(
        params.mean,
        params.stdDev
      );

      const { unitsSold, excessUnits, shortageUnits, profit } = calculateProfit(
        demand,
        orderQuantity,
        params
      );

      results.push({
        simulationNumber: i + 1,
        randomNumber: uniform,
        zScore,
        demand,
        unitsSold,
        excessUnits,
        shortageUnits,
        profit,
      });
    }
  }

  return results;
}

/**
 * Calcula estadísticas para los resultados de una política
 */
export function calculateStatistics(
  policyName: string,
  orderQuantity: number,
  results: SimulationResult[]
): PolicyStatistics {
  const n = results.length;

  // Validar que hay resultados
  if (n === 0) {
    return {
      policyName,
      orderQuantity,
      averageProfit: 0,
      averageExcess: 0,
      averageShortage: 0,
      maxProfit: 0,
      minProfit: 0,
      stdDevProfit: 0,
      selloutPercentage: 0,
      totalSimulations: 0,
    };
  }

  // Calcular promedios con validación
  const averageProfit = results.reduce((sum, r) => sum + (r.profit || 0), 0) / n;
  const averageExcess = results.reduce((sum, r) => sum + (r.excessUnits || 0), 0) / n;
  const averageShortage = results.reduce((sum, r) => sum + (r.shortageUnits || 0), 0) / n;

  // Calcular máximos y mínimos con valores seguros
  const profits = results.map(r => r.profit || 0);
  const maxProfit = profits.length > 0 ? Math.max(...profits) : 0;
  const minProfit = profits.length > 0 ? Math.min(...profits) : 0;

  // Calcular desviación estándar de la ganancia
  const variance = results.reduce((sum, r) => sum + Math.pow((r.profit || 0) - averageProfit, 2), 0) / n;
  const stdDevProfit = Math.sqrt(variance);

  // Calcular porcentaje de veces que se vendió todo (shortage = 0)
  const selloutCount = results.filter(r => r.shortageUnits === 0).length;
  const selloutPercentage = n > 0 ? (selloutCount / n) * 100 : 0;

  return {
    policyName,
    orderQuantity,
    averageProfit: isNaN(averageProfit) ? 0 : averageProfit,
    averageExcess: isNaN(averageExcess) ? 0 : averageExcess,
    averageShortage: isNaN(averageShortage) ? 0 : averageShortage,
    maxProfit: isNaN(maxProfit) ? 0 : maxProfit,
    minProfit: isNaN(minProfit) ? 0 : minProfit,
    stdDevProfit: isNaN(stdDevProfit) ? 0 : stdDevProfit,
    selloutPercentage: isNaN(selloutPercentage) ? 0 : selloutPercentage,
    totalSimulations: n,
  };
}

/**
 * Calcula la solución analítica del problema
 */
export function calculateAnalyticalSolution(
  params: SimulationParameters
): AnalyticalSolution {
  // Cu = costo de quedarse corto = ganancia perdida
  const Cu = params.profit;

  // Co = costo de sobrestimar = pérdida por sobrante
  const Co = params.excessLoss;

  // Razón crítica
  const criticalRatio = Cu / (Cu + Co);

  // Encontrar el valor Z que corresponde a P = criticalRatio
  const zValue = inverseNormalCDF(criticalRatio);

  // Calcular Q* = μ + Z × σ
  const optimalQuantity = Math.round(params.mean + zValue * params.stdDev);

  return {
    Cu,
    Co,
    criticalRatio,
    zValue,
    optimalQuantity,
  };
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(value: number): string {
  return `${value.toFixed(2)} UM`;
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
