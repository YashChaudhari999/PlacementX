export interface Student { id: string; name: string; email: string; }
export interface Admin { id: string; role: string; }
export interface PlacementEvent { id: string; companyId: string; title: string; }
export interface Application { id: string; studentId: string; eventId: string; status: string; }
export interface Notification { id: string; userId: string; message: string; read: boolean; }
export interface RecruiterSubmission { id: string; eventToken: string; status: string; }
export interface Department { id: string; name: string; }
export interface Branch { id: string; name: string; departmentId: string; }
export interface Settings { id: string; notificationsEnabled: boolean; }
