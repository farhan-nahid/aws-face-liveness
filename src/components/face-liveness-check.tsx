import { useEffect, useState } from "react";
import { API_ENDPOINTS, HR_API_SECRET_KEY } from "../constants";

export function FaceLivenessCheck(props: any) {
  const [pending, setPending] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { loading, createLivenessSession, error, livenessResult } = props;
  const userId = livenessResult?.data?.data?.face_recognition?.data?.user_id;

  useEffect(() => {
    if (userId && !loading) {
      const fetchUserInfo = async () => {
        setPending(true);
        try {
          const response = await fetch(API_ENDPOINTS.USER_INFO(userId), {
            method: "GET",
            headers: {
              "secret-key": HR_API_SECRET_KEY,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }

          const data = await response.json();
          setUserInfo(data?.data || null);
        } catch (err) {
          console.error("Error fetching user info:", err);
        } finally {
          setPending(false);
        }
      };
      fetchUserInfo();
    }
  }, [userId, loading]);

  return (
    <div className="card">
      <h2>Face Liveness Check</h2>
      <p>
        Verify your identity using secure, real-time facial liveness detection.
      </p>

      <div style={{ marginTop: "1.75rem" }}>
        <button
          className="primary-button"
          onClick={createLivenessSession}
          disabled={loading}
        >
          {loading ? "Starting Session..." : "Start Liveness Check"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {livenessResult && (
        <div className="result-container">
          <h3>Liveness Result</h3>
          <pre className="result-json">
            {JSON.stringify(livenessResult, null, 2)}
          </pre>
        </div>
      )}

      {pending && <p>Loading user information...</p>}

      {userInfo && (
        <div className="result-container">
          <h3>User Information</h3>
          <pre className="result-json">{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
