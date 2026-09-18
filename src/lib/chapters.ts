import stats from "../data/stats.json";

// Chapter counts for page copy. Every number reads off the chapter list in
// stats.json, so adding a chapter there updates the map and the copy together.
export const chapters = stats.chapters;
export const chapterStates = [...new Set(chapters.map((chapter) => chapter.state))];
export const chapterCount = chapters.length;
export const stateCount = chapterStates.length;

// Fifty states, no territories.
export const STATE_COUNT = 50;

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty"];

// Spells out 0 to 59, which covers a count of states.
export function spell(n: number): string {
  if (n < 20) return ONES[n];
  const ones = n % 10;
  return ones ? `${TENS[Math.floor(n / 10)]}-${ONES[ones]}` : TENS[Math.floor(n / 10)];
}

export const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1);

export const listFormat = (items: string[]) =>
  new Intl.ListFormat("en", { type: "conjunction" }).format(items);
