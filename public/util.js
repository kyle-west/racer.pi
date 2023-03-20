export function kebabToPascal (kebabCase) {
  return kebabCase.replace(
    /-(\w)/g,
    (_, match) => match.toUpperCase()
  ).replace(/^\w/, (match) => match.toUpperCase())
}
