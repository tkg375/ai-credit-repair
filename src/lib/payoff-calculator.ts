export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface MonthlyDebtDetail {
  name: string;
  payment: number;
  balance: number;
  interestPaid: number;
}

export interface MonthlyScheduleEntry {
  month: number;
  debts: MonthlyDebtDetail[];
  totalBalance: number;
}

export interface PayoffResult {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  monthlySchedule: MonthlyScheduleEntry[];
  payoffDate: string;
}

function calculateSchedule(
  debts: Debt[],
  extraPayment: number,
  sortFn: (a: Debt, b: Debt) => number
): PayoffResult {
  if (debts.length === 0) {
    return { totalMonths: 0, totalInterest: 0, totalPaid: 0, monthlySchedule: [], payoffDate: new Date().toISOString() };
  }

  const balances = new Map<string, number>();
  debts.forEach((d) => balances.set(d.id, d.balance));

  const totalInterest = { value: 0 };
  const totalPaid = { value: 0 };
  const schedule: MonthlyScheduleEntry[] = [];
  let month = 0;
  const maxMonths = 600; // 50 year cap

  while (month < maxMonths) {
    const remainingDebts = debts.filter((d) => (balances.get(d.id) || 0) > 0.01);
    if (remainingDebts.length === 0) break;

    month++;
    const sorted = [...remainingDebts].sort(sortFn);
    let extraLeft = extraPayment;
    const monthDetails: MonthlyDebtDetail[] = [];

    // First pass: apply minimum payments and interest
    for (const debt of remainingDebts) {
      const bal = balances.get(debt.id) || 0;
      const monthlyRate = debt.interestRate / 100 / 12;
      const interest = bal * monthlyRate;
      totalInterest.value += interest;

      const minPay = Math.min(debt.minimumPayment, bal + interest);
      const newBal = bal + interest - minPay;
      totalPaid.value += minPay;
      balances.set(debt.id, Math.max(0, newBal));

      monthDetails.push({
        name: debt.name,
        payment: minPay,
        balance: Math.max(0, newBal),
        interestPaid: interest,
      });
    }

    // Second pass: apply extra payment to priority debt
    for (const debt of sorted) {
      if (extraLeft <= 0) break;
      const bal = balances.get(debt.id) || 0;
      if (bal <= 0) continue;

      const extraApplied = Math.min(extraLeft, bal);
      balances.set(debt.id, bal - extraApplied);
      extraLeft -= extraApplied;
      totalPaid.value += extraApplied;

      const detail = monthDetails.find((d) => d.name === debt.name);
      if (detail) {
        detail.payment += extraApplied;
        detail.balance = Math.max(0, bal - extraApplied);
      }
    }

    const totalBalance = Array.from(balances.values()).reduce((s, b) => s + b, 0);
    schedule.push({ month, debts: monthDetails, totalBalance });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    totalMonths: month,
    totalInterest: Math.round(totalInterest.value * 100) / 100,
    totalPaid: Math.round(totalPaid.value * 100) / 100,
    monthlySchedule: schedule,
    payoffDate: payoffDate.toISOString(),
  };
}

export function calculateAvalanche(debts: Debt[], extraPayment: number): PayoffResult {
  return calculateSchedule(debts, extraPayment, (a, b) => b.interestRate - a.interestRate);
}

export function calculateSnowball(debts: Debt[], extraPayment: number): PayoffResult {
  return calculateSchedule(debts, extraPayment, (a, b) => {
    const balA = a.balance;
    const balB = b.balance;
    return balA - balB;
  });
}

export function calculateMinimumOnly(debts: Debt[]): PayoffResult {
  return calculateSchedule(debts, 0, () => 0);
}
