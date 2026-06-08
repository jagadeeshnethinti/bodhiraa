// Public surface of the API layer.
export { api, ApiError, setAuthToken, setUnauthorizedHandler } from './client';
export type { ApiResult, ApiErrorKind } from './client';
export { Storage } from './storage';
export { resolveMediaUrl, authedVideoSource } from './media';

export { AuthApi } from './endpoints/auth';
export type { RegisterInput, LoginInput, OtpVerifyInput } from './endpoints/auth';
export { NotificationsApi } from './endpoints/notifications';
export type { NotificationPage } from './endpoints/notifications';
export { StudentApi } from './endpoints/student';
export { TeacherApi } from './endpoints/teacher';
export { ParentApi } from './endpoints/parent';

export * from './types';
