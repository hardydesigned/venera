<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		fetchFinanceCategories,
		fetchFinanceMappings,
		fetchFinanceMonthSummary,
		fetchFinanceYearSummary,
		importFinanceCsv,
		updateFinanceTransactionCategory,
		type FinanceCategoryOption,
		type FinanceMapping,
		type FinanceMonthSummary,
		type FinanceYearSummary
	} from '$lib/api/finance';

	type TabKey = 'import' | 'year' | 'month';

	const now = new Date();
	const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

	let activeTab = $state<TabKey>('import');
	let mappings = $state<FinanceMapping[]>([]);
	let categories = $state<FinanceCategoryOption[]>([]);

	let providerKey = $state('ing');
	let csvFile = $state<File | null>(null);
	let headers = $state<string[]>([]);
	let dateColumn = $state('');
	let payeeColumn = $state('');
	let purposeColumn = $state('');
	let amountColumn = $state('');
	let delimiter = $state(';');
	let dateFormat = $state('dd.MM.yyyy');
	let saveMapping = $state(true);
	let importLoading = $state(false);
	let importMessage = $state<string | null>(null);
	let importError = $state<string | null>(null);

	let selectedYear = $state(now.getFullYear());
	let yearSummary = $state<FinanceYearSummary | null>(null);
	let yearLoading = $state(false);
	let yearError = $state<string | null>(null);

	let selectedMonth = $state(defaultMonth);
	let monthSummary = $state<FinanceMonthSummary | null>(null);
	let monthLoading = $state(false);
	let monthError = $state<string | null>(null);

	function toNumber(value: unknown): number {
		if (typeof value === 'number') return value;
		if (typeof value === 'string') return Number(value);
		return 0;
	}

	function toCurrency(value: unknown): string {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(toNumber(value));
	}

	function normalizeProviderKey(value: string): string {
		return value.trim().toLowerCase().replace(/\s+/g, '-');
	}

	function guessHeaderValue(candidates: string[]): string {
		const lowerHeaders = headers.map((h) => h.toLowerCase());
		for (const candidate of candidates) {
			const idx = lowerHeaders.findIndex((header) => header.includes(candidate.toLowerCase()));
			if (idx >= 0) {
				return headers[idx];
			}
		}
		return '';
	}

	function parseCsvLine(line: string, activeDelimiter: string): string[] {
		const delimiterChar = activeDelimiter[0] ?? ';';
		const values: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"') {
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
				continue;
			}
			if (!inQuotes && ch === delimiterChar) {
				values.push(current.trim());
				current = '';
				continue;
			}
			current += ch;
		}

		values.push(current.trim());
		return values.filter((entry) => entry.length > 0);
	}

	function detectDelimiter(line: string): string {
		const candidates = [';', ',', '\t'];
		let best = ';';
		let bestCount = -1;
		for (const candidate of candidates) {
			const count = line.split(candidate).length - 1;
			if (count > bestCount) {
				bestCount = count;
				best = candidate;
			}
		}
		return best;
	}

	function applySavedMapping() {
		const key = normalizeProviderKey(providerKey);
		if (!key) return;
		const existing = mappings.find((mapping) => mapping.providerKey === key);
		if (!existing) return;
		if (!dateColumn) dateColumn = existing.dateColumn;
		if (!payeeColumn) payeeColumn = existing.payeeColumn;
		if (!purposeColumn) purposeColumn = existing.purposeColumn;
		if (!amountColumn) amountColumn = existing.amountColumn;
		delimiter = existing.delimiter || delimiter;
		dateFormat = existing.dateFormat ?? dateFormat;
	}

	async function loadMeta() {
		categories = await fetchFinanceCategories();
		mappings = await fetchFinanceMappings();
		applySavedMapping();
	}

	async function loadYearSummary() {
		yearLoading = true;
		yearError = null;
		try {
			yearSummary = await fetchFinanceYearSummary(selectedYear);
		} catch (error) {
			yearError = error instanceof Error ? error.message : 'Jahresübersicht konnte nicht geladen werden.';
		} finally {
			yearLoading = false;
		}
	}

	async function loadMonthSummary() {
		monthLoading = true;
		monthError = null;
		const [yearText, monthText] = selectedMonth.split('-');
		const year = Number(yearText);
		const month = Number(monthText);
		if (!year || !month) {
			monthError = 'Monat ist ungültig.';
			monthLoading = false;
			return;
		}
		try {
			monthSummary = await fetchFinanceMonthSummary(year, month);
		} catch (error) {
			monthError = error instanceof Error ? error.message : 'Monatsübersicht konnte nicht geladen werden.';
		} finally {
			monthLoading = false;
		}
	}

	async function handleFileSelect(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const file = target.files?.[0] ?? null;
		csvFile = file;
		headers = [];
		if (!file) return;

		const previewText = (await file.slice(0, 64 * 1024).text()).trim();
		const firstLine = previewText.split(/\r?\n/).find((line) => line.trim().length > 0) ?? '';
		if (!firstLine) return;

		delimiter = detectDelimiter(firstLine);
		headers = parseCsvLine(firstLine, delimiter);
		if (headers.length === 0) return;

		applySavedMapping();
		if (!dateColumn || !headers.includes(dateColumn)) {
			dateColumn = guessHeaderValue(['buchung', 'datum', 'valuta']);
		}
		if (!payeeColumn || !headers.includes(payeeColumn)) {
			payeeColumn = guessHeaderValue(['zahlungsempfänger', 'empfänger', 'name', 'auftraggeber']);
		}
		if (!purposeColumn || !headers.includes(purposeColumn)) {
			purposeColumn = guessHeaderValue(['verwendungszweck', 'zweck', 'buchungstext', 'text']);
		}
		if (!amountColumn || !headers.includes(amountColumn)) {
			amountColumn = guessHeaderValue(['betrag', 'umsatz', 'wert']);
		}
	}

	async function handleImport() {
		importError = null;
		importMessage = null;
		const normalizedProvider = normalizeProviderKey(providerKey);
		if (!csvFile) {
			importError = 'Bitte eine CSV-Datei auswählen.';
			return;
		}
		if (!normalizedProvider || !dateColumn || !payeeColumn || !purposeColumn || !amountColumn) {
			importError = 'Bitte Provider und alle Mapping-Felder ausfüllen.';
			return;
		}

		importLoading = true;
		try {
			const result = await importFinanceCsv({
				file: csvFile,
				providerKey: normalizedProvider,
				dateColumn,
				payeeColumn,
				purposeColumn,
				amountColumn,
				delimiter,
				dateFormat,
				saveMapping
			});
			importMessage = `${result.importedCount} Buchungen importiert, ${result.skippedDuplicates} Duplikate übersprungen, ${result.uncertainCount} unsichere Zuordnungen.`;
			if (saveMapping) {
				mappings = await fetchFinanceMappings();
			}
			await Promise.all([loadYearSummary(), loadMonthSummary()]);
		} catch (error) {
			importError = error instanceof Error ? error.message : 'Import fehlgeschlagen.';
		} finally {
			importLoading = false;
		}
	}

	async function handleTransactionCategoryChange(transactionId: string, value: string) {
		if (!value) return;
		await updateFinanceTransactionCategory(transactionId, value);
		await Promise.all([loadMonthSummary(), loadYearSummary()]);
	}

	function categoryLabel(category: string | null): string {
		if (!category) return 'Unkategorisiert';
		return category;
	}

	function maxAbsTotal(totals: { total: string }[]): number {
		let max = 0;
		for (const total of totals) {
			max = Math.max(max, Math.abs(toNumber(total.total)));
		}
		return max || 1;
	}

	function barWidth(total: string, totals: { total: string }[]): number {
		const max = maxAbsTotal(totals);
		return Math.max(4, Math.round((Math.abs(toNumber(total)) / max) * 100));
	}

	function handleProviderBlur() {
		providerKey = normalizeProviderKey(providerKey);
		applySavedMapping();
	}

	onMount(async () => {
		await loadMeta();
		await Promise.all([loadYearSummary(), loadMonthSummary()]);
	});
</script>

<svelte:head>
	<title>Finanzmanager | Venera</title>
</svelte:head>

<section class="relative z-10 flex h-full min-h-0 flex-col gap-4">
	<header class="flex flex-wrap items-center justify-between gap-3">
		<div class="space-y-1">
			<h2 class="text-2xl font-semibold">Finanzmanager</h2>
			<p class="text-sm text-muted-foreground">
				CSV importieren, automatisch kategorisieren und Ein-/Ausgaben auswerten.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button variant={activeTab === 'import' ? 'default' : 'outline'} size="sm" onclick={() => (activeTab = 'import')}>Import</Button>
			<Button variant={activeTab === 'year' ? 'default' : 'outline'} size="sm" onclick={() => (activeTab = 'year')}>Jahr</Button>
			<Button variant={activeTab === 'month' ? 'default' : 'outline'} size="sm" onclick={() => (activeTab = 'month')}>Monat</Button>
		</div>
	</header>

	{#if activeTab === 'import'}
		<div class="grid gap-4 rounded-lg border border-border bg-card/40 p-4">
			<div class="grid gap-3 md:grid-cols-3">
				<div class="grid gap-1">
					<label for="finance-provider" class="text-xs font-medium text-muted-foreground">Provider</label>
					<input
						id="finance-provider"
						type="text"
						list="provider-list"
						bind:value={providerKey}
						onblur={handleProviderBlur}
						placeholder="z. B. ing oder dkb"
						class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
					/>
					<datalist id="provider-list">
						<option value="ing"></option>
						<option value="dkb"></option>
						{#each mappings as mapping}
							<option value={mapping.providerKey}></option>
						{/each}
					</datalist>
				</div>
				<div class="grid gap-1">
					<label for="finance-delimiter" class="text-xs font-medium text-muted-foreground">Delimiter</label>
					<input
						id="finance-delimiter"
						type="text"
						maxlength="1"
						bind:value={delimiter}
						class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
					/>
				</div>
				<div class="grid gap-1">
					<label for="finance-date-format" class="text-xs font-medium text-muted-foreground">Datumsformat (optional)</label>
					<input
						id="finance-date-format"
						type="text"
						bind:value={dateFormat}
						placeholder="dd.MM.yyyy"
						class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
					/>
				</div>
			</div>

			<div class="grid gap-2">
				<label for="finance-file" class="text-xs font-medium text-muted-foreground">CSV-Datei</label>
				<input id="finance-file" type="file" accept=".csv,text/csv" onchange={handleFileSelect} class="text-sm" />
			</div>

			<div class="grid gap-3 md:grid-cols-2">
				<div class="grid gap-1">
					<label for="finance-date-column" class="text-xs font-medium text-muted-foreground">Buchungsdatum</label>
					<select id="finance-date-column" bind:value={dateColumn} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
						<option value="">Bitte Spalte wählen</option>
						{#each headers as header}
							<option value={header}>{header}</option>
						{/each}
					</select>
				</div>
				<div class="grid gap-1">
					<label for="finance-payee-column" class="text-xs font-medium text-muted-foreground">Zahlungsempfänger</label>
					<select id="finance-payee-column" bind:value={payeeColumn} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
						<option value="">Bitte Spalte wählen</option>
						{#each headers as header}
							<option value={header}>{header}</option>
						{/each}
					</select>
				</div>
				<div class="grid gap-1">
					<label for="finance-purpose-column" class="text-xs font-medium text-muted-foreground">Verwendungszweck</label>
					<select id="finance-purpose-column" bind:value={purposeColumn} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
						<option value="">Bitte Spalte wählen</option>
						{#each headers as header}
							<option value={header}>{header}</option>
						{/each}
					</select>
				</div>
				<div class="grid gap-1">
					<label for="finance-amount-column" class="text-xs font-medium text-muted-foreground">Betrag</label>
					<select id="finance-amount-column" bind:value={amountColumn} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
						<option value="">Bitte Spalte wählen</option>
						{#each headers as header}
							<option value={header}>{header}</option>
						{/each}
					</select>
				</div>
			</div>

			<label class="inline-flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={saveMapping} />
				Mapping für nächstes Mal speichern
			</label>

			<div class="flex items-center gap-2">
				<Button onclick={handleImport} disabled={importLoading || !csvFile}>
					{importLoading ? 'Import läuft…' : 'CSV importieren'}
				</Button>
				{#if importMessage}
					<p class="text-sm text-emerald-700 dark:text-emerald-400">{importMessage}</p>
				{/if}
				{#if importError}
					<p class="text-sm text-destructive">{importError}</p>
				{/if}
			</div>
		</div>
	{:else if activeTab === 'year'}
		<div class="grid gap-4 rounded-lg border border-border bg-card/40 p-4">
			<div class="flex flex-wrap items-center gap-2">
				<input
					type="number"
					min="2000"
					max="2100"
					bind:value={selectedYear}
					class="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
				/>
				<Button variant="outline" onclick={loadYearSummary} disabled={yearLoading}>Aktualisieren</Button>
			</div>

			{#if yearError}
				<p class="text-sm text-destructive">{yearError}</p>
			{:else if yearLoading}
				<p class="text-sm text-muted-foreground">Jahresdaten werden geladen…</p>
			{:else if yearSummary}
				<div class="grid gap-3 md:grid-cols-3">
					<div class="rounded-md border border-border bg-background p-3">
						<p class="text-xs text-muted-foreground">Einnahmen</p>
						<p class="text-lg font-semibold text-emerald-600">{toCurrency(yearSummary.income)}</p>
					</div>
					<div class="rounded-md border border-border bg-background p-3">
						<p class="text-xs text-muted-foreground">Ausgaben</p>
						<p class="text-lg font-semibold text-rose-600">{toCurrency(yearSummary.expenses)}</p>
					</div>
					<div class="rounded-md border border-border bg-background p-3">
						<p class="text-xs text-muted-foreground">Gewinn</p>
						<p class="text-lg font-semibold">{toCurrency(yearSummary.net)}</p>
					</div>
				</div>

				<div class="grid gap-3 lg:grid-cols-2">
					<div class="rounded-md border border-border bg-background p-3">
						<h3 class="mb-2 font-medium">Kategorien (Tabelle)</h3>
						<div class="max-h-72 overflow-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-left text-muted-foreground">
										<th class="pb-1">Kategorie</th>
										<th class="pb-1 text-right">Summe</th>
									</tr>
								</thead>
								<tbody>
									{#each yearSummary.totals as total}
										<tr class="border-t border-border/50">
											<td class="py-1">{categoryLabel(total.category)}</td>
											<td class="py-1 text-right">{toCurrency(total.total)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<div class="rounded-md border border-border bg-background p-3">
						<h3 class="mb-2 font-medium">Kategorien (Graph)</h3>
						<div class="space-y-2">
							{#each yearSummary.totals as total}
								{@const value = toNumber(total.total)}
								{@const width = barWidth(total.total, yearSummary.totals)}
								<div>
									<div class="mb-1 flex items-center justify-between text-xs">
										<span class="truncate">{categoryLabel(total.category)}</span>
										<span>{toCurrency(total.total)}</span>
									</div>
									<div class="h-2 rounded bg-muted">
										<div
											class="h-2 rounded {value < 0 ? 'bg-rose-500' : 'bg-emerald-500'}"
											style={`width: ${width}%`}
										></div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 rounded-lg border border-border bg-card/40 p-4">
			<div class="flex flex-wrap items-center gap-2">
				<input type="month" bind:value={selectedMonth} class="h-9 rounded-md border border-input bg-background px-3 text-sm" />
				<Button variant="outline" onclick={loadMonthSummary} disabled={monthLoading}>Aktualisieren</Button>
			</div>

			{#if monthError}
				<p class="text-sm text-destructive">{monthError}</p>
			{:else if monthLoading}
				<p class="text-sm text-muted-foreground">Monatsdaten werden geladen…</p>
			{:else if monthSummary}
				<div class="grid gap-3 md:grid-cols-3">
					<div class="rounded-md border border-border bg-background p-3">
						<p class="text-xs text-muted-foreground">Einnahmen</p>
						<p class="text-lg font-semibold text-emerald-600">{toCurrency(monthSummary.income)}</p>
					</div>
					<div class="rounded-md border border-border bg-background p-3">
						<p class="text-xs text-muted-foreground">Ausgaben</p>
						<p class="text-lg font-semibold text-rose-600">{toCurrency(monthSummary.expenses)}</p>
					</div>
					<div class="rounded-md border border-border bg-background p-3">
						<p class="text-xs text-muted-foreground">Gewinn</p>
						<p class="text-lg font-semibold">{toCurrency(monthSummary.net)}</p>
					</div>
				</div>

				<div class="grid gap-3 lg:grid-cols-2">
					<div class="rounded-md border border-border bg-background p-3">
						<h3 class="mb-2 font-medium">Kategorien im Monat</h3>
						<div class="max-h-72 overflow-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-left text-muted-foreground">
										<th class="pb-1">Kategorie</th>
										<th class="pb-1 text-right">Summe</th>
									</tr>
								</thead>
								<tbody>
									{#each monthSummary.totals as total}
										<tr class="border-t border-border/50">
											<td class="py-1">{categoryLabel(total.category)}</td>
											<td class="py-1 text-right">{toCurrency(total.total)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<div class="rounded-md border border-border bg-background p-3">
						<h3 class="mb-2 font-medium">Buchungen</h3>
						<div class="max-h-[420px] overflow-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-left text-muted-foreground">
										<th class="pb-1">Datum</th>
										<th class="pb-1">Empfänger</th>
										<th class="pb-1">Betrag</th>
										<th class="pb-1">Kategorie</th>
									</tr>
								</thead>
								<tbody>
									{#each monthSummary.transactions as tx (tx.id)}
										<tr class="border-t border-border/50 align-top">
											<td class="py-1 whitespace-nowrap">{new Date(tx.bookingDate).toLocaleDateString('de-DE')}</td>
											<td class="py-1">
												<div class="font-medium">{tx.payee}</div>
												{#if tx.purpose}
													<div class="text-xs text-muted-foreground">{tx.purpose}</div>
												{/if}
												{#if tx.lowConfidence}
													<div class="mt-1 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">
														Unsicher ({Math.round((tx.confidence ?? 0) * 100)}%)
													</div>
												{/if}
											</td>
											<td class="py-1 text-right whitespace-nowrap {toNumber(tx.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}">
												{toCurrency(tx.amount)}
											</td>
											<td class="py-1">
												<select
													value={tx.category ?? ''}
													onchange={(e) =>
														handleTransactionCategoryChange(
															tx.id,
															(e.currentTarget as HTMLSelectElement).value
														)}
													class="h-8 w-full min-w-[190px] rounded-md border border-input bg-background px-2 text-xs"
												>
													{#if tx.category && !categories.some((c) => c.category === tx.category)}
														<option value={tx.category}>
															{categoryLabel(tx.category)}
														</option>
													{/if}
													{#each categories as option}
														<option value={option.category}>
															{categoryLabel(option.category)}
														</option>
													{/each}
												</select>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</section>
