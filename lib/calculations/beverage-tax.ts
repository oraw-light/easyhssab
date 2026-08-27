import type { SectorType } from '../../src/types';

/**
 * Taxe sur les débits de boissons — only applies to sectors that actually serve
 * drinks on-site. (The pre-migration TaxEngine checked a constant instead of the
 * establishment's real sector, which always evaluated true — fixed here.)
 */
export const CATERING_SECTORS: SectorType[] = ['Cafe', 'Restaurant', 'Snack', 'SalonDeThe', 'Glacier', 'Hotel'];

export function isCateringSector(sector: SectorType): boolean {
  return CATERING_SECTORS.includes(sector);
}

export function calculateBeverageTax(totalRevenue: number, beverageTaxRate: number, sector: SectorType): number {
  return isCateringSector(sector) ? Math.max(0, totalRevenue * beverageTaxRate) : 0;
}
