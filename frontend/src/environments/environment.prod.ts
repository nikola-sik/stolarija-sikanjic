/**
 * Produkcija - backend je na Railway-u (poseban domen).
 * Promijeni apiBaseUrl na svoj Railway URL nakon prvog deploya backend-a.
 *
 * Format: https://<your-backend>.up.railway.app/api/v1
 * ili sa custom domenom: https://api.stolarija-sikanjic.com/api/v1
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://stolarija-sikanjic-production.up.railway.app/api/v1',
} as const;
