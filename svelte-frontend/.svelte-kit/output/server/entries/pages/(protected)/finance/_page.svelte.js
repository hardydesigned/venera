import { t as head, l as attr, h as ensure_array_like, e as escape_html, m as attr_class, r as attr_style, k as stringify } from "../../../../chunks/index.js";
import { B as Button } from "../../../../chunks/button.js";
import { a as apiFetch } from "../../../../chunks/client2.js";
async function fetchFinanceYearSummary(year) {
  const res = await apiFetch(`/finance/summary/year/${year}`);
  if (!res.ok) throw new Error(`Finance year summary failed: ${res.status}`);
  return await res.json();
}
async function fetchFinanceMonthSummary(year, month) {
  const res = await apiFetch(`/finance/summary/month/${year}/${month}`);
  if (!res.ok) throw new Error(`Finance month summary failed: ${res.status}`);
  return await res.json();
}
async function updateFinanceTransactionCategory(transactionId, category) {
  const res = await apiFetch(`/finance/transactions/${transactionId}/category`, {
    method: "PATCH",
    body: JSON.stringify({
      category
    })
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Finance category update failed: ${res.status}`);
  }
  return await res.json();
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const now = /* @__PURE__ */ new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let activeTab = "import";
    let mappings = [];
    let categories = [];
    let providerKey = "ing";
    let headers = [];
    let dateColumn = "";
    let payeeColumn = "";
    let purposeColumn = "";
    let amountColumn = "";
    let delimiter = ";";
    let dateFormat = "dd.MM.yyyy";
    let saveMapping = true;
    let importMessage = null;
    let importError = null;
    let selectedYear = now.getFullYear();
    let yearSummary = null;
    let yearLoading = false;
    let yearError = null;
    let selectedMonth = defaultMonth;
    let monthSummary = null;
    let monthLoading = false;
    let monthError = null;
    function toNumber(value) {
      if (typeof value === "number") return value;
      if (typeof value === "string") return Number(value);
      return 0;
    }
    function toCurrency(value) {
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(toNumber(value));
    }
    function normalizeProviderKey(value) {
      return value.trim().toLowerCase().replace(/\s+/g, "-");
    }
    async function loadYearSummary() {
      yearLoading = true;
      yearError = null;
      try {
        yearSummary = await fetchFinanceYearSummary(selectedYear);
      } catch (error) {
        yearError = error instanceof Error ? error.message : "Jahresübersicht konnte nicht geladen werden.";
      } finally {
        yearLoading = false;
      }
    }
    async function loadMonthSummary() {
      monthLoading = true;
      monthError = null;
      const [yearText, monthText] = selectedMonth.split("-");
      const year = Number(yearText);
      const month = Number(monthText);
      if (!year || !month) {
        monthError = "Monat ist ungültig.";
        monthLoading = false;
        return;
      }
      try {
        monthSummary = await fetchFinanceMonthSummary(year, month);
      } catch (error) {
        monthError = error instanceof Error ? error.message : "Monatsübersicht konnte nicht geladen werden.";
      } finally {
        monthLoading = false;
      }
    }
    async function handleImport() {
      importError = null;
      importMessage = null;
      normalizeProviderKey(providerKey);
      {
        importError = "Bitte eine CSV-Datei auswählen.";
        return;
      }
    }
    async function handleTransactionCategoryChange(transactionId, value) {
      if (!value) return;
      await updateFinanceTransactionCategory(transactionId, value);
      await Promise.all([loadMonthSummary(), loadYearSummary()]);
    }
    function categoryLabel(category) {
      if (!category) return "Unkategorisiert";
      return category;
    }
    function maxAbsTotal(totals) {
      let max = 0;
      for (const total of totals) {
        max = Math.max(max, Math.abs(toNumber(total.total)));
      }
      return max || 1;
    }
    function barWidth(total, totals) {
      const max = maxAbsTotal(totals);
      return Math.max(4, Math.round(Math.abs(toNumber(total)) / max * 100));
    }
    head("1ijmhxn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Finanzmanager | Venera</title>`);
      });
    });
    $$renderer2.push(`<section class="relative z-10 flex h-full min-h-0 flex-col gap-4"><header class="flex flex-wrap items-center justify-between gap-3"><div class="space-y-1"><h2 class="text-2xl font-semibold">Finanzmanager</h2> <p class="text-sm text-muted-foreground">CSV importieren, automatisch kategorisieren und Ein-/Ausgaben auswerten.</p></div> <div class="flex flex-wrap items-center gap-2">`);
    Button($$renderer2, {
      variant: activeTab === "import" ? "default" : "outline",
      size: "sm",
      onclick: () => activeTab = "import",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Import`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: activeTab === "year" ? "default" : "outline",
      size: "sm",
      onclick: () => activeTab = "year",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Jahr`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: activeTab === "month" ? "default" : "outline",
      size: "sm",
      onclick: () => activeTab = "month",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Monat`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></header> `);
    if (activeTab === "import") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="grid gap-4 rounded-lg border border-border bg-card/40 p-4"><div class="grid gap-3 md:grid-cols-3"><div class="grid gap-1"><label for="finance-provider" class="text-xs font-medium text-muted-foreground">Provider</label> <input id="finance-provider" type="text" list="provider-list"${attr("value", providerKey)} placeholder="z. B. ing oder dkb" class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"/> <datalist id="provider-list">`);
      $$renderer2.option({ value: "ing" }, ($$renderer3) => {
      });
      $$renderer2.option({ value: "dkb" }, ($$renderer3) => {
      });
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(mappings);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let mapping = each_array[$$index];
        $$renderer2.option({ value: mapping.providerKey }, ($$renderer3) => {
        });
      }
      $$renderer2.push(`<!--]--></datalist></div> <div class="grid gap-1"><label for="finance-delimiter" class="text-xs font-medium text-muted-foreground">Delimiter</label> <input id="finance-delimiter" type="text" maxlength="1"${attr("value", delimiter)} class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"/></div> <div class="grid gap-1"><label for="finance-date-format" class="text-xs font-medium text-muted-foreground">Datumsformat (optional)</label> <input id="finance-date-format" type="text"${attr("value", dateFormat)} placeholder="dd.MM.yyyy" class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"/></div></div> <div class="grid gap-2"><label for="finance-file" class="text-xs font-medium text-muted-foreground">CSV-Datei</label> <input id="finance-file" type="file" accept=".csv,text/csv" class="text-sm"/></div> <div class="grid gap-3 md:grid-cols-2"><div class="grid gap-1"><label for="finance-date-column" class="text-xs font-medium text-muted-foreground">Buchungsdatum</label> `);
      $$renderer2.select(
        {
          id: "finance-date-column",
          value: dateColumn,
          class: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Bitte Spalte wählen`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(headers);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let header = each_array_1[$$index_1];
            $$renderer3.option({ value: header }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(header)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <div class="grid gap-1"><label for="finance-payee-column" class="text-xs font-medium text-muted-foreground">Zahlungsempfänger</label> `);
      $$renderer2.select(
        {
          id: "finance-payee-column",
          value: payeeColumn,
          class: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Bitte Spalte wählen`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_2 = ensure_array_like(headers);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let header = each_array_2[$$index_2];
            $$renderer3.option({ value: header }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(header)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <div class="grid gap-1"><label for="finance-purpose-column" class="text-xs font-medium text-muted-foreground">Verwendungszweck</label> `);
      $$renderer2.select(
        {
          id: "finance-purpose-column",
          value: purposeColumn,
          class: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Bitte Spalte wählen`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_3 = ensure_array_like(headers);
          for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
            let header = each_array_3[$$index_3];
            $$renderer3.option({ value: header }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(header)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <div class="grid gap-1"><label for="finance-amount-column" class="text-xs font-medium text-muted-foreground">Betrag</label> `);
      $$renderer2.select(
        {
          id: "finance-amount-column",
          value: amountColumn,
          class: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Bitte Spalte wählen`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_4 = ensure_array_like(headers);
          for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
            let header = each_array_4[$$index_4];
            $$renderer3.option({ value: header }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(header)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div></div> <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox"${attr("checked", saveMapping, true)}/> Mapping für nächstes Mal speichern</label> <div class="flex items-center gap-2">`);
      Button($$renderer2, {
        onclick: handleImport,
        disabled: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html("CSV importieren")}`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      if (importMessage) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-sm text-emerald-700 dark:text-emerald-400">${escape_html(importMessage)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (importError) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-sm text-destructive">${escape_html(importError)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else if (activeTab === "year") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="grid gap-4 rounded-lg border border-border bg-card/40 p-4"><div class="flex flex-wrap items-center gap-2"><input type="number" min="2000" max="2100"${attr("value", selectedYear)} class="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"/> `);
      Button($$renderer2, {
        variant: "outline",
        onclick: loadYearSummary,
        disabled: yearLoading,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Aktualisieren`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div> `);
      if (yearError) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-sm text-destructive">${escape_html(yearError)}</p>`);
      } else if (yearLoading) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<p class="text-sm text-muted-foreground">Jahresdaten werden geladen…</p>`);
      } else if (yearSummary) {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div class="grid gap-3 md:grid-cols-3"><div class="rounded-md border border-border bg-background p-3"><p class="text-xs text-muted-foreground">Einnahmen</p> <p class="text-lg font-semibold text-emerald-600">${escape_html(toCurrency(yearSummary.income))}</p></div> <div class="rounded-md border border-border bg-background p-3"><p class="text-xs text-muted-foreground">Ausgaben</p> <p class="text-lg font-semibold text-rose-600">${escape_html(toCurrency(yearSummary.expenses))}</p></div> <div class="rounded-md border border-border bg-background p-3"><p class="text-xs text-muted-foreground">Gewinn</p> <p class="text-lg font-semibold">${escape_html(toCurrency(yearSummary.net))}</p></div></div> <div class="grid gap-3 lg:grid-cols-2"><div class="rounded-md border border-border bg-background p-3"><h3 class="mb-2 font-medium">Kategorien (Tabelle)</h3> <div class="max-h-72 overflow-auto"><table class="w-full text-sm"><thead><tr class="text-left text-muted-foreground"><th class="pb-1">Kategorie</th><th class="pb-1 text-right">Summe</th></tr></thead><tbody><!--[-->`);
        const each_array_5 = ensure_array_like(yearSummary.totals);
        for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
          let total = each_array_5[$$index_5];
          $$renderer2.push(`<tr class="border-t border-border/50"><td class="py-1">${escape_html(categoryLabel(total.category))}</td><td class="py-1 text-right">${escape_html(toCurrency(total.total))}</td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div></div> <div class="rounded-md border border-border bg-background p-3"><h3 class="mb-2 font-medium">Kategorien (Graph)</h3> <div class="space-y-2"><!--[-->`);
        const each_array_6 = ensure_array_like(yearSummary.totals);
        for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
          let total = each_array_6[$$index_6];
          const value = toNumber(total.total);
          const width = barWidth(total.total, yearSummary.totals);
          $$renderer2.push(`<div><div class="mb-1 flex items-center justify-between text-xs"><span class="truncate">${escape_html(categoryLabel(total.category))}</span> <span>${escape_html(toCurrency(total.total))}</span></div> <div class="h-2 rounded bg-muted"><div${attr_class(`h-2 rounded ${stringify(value < 0 ? "bg-rose-500" : "bg-emerald-500")}`)}${attr_style(`width: ${width}%`)}></div></div></div>`);
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid gap-4 rounded-lg border border-border bg-card/40 p-4"><div class="flex flex-wrap items-center gap-2"><input type="month"${attr("value", selectedMonth)} class="h-9 rounded-md border border-input bg-background px-3 text-sm"/> `);
      Button($$renderer2, {
        variant: "outline",
        onclick: loadMonthSummary,
        disabled: monthLoading,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Aktualisieren`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div> `);
      if (monthError) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-sm text-destructive">${escape_html(monthError)}</p>`);
      } else if (monthLoading) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<p class="text-sm text-muted-foreground">Monatsdaten werden geladen…</p>`);
      } else if (monthSummary) {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div class="grid gap-3 md:grid-cols-3"><div class="rounded-md border border-border bg-background p-3"><p class="text-xs text-muted-foreground">Einnahmen</p> <p class="text-lg font-semibold text-emerald-600">${escape_html(toCurrency(monthSummary.income))}</p></div> <div class="rounded-md border border-border bg-background p-3"><p class="text-xs text-muted-foreground">Ausgaben</p> <p class="text-lg font-semibold text-rose-600">${escape_html(toCurrency(monthSummary.expenses))}</p></div> <div class="rounded-md border border-border bg-background p-3"><p class="text-xs text-muted-foreground">Gewinn</p> <p class="text-lg font-semibold">${escape_html(toCurrency(monthSummary.net))}</p></div></div> <div class="grid gap-3 lg:grid-cols-2"><div class="rounded-md border border-border bg-background p-3"><h3 class="mb-2 font-medium">Kategorien im Monat</h3> <div class="max-h-72 overflow-auto"><table class="w-full text-sm"><thead><tr class="text-left text-muted-foreground"><th class="pb-1">Kategorie</th><th class="pb-1 text-right">Summe</th></tr></thead><tbody><!--[-->`);
        const each_array_7 = ensure_array_like(monthSummary.totals);
        for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
          let total = each_array_7[$$index_7];
          $$renderer2.push(`<tr class="border-t border-border/50"><td class="py-1">${escape_html(categoryLabel(total.category))}</td><td class="py-1 text-right">${escape_html(toCurrency(total.total))}</td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div></div> <div class="rounded-md border border-border bg-background p-3"><h3 class="mb-2 font-medium">Buchungen</h3> <div class="max-h-[420px] overflow-auto"><table class="w-full text-sm"><thead><tr class="text-left text-muted-foreground"><th class="pb-1">Datum</th><th class="pb-1">Empfänger</th><th class="pb-1">Betrag</th><th class="pb-1">Kategorie</th></tr></thead><tbody><!--[-->`);
        const each_array_8 = ensure_array_like(monthSummary.transactions);
        for (let $$index_9 = 0, $$length = each_array_8.length; $$index_9 < $$length; $$index_9++) {
          let tx = each_array_8[$$index_9];
          $$renderer2.push(`<tr class="border-t border-border/50 align-top"><td class="py-1 whitespace-nowrap">${escape_html(new Date(tx.bookingDate).toLocaleDateString("de-DE"))}</td><td class="py-1"><div class="font-medium">${escape_html(tx.payee)}</div> `);
          if (tx.purpose) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="text-xs text-muted-foreground">${escape_html(tx.purpose)}</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (tx.lowConfidence) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="mt-1 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">Unsicher (${escape_html(Math.round((tx.confidence ?? 0) * 100))}%)</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></td><td${attr_class(`py-1 text-right whitespace-nowrap ${stringify(toNumber(tx.amount) < 0 ? "text-rose-600" : "text-emerald-600")}`)}>${escape_html(toCurrency(tx.amount))}</td><td class="py-1">`);
          $$renderer2.select(
            {
              value: tx.category ?? "",
              onchange: (e) => handleTransactionCategoryChange(tx.id, e.currentTarget.value),
              class: "h-8 w-full min-w-[190px] rounded-md border border-input bg-background px-2 text-xs"
            },
            ($$renderer3) => {
              if (tx.category && !categories.some((c) => c.category === tx.category)) {
                $$renderer3.push("<!--[-->");
                $$renderer3.option({ value: tx.category }, ($$renderer4) => {
                  $$renderer4.push(`${escape_html(categoryLabel(tx.category))}`);
                });
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--><!--[-->`);
              const each_array_9 = ensure_array_like(categories);
              for (let $$index_8 = 0, $$length2 = each_array_9.length; $$index_8 < $$length2; $$index_8++) {
                let option = each_array_9[$$index_8];
                $$renderer3.option({ value: option.category }, ($$renderer4) => {
                  $$renderer4.push(`${escape_html(categoryLabel(option.category))}`);
                });
              }
              $$renderer3.push(`<!--]-->`);
            }
          );
          $$renderer2.push(`</td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
export {
  _page as default
};
