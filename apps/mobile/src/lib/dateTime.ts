export const formatRegistrationClose = (value?: string | Date | null): string => {
  if (!value) return 'To be announced';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'To be announced';

  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};
