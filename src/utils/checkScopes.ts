export function checkScopes(
  grantedScopes: string[],
  requiredScopes: string[],
): boolean {
  return requiredScopes.every((scope) => grantedScopes.includes(scope));
}
