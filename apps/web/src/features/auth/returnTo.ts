const ALLOWED_RETURN_PATH = /^\/student\/drives\/[A-Za-z0-9-]{1,64}$/;

export const getSafeReturnTo = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    return ALLOWED_RETURN_PATH.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
};

export const loginUrlFor = (destination: string): string =>
  `/login?returnTo=${encodeURIComponent(destination)}`;
