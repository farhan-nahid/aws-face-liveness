import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { useEffect, useState } from "react";
import "./App.tsx";

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLivenessActive, setIsLivenessActive] = useState(false);
  const [livenessResult, setLivenessResult] = useState<any>(null);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);

  // Fetch temporary credentials on component mount
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

        if (creds) {
          // Configure Amplify with temporary credentials
          Amplify.configure({
            Auth: {
              Cognito: {
                identityPoolId: `${creds.region}:temp-credentials`,
              },
            },
          });

          // Store credentials for manual configuration if needed
          (window as any).awsCredentials = {
            accessKeyId: creds.access_key_id,
            secretAccessKey: creds.secret_access_key,
            sessionToken: creds.session_token,
            region: creds.region,
          };

          setCredentialsLoaded(true);
        }
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
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const session = data?.data?.data;

      if (session && session.session_id) {
        setSessionId(session.session_id);
        setIsLivenessActive(true);
      } else {
        throw new Error("Invalid response structure: sessionId not found");
      }
    } catch (err: any) {
      console.log("Failed to create session:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = async () => {
    try {
      if (!sessionId) return;

      const response = await fetch(
        `http://localhost:8000/api/v1/liveness/get-face-liveness-session-result/${sessionId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching results: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Liveness Result:", data);
      setLivenessResult(data);
      setIsLivenessActive(false);
    } catch (err: any) {
      console.log("Failed to get liveness results:", err);
      setError(err.message || "Failed to fetch results");
      setIsLivenessActive(false);
    }
  };

  return (
    <>
      {!credentialsLoaded ? (
        <div className="card">
          <h2>Loading AWS Credentials...</h2>
          <p>Please wait while we set up the liveness detection.</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : isLivenessActive && sessionId ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1000,
            background: "white",
          }}
        >
          <FaceLivenessDetector
            sessionId={sessionId}
            region="us-east-1"
            onAnalysisComplete={handleAnalysisComplete}
            onError={(error: any) => {
              console.log("Liveness Error:", error);
              setError(error.message);
              setIsLivenessActive(false);
            }}
          />
          <button
            onClick={() => setIsLivenessActive(false)}
            style={{ position: "absolute", top: 20, right: 20, zIndex: 1001 }}
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Liveness Check</h2>
            <button onClick={createLivenessSession} disabled={loading}>
              {loading ? "Starting Session..." : "Start Liveness Check"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {livenessResult && (
              <div style={{ marginTop: "1rem", textAlign: "left" }}>
                <h3>Liveness Result:</h3>
                <pre
                  style={{
                    background: "#333",
                    padding: "1rem",
                    borderRadius: "8px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(livenessResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
        </>
      )}
    </>
  );
}

export default App;
