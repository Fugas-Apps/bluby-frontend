// API configuration
// If API_URL is provided without a scheme (e.g. "api.blubyai.com"), prepend https://.
const rawApiUrl = process.env.API_URL || '';
function normalizeUrl(u: string) {
	if (!u) return '';
	if (u.startsWith('http://') || u.startsWith('https://')) return u;
	return `https://${u}`;
}

export const API_URL = ((): string => {
	if (rawApiUrl) return normalizeUrl(rawApiUrl);
	// default to localhost in development, production domain in production
	return process.env.NODE_ENV === 'production' ? 'https://api.blubyai.com' : 'http://localhost:8787';
})();
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
