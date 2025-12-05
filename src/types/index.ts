// Tipos para la aplicación de simulación Monte Carlo

export interface SimulationParameters {
  mean: number;           // μ - Media de la demanda
  stdDev: number;         // σ - Desviación estándar
  salePrice: number;      // Precio de venta
  profit: number;         // Ganancia por venta
  liquidationPrice: number; // Precio de liquidación
  purchaseCost: number;   // Costo de compra
  excessLoss: number;     // Pérdida por sobrante
}

export interface SimulationResult {
  simulationNumber: number;
  randomNumber: number;    // Número aleatorio uniforme [0,1]
  zScore: number;         // Valor Z de la distribución normal
  demand: number;         // Demanda generada
  unitsSold: number;      // Unidades vendidas
  excessUnits: number;    // Unidades sobrantes
  shortageUnits: number;  // Unidades faltantes
  profit: number;         // Ganancia
}

export interface PolicySimulation {
  policyName: string;
  orderQuantity: number;  // Q - Cantidad a ordenar
  results: SimulationResult[];
}

export interface PolicyStatistics {
  policyName: string;
  orderQuantity: number;
  averageProfit: number;
  averageExcess: number;
  averageShortage: number;
  maxProfit: number;
  minProfit: number;
  stdDevProfit: number;
  selloutPercentage: number; // % de veces que se vendió todo
  totalSimulations: number;
}

export interface AnalyticalSolution {
  Cu: number;              // Costo unitario de quedarse corto
  Co: number;              // Costo de sobrestimar
  criticalRatio: number;   // Cu / (Cu + Co)
  zValue: number;          // Valor Z para P = criticalRatio
  optimalQuantity: number; // Q* óptima
}

export interface RandomNumberExample {
  index: number;
  randomUniform: number;
  zScore: number;
  demand: number;
}
