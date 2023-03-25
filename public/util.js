export function kebabToPascal (kebabCase) {
  return kebabCase.replace(
    /-(\w)/g,
    (_, match) => match.toUpperCase()
  ).replace(/^\w/, (match) => match.toUpperCase())
}

const pluralFormatter = new Intl.PluralRules("en-US", { type: "ordinal" });
const suffixes = new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"],
]);

export function formatOrdinals (n) {
  const rule = pluralFormatter.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
}

export const deferredAction = (action) => setTimeout(action, 0)