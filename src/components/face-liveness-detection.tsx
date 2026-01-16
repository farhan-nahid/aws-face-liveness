import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { AWS_REGION } from "../constants";

export function FaceLivenessDetection(props: any) {
  const { sessionId, setIsLivenessActive, setError, onAnalysisComplete } =
    props;

  return (
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
          region={AWS_REGION}
          onAnalysisComplete={onAnalysisComplete}
          onError={(err: any) => {
            console.error("Liveness error:", err);
            setError(err.message || "Liveness detection failed");
            setIsLivenessActive(false);
          }}
        />
      </div>
    </>
  );
}
