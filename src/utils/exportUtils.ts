import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type {
  SimulationResult,
  PolicyStatistics,
  AnalyticalSolution,
  SimulationParameters,
} from '../types';
import { formatCurrency, formatNumber, formatPercentage } from './mathUtils';

/**
 * Exporta las tablas de simulación a Excel
 */
export function exportToExcel(
  policy1Results: SimulationResult[],
  policy2Results: SimulationResult[],
  optimalResults: SimulationResult[],
  policy1Stats: PolicyStatistics,
  policy2Stats: PolicyStatistics,
  optimalStats: PolicyStatistics
): void {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Política 1
  const ws1Data = [
    [
      '#',
      'Aleatorio',
      'Z-Score',
      'Demanda',
      'Vendidas',
      'Sobrantes',
      'Faltantes',
      'Ganancia',
    ],
    ...policy1Results.map((r) => [
      r.simulationNumber,
      r.randomNumber.toFixed(4),
      r.zScore.toFixed(4),
      r.demand,
      r.unitsSold,
      r.excessUnits,
      r.shortageUnits,
      r.profit,
    ]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  XLSX.utils.book_append_sheet(wb, ws1, `Política 1 (Q=${policy1Stats.orderQuantity})`);

  // Hoja 2: Política 2
  const ws2Data = [
    [
      '#',
      'Aleatorio',
      'Z-Score',
      'Demanda',
      'Vendidas',
      'Sobrantes',
      'Faltantes',
      'Ganancia',
    ],
    ...policy2Results.map((r) => [
      r.simulationNumber,
      r.randomNumber.toFixed(4),
      r.zScore.toFixed(4),
      r.demand,
      r.unitsSold,
      r.excessUnits,
      r.shortageUnits,
      r.profit,
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  XLSX.utils.book_append_sheet(wb, ws2, `Política 2 (Q=${policy2Stats.orderQuantity})`);

  // Hoja 3: Política Óptima
  const ws3Data = [
    [
      '#',
      'Aleatorio',
      'Z-Score',
      'Demanda',
      'Vendidas',
      'Sobrantes',
      'Faltantes',
      'Ganancia',
    ],
    ...optimalResults.map((r) => [
      r.simulationNumber,
      r.randomNumber.toFixed(4),
      r.zScore.toFixed(4),
      r.demand,
      r.unitsSold,
      r.excessUnits,
      r.shortageUnits,
      r.profit,
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  XLSX.utils.book_append_sheet(wb, ws3, `Óptima (Q=${optimalStats.orderQuantity})`);

  // Hoja 4: Comparación de Estadísticas
  const ws4Data = [
    ['Métrica', 'Política 1', 'Política 2', 'Política Óptima'],
    [
      'Cantidad a Ordenar (Q)',
      policy1Stats.orderQuantity,
      policy2Stats.orderQuantity,
      optimalStats.orderQuantity,
    ],
    [
      'Ganancia Promedio',
      policy1Stats.averageProfit.toFixed(2),
      policy2Stats.averageProfit.toFixed(2),
      optimalStats.averageProfit.toFixed(2),
    ],
    [
      'Sobrantes Promedio',
      policy1Stats.averageExcess.toFixed(2),
      policy2Stats.averageExcess.toFixed(2),
      optimalStats.averageExcess.toFixed(2),
    ],
    [
      'Faltantes Promedio',
      policy1Stats.averageShortage.toFixed(2),
      policy2Stats.averageShortage.toFixed(2),
      optimalStats.averageShortage.toFixed(2),
    ],
    [
      'Ganancia Máxima',
      policy1Stats.maxProfit.toFixed(2),
      policy2Stats.maxProfit.toFixed(2),
      optimalStats.maxProfit.toFixed(2),
    ],
    [
      'Ganancia Mínima',
      policy1Stats.minProfit.toFixed(2),
      policy2Stats.minProfit.toFixed(2),
      optimalStats.minProfit.toFixed(2),
    ],
    [
      'Desviación Estándar',
      policy1Stats.stdDevProfit.toFixed(2),
      policy2Stats.stdDevProfit.toFixed(2),
      optimalStats.stdDevProfit.toFixed(2),
    ],
    [
      'Porcentaje Ventas Completas',
      policy1Stats.selloutPercentage.toFixed(2) + '%',
      policy2Stats.selloutPercentage.toFixed(2) + '%',
      optimalStats.selloutPercentage.toFixed(2) + '%',
    ],
    ['Simulaciones Totales', policy1Stats.totalSimulations],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
  XLSX.utils.book_append_sheet(wb, ws4, 'Comparación');

  // Guardar archivo
  XLSX.writeFile(wb, 'Simulacion_Monte_Carlo_Inventario.xlsx');
}

/**
 * Exporta un reporte completo a PDF
 */
export function exportToPDF(
  params: SimulationParameters,
  policy1Stats: PolicyStatistics,
  policy2Stats: PolicyStatistics,
  optimalStats: PolicyStatistics,
  analyticalSolution: AnalyticalSolution,
  conclusions: string
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Título
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text('Simulación Monte Carlo - Inventario', 105, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(14);
  doc.text('Electrónicos Innovadores C.A.', 105, yPos, { align: 'center' });
  yPos += 15;

  // Parámetros
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Parámetros del Problema:', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`• Demanda: Normal(μ=${params.mean}, σ=${params.stdDev})`, 25, yPos);
  yPos += 6;
  doc.text(`• Precio de venta: ${formatCurrency(params.salePrice)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Ganancia por venta: ${formatCurrency(params.profit)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Costo de compra: ${formatCurrency(params.purchaseCost)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Precio de liquidación: ${formatCurrency(params.liquidationPrice)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Pérdida por sobrante: ${formatCurrency(params.excessLoss)}`, 25, yPos);
  yPos += 12;

  // Solución Analítica
  doc.setFontSize(12);
  doc.setTextColor(147, 51, 234); // Purple
  doc.text('Solución Analítica:', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`• Cu (costo de quedarse corto): ${formatCurrency(analyticalSolution.Cu)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Co (costo de sobrestimar): ${formatCurrency(analyticalSolution.Co)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Razón crítica: ${analyticalSolution.criticalRatio.toFixed(4)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Valor Z: ${analyticalSolution.zValue.toFixed(4)}`, 25, yPos);
  yPos += 6;
  doc.text(`• Cantidad óptima (Q*): ${analyticalSolution.optimalQuantity} unidades`, 25, yPos);
  yPos += 12;

  // Tabla Comparativa
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94); // Green
  doc.text('Comparación de Políticas:', 20, yPos);
  yPos += 10;

  // Headers
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(37, 99, 235);
  doc.rect(20, yPos - 5, 170, 7, 'F');
  doc.text('Métrica', 25, yPos);
  doc.text('Política 1', 75, yPos);
  doc.text('Política 2', 115, yPos);
  doc.text('Óptima', 160, yPos);
  yPos += 8;

  // Datos
  doc.setTextColor(0, 0, 0);
  const stats = [
    ['Q (unidades)', policy1Stats.orderQuantity, policy2Stats.orderQuantity, optimalStats.orderQuantity],
    ['Ganancia Prom.', formatCurrency(policy1Stats.averageProfit), formatCurrency(policy2Stats.averageProfit), formatCurrency(optimalStats.averageProfit)],
    ['Sobrantes Prom.', formatNumber(policy1Stats.averageExcess, 2), formatNumber(policy2Stats.averageExcess, 2), formatNumber(optimalStats.averageExcess, 2)],
    ['Faltantes Prom.', formatNumber(policy1Stats.averageShortage, 2), formatNumber(policy2Stats.averageShortage, 2), formatNumber(optimalStats.averageShortage, 2)],
    ['Desv. Est.', formatCurrency(policy1Stats.stdDevProfit), formatCurrency(policy2Stats.stdDevProfit), formatCurrency(optimalStats.stdDevProfit)],
    ['% Ventas Comp.', formatPercentage(policy1Stats.selloutPercentage), formatPercentage(policy2Stats.selloutPercentage), formatPercentage(optimalStats.selloutPercentage)],
  ];

  stats.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, 170, 7, 'F');
    }
    doc.text(row[0], 25, yPos);
    doc.text(String(row[1]), 75, yPos);
    doc.text(String(row[2]), 115, yPos);
    doc.text(String(row[3]), 160, yPos);
    yPos += 7;
  });

  // Nueva página para conclusiones
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Conclusiones y Recomendaciones', 105, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Dividir el texto en líneas
  const lines = doc.splitTextToSize(conclusions, 170);
  lines.forEach((line: string) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 20, yPos);
    yPos += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-ES')} | Simulaciones: ${policy1Stats.totalSimulations}`,
    105,
    285,
    { align: 'center' }
  );

  // Guardar
  doc.save('Reporte_Simulacion_Monte_Carlo.pdf');
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return false;
  }
}

/**
 * Genera el texto de conclusiones automáticas
 */
export function generateAutoConclusions(
  policy1Stats: PolicyStatistics,
  policy2Stats: PolicyStatistics,
  optimalStats: PolicyStatistics,
  analyticalSolution: AnalyticalSolution
): string {
  // Validar que todos los valores existan y sean números válidos
  const policies = [policy1Stats, policy2Stats, optimalStats].filter(p =>
    p && !isNaN(p.averageProfit) && !isNaN(p.stdDevProfit)
  );

  if (policies.length === 0) {
    return 'Error: No se pudieron calcular las estadísticas correctamente.';
  }

  const bestPolicy = policies.reduce((best, current) =>
    (current.averageProfit || 0) > (best.averageProfit || 0) ? current : best
  );

  const mostStable = policies.reduce((stable, current) =>
    (current.stdDevProfit || Infinity) < (stable.stdDevProfit || Infinity) ? current : stable
  );

  return `ANÁLISIS COMPARATIVO DE POLÍTICAS DE INVENTARIO

1. RESULTADOS GENERALES

Se realizaron ${policy1Stats.totalSimulations.toLocaleString()} simulaciones Monte Carlo para evaluar tres políticas de inventario diferentes para la campaña navideña de tabletas de Electrónicos Innovadores C.A.

2. POLÍTICA 1: Q = ${policy1Stats.orderQuantity} unidades
- Ganancia promedio: ${formatCurrency(policy1Stats.averageProfit)}
- Sobrantes promedio: ${formatNumber(policy1Stats.averageExcess, 2)} unidades
- Faltantes promedio: ${formatNumber(policy1Stats.averageShortage, 2)} unidades
- Desviación estándar: ${formatCurrency(policy1Stats.stdDevProfit)}
- Porcentaje de ventas completas: ${formatPercentage(policy1Stats.selloutPercentage)}

3. POLÍTICA 2: Q = ${policy2Stats.orderQuantity} unidades
- Ganancia promedio: ${formatCurrency(policy2Stats.averageProfit)}
- Sobrantes promedio: ${formatNumber(policy2Stats.averageExcess, 2)} unidades
- Faltantes promedio: ${formatNumber(policy2Stats.averageShortage, 2)} unidades
- Desviación estándar: ${formatCurrency(policy2Stats.stdDevProfit)}
- Porcentaje de ventas completas: ${formatPercentage(policy2Stats.selloutPercentage)}

4. POLÍTICA ÓPTIMA ANALÍTICA: Q* = ${optimalStats.orderQuantity} unidades
- Ganancia promedio: ${formatCurrency(optimalStats.averageProfit)}
- Sobrantes promedio: ${formatNumber(optimalStats.averageExcess, 2)} unidades
- Faltantes promedio: ${formatNumber(optimalStats.averageShortage, 2)} unidades
- Desviación estándar: ${formatCurrency(optimalStats.stdDevProfit)}
- Porcentaje de ventas completas: ${formatPercentage(optimalStats.selloutPercentage)}

5. SOLUCIÓN ANALÍTICA

Utilizando el modelo de cantidad óptima con demanda incierta:
- Costo unitario de quedarse corto (Cu): ${formatCurrency(analyticalSolution.Cu)}
- Costo de sobrestimar (Co): ${formatCurrency(analyticalSolution.Co)}
- Razón crítica: ${(analyticalSolution.criticalRatio * 100).toFixed(2)}%
- Valor Z para P=${(analyticalSolution.criticalRatio * 100).toFixed(2)}%: ${analyticalSolution.zValue.toFixed(4)}
- Cantidad óptima calculada: Q* = μ + Z×σ = ${analyticalSolution.optimalQuantity} unidades

6. ANÁLISIS DE RIESGO

Política más estable (menor variabilidad): ${mostStable.policyName} con desviación estándar de ${formatCurrency(mostStable.stdDevProfit)}.

${policy1Stats.stdDevProfit < policy2Stats.stdDevProfit
  ? 'La Política 1 muestra menor riesgo pero posiblemente menor ganancia debido a mayores costos de inventario.'
  : 'La Política 2 presenta mayor riesgo pero potencialmente mejores ganancias al reducir costos de sobrantes.'}

7. RECOMENDACIÓN FINAL

Basándose en los resultados de la simulación Monte Carlo, se recomienda implementar la ${bestPolicy.policyName} con Q = ${bestPolicy.orderQuantity} unidades, ya que:

✓ Maximiza la ganancia esperada: ${formatCurrency(bestPolicy.averageProfit)}
✓ ${bestPolicy === mostStable ? 'Presenta la menor variabilidad en los resultados' : `Ofrece un balance adecuado entre ganancia y riesgo`}
✓ ${bestPolicy.selloutPercentage > 50 ? 'Minimiza el riesgo de inventario no vendido' : 'Minimiza el riesgo de demanda insatisfecha'}

La diferencia entre las políticas demuestra la importancia de usar métodos cuantitativos para la toma de decisiones en gestión de inventarios, especialmente cuando existe incertidumbre en la demanda.

8. CONSIDERACIONES ADICIONALES

- La demanda sigue una distribución Normal(μ=7000, σ=800), lo que implica que aproximadamente el 68% de las veces la demanda estará entre 6,200 y 7,800 unidades.
- El costo de oportunidad de quedarse corto (${formatCurrency(analyticalSolution.Cu)}) es ${(analyticalSolution.Cu / analyticalSolution.Co).toFixed(2)} veces mayor que el costo de sobrestimar (${formatCurrency(analyticalSolution.Co)}), justificando una política más conservadora.
- Se sugiere monitorear las ventas reales durante la campaña para ajustar pronósticos futuros.`;
}
