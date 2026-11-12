// Used only if the roi_* tables cannot be read, so the calculator never goes blank.
export const FALLBACK = {
  districts: [{ slug: 'valencia-ortalama', name: 'Valencia', ref_price: 270000, ref_rent: 1320, price_per_sqm: 3378, updated_at: null }],
  mortgages: [],
  assumptions: {
    itp_pct: 9, itp_high_pct: 11, itp_high_threshold: 1000000, vat_new_pct: 10, ajd_pct: 1.4, legal_costs_pct: 1.5, tax_noneu_pct: 24, tax_eu_pct: 19, vacancy_pct: 4, mgmt_fee_pct: 10,
    ibi_pct: 0.25, community_monthly: 50, insurance_annual: 250, maintenance_pct: 0.5, rent_growth_pct: 2,
    appreciation_pct: 2, str_multiplier: 1.8, str_cost_pct: 35,
  },
  updatedAt: null,
  fromFallback: true,
};

function amortize(loan, annualRatePct, years) {
  const n = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  if (loan <= 0 || n <= 0) return { payment: 0, interestByYear: [], principalByYear: [] };
  const payment = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  let bal = loan;
  const interestByYear = [];
  const principalByYear = [];
  for (let y = 0; y < Math.ceil(n / 12); y++) {
    let i = 0;
    let p = 0;
    for (let m = 0; m < 12 && y * 12 + m < n; m++) {
      const int = bal * r;
      const princ = payment - int;
      i += int;
      p += princ;
      bal -= princ;
    }
    interestByYear.push(i);
    principalByYear.push(p);
  }
  return { payment, interestByYear, principalByYear };
}

/**
 * price: purchase price (€). Returns yearly figures in €.
 * Rent comes from the district's typical rent/price ratio, so a different
 * flat size in the same district is only a rough guide.
 */
export function computeROI(input, data) {
  const a = data.assumptions;
  const d = data.districts.find((x) => x.slug === input.districtSlug) || data.districts[0];
  const P = input.price;

  const purchaseCosts = (P * (a.itp_pct + a.legal_costs_pct)) / 100;
  // Rent: from the flat's size when given (district rent per m²), otherwise from the district's rent/price ratio
  const area = Number(input.areaSqm) > 0 ? Number(input.areaSqm) : 0;
  const rentPerSqm = d.ref_rent / (Number(d.ref_area) > 0 ? Number(d.ref_area) : 80);
  const potentialRent = area ? area * rentPerSqm * 12 : P * ((d.ref_rent * 12) / d.ref_price);
  const marketYield = potentialRent / P;

  const short = input.strategy === 'short';
  const gross = short ? potentialRent * a.str_multiplier : potentialRent * (1 - a.vacancy_pct / 100);
  const mgmt = short ? 0 : (gross * a.mgmt_fee_pct) / 100;
  const strCost = short ? (gross * a.str_cost_pct) / 100 : 0;
  const ibi = (P * a.ibi_pct) / 100;
  const community = a.community_monthly * 12;
  const insurance = a.insurance_annual;
  const maintenance = (P * a.maintenance_pct) / 100;
  const opex = mgmt + strCost + ibi + community + insurance + maintenance;

  let loan = 0;
  let loanFee = 0;
  let schedule = { payment: 0, interestByYear: [], principalByYear: [] };
  const prod = input.financing === 'mortgage' ? data.mortgages.find((m) => m.id === input.mortgageId) : null;
  if (prod) {
    const ltv = Math.min(input.ltvPct, prod.max_ltv_pct);
    const years = Math.min(input.termYears, prod.max_term_years);
    loan = (P * ltv) / 100;
    loanFee = (loan * prod.fee_pct) / 100;
    schedule = amortize(loan, prod.rate_pct, years);
  }
  const debtService = schedule.payment * 12;

  const taxFor = (grossY, opexY, interestY) =>
    input.taxStatus === 'eu'
      ? (Math.max(0, grossY - opexY - interestY) * a.tax_eu_pct) / 100
      : (grossY * a.tax_noneu_pct) / 100;

  const tax = taxFor(gross, opex, schedule.interestByYear[0] || 0);
  const netOperating = gross - opex - tax; // after tax, before loan payments
  const cashFlow = netOperating - debtService;
  const equity = P - loan + purchaseCosts + loanFee;

  // 5-year view: rent and rent-linked costs grow, fixed costs stay flat
  const g = a.rent_growth_pct / 100;
  let cum = 0;
  let principal = 0;
  for (let y = 0; y < 5; y++) {
    const f = Math.pow(1 + g, y);
    const grossY = gross * f;
    const opexY = mgmt * f + strCost * f + ibi + community + insurance + maintenance;
    const interestY = schedule.interestByYear[y] || 0;
    const taxY = taxFor(grossY, opexY, interestY);
    cum += grossY - opexY - taxY - debtService;
    principal += schedule.principalByYear[y] || 0;
  }
  const valueGain = P * (Math.pow(1 + a.appreciation_pct / 100, 5) - 1);
  const fiveYearTotal = cum + principal + valueGain - purchaseCosts - loanFee;

  const tpl = d.ref_price;
  return {
    district: d,
    purchaseCosts,
    loan,
    loanFee,
    monthlyPayment: schedule.payment,
    gross,
    potentialRent,
    rentPerSqm,
    byArea: !!area,
    grossYield: marketYield,
    opex,
    breakdown: { mgmt, strCost, ibi, community, insurance, maintenance },
    tax,
    netOperating,
    netYield: netOperating / (P + purchaseCosts),
    cashFlow,
    monthlyCashFlow: cashFlow / 12,
    equity,
    cashOnCash: equity > 0 ? cashFlow / equity : 0,
    fiveYear: { cumulativeCashFlow: cum, principal, valueGain, total: fiveYearTotal, onEquity: equity > 0 ? fiveYearTotal / equity : 0 },
    priceVsTypical: P / tpl,
    mortgage: prod,
  };
}
