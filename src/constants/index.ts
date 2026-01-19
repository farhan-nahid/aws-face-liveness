export const API_BASE_URL = "http://localhost:8000/api/v1/liveness";
export const HR_API_URL = "https://api.attendancekeeper.net/hr/api/v1";
export const AWS_REGION = "us-east-1";
export const HR_API_SECRET_KEY = "6433220e-5f0b-4238-bb11-046f589e9149";
export const COMPANY_ID = "0148ad01-c138-42f5-9609-01d3989e92f1"

export const API_ENDPOINTS = {
  CREATE_SESSION: `${API_BASE_URL}`,
  CREATE_TEMPORARY_CREDENTIALS: `${API_BASE_URL}/temporary-credentials`,
  GET_RESULT: (sessionId: string, threshold: number) => `${API_BASE_URL}/${sessionId}/${COMPANY_ID}?threshold=${threshold}`,
  GET_USER_INFO: (userId: string) => `${HR_API_URL}/employee/single-employee/${userId}/`,
};
