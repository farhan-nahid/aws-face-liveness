import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { Amplify } from "aws-amplify";
import { useEffect, useState } from "react";

import "@aws-amplify/ui-react-liveness/styles.css";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLivenessActive, setIsLivenessActive] = useState(false);
  const [livenessResult, setLivenessResult] = useState<any>(null);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/liveness/credentials"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch credentials");
        }

        const data = await response.json();
        const creds = data?.data?.data;

        if (!creds) {
          throw new Error("Invalid credentials response");
        }

        Amplify.configure(
          {
            Auth: {
              Cognito: {
                identityPoolId: `${creds.region}:temp-credentials`,
              },
            },
          },
          {
            Auth: {
              credentialsProvider: {
                getCredentialsAndIdentityId: async () => ({
                  credentials: {
                    accessKeyId: creds.access_key_id,
                    secretAccessKey: creds.secret_access_key,
                    sessionToken: creds.session_token,
                  },
                }),
                clearCredentialsAndIdentityId: () => {},
              },
            },
          }
        );

        setCredentialsLoaded(true);
      } catch (err: any) {
        console.error("Failed to load credentials:", err);
        setError("Failed to load AWS credentials");
      }
    };

    loadCredentials();
  }, []);

  const createLivenessSession = async () => {
    setLoading(true);
    setError(null);
    setSessionId(null);
    setLivenessResult(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/liveness/create-liveness-session",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create liveness session");
      }

      const data = await response.json();
      const session = data?.data?.data;

      if (!session?.session_id) {
        throw new Error("Session ID missing in response");
      }

      setSessionId(session.session_id);
      setIsLivenessActive(true);
    } catch (err: any) {
      console.error("Create session error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/liveness/get-face-liveness-session-result/${sessionId}/0148ad01-c138-42f5-9609-01d3989e92f1?threshold=80`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch liveness result");
      }

      const data = await response.json();
      setLivenessResult(data);
    } catch (err: any) {
      console.error("Fetch result error:", err);
      setError(err.message || "Failed to fetch result");
    } finally {
      setIsLivenessActive(false);
    }
  };

  return (
    <div className="app-container">
      <div className="centered-container">
        {!credentialsLoaded ? (
          <div className="card">
            <h2>Loading AWS Credentials</h2>
            <p>Please wait while we prepare face liveness detection.</p>
            {error && <p className="error-text">{error}</p>}
          </div>
        ) : isLivenessActive && sessionId ? (
          <>
            <div className="liveness-header">
              <h2>Face Liveness Detection</h2>
              <button
                className="cancel-button"
                onClick={() => setIsLivenessActive(false)}
              >
                Cancel
              </button>
            </div>

            <div className="liveness-container">
              <FaceLivenessDetector
                sessionId={sessionId}
                region="us-east-1"
                onAnalysisComplete={handleAnalysisComplete}
                onError={(err: any) => {
                  console.error("Liveness error:", err);
                  setError(err.message || "Liveness failed");
                  setIsLivenessActive(false);
                }}
              />
            </div>
          </>
        ) : (
          <div className="card">
            <h2>Face Liveness Check</h2>
            <p>
              Verify your identity using secure, real-time facial liveness
              detection.
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
