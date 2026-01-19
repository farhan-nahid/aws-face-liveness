import { Amplify } from "aws-amplify";
import { useEffect, useState } from "react";
import { FaceLivenessCheck } from "./components/face-liveness-check";
import { FaceLivenessDetection } from "./components/face-liveness-detection";
import { API_ENDPOINTS } from "./constants";

import "@aws-amplify/ui-react-liveness/styles.css";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<string>("us-east-1");
  const [error, setError] = useState<string | null>(null);
  const [isLivenessActive, setIsLivenessActive] = useState(false);
  const [livenessResult, setLivenessResult] = useState<any>(null);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.CREATE_TEMPORARY_CREDENTIALS,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "liveness-check-app" }),
          },
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
          },
        );

        setRegion(creds.region);
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
      const response = await fetch(API_ENDPOINTS.CREATE_LIVENESS_SESSION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

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
      const response = await fetch(API_ENDPOINTS.GET_RESULT(sessionId, 80));

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
          <FaceLivenessDetection
            region={region}
            sessionId={sessionId}
            onAnalysisComplete={handleAnalysisComplete}
            setIsLivenessActive={setIsLivenessActive}
            setError={setError}
          />
        ) : (
          <FaceLivenessCheck
            loading={loading}
            createLivenessSession={createLivenessSession}
            error={error}
            livenessResult={livenessResult}
          />
        )}
      </div>
    </div>
  );
}

export default App;
