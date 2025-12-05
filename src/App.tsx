import { useState } from 'react';
import Header from './components/Header';
import ProfitFunction from './components/ProfitFunction';
import RandomNumbers from './components/RandomNumbers';
import Simulations from './components/Simulations';
import Statistics from './components/Statistics';
import AnalyticalSolution from './components/AnalyticalSolution';
import Conclusions from './components/Conclusions';
import type {
  SimulationParameters,
  PolicySimulation,
  PolicyStatistics,
  AnalyticalSolution as AnalyticalSolutionType,
} from './types';
import { calculateStatistics } from './utils/mathUtils';

function App() {
  const [showExplanations, setShowExplanations] = useState(true);

  const params: SimulationParameters = {
    mean: 7000,
    stdDev: 800,
    salePrice: 80,
    profit: 35,
    liquidationPrice: 20,
    purchaseCost: 45,
    excessLoss: 15,
  };

  const [policy1Simulation, setPolicy1Simulation] = useState<PolicySimulation | null>(null);
  const [policy2Simulation, setPolicy2Simulation] = useState<PolicySimulation | null>(null);
  const [optimalSimulation, setOptimalSimulation] = useState<PolicySimulation | null>(null);
  const [policy1Stats, setPolicy1Stats] = useState<PolicyStatistics | null>(null);
  const [policy2Stats, setPolicy2Stats] = useState<PolicyStatistics | null>(null);
  const [optimalStats, setOptimalStats] = useState<PolicyStatistics | null>(null);
  const [analyticalSolution, setAnalyticalSolution] = useState<AnalyticalSolutionType | null>(null);

  const handleSimulationsComplete = (p1: PolicySimulation, p2: PolicySimulation, pOpt: PolicySimulation) => {
    setPolicy1Simulation(p1);
    setPolicy2Simulation(p2);
    setOptimalSimulation(pOpt);
    setPolicy1Stats(calculateStatistics(p1.policyName, p1.orderQuantity, p1.results));
    setPolicy2Stats(calculateStatistics(p2.policyName, p2.orderQuantity, p2.results));
    setOptimalStats(calculateStatistics(pOpt.policyName, pOpt.orderQuantity, pOpt.results));
  };

  return (
    <div className="min-h-screen">
      <Header
        showExplanations={showExplanations}
        onToggleExplanations={() => setShowExplanations(!showExplanations)}
        policy1Stats={policy1Stats}
        policy2Stats={policy2Stats}
        optimalStats={optimalStats}
        policy1Simulation={policy1Simulation}
        policy2Simulation={policy2Simulation}
        optimalSimulation={optimalSimulation}
        analyticalSolution={analyticalSolution}
        params={params}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="text-center py-12 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🎄 Campaña Navideña - Tabletas para Niños</h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">Optimización de Inventario mediante Simulación Monte Carlo</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">80 UM</div>
              <div className="text-sm opacity-90">Precio Venta</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">35 UM</div>
              <div className="text-sm opacity-90">Ganancia</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">7000</div>
              <div className="text-sm opacity-90">Demanda μ</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">800</div>
              <div className="text-sm opacity-90">Desv. Est. σ</div>
            </div>
          </div>
        </section>

        <ProfitFunction params={params} showExplanations={showExplanations} />
        <RandomNumbers params={params} showExplanations={showExplanations} />
        <AnalyticalSolution params={params} showExplanations={showExplanations} onSolutionCalculated={setAnalyticalSolution} />
        <Simulations params={params} onSimulationsComplete={handleSimulationsComplete} optimalQuantity={analyticalSolution?.optimalQuantity} />
        <Statistics
          policy1Stats={policy1Stats}
          policy2Stats={policy2Stats}
          optimalStats={optimalStats}
          policy1Simulation={policy1Simulation}
          policy2Simulation={policy2Simulation}
          optimalSimulation={optimalSimulation}
        />
        <Conclusions
          policy1Stats={policy1Stats}
          policy2Stats={policy2Stats}
          optimalStats={optimalStats}
          analyticalSolution={analyticalSolution}
          policy1Simulation={policy1Simulation}
          policy2Simulation={policy2Simulation}
          optimalSimulation={optimalSimulation}
          params={params}
        />

        <footer className="text-center py-8 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm">💻 Investigación de Operaciones II - Simulación Monte Carlo</p>
          <p className="text-xs mt-2">Electrónicos Innovadores C.A. © 2024</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
