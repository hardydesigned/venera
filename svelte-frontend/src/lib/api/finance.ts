import { apiFetch } from './client';

export interface FinanceCategoryOption {
	category: string;
}

export interface FinanceMapping {
	id: string;
	providerKey: string;
	dateColumn: string;
	payeeColumn: string;
	purposeColumn: string;
	amountColumn: string;
	delimiter: string;
	dateFormat: string | null;
	updatedAt: string;
}

export interface FinanceImportResult {
	importedCount: number;
	skippedDuplicates: number;
	uncertainCount: number;
}

export interface FinanceCategoryTotal {
	category: string;
	total: string;
}

export interface FinanceTransaction {
	id: string;
	bookingDate: string;
	payee: string;
	purpose: string | null;
	amount: string;
	category: string | null;
	confidence: number | null;
	lowConfidence: boolean;
	manualOverride: boolean;
}

export interface FinanceYearSummary {
	year: number;
	income: string;
	expenses: string;
	net: string;
	totals: FinanceCategoryTotal[];
}

export interface FinanceMonthSummary {
	year: number;
	month: number;
	income: string;
	expenses: string;
	net: string;
	totals: FinanceCategoryTotal[];
	transactions: FinanceTransaction[];
}

export async function fetchFinanceCategories(): Promise<FinanceCategoryOption[]> {
	const res = await apiFetch('/finance/categories');
	if (!res.ok) throw new Error(`Finance categories failed: ${res.status}`);
	return (await res.json()) as FinanceCategoryOption[];
}

export async function fetchFinanceMappings(): Promise<FinanceMapping[]> {
	const res = await apiFetch('/finance/mappings');
	if (!res.ok) throw new Error(`Finance mappings failed: ${res.status}`);
	return (await res.json()) as FinanceMapping[];
}

export async function upsertFinanceMapping(providerKey: string, input: {
	dateColumn: string;
	payeeColumn: string;
	purposeColumn: string;
	amountColumn: string;
	delimiter: string;
	dateFormat?: string;
}): Promise<FinanceMapping> {
	const res = await apiFetch(`/finance/mappings/${encodeURIComponent(providerKey)}`, {
		method: 'PUT',
		body: JSON.stringify(input)
	});
	if (!res.ok) {
		const msg = await res.text();
		throw new Error(msg || `Finance mapping save failed: ${res.status}`);
	}
	return (await res.json()) as FinanceMapping;
}

export async function importFinanceCsv(input: {
	file: File;
	providerKey: string;
	dateColumn: string;
	payeeColumn: string;
	purposeColumn: string;
	amountColumn: string;
	delimiter: string;
	dateFormat?: string;
	saveMapping: boolean;
}): Promise<FinanceImportResult> {
	const formData = new FormData();
	formData.append('file', input.file);
	formData.append('providerKey', input.providerKey);
	formData.append('dateColumn', input.dateColumn);
	formData.append('payeeColumn', input.payeeColumn);
	formData.append('purposeColumn', input.purposeColumn);
	formData.append('amountColumn', input.amountColumn);
	formData.append('delimiter', input.delimiter);
	if (input.dateFormat) {
		formData.append('dateFormat', input.dateFormat);
	}
	formData.append('saveMapping', String(input.saveMapping));

	const res = await apiFetch('/finance/import', {
		method: 'POST',
		body: formData,
		headers: {}
	});
	if (!res.ok) {
		const msg = await res.text();
		throw new Error(msg || `Finance import failed: ${res.status}`);
	}
	return (await res.json()) as FinanceImportResult;
}

export async function fetchFinanceYearSummary(year: number): Promise<FinanceYearSummary> {
	const res = await apiFetch(`/finance/summary/year/${year}`);
	if (!res.ok) throw new Error(`Finance year summary failed: ${res.status}`);
	return (await res.json()) as FinanceYearSummary;
}

export async function fetchFinanceMonthSummary(year: number, month: number): Promise<FinanceMonthSummary> {
	const res = await apiFetch(`/finance/summary/month/${year}/${month}`);
	if (!res.ok) throw new Error(`Finance month summary failed: ${res.status}`);
	return (await res.json()) as FinanceMonthSummary;
}

export async function updateFinanceTransactionCategory(
	transactionId: string,
	category: string
): Promise<FinanceTransaction> {
	const res = await apiFetch(`/finance/transactions/${transactionId}/category`, {
		method: 'PATCH',
		body: JSON.stringify({
			category
		})
	});
	if (!res.ok) {
		const msg = await res.text();
		throw new Error(msg || `Finance category update failed: ${res.status}`);
	}
	return (await res.json()) as FinanceTransaction;
}
