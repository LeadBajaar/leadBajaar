import { type CreateLeadDto } from '@/lib/api';
import { type ColumnMapping } from '@/app/(dashboard)/leads/types';

/**
 * Robustly parses a CSV line, respecting double quotes and trimming values.
 * Removes surrounding quotes from the resulting values.
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Toggle quote state
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes ""
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

/**
 * Parses raw CSV text into headers and preview rows.
 * @throws Error if the CSV is empty or has no data rows.
 */
export const parseCSVContent = (csvText: string): { headers: string[]; preview: string[][] } => {
  const lines = csvText.split('\n');

  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  const result = lines.filter(l => l.trim()).map(line => parseCSVLine(line));
  const headers = result[0];
  const preview = result.slice(0, 5);

  return { headers, preview };
};

/**
 * Prepares the array of CreateLeadDto objects based on CSV data and user mappings.
 */
export const prepareImportData = (
  csvText: string,
  columnMapping: ColumnMapping[]
): CreateLeadDto[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const dataRows = lines.slice(1).map(line => parseCSVLine(line));

  return dataRows.map(row => {
    const lead: CreateLeadDto = {
      name: '',
      email: '',
      stage: 'New',
      status: 'Warm',
    };

    columnMapping.forEach(mapping => {
      if (mapping.leadField !== 'skip') {
        const index = headers.indexOf(mapping.csvHeader);
        if (index !== -1) {
          const value = row[index];
          switch (mapping.leadField) {
            case 'name':
            case 'email':
            case 'phone':
            case 'company':
            case 'stage':
            case 'source':
            case 'city':
            case 'profession':
              lead[mapping.leadField] = value;
              break;
            case 'status':
              if (['Hot', 'Warm', 'Cold'].includes(value)) {
                lead.status = value as 'Hot' | 'Warm' | 'Cold';
              }
              break;
          }
        }
      }
    });

    return lead;
  });
};
