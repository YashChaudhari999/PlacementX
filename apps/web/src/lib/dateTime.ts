export const formatRegistrationClose = (value?: string | Date | null): string => {
 if (!value) return 'To be announced';
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return 'To be announced';

 return date.toLocaleString('en-IN', {
 day: '2-digit', month: 'short', year: 'numeric',
 hour: 'numeric', minute: '2-digit', hour12: true,
 });
};

export const toDateTimeLocalValue = (value?: string | null): string => {
 if (!value) return '';
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return '';
 const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
 return local.toISOString().slice(0, 16);
};
