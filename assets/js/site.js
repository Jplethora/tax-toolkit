const siteLinks = {
  whatsapp: "https://wa.me/2347025446297",
  telegram: "https://t.me/+2347025446297"
};

const taxBands = [
  { cap: 300000, rate: 0.07 },
  { cap: 300000, rate: 0.11 },
  { cap: 500000, rate: 0.15 },
  { cap: 500000, rate: 0.19 },
  { cap: 1600000, rate: 0.21 },
  { cap: Number.POSITIVE_INFINITY, rate: 0.24 }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(value || 0)));
}

function computeRelief(grossIncome) {
  const standardRelief = 200000 + grossIncome * 0.2;
  const minimumRelief = grossIncome * 0.01;
  return Math.max(standardRelief, minimumRelief);
}

function computeTaxFromBands(taxableIncome) {
  let remaining = Math.max(0, taxableIncome);
  let totalTax = 0;

  for (const band of taxBands) {
    if (remaining <= 0) {
      break;
    }

    const taxableAtBand = Math.min(remaining, band.cap);
    totalTax += taxableAtBand * band.rate;
    remaining -= taxableAtBand;
  }

  return totalTax;
}

function applyLinks() {
  document.querySelectorAll("[data-link-key]").forEach((link) => {
    const key = link.getAttribute("data-link-key");
    const target = siteLinks[key];

    if (target && target !== "#") {
      link.setAttribute("href", target);
      link.removeAttribute("aria-disabled");
      link.classList.remove("disabled-link");
      return;
    }

    link.setAttribute("aria-disabled", "true");
    link.classList.add("disabled-link");
    link.addEventListener("click", (event) => event.preventDefault());
  });
}

function wireMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const body = document.body;

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

function wireFaqs() {
  document.querySelectorAll(".faq-card").forEach((card) => {
    const button = card.querySelector(".accordion-trigger");
    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function wireReveal() {
  const targets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((target) => observer.observe(target));
}

function wireCanonical() {
  const canonical = document.querySelector("[data-canonical]");
  if (!canonical) {
    return;
  }

  canonical.setAttribute("href", window.location.href.split("#")[0]);
}

function runCalculator(form) {
  const results = form.parentElement.querySelector("[data-calculator-results]");
  const grossIncome = Number(form.elements.grossIncome.value || 0);
  const pension = Number(form.elements.pension.value || 0);
  const expenses = Number(form.elements.expenses.value || 0);
  const mode = form.elements.mode.value;

  const adjustedExpenses = mode === "salary" ? 0 : expenses;
  const relief = computeRelief(grossIncome);
  const taxableIncome = Math.max(0, grossIncome - pension - adjustedExpenses - relief);
  const bandTax = computeTaxFromBands(taxableIncome);
  const minimumTax = grossIncome > 0 ? grossIncome * 0.01 : 0;
  const annualTax = Math.max(bandTax, minimumTax);
  const monthlyTax = annualTax / 12;
  const netBalance = Math.max(0, grossIncome - pension - adjustedExpenses - annualTax);

  results.querySelector("[data-result-taxable]").textContent = formatCurrency(taxableIncome);
  results.querySelector("[data-result-tax]").textContent = formatCurrency(annualTax);
  results.querySelector("[data-result-monthly]").textContent = formatCurrency(monthlyTax);
  results.querySelector("[data-result-net]").textContent = formatCurrency(netBalance);
}

function wireCalculators() {
  document.querySelectorAll("[data-tax-calculator]").forEach((form) => {
    const defaultMode = form.getAttribute("data-default-mode");
    if (defaultMode) {
      form.elements.mode.value = defaultMode;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      runCalculator(form);
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        if (defaultMode) {
          form.elements.mode.value = defaultMode;
        }
        runCalculator(form);
      }, 0);
    });

    ["mode", "grossIncome", "pension", "expenses"].forEach((fieldName) => {
      const field = form.elements[fieldName];
      if (field) {
        field.addEventListener("input", () => runCalculator(form));
        field.addEventListener("change", () => runCalculator(form));
      }
    });

    runCalculator(form);
  });
}

function wireYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyLinks();
  wireMenu();
  wireFaqs();
  wireReveal();
  wireCanonical();
  wireCalculators();
  wireYear();
});