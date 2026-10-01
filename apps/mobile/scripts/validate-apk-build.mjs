const rawUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!rawUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is required for an Android APK build.');
}

let url;
try {
  url = new URL(rawUrl);
} catch {
  throw new Error('EXPO_PUBLIC_API_URL must be a valid absolute URL.');
}

if (!['http:', 'https:'].includes(url.protocol)) {
  throw new Error('EXPO_PUBLIC_API_URL must use http or https.');
}

if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) {
  throw new Error('EXPO_PUBLIC_API_URL cannot target localhost, 127.0.0.1, or 0.0.0.0 in an APK.');
}

if (!url.pathname.endsWith('/api')) {
  throw new Error('EXPO_PUBLIC_API_URL must include the API /api path.');
}

console.log(`APK API endpoint validated: ${url.protocol}//${url.host}${url.pathname}`);