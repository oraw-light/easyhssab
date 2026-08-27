/**
 * Taxe de Patente — municipal business-operation tax, computed on turnover.
 */
export function calculatePatente(totalRevenue: number, patenteRate: number): number {
  return Math.max(0, totalRevenue * patenteRate);
}
