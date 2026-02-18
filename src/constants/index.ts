export const API_ENDPOINTS = {
  CREATE_LIVENESS_SESSION: `${import.meta.env.VITE_FACE_REC_API_URL}/liveness`,
  CREATE_TEMPORARY_CREDENTIALS: `${import.meta.env.VITE_FACE_REC_API_URL}/liveness/temporary-credentials`,
  GET_RESULT: (sessionId: string, threshold: number) => `${import.meta.env.VITE_FACE_REC_API_URL}/liveness/${sessionId}/${import.meta.env.VITE_COMPANY_ID}?threshold=${threshold}`,
  GET_USER_INFO: (userId: string) => `${import.meta.env.VITE_HR_API_URL}/employee/single-employee/${userId}/`,
};
