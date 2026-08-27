/**
 * CNSS / AMO payroll deductions (employee share, withheld at source).
 */

/** CNSS "prestations sociales" employee contribution is capped on this monthly base. */
export const CNSS_MONTHLY_CEILING = 6000;

/** Employee-side CNSS deduction, capped at CNSS_MONTHLY_CEILING. */
export function calculateCnssDeduction(baseSalary: number, cnssRate: number, registered: boolean): number {
  if (!registered) return 0;
  return Math.min(baseSalary, CNSS_MONTHLY_CEILING) * cnssRate;
}

/** Employee-side AMO deduction — uncapped. */
export function calculateAmoDeduction(baseSalary: number, amoRate: number, registered: boolean): number {
  if (!registered) return 0;
  return baseSalary * amoRate;
}

export interface PayrollInput {
  baseSalary: number;
  prime: number;
  cnssRegistered: boolean;
  amoRegistered: boolean;
}

export interface PayrollBreakdown {
  cnssDeduction: number;
  amoDeduction: number;
  netPaid: number;
}

/** Full net-pay breakdown for one payslip. */
export function calculatePayroll(input: PayrollInput, taxSettings: { cnssRate: number; amoRate: number }): PayrollBreakdown {
  const cnssDeduction = calculateCnssDeduction(input.baseSalary, taxSettings.cnssRate, input.cnssRegistered);
  const amoDeduction = calculateAmoDeduction(input.baseSalary, taxSettings.amoRate, input.amoRegistered);
  const netPaid = input.baseSalary + input.prime - cnssDeduction - amoDeduction;
  return { cnssDeduction, amoDeduction, netPaid };
}
