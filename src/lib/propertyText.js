// Sample listings carry a neighbourhood + a type key; the title is built per language.
export function propertyTitle(property, tType, locale) {
  const type = tType(property.type);
  if (locale === 'es') return `${type} en ${property.hood}`;
  if (locale === 'de') return `${type} in ${property.hood}`;
  return `${property.hood} ${type}`;
}
