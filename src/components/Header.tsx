import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Download, FileDown } from 'lucide-react';
import type { PolicyStatistics, AnalyticalSolution, PolicySimulation, SimulationParameters } from '../types';
import { exportToExcel, exportToPDF, generateAutoConclusions } from '../utils/exportUtils';

interface HeaderProps {
  showExplanations: boolean;
  onToggleExplanations: () => void;
  policy1Stats: PolicyStatistics | null;
  policy2Stats: PolicyStatistics | null;
  optimalStats: PolicyStatistics | null;
  policy1Simulation: PolicySimulation | null;
  policy2Simulation: PolicySimulation | null;
  optimalSimulation: PolicySimulation | null;
  analyticalSolution: AnalyticalSolution | null;
  params: SimulationParameters;
}

const Header: React.FC<HeaderProps> = ({
  showExplanations,
  onToggleExplanations,
  policy1Stats,
  policy2Stats,
  optimalStats,
  policy1Simulation,
  policy2Simulation,
  optimalSimulation,
  analyticalSolution,
  params,
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
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
      const conclusions = generateAutoConclusions(policy1Stats, policy2Stats, optimalStats, analyticalSolution);
      exportToPDF(params, policy1Stats, policy2Stats, optimalStats, analyticalSolution, conclusions);
    }
  };

  const canExport = policy1Stats && policy2Stats && optimalStats;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Electrónicos Innovadores C.A.
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Simulación Monte Carlo - Gestión de Inventario
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('profit-function')}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Función de Ganancia
            </button>
            <button
              onClick={() => scrollToSection('random-numbers')}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Números Aleatorios
            </button>
            <button
              onClick={() => scrollToSection('simulations')}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Simulaciones
            </button>
            <button
              onClick={() => scrollToSection('statistics')}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Estadísticas
            </button>
            <button
              onClick={() => scrollToSection('analytical-solution')}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Solución Analítica
            </button>
            <button
              onClick={() => scrollToSection('conclusions')}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Conclusiones
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                disabled={!canExport}
                className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Descargar Excel"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!canExport}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Descargar PDF"
              >
                <FileDown className="w-5 h-5" />
              </button>
            </div>

            {/* Tutorial Toggle */}
            <label className="hidden sm:flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExplanations}
                onChange={onToggleExplanations}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${showExplanations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showExplanations ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Tutorial</span>
            </label>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <button
              onClick={() => scrollToSection('profit-function')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              📐 Función de Ganancia
            </button>
            <button
              onClick={() => scrollToSection('random-numbers')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              🎲 Números Aleatorios
            </button>
            <button
              onClick={() => scrollToSection('simulations')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              🔄 Simulaciones
            </button>
            <button
              onClick={() => scrollToSection('statistics')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              📊 Estadísticas
            </button>
            <button
              onClick={() => scrollToSection('analytical-solution')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              🧮 Solución Analítica
            </button>
            <button
              onClick={() => scrollToSection('conclusions')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              📝 Conclusiones
            </button>
            <div className="flex gap-2 px-4 pt-2">
              <button
                onClick={handleExportExcel}
                disabled={!canExport}
                className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Excel
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!canExport}
                className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4 h-4 inline mr-1" />
                PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
