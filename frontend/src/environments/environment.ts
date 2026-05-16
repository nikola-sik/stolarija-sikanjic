/**
 * Default environment - koristi se za development (ng serve).
 * Za produkciju, angular.json ima fileReplacements koji
 * zamijene ovaj fajl sa environment.prod.ts pri prod build-u.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
} as const;
