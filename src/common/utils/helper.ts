import { FindOptionsWhere } from 'typeorm';

export function formatFieldName(field: string): string {
  const words = field
    .replace(/([A-Z])/g, ' $1') // Add space before capitals: userName → user Name
    .replace(/[_\-.]/g, ' ') // Replace snake_case or kebab-case with spaces
    .toLowerCase() // Convert entire string to lowercase
    .split(' ') // Split into words
    .filter(Boolean); // Remove empty strings

  if (words.length === 0) {
    return field;
  }

  const firstWord = words[0][0].toUpperCase() + words[0].slice(1);
  const rest = words.length > 1 ? ` ${words.slice(1).join(' ')}` : '';
  return firstWord + rest;
}

export function cleanObject<T extends object>(
  input: FindOptionsWhere<T>,
): FindOptionsWhere<T> {
  const result: FindOptionsWhere<T> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (result as any)[key] = value;
    }
  }

  return result;
}

export function extractDriveId(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  const regex = /[-\w]{25,}/; // Matches typical Drive ID patterns
  const match = regex.exec(trimmed);
  return match ? match[0] : undefined;
}
