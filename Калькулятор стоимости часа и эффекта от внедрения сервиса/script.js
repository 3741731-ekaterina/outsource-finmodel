const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const form = document.querySelector("#calculator-form");
const warning = document.querySelector("#warning");

const fields = {
  monthlyDividends: document.querySelector("#monthlyDividends"),
  workingHoursPerMonth: document.querySelector("#workingHoursPerMonth"),
  reportHoursPerMonth: document.querySelector("#reportHoursPerMonth"),
  serviceCostPerMonth: document.querySelector("#serviceCostPerMonth"),
  monthlyRevenue: document.querySelector("#monthlyRevenue"),
  expenseReductionRate: document.querySelector("#expenseReductionRate"),
};

const output = {
  heroTotal: document.querySelector("#hero-total"),
  ownerHourlyRate: document.querySelector("#ownerHourlyRate"),
  timeSavingPerYear: document.querySelector("#timeSavingPerYear"),
  expenseSavingPerYear: document.querySelector("#expenseSavingPerYear"),
  totalSavingPerYear: document.querySelector("#totalSavingPerYear"),
  reportHoursPerYear: document.querySelector("#reportHoursPerYear"),
  reportWorkDaysPerYear: document.querySelector("#reportWorkDaysPerYear"),
  currentAccountingCostPerMonth: document.querySelector("#currentAccountingCostPerMonth"),
  currentAccountingCostPerYear: document.querySelector("#currentAccountingCostPerYear"),
  timeSavingPerMonth: document.querySelector("#timeSavingPerMonth"),
  expenseSavingPerMonth: document.querySelector("#expenseSavingPerMonth"),
  monthlyTable: document.querySelector("#monthly-table"),
};

const rubFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "RUB",
});

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

function readNumber(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : 0;
}

function money(value) {
  return rubFormatter.format(value).replace("₽", "₽");
}

function calculate(input) {
  const workingHoursPerMonth = Math.max(input.workingHoursPerMonth, 0);
  const ownerHourlyRate =
    workingHoursPerMonth > 0 ? input.monthlyDividends / workingHoursPerMonth : 0;
  const reportHoursPerYear = input.reportHoursPerMonth * 12;
  const reportWorkDaysPerYear = reportHoursPerYear / 8;
  const currentAccountingCostPerMonth = input.reportHoursPerMonth * ownerHourlyRate;
  const currentAccountingCostPerYear = currentAccountingCostPerMonth * 12;
  const timeSavingPerMonth = currentAccountingCostPerMonth - input.serviceCostPerMonth;
  const timeSavingPerYear = timeSavingPerMonth * 12;
  const expenseSavingPerMonth = input.monthlyRevenue * input.expenseReductionRate;
  const expenseSavingPerYear = expenseSavingPerMonth * 12;

  const monthlyCumulative = MONTHS.map((month, index) => {
    const multiplier = index + 1;
    const timeSaving = timeSavingPerMonth * multiplier;
    const expenseSaving = expenseSavingPerMonth * multiplier;

    return {
      month,
      timeSaving,
      expenseSaving,
      totalSaving: timeSaving + expenseSaving,
    };
  });

  return {
    ownerHourlyRate,
    reportHoursPerYear,
    reportWorkDaysPerYear,
    currentAccountingCostPerMonth,
    currentAccountingCostPerYear,
    timeSavingPerMonth,
    timeSavingPerYear,
    expenseSavingPerMonth,
    expenseSavingPerYear,
    totalSavingPerYear: timeSavingPerYear + expenseSavingPerYear,
    monthlyCumulative,
  };
}

function readInput() {
  return {
    monthlyDividends: readNumber(fields.monthlyDividends),
    workingHoursPerMonth: readNumber(fields.workingHoursPerMonth),
    reportHoursPerMonth: readNumber(fields.reportHoursPerMonth),
    serviceCostPerMonth: readNumber(fields.serviceCostPerMonth),
    monthlyRevenue: readNumber(fields.monthlyRevenue),
    expenseReductionRate: readNumber(fields.expenseReductionRate) / 100,
  };
}

function renderMonthlyRows(rows) {
  output.monthlyTable.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.month}</td>
          <td>${money(row.timeSaving)}</td>
          <td>${money(row.expenseSaving)}</td>
          <td>${money(row.totalSaving)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderWarning(input, result) {
  const messages = [];

  if (input.workingHoursPerMonth <= 0) {
    messages.push("Укажите рабочие часы в месяц, чтобы рассчитать стоимость часа.");
  }

  if (result.timeSavingPerMonth < 0) {
    messages.push("Стоимость сервиса выше текущей расчетной стоимости ручного учета.");
  }

  warning.hidden = messages.length === 0;
  warning.textContent = messages.join(" ");
}

function render() {
  const input = readInput();
  const result = calculate(input);

  output.heroTotal.textContent = money(result.totalSavingPerYear);
  output.ownerHourlyRate.textContent = money(result.ownerHourlyRate);
  output.timeSavingPerYear.textContent = money(result.timeSavingPerYear);
  output.expenseSavingPerYear.textContent = money(result.expenseSavingPerYear);
  output.totalSavingPerYear.textContent = money(result.totalSavingPerYear);
  output.reportHoursPerYear.textContent = `${numberFormatter.format(result.reportHoursPerYear)} ч`;
  output.reportWorkDaysPerYear.textContent = `${numberFormatter.format(result.reportWorkDaysPerYear)} дн.`;
  output.currentAccountingCostPerMonth.textContent = money(result.currentAccountingCostPerMonth);
  output.currentAccountingCostPerYear.textContent = money(result.currentAccountingCostPerYear);
  output.timeSavingPerMonth.textContent = money(result.timeSavingPerMonth);
  output.expenseSavingPerMonth.textContent = money(result.expenseSavingPerMonth);

  renderMonthlyRows(result.monthlyCumulative);
  renderWarning(input, result);
}

form.addEventListener("input", render);
render();
