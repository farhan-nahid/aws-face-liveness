import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";

export function FaceLivenessDetection(props: any) {
  const { region, sessionId, setIsLivenessActive, setError } = props;

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
          region={region}
          sessionId={sessionId}
          onAnalysisComplete={props.onAnalysisComplete}
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
