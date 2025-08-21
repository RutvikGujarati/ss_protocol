// TxProgressModal.jsx
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

const getStepIndex = (txStatus, steps) => {
  return steps.findIndex(step => step.key === txStatus);
};

const TxProgressModal = ({ isOpen, txStatus, steps }) => {
  const [showClass, setShowClass] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShowClass("slide-in");
    } else if (!isOpen && showClass === "slide-in") {
      setShowClass("slide-out");
    }
  }, [isOpen]);
  // ✅ Immediately hide if txStatus is "error" or "confirm"
  if (txStatus === "error" || txStatus === "confirmed") return null;
  
  if (!isOpen && showClass !== "slide-out") return null;

  const currentStepIndex = getStepIndex(txStatus, steps);

  return (
    <div
      className={`modal fade show d-block modal-animate ${showClass}`}
      tabIndex="-1"
      style={{
        background: "transparent",
        zIndex: 30000,
        backdropFilter: "blur(4px)",
      }}
      onAnimationEnd={() => {
        if (showClass === "slide-out") {
          setShowClass("");
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content text-light shadow border-1 p-3"
          style={{
            background: "#1a1b1f",
            borderRadius: "30px",
          }}
        >
          <div className="modal-header border-0 pb-3">
            <h6 className="modal-title" style={{ fontSize: "1rem", fontWeight: "200" }}>Transaction Status</h6>
          </div>
          <div className="modal-body pt-0">
            <div className="position-relative d-flex justify-content-between align-items-center pb-2">
              {/* Dotted connector */}
              {steps.map((_, idx) => {
                if (idx === steps.length - 1) return null;
                return (
                  <div
                    key={`line-${idx}`}
                    className="position-absolute"
                    style={{
                      top: "35%",
                      left: `${(idx + 0.7) * (100 / steps.length)}%`,
                      transform: "translateY(-50%)",
                      width: `calc(${100 / steps.length}% - 30px)`,
                      borderTop: "2px dotted #6c757d",
                      zIndex: 0,
                    }}
                  ></div>
                );
              })}

              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFinal = idx === steps.length - 1;

                return (
                  <div
                    key={step.key}
                    className="text-center position-relative"
                    style={{ zIndex: 1, flex: 1 }}
                  >
                    <div className="d-flex justify-content-center align-items-center my-4">
                      {isCurrent ? (
                        <Spinner
                          animation="border"
                          style={{
                            width: "20px",
                            height: "20px",
                            color: "#ff4081",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle"
                          style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: isActive
                              ? isFinal
                                ? txStatus === "error"
                                  ? "#dc3545"
                                  : "#28a745"
                                : "#ff4081"
                              : "#1a1b1f",
                            border: `2px solid ${isActive
                              ? isFinal
                                ? txStatus === "error"
                                  ? "#dc3545"
                                  : "#28a745"
                                : "#ff4081"
                              : "#6c757d"
                              }`,
                          }}
                        ></div>
                      )}
                    </div>
                    <small
                      className={
                        isActive
                          ? isFinal
                            ? txStatus === "error"
                              ? "text-danger fw-bold"
                              : "text-success fw-bold"
                            : "text-light"
                          : "text-light"
                      }
                      style={{
                        whiteSpace: "nowrap",   // ✅ force in one line
                        overflow: "hidden",     // ✅ hide overflow
                        textOverflow: "ellipsis", // ✅ add "..." if text too long
                        display: "block",
                        maxWidth: "80px",       // ✅ adjust width per your design
                      }}
                    >
                      {step.label}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TxProgressModal;
