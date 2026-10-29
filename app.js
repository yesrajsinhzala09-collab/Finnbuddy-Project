/* =========================================================
   FINNBUDDY AI — COMPLETE FRONT-END APPLICATION
   Login + Signup + Calculator + Charts + History + Theme
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {
  user: null,

  frequency: "monthly",
  income: 50000,
  monthlyIncome: 50000,

  currency: "INR",

  expenses: {
    rent: 10000,
    food: 5000,
    transport: 3000,
    utilities: 2500,
    shopping: 2500,
    entertainment: 1500,
    healthcare: 1000,
    education: 1000,
    other: 500
  },

  investments: [
    {
      id: "equity",
      name: "Equity / Mutual Funds",
      percent: 40,
      rate: 12,
      risk: "High",
      color: "#6C63FF"
    },
    {
      id: "fd",
      name: "Fixed Deposit",
      percent: 30,
      rate: 7,
      risk: "Low",
      color: "#8B5CF6"
    },
    {
      id: "gold",
      name: "Gold",
      percent: 15,
      rate: 8,
      risk: "Medium",
      color: "#F1C40F"
    },
    {
      id: "cash",
      name: "Cash / Savings",
      percent: 15,
      rate: 3,
      risk: "Low",
      color: "#4ECDC4"
    }
  ],

  customRisk: "Medium",
  years: 10,

  currentStep: 1,

  calculation: null
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

function currencySymbol() {
  return state.currency === "USD" ? "$" : "₹";
}

function money(value) {
  value = Number(value) || 0;

  if (state.currency === "USD") {
    return "$" + value.toLocaleString("en-US", {
      maximumFractionDigits: 0
    });
  }

  return "₹" + value.toLocaleString("en-IN", {
    maximumFractionDigits: 0
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function saveUsers(users) {
  localStorage.setItem("finnbuddy_users", JSON.stringify(users));
}

function getUsers() {
  try {
    return JSON.parse(
      localStorage.getItem("finnbuddy_users") || "{}"
    );
  } catch {
    return {};
  }
}

function userStorageKey() {
  return state.user
    ? `finnbuddy_history_${state.user}`
    : "finnbuddy_history_guest";
}


/* =========================================================
   MARKETING → AUTH
   ========================================================= */

function launchDashboard() {
  $("marketing-page").classList.add("hidden");
  $("auth-screen").classList.remove("hidden");

  showAuthTab("login");

  $("auth-username").focus();
}

function backToWebsite() {
  $("auth-screen").classList.add("hidden");
  $("app").classList.add("hidden");
  $("marketing-page").classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   AUTH TABS
   ========================================================= */

let authMode = "login";

function showAuthTab(mode) {
  authMode = mode;

  $("tab-login").classList.toggle(
    "active",
    mode === "login"
  );

  $("tab-signup").classList.toggle(
    "active",
    mode === "signup"
  );

  $("auth-title").textContent =
    mode === "login"
      ? "Welcome Back"
      : "Create Your Account";

  $("auth-submit").textContent =
    mode === "login"
      ? "Login"
      : "Create Account";

  $("auth-error").textContent = "";
}


/* =========================================================
   LOGIN / SIGNUP
   ========================================================= */

function handleAuthSubmit() {
  const username =
    $("auth-username").value.trim().toLowerCase();

  const password =
    $("auth-password").value;

  const error = $("auth-error");

  error.textContent = "";

  if (!username || !password) {
    error.textContent =
      "Please enter your username and password.";
    return;
  }

  if (username.length < 3) {
    error.textContent =
      "Username must be at least 3 characters.";
    return;
  }

  if (password.length < 4) {
    error.textContent =
      "Password must be at least 4 characters.";
    return;
  }

  const users = getUsers();

  if (authMode === "signup") {

    if (users[username]) {
      error.textContent =
        "This username already exists. Please login.";
      return;
    }

    users[username] = {
      password,
      createdAt: new Date().toISOString()
    };

    saveUsers(users);

    loginUser(username);

    return;
  }

  if (!users[username]) {
    error.textContent =
      "Account not found. Please sign up first.";
    return;
  }

  if (users[username].password !== password) {
    error.textContent =
      "Incorrect password.";
    return;
  }

  loginUser(username);
}


function loginUser(username) {
  state.user = username;

  localStorage.setItem(
    "finnbuddy_current_user",
    username
  );

  $("auth-screen").classList.add("hidden");
  $("marketing-page").classList.add("hidden");
  $("app").classList.remove("hidden");

  $("user-name-disp").textContent =
    username;

  resetCalculator(false);

  goStep(1);
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

  localStorage.removeItem(
    "finnbuddy_current_user"
  );

  state.user = null;

  $("app").classList.add("hidden");
  $("auth-screen").classList.remove("hidden");

  $("auth-username").value = "";
  $("auth-password").value = "";

  showAuthTab("login");
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

  document.body.classList.toggle("dark");

  const dark =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "finnbuddy_theme",
    dark ? "dark" : "light"
  );

  updateThemeButtons();
}

function updateThemeButtons() {

  const dark =
    document.body.classList.contains("dark");

  const text =
    dark ? "🌙 Dark" : "☀️ Light";

  if ($("theme-btn")) {
    $("theme-btn").textContent = text;
  }

  if ($("site-theme-btn")) {
    $("site-theme-btn").textContent = text;
  }
}

function loadTheme() {

  const theme =
    localStorage.getItem("finnbuddy_theme");

  if (theme === "dark") {
    document.body.classList.add("dark");
  }

  updateThemeButtons();
}


/* =========================================================
   CURRENCY
   ========================================================= */

function setCurrency(currency) {

  state.currency = currency;

  document
    .querySelectorAll(".cur-btn")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.cur === currency
      );
    });

  updateIncomeUI();
  recalcIncomeExpense();
  updateInvestmentUI();
}


/* =========================================================
   INCOME FREQUENCY
   ========================================================= */

function setFreq(freq) {

  state.frequency = freq;

  document
    .querySelectorAll(".freq-btn")
    .forEach(button => {

      if (
        button.dataset.freq === freq
      ) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }

    });

  updateIncomeUI();
  recalcIncomeExpense();
}


function updateIncomeUI() {

  const symbol = currencySymbol();

  $("income-prefix").textContent =
    symbol;

  const labels = {
    weekly: "💰 Weekly Income",
    monthly: "💰 Monthly Income",
    yearly: "💰 Yearly Income"
  };

  $("freq-label-txt").textContent =
    labels[state.frequency];
}


/* =========================================================
   INCOME CALCULATION
   ========================================================= */

function recalcIncomeExpense() {

  const value =
    Number($("income-input").value) || 0;

  state.income = value;

  if (state.frequency === "weekly") {
    state.monthlyIncome =
      value * 52 / 12;
  }

  else if (state.frequency === "yearly") {
    state.monthlyIncome =
      value / 12;
  }

  else {
    state.monthlyIncome =
      value;
  }

  $("monthly-income-disp").innerHTML =
    `${money(state.monthlyIncome)}<span>/mo</span>`;

  updateExpenses();

  updateSnapshot();
}


/* =========================================================
   EXPENSE UI
   ========================================================= */

const expenseDefinitions = [
  ["rent", "🏠", "Rent / Housing"],
  ["food", "🍔", "Food & Groceries"],
  ["transport", "🚗", "Transport"],
  ["utilities", "💡", "Utilities & Bills"],
  ["shopping", "🛍️", "Shopping"],
  ["entertainment", "🎬", "Entertainment"],
  ["healthcare", "🏥", "Healthcare"],
  ["education", "🎓", "Education"],
  ["other", "📦", "Other"]
];


function createExpenseFields() {

  const container =
    $("expense-fields");

  container.innerHTML = "";

  expenseDefinitions.forEach(
    ([key, icon, label]) => {

      const wrapper =
        document.createElement("div");

      wrapper.className = "field";

      wrapper.innerHTML = `
        <div class="field-label">
          ${icon} ${label}
        </div>

        <div class="input-wrap">
          <span class="input-prefix">
            ${currencySymbol()}
          </span>

          <input
            type="number"
            min="0"
            step="100"
            value="${state.expenses[key]}"
            data-expense="${key}"
          />
        </div>
      `;

      container.appendChild(wrapper);
    }
  );

  container
    .querySelectorAll("input[data-expense]")
    .forEach(input => {

      input.addEventListener(
        "input",
        () => {

          const key =
            input.dataset.expense;

          state.expenses[key] =
            Math.max(
              0,
              Number(input.value) || 0
            );

          updateSnapshot();
          drawExpenseChart();
        }
      );

    });
}


function updateExpenses() {

  if (!$("expense-fields")) {
    return;
  }

  $("expense-fields")
    .querySelectorAll(
      "input[data-expense]"
    )
    .forEach(input => {

      const key =
        input.dataset.expense;

      input.value =
        state.expenses[key];

    });

  updateSnapshot();
  drawExpenseChart();
}


/* =========================================================
   EXPENSE TOTALS
   ========================================================= */

function totalExpenses() {

  return Object.values(
    state.expenses
  ).reduce(
    (sum, value) =>
      sum + Number(value || 0),
    0
  );
}


function monthlySavings() {

  return Math.max(
    0,
    state.monthlyIncome -
    totalExpenses()
  );
}


function updateSnapshot() {

  if (!$("snap-income")) {
    return;
  }

  const income =
    state.monthlyIncome;

  const expenses =
    totalExpenses();

  const savings =
    income - expenses;

  const safeSavings =
    Math.max(0, savings);

  const rate =
    income > 0
      ? (savings / income) * 100
      : 0;

  $("snap-income").textContent =
    money(income);

  $("snap-expenses").textContent =
    money(expenses);

  $("snap-savings").textContent =
    money(safeSavings);

  $("savings-rate-pct").textContent =
    `${Math.max(0, rate).toFixed(1)}%`;

  $("savings-bar").style.width =
    `${clamp(rate, 0, 100)}%`;

  if (rate >= 30) {
    $("savings-tip").textContent =
      "Excellent! Your savings rate is strong.";
  }

  else if (rate >= 20) {
    $("savings-tip").textContent =
      "Good job. You're building a healthy savings habit.";
  }

  else if (rate > 0) {
    $("savings-tip").textContent =
      "You're saving, but there may be room to improve.";
  }

  else {
    $("savings-tip").textContent =
      "Your expenses currently use all your income.";
  }

  updateInvestmentPills();
}


/* =========================================================
   DONUT CHART — EXPENSES
   ========================================================= */

function drawDonut(
  canvas,
  values,
  colors
) {

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  const width =
    canvas.width;

  const height =
    canvas.height;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const total =
    values.reduce(
      (a,b) => a+b,
      0
    );

  const cx =
    width / 2;

  const cy =
    height / 2;

  const radius =
    Math.min(width,height) / 2 - 7;

  const inner =
    radius * .61;

  if (total <= 0) {

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      getComputedStyle(
        document.body
      ).getPropertyValue(
        "--bar-track"
      );

    ctx.lineWidth = 20;

    ctx.stroke();

    return;
  }

  let start =
    -Math.PI / 2;

  values.forEach(
    (value, index) => {

      if (value <= 0) return;

      const angle =
        (value / total) *
        Math.PI * 2;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        radius,
        start,
        start + angle
      );

      ctx.strokeStyle =
        colors[index];

      ctx.lineWidth = 20;

      ctx.lineCap = "butt";

      ctx.stroke();

      start += angle;
    }
  );

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    inner,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    getComputedStyle(
      document.body
    ).getPropertyValue(
      "--surface"
    );

  ctx.fill();
}


function drawExpenseChart() {

  const values =
    expenseDefinitions.map(
      ([key]) =>
        Number(state.expenses[key]) || 0
    );

  const colors = [
    "#6C63FF",
    "#8B5CF6",
    "#4ECDC4",
    "#F1C40F",
    "#FF6B6B",
    "#3498DB",
    "#2ECC71",
    "#E67E22",
    "#95A5A6"
  ];

  drawDonut(
    $("expense-chart"),
    values,
    colors
  );

  const total =
    values.reduce(
      (a,b) => a+b,
      0
    );

  $("expense-chart-total").textContent =
    money(total);

  const legend =
    $("expense-chart-legend");

  legend.innerHTML = "";

  expenseDefinitions.forEach(
    ([key, icon, label], index) => {

      const value =
        Number(state.expenses[key]) || 0;

      if (value <= 0) return;

      const percent =
        total > 0
          ? value / total * 100
          : 0;

      const item =
        document.createElement("div");

      item.className =
        "legend-item";

      item.innerHTML = `
        <span
          class="legend-color"
          style="background:${colors[index]}"
        ></span>

        <span>
          ${label}
          — ${percent.toFixed(0)}%
        </span>
      `;

      legend.appendChild(item);
    }
  );
}


/* =========================================================
   INVESTMENTS
   ========================================================= */

function investmentAllocationPercent() {

  return state.investments.reduce(
    (sum, investment) =>
      sum + Number(investment.percent || 0),
    0
  );
}


function investmentAmount(investment) {

  return (
    monthlySavings() *
    Number(investment.percent || 0)
    / 100
  );
}


function createInvestmentSliders() {

  const container =
    $("inv-sliders");

  container.innerHTML = "";

  state.investments.forEach(
    investment => {

      const row =
        document.createElement("div");

      row.className =
        "inv-row";

      row.innerHTML = `
        <div class="inv-head">

          <div>
            <div class="inv-name">
              ${investment.name}
            </div>

            <div class="inv-meta">
              ${investment.risk} risk ·
              ~${investment.rate}% assumed return
            </div>
          </div>

          <div class="inv-percent"
               id="inv-percent-${investment.id}">
            ${investment.percent}%
          </div>

        </div>

        <div class="inv-slider-row">

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value="${investment.percent}"
            data-investment="${investment.id}"
          />

          <span>
            ${money(investmentAmount(investment))}
          </span>

        </div>
      `;

      container.appendChild(row);
    }
  );

  container
    .querySelectorAll(
      "input[data-investment]"
    )
    .forEach(slider => {

      slider.addEventListener(
        "input",
        () => {

          const investment =
            state.investments.find(
              item =>
                item.id ===
                slider.dataset.investment
            );

          if (!investment) return;

          investment.percent =
            Number(slider.value);

          updateInvestmentUI();
        }
      );

    });
}


function updateInvestmentUI() {

  const savings =
    monthlySavings();

  const allocatedPercent =
    investmentAllocationPercent();

  const allocatedAmount =
    savings *
    allocatedPercent /
    100;

  const liquid =
    Math.max(
      0,
      savings - allocatedAmount
    );

  if ($("pill-savings-val")) {
    $("pill-savings-val").textContent =
      money(savings);
  }

  if ($("pill-alloc-val")) {
    $("pill-alloc-val").textContent =
      money(allocatedAmount);
  }

  if ($("pill-alloc-sub")) {
    $("pill-alloc-sub").textContent =
      `${allocatedPercent}%`;
  }

  if ($("alloc-invested")) {
    $("alloc-invested").textContent =
      money(
        Math.min(
          savings,
          allocatedAmount
        )
      );
  }

  if ($("alloc-liquid")) {
    $("alloc-liquid").textContent =
      money(liquid);
  }

  const warning =
    $("alloc-warn");

  if (warning) {
    warning.classList.toggle(
      "hidden",
      allocatedPercent <= 100
    );
  }

  state.investments.forEach(
    investment => {

      const percentEl =
        $(
          `inv-percent-${investment.id}`
        );

      if (percentEl) {
        percentEl.textContent =
          `${investment.percent}%`;
      }

      const slider =
        document.querySelector(
          `input[data-investment="${investment.id}"]`
        );

      if (slider) {
        slider.value =
          investment.percent;

        const amountLabel =
          slider.parentElement
            .querySelector("span");

        if (amountLabel) {
          amountLabel.textContent =
            money(
              investmentAmount(
                investment
              )
            );
        }
      }

    }
  );

  drawInvestmentChart();
}


function updateInvestmentPills() {
  updateInvestmentUI();
}


/* =========================================================
   INVESTMENT DONUT
   ========================================================= */

function drawInvestmentChart() {

  if (!$("invest-chart")) {
    return;
  }

  const values =
    state.investments.map(
      investment =>
        Number(investment.percent) || 0
    );

  const colors =
    state.investments.map(
      investment =>
        investment.color
    );

  drawDonut(
    $("invest-chart"),
    values,
    colors
  );

  const allocated =
    investmentAllocationPercent();

  $("invest-chart-total").textContent =
    `${allocated}%`;

  $("invest-chart-sub").textContent =
    "Allocated";

  const legend =
    $("invest-chart-legend");

  legend.innerHTML = "";

  state.investments.forEach(
    investment => {

      if (investment.percent <= 0) {
        return;
      }

      const item =
        document.createElement("div");

      item.className =
        "legend-item";

      item.innerHTML = `
        <span
          class="legend-color"
          style="background:${investment.color}"
        ></span>

        <span>
          ${investment.name}
          — ${investment.percent}%
        </span>
      `;

      legend.appendChild(item);
    }
  );
}


/* =========================================================
   CUSTOM INVESTMENT
   ========================================================= */

function onCustomNameInput() {

  const name =
    $("custom-inv-name").value
      .trim()
      .toLowerCase();

  const suggestion =
    $("custom-inv-suggestion");

  if (!name) {
    suggestion.classList.add("hidden");
    return;
  }

  const suggestions = {

    bitcoin: {
      rate: 0,
      risk: "Very High"
    },

    crypto: {
      rate: 0,
      risk: "Very High"
    },

    ppf: {
      rate: 7,
      risk: "Low"
    },

    "public provident fund": {
      rate: 7,
      risk: "Low"
    },

    "real estate": {
      rate: 8,
      risk: "Medium"
    },

    gold: {
      rate: 8,
      risk: "Medium"
    },

    "index fund": {
      rate: 11,
      risk: "High"
    },

    mutual: {
      rate: 11,
      risk: "High"
    }

  };

  const match =
    Object.keys(suggestions)
      .find(key =>
        name.includes(key)
      );

  if (!match) {
    suggestion.classList.add("hidden");
    return;
  }

  const info =
    suggestions[match];

  suggestion.classList.remove("hidden");

  suggestion.innerHTML = `
    <div class="insight-label">
      FinnBuddy suggestion
    </div>

    <div class="insight-sublabel">
      Typical category:
      <strong>${info.risk}</strong> risk
      ${info.rate
        ? ` · around ${info.rate}% assumed return`
        : ""}
    </div>
  `;
}


function setCustomRisk(risk) {

  state.customRisk =
    risk;

  document
    .querySelectorAll(".risk-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.risk === risk
      );

    });
}


function addCustomInvestment() {

  const name =
    $("custom-inv-name").value.trim();

  const rate =
    Number(
      $("custom-inv-rate").value
    );

  if (!name) {
    alert(
      "Please enter an investment name."
    );
    return;
  }

  if (!Number.isFinite(rate) || rate < 0) {
    alert(
      "Please enter a valid expected annual return."
    );
    return;
  }

  const id =
    "custom_" +
    Date.now();

  state.investments.push({
    id,
    name,
    percent: 0,
    rate,
    risk: state.customRisk,
    color: getRandomInvestmentColor()
  });

  createInvestmentSliders();
  updateInvestmentUI();

  $("custom-inv-name").value = "";
  $("custom-inv-rate").value = "";

  $("custom-inv-suggestion")
    .classList.add("hidden");

  document
    .querySelectorAll(".risk-btn")
    .forEach(button =>
      button.classList.remove("active")
    );

  state.customRisk = "Medium";
}


function getRandomInvestmentColor() {

  const colors = [
    "#6C63FF",
    "#8B5CF6",
    "#4ECDC4",
    "#F1C40F",
    "#FF6B6B",
    "#3498DB",
    "#2ECC71",
    "#E67E22"
  ];

  return colors[
    Math.floor(
      Math.random() *
      colors.length
    )
  ];
}


/* =========================================================
   YEARS
   ========================================================= */

function setYears(value) {

  state.years =
    Number(value);

  $("years-val").textContent =
    `${state.years} yrs`;
}


/* =========================================================
   STEP NAVIGATION
   ========================================================= */

function goStep(step) {

  if (step === 3) {
    if (monthlySavings() <= 0) {

      alert(
        "You currently have no positive monthly savings. Reduce your expenses before planning investments."
      );

      return;
    }
  }

  if (step === 4) {

    const allocation =
      investmentAllocationPercent();

    if (allocation > 100) {

      alert(
        "Investment allocation cannot exceed 100%."
      );

      return;
    }

    calculateResults();
  }

  state.currentStep =
    step;

  [1,2,3,4].forEach(
    number => {

      const section =
        $(`step-${number}`);

      if (section) {
        section.classList.toggle(
          "hidden",
          number !== step
        );
      }

      const bar =
        $(`sbar-${number}`);

      const label =
        $(`slbl-${number}`);

      if (bar) {
        bar.classList.toggle(
          "active",
          number <= step
        );
      }

      if (label) {
        label.classList.toggle(
          "active",
          number === step
        );
      }

    }
  );

  $("history-view")
    .classList.add("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (step === 2) {
    updateExpenses();
  }

  if (step === 3) {
    createInvestmentSliders();
    updateInvestmentUI();
  }
}


/* =========================================================
   RESULTS CALCULATION
   ========================================================= */

function calculateResults() {

  const savings =
    monthlySavings();

  const savingsRate =
    state.monthlyIncome > 0
      ? savings /
        state.monthlyIncome *
        100
      : 0;

  const allocation =
    investmentAllocationPercent();

  let invested =
    savings *
    Math.min(allocation,100)
    / 100;

  let corpus = 0;

  state.investments.forEach(
    investment => {

      const monthly =
        savings *
        investment.percent /
        100;

      const annualRate =
        Number(investment.rate) || 0;

      const monthlyRate =
        annualRate /
        100 /
        12;

      const months =
        state.years * 12;

      let future;

      if (monthlyRate === 0) {

        future =
          monthly * months;

      } else {

        future =
          monthly *
          (
            (
              Math.pow(
                1 + monthlyRate,
                months
              ) - 1
            ) /
            monthlyRate
          );
      }

      corpus += future;
    }
  );

  const totalInvested =
    invested *
    state.years *
    12;

  const growth =
    Math.max(
      0,
      corpus - totalInvested
    );

  const diversificationScore =
    calculateDiversificationScore();

  const trendScore =
    calculateTrendScore();

  const savingsScore =
    clamp(
      savingsRate / 50 * 50,
      0,
      50
    );

  const score =
    Math.round(
      savingsScore +
      diversificationScore +
      trendScore
    );

  state.calculation = {
    timestamp:
      new Date().toISOString(),

    income:
      state.monthlyIncome,

    expenses:
      totalExpenses(),

    savings,

    savingsRate,

    allocation,

    totalInvested,

    corpus,

    growth,

    years:
      state.years,

    score,

    investments:
      state.investments.map(
        item => ({
          name: item.name,
          percent: item.percent,
          rate: item.rate,
          risk: item.risk
        })
      )
  };

  renderResults();
}


/* =========================================================
   DIVERSIFICATION SCORE
   ========================================================= */

function calculateDiversificationScore() {

  const active =
    state.investments.filter(
      item =>
        item.percent > 0
    );

  if (active.length <= 1) {
    return 5;
  }

  const percentages =
    active.map(
      item =>
        item.percent
    );

  const total =
    percentages.reduce(
      (a,b) => a+b,
      0
    );

  if (total <= 0) {
    return 0;
  }

  let entropy = 0;

  percentages.forEach(
    percent => {

      const p =
        percent / total;

      if (p > 0) {
        entropy -=
          p * Math.log(p);
      }

    }
  );

  const maxEntropy =
    Math.log(
      active.length
    );

  if (maxEntropy === 0) {
    return 5;
  }

  return clamp(
    entropy /
    maxEntropy *
    30,
    0,
    30
  );
}


/* =========================================================
   HISTORY TREND SCORE
   ========================================================= */

function getHistory() {

  if (!state.user) {
    return [];
  }

  try {

    return JSON.parse(
      localStorage.getItem(
        userStorageKey()
      ) || "[]"
    );

  } catch {
    return [];
  }
}


function calculateTrendScore() {

  const history =
    getHistory();

  if (history.length < 2) {
    return 5;
  }

  const recent =
    history
      .slice(-5)
      .map(
        item =>
          Number(item.savingsRate) || 0
      );

  if (recent.length < 2) {
    return 5;
  }

  const first =
    recent[0];

  const last =
    recent[recent.length - 1];

  if (last > first) {
    return 20;
  }

  if (last === first) {
    return 10;
  }

  return 5;
}


/* =========================================================
   RENDER RESULTS
   ========================================================= */

function renderResults() {

  const result =
    state.calculation;

  if (!result) return;

  $("res-invested").textContent =
    money(result.totalInvested);

  $("res-growth").textContent =
    money(result.growth);

  $("res-corpus").textContent =
    money(result.corpus);

  $("res-years-label").textContent =
    result.years;

  renderScore(result);

  renderProjectionChart(result);

  renderSmartInsight();

  renderTips(result);

  $("save-history-btn")
    .disabled = false;
}


function renderScore(result) {

  const savingsPart =
    clamp(
      result.savingsRate / 50 * 50,
      0,
      50
    );

  const diversifyPart =
    calculateDiversificationScore();

  const trendPart =
    calculateTrendScore();

  const score =
    clamp(
      Math.round(
        savingsPart +
        diversifyPart +
        trendPart
      ),
      0,
      100
    );

  $("score-num").textContent =
    score;

  $("score-part-savings").textContent =
    `${Math.round(savingsPart)} / 50`;

  $("score-part-diversify").textContent =
    `${Math.round(diversifyPart)} / 30`;

  $("score-part-trend").textContent =
    `${Math.round(trendPart)} / 20`;

  let band;

  if (score >= 85) {
    band = "Excellent";
  }

  else if (score >= 70) {
    band = "Strong";
  }

  else if (score >= 50) {
    band = "Building Momentum";
  }

  else if (score >= 30) {
    band = "Getting Started";
  }

  else {
    band = "Needs Attention";
  }

  $("score-band").textContent =
    band;

  const circumference =
    351.9;

  $("score-ring").style.strokeDashoffset =
    circumference -
    circumference *
    score /
    100;

  $("score-ring").style.stroke =
    score >= 70
      ? "#27ae60"
      : score >= 40
        ? "#6C63FF"
        : "#FF6B6B";
}


/* =========================================================
   PROJECTION CHART
   ========================================================= */

function calculateYearCorpus(year) {

  const savings =
    monthlySavings();

  let corpus = 0;

  state.investments.forEach(
    investment => {

      const monthly =
        savings *
        investment.percent /
        100;

      const monthlyRate =
        Number(investment.rate) /
        100 /
        12;

      const months =
        year * 12;

      if (monthlyRate === 0) {

        corpus +=
          monthly *
          months;

      } else {

        corpus +=
          monthly *
          (
            Math.pow(
              1 + monthlyRate,
              months
            ) - 1
          ) /
          monthlyRate;
      }

    }
  );

  return corpus;
}


function renderProjectionChart(result) {

  const container =
    $("chart-bars");

  container.innerHTML = "";

  const max =
    result.corpus || 1;

  for (
    let year = 1;
    year <= result.years;
    year++
  ) {

    const value =
      calculateYearCorpus(year);

    const percent =
      clamp(
        value / max * 100,
        2,
        100
      );

    const group =
      document.createElement("div");

    group.className =
      "proj-bar-group";

    group.innerHTML = `
      <div
        class="proj-bar"
        style="height:${percent}%"
        title="Year ${year}: ${money(value)}"
      ></div>

      <div class="proj-year">
        Y${year}
      </div>
    `;

    container.appendChild(group);
  }
}


/* =========================================================
   SMART INSIGHT
   ========================================================= */

function renderSmartInsight() {

  const history =
    getHistory();

  const box =
    $("smart-insight-box");

  if (history.length < 2) {

    box.innerHTML = `
      <div class="insight-sublabel"
           style="margin-top:0">
        Save at least 2 calculations over time
        to unlock your trend.
      </div>
    `;

    return;
  }

  const rates =
    history.map(
      item =>
        Number(item.savingsRate) || 0
    );

  const first =
    rates[0];

  const last =
    rates[rates.length - 1];

  const change =
    last - first;

  let message;

  if (change > 2) {

    message =
      `Your savings rate has improved by ${change.toFixed(1)} percentage points across your saved calculations. Keep going — your consistency is paying off.`;

  } else if (change < -2) {

    message =
      `Your savings rate has fallen by ${Math.abs(change).toFixed(1)} percentage points. Consider reviewing your largest expense categories.`;

  } else {

    message =
      `Your savings rate has been relatively stable. Small improvements in one or two expense categories could make a meaningful difference.`;

  }

  box.innerHTML = `
    <div class="insight-label">
      Your savings trend
    </div>

    <div class="insight-value">
      ${change >= 0 ? "+" : ""}
      ${change.toFixed(1)}%
    </div>

    <div class="insight-sublabel">
      ${message}
    </div>
  `;
}


/* =========================================================
   TIPS
   ========================================================= */

function renderTips(result) {

  const tips =
    [];

  if (result.savingsRate < 20) {

    tips.push({
      icon: "💰",
      text:
        "Try gradually moving your savings rate toward 20% or higher."
    });

  } else {

    tips.push({
      icon: "🔥",
      text:
        "Your savings rate is looking healthy. Keep the habit consistent."
    });

  }

  const allocation =
    investmentAllocationPercent();

  if (allocation < 70) {

    tips.push({
      icon: "📊",
      text:
        "You have some savings left liquid after your current investment allocation."
    });

  }

  if (
    state.investments.filter(
      item =>
        item.percent > 0
    ).length < 2
  ) {

    tips.push({
      icon: "🧩",
      text:
        "Consider learning about diversification before concentrating your entire investment allocation in one category."
    });

  } else {

    tips.push({
      icon: "🧩",
      text:
        "Your portfolio uses multiple categories, which gives you some diversification."
    });

  }

  if (result.years < 5) {

    tips.push({
      icon: "⏳",
      text:
        "Longer time horizons can give compound growth more time to work."
    });

  } else {

    tips.push({
      icon: "🚀",
      text:
        "Your longer time horizon gives compounding more time to build."
    });

  }

  const container =
    $("tips-list");

  container.innerHTML = "";

  tips.forEach(
    tip => {

      const item =
        document.createElement("div");

      item.className =
        "tip-item";

      item.innerHTML = `
        <div class="tip-icon">
          ${tip.icon}
        </div>

        <div class="tip-text">
          ${tip.text}
        </div>
      `;

      container.appendChild(item);
    }
  );
}


/* =========================================================
   SAVE HISTORY
   ========================================================= */

function saveCalculation() {

  if (!state.user) {
    alert("Please login first.");
    return;
  }

  if (!state.calculation) {
    return;
  }

  const history =
    getHistory();

  history.push(
    JSON.parse(
      JSON.stringify(
        state.calculation
      )
    )
  );

  localStorage.setItem(
    userStorageKey(),
    JSON.stringify(history)
  );

  const button =
    $("save-history-btn");

  button.textContent =
    "✓ Saved to History";

  button.disabled = true;

  setTimeout(() => {

    button.textContent =
      "💾 Save to History";

    button.disabled = false;

  }, 1800);

  renderSmartInsight();
}


/* =========================================================
   HISTORY VIEW
   ========================================================= */

function viewHistory() {

  if (!state.user) {
    return;
  }

  [
    1,2,3,4
  ].forEach(
    number => {
      $(`step-${number}`)
        .classList.add("hidden");
    }
  );

  $("history-view")
    .classList.remove("hidden");

  renderHistory();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function renderHistory() {

  const history =
    getHistory();

  const container =
    $("history-list");

  container.innerHTML = "";

  if (history.length === 0) {

    container.innerHTML = `
      <div class="insight-box">
        <div class="insight-sublabel">
          No saved calculations yet.
          Complete your first calculation and
          save it here.
        </div>
      </div>
    `;

    return;
  }

  [...history]
    .reverse()
    .forEach(
      item => {

        const date =
          new Date(
            item.timestamp
          );

        const row =
          document.createElement("div");

        row.className =
          "history-item";

        row.innerHTML = `
          <div class="history-top">

            <div>
              <strong>
                ${money(item.savings)}
                monthly savings
              </strong>

              <div class="history-date">
                ${date.toLocaleString()}
              </div>
            </div>

            <div class="history-score">
              ${item.score}/100
            </div>

          </div>

          <div class="history-grid">

            <div class="history-stat">
              Income
              <strong>
                ${money(item.income)}
              </strong>
            </div>

            <div class="history-stat">
              Expenses
              <strong>
                ${money(item.expenses)}
              </strong>
            </div>

            <div class="history-stat">
              Savings Rate
              <strong>
                ${Number(item.savingsRate).toFixed(1)}%
              </strong>
            </div>

            <div class="history-stat">
              Allocation
              <strong>
                ${item.allocation}%
              </strong>
            </div>

            <div class="history-stat">
              Horizon
              <strong>
                ${item.years} years
              </strong>
            </div>

            <div class="history-stat">
              Corpus
              <strong>
                ${money(item.corpus)}
              </strong>
            </div>

          </div>
        `;

        container.appendChild(row);
      }
    );
}


function closeHistory() {

  $("history-view")
    .classList.add("hidden");

  goStep(
    state.currentStep || 1
  );
}


/* =========================================================
   RESET
   ========================================================= */

function restart() {

  resetCalculator(true);

  goStep(1);
}


function resetCalculator(clearIncome = true) {

  state.frequency = "monthly";

  if (clearIncome) {
    state.income = 50000;
  }

  state.monthlyIncome =
    clearIncome
      ? 50000
      : state.monthlyIncome || 50000;

  state.expenses = {
    rent: 10000,
    food: 5000,
    transport: 3000,
    utilities: 2500,
    shopping: 2500,
    entertainment: 1500,
    healthcare: 1000,
    education: 1000,
    other: 500
  };

  state.investments = [
    {
      id: "equity",
      name: "Equity / Mutual Funds",
      percent: 40,
      rate: 12,
      risk: "High",
      color: "#6C63FF"
    },
    {
      id: "fd",
      name: "Fixed Deposit",
      percent: 30,
      rate: 7,
      risk: "Low",
      color: "#8B5CF6"
    },
    {
      id: "gold",
      name: "Gold",
      percent: 15,
      rate: 8,
      risk: "Medium",
      color: "#F1C40F"
    },
    {
      id: "cash",
      name: "Cash / Savings",
      percent: 15,
      rate: 3,
      risk: "Low",
      color: "#4ECDC4"
    }
  ];

  state.years = 10;
  state.calculation = null;

  if ($("income-input")) {
    $("income-input").value =
      state.income;
  }

  if ($("years-slider")) {
    $("years-slider").value =
      state.years;
  }

  if ($("years-val")) {
    $("years-val").textContent =
      "10 yrs";
  }

  document
    .querySelectorAll(".freq-btn")
    .forEach(button =>
      button.classList.toggle(
        "active",
        button.dataset.freq === "monthly"
      )
    );

  createExpenseFields();
  updateIncomeUI();
  recalcIncomeExpense();

  createInvestmentSliders();
  updateInvestmentUI();

  if ($("save-history-btn")) {
    $("save-history-btn")
      .disabled = false;

    $("save-history-btn").textContent =
      "💾 Save to History";
  }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

  loadTheme();

  createExpenseFields();

  updateIncomeUI();

  recalcIncomeExpense();

  createInvestmentSliders();

  updateInvestmentUI();

  const savedUser =
    localStorage.getItem(
      "finnbuddy_current_user"
    );

  if (savedUser) {

    state.user =
      savedUser;

    $("user-name-disp").textContent =
      savedUser;

    $("marketing-page")
      .classList.add("hidden");

    $("auth-screen")
      .classList.add("hidden");

    $("app")
      .classList.remove("hidden");

    goStep(1);

  } else {

    $("marketing-page")
      .classList.remove("hidden");

    $("auth-screen")
      .classList.add("hidden");

    $("app")
      .classList.add("hidden");

  }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);