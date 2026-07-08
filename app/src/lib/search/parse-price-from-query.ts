export type ParsedPriceFromQuery = {
  minPrice?: number;
  maxPrice?: number;
};

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const NUMBER_PATTERN = '([\\d٠-٩][\\d٠-٩.,\\s]*)';
const OPTIONAL_CURRENCY = '(?:\\s*(?:ريال|ر\\.س|sar|usd|دولار))?';
const ARABIC_TO_WORD = '(?:الى|[إأآا]لى)';
const ARABIC_RANGE_CONNECTOR = `(?:${ARABIC_TO_WORD}|و|وال|حتى|لحد|لغاية|ل)`;
const ARABIC_BETWEEN_PREFIX = '(?:بين|ما\\s+بين)';
const ARABIC_LESS_THAN_WORD = '(?:[اأإآ]قل\\s+من)';
const ARABIC_MORE_THAN_WORD = '(?:[اأإآ]كثر\\s+من)';
const ARABIC_HIGHER_THAN_WORD = '(?:[اأإآ]على\\s+من)';

function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC_DIGITS.indexOf(digit)))
    .replace(/[,\s]/g, '');
}

function parsePriceNumber(raw: string): number | undefined {
  const normalized = normalizeDigits(raw.trim());
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

function matchFirstPrice(query: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(query);
    if (!match) continue;
    const parsed = parsePriceNumber(match[1]);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
}

export function parsePriceFromQuery(query: string): ParsedPriceFromQuery {
  const trimmed = query.trim();
  if (!trimmed || trimmed === '*') return {};

  const betweenPatterns = [
    new RegExp(
      `(?:^|\\s)between\\s+${NUMBER_PATTERN}\\s+(?:and|to)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)from\\s+${NUMBER_PATTERN}\\s+(?:to|till|until)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)من\\s+${NUMBER_PATTERN}\\s+${ARABIC_RANGE_CONNECTOR}\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)${ARABIC_BETWEEN_PREFIX}\\s+${NUMBER_PATTERN}\\s+${ARABIC_RANGE_CONNECTOR}\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
  ];

  for (const pattern of betweenPatterns) {
    const match = pattern.exec(trimmed);
    if (!match) continue;
    const min = parsePriceNumber(match[1]);
    const max = parsePriceNumber(match[2]);
    if (min !== undefined && max !== undefined) {
      return { minPrice: Math.min(min, max), maxPrice: Math.max(min, max) };
    }
  }

  const lessPatterns = [
    new RegExp(
      `(?:^|\\s)(?:less\\s+than|under|below)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(`<\\s*${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`, 'giu'),
    new RegExp(
      `(?:^|\\s)${ARABIC_LESS_THAN_WORD}\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)تحت\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)(?:حد\\s+[اأإآ]قص[ىي]|بحد\\s+[اأإآ]قص[ىي]|لحد|maximum|max)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)[اأإآ]رخص\\s+من\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
  ];

  const morePatterns = [
    new RegExp(
      `(?:^|\\s)(?:more\\s+than|over|above|greater\\s+than)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(`>\\s*${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`, 'giu'),
    new RegExp(
      `(?:^|\\s)${ARABIC_MORE_THAN_WORD}\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)فوق\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)(?:at\\s+least|minimum|min)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)(?:على\\s+ال[اأإآ]قل|بحد\\s+[اأإآ]دنى|[اأإآ]دنى\\s+من|ابتدا[ء]?\\s+من|ابتداء\\s+من|ابتداءً\\s+من)\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
    new RegExp(
      `(?:^|\\s)${ARABIC_HIGHER_THAN_WORD}\\s+${NUMBER_PATTERN}${OPTIONAL_CURRENCY}(?=\\s|$)`,
      'giu',
    ),
  ];

  const lessThan = matchFirstPrice(trimmed, lessPatterns);
  const moreThan = matchFirstPrice(trimmed, morePatterns);

  if (lessThan !== undefined && moreThan !== undefined) {
    return { minPrice: Math.min(lessThan, moreThan), maxPrice: Math.max(lessThan, moreThan) };
  }
  if (lessThan !== undefined) return { maxPrice: lessThan };
  if (moreThan !== undefined) return { minPrice: moreThan };
  return {};
}
