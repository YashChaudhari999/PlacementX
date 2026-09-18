import api from './api';

const getFilename = (contentDisposition: string | undefined, fallback: string) => {
 const encodedMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i);
 if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1]);

 const basicMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
 return basicMatch?.[1] || fallback;
};

export const downloadGeneratedReport = async (reportId: string) => {
 const response = await api.get(`/admin/reports/download/${reportId}`, {
 responseType: 'blob',
 });
 const url = URL.createObjectURL(response.data);
 const anchor = document.createElement('a');
 anchor.href = url;
 anchor.download = getFilename(response.headers['content-disposition'], `report_${reportId}`);
 document.body.appendChild(anchor);
 anchor.click();
 anchor.remove();
 URL.revokeObjectURL(url);
};
