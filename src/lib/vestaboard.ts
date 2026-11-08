export const FLAGSHIP_ROWS = 6;
export const FLAGSHIP_COLUMNS = 22;
export const NOTE_ROWS = 3;
export const NOTE_COLUMNS = 15;

// Codes from https://docs.vestaboard.com/docs/characterCodes
const CHARACTER_CODE: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 10,
  K: 11,
  L: 12,
  M: 13,
  N: 14,
  O: 15,
  P: 16,
  Q: 17,
  R: 18,
  S: 19,
  T: 20,
  U: 21,
  V: 22,
  W: 23,
  X: 24,
  Y: 25,
  Z: 26,
  "1": 27,
  "2": 28,
  "3": 29,
  "4": 30,
  "5": 31,
  "6": 32,
  "7": 33,
  "8": 34,
  "9": 35,
  "0": 36,
  "!": 37,
  "@": 38,
  "#": 39,
  $: 40,
  "(": 41,
  ")": 42,
  "-": 44,
  "+": 46,
  "&": 47,
  "=": 48,
  ";": 49,
  ":": 50,
  "'": 52,
  '"': 53,
  "%": 54,
  ",": 55,
  ".": 56,
  "/": 59,
  "?": 60,
};

const FANCY_CHARACTERS: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u201B": "'",
  "\u2032": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2212": "-",
  "\u00A0": " ",
};

export const VALID_VESTABOARD_CODES = new Set<number>([0, ...Object.values(CHARACTER_CODE)]);

export type VestaboardLayout = {
  text: string;
  characters: number[][];
  rows: number;
  columns: number;
};

export function boardSize(size: string | undefined) {
  if (size?.trim().toLowerCase() === "note") {
    return { rows: NOTE_ROWS, columns: NOTE_COLUMNS };
  }
  return { rows: FLAGSHIP_ROWS, columns: FLAGSHIP_COLUMNS };
}

export function formatVestaboard(input: {
  reference: string;
  body: string;
  translation: string;
  rows?: number;
  columns?: number;
}): VestaboardLayout {
  const rows = input.rows ?? FLAGSHIP_ROWS;
  const columns = input.columns ?? FLAGSHIP_COLUMNS;
  const header = wrap(plain(input.reference, input.translation), columns).slice(0, rows);
  const body = layoutLines(input.body, columns, rows - header.length);
  const occupied = [...header, ...body].slice(0, rows);
  const characters = Array.from({ length: rows }, (_, index) =>
    encodeLine(occupied[index] ?? "", columns),
  );
  return {
    text: occupied.map((line) => line.trimEnd()).join("\n"),
    characters,
    rows,
    columns,
  };
}

function plain(reference: string, translation: string) {
  const ref = normalizeBoardText(reference).replace(/\n/g, " ").replace(/ +/g, " ").trim();
  if (translation.trim().toUpperCase() === "ESV") return `${ref} ESV`.trim();
  return ref;
}

function layoutLines(body: string, columns: number, maxLines: number) {
  if (maxLines <= 0) return [];
  const normalized = normalizeBoardText(body);
  const lines: string[] = [];
  for (const paragraph of normalized.split("\n")) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    lines.push(...wrap(trimmed, columns));
    if (lines.length >= maxLines) break;
  }
  return lines.slice(0, maxLines);
}

export function normalizeBoardText(input: string) {
  const converted = [...input]
    .map((char) => {
      if (char === "\n" || char === "\r") return "\n";
      const replaced = FANCY_CHARACTERS[char] ?? char;
      if (replaced === " " || replaced === "\t") return " ";
      const upper = replaced.toUpperCase();
      if (CHARACTER_CODE[upper] !== undefined) return upper;
      if (CHARACTER_CODE[replaced] !== undefined) return replaced;
      return "";
    })
    .join("");
  return converted.replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n").trim();
}

function wrap(text: string, columns: number) {
  const words = text.split(" ").flatMap((word) => splitWord(word, columns)).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (current.length + 1 + word.length <= columns) {
      current = `${current} ${word}`;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

function splitWord(word: string, columns: number) {
  if (word.length <= columns) return [word];
  const pieces: string[] = [];
  for (let index = 0; index < word.length; index += columns) {
    pieces.push(word.slice(index, index + columns));
  }
  return pieces;
}

function encodeLine(line: string, columns: number) {
  const codes = [...line.slice(0, columns)].map((char) =>
    char === " " ? 0 : (CHARACTER_CODE[char] ?? 0),
  );
  while (codes.length < columns) codes.push(0);
  return codes;
}
