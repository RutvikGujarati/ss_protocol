import React from "react";

const getStepActive = (step, txStatus) => {
  // Map status to step index for highlighting
  const order = [
    "initializing",
    "initiated",
    "Approving",
    "pending",
    "confirmed",
    "error",
  ];
  const statusIdx = order.indexOf(txStatus);
  const stepIdx = order.indexOf(step);
  if (step === "error") return txStatus === "error";
  if (step === "confirmed") return txStatus === "confirmed";
  return statusIdx >= stepIdx && statusIdx !== -1;
};

const TxProgressModal = ({ isOpen, txStatus }) => {
  if (!isOpen) return null;
  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      style={{
        zIndex: 30000,
        background: "rgba(33, 37, 41, 0.1)",
        pointerEvents: isOpen ? "auto" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content popup-content">
          <div className="modal-header border-0 text-center w-100 d-block">
            <h6 className="modal-title text-light">Transaction Status</h6>
           
          </div>
          <div className="modal-body">
            <div className="tx-progress-container">
              <div className="step-line">
                {/* Initializing */}
                <div className={`step ${getStepActive("initializing", txStatus) ? "active" : ""}`}>
                  <span className="dot" />
                  <span className="label">Initializing</span>
                </div>
                {/* Initiated */}
                <div className={`step ${getStepActive("initiated", txStatus) ? "active" : ""}`}>
                  <span className="dot" />
                  <span className="label">Initiated</span>
                </div>
                {/* Approving */}
                <div className={`step ${getStepActive("Approving", txStatus) ? "active" : ""}`}>
                  <span className="dot" />
                  <span className="label">Approving</span>
                </div>
                {/* Swapping */}
                <div className={`step ${getStepActive("pending", txStatus) ? "active" : ""}`}>
                  <span className="dot" />
                  <span className="label">Swapping</span>
                </div>
                {/* Confirmed/Error */}
                <div className={`step ${getStepActive("confirmed", txStatus) || getStepActive("error", txStatus) ? "active" : ""}`}>
                  <span className="dot" />
                  <span className="label">{txStatus === "error" ? "Error" : "Confirmed"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TxProgressModal; 