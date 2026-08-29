export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };
export class AppError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}
export const FirebaseErrorMapper = (error: any): AppError => {
  // Map firebase errors to AppError
  return new AppError('FIREBASE_ERROR', error.message || 'Unknown Firebase Error');
};
export interface ResponseWrapper<T> {
  data: T;
  timestamp: number;
}
