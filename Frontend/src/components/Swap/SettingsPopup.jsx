import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const SettingsPopup = ({
  show,
  slippage,
  isAutoSlippage,
  handleSlippageToggle,
  setSlippage,
  onClose,
}) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
      {/* Popup */}
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ minWidth: 320, maxWidth: 400 }}
        >
          <div className="modal-content bg-dark text-light" ref={popupRef}>
            <div className="modal-header border-0">
              <h5 className="modal-title">
                <i className="bi bi-gear-fill me-2 text-primary"></i>
                Swap Settings
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <label className="form-label">
                <i className="bi bi-shield-check me-2 text-success"></i>
                Max Slippage Tolerance
              </label>
              <div className="input-group mb-3">
                <span className="input-group-text bg-secondary border-0 text-light">
                  <i className="bi bi-percent"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-secondary text-light"
                  value={
                    isAutoSlippage ? `${slippage}% (Auto)` : `${slippage}%`
                  }
                  readOnly
                />
              </div>
              <div className="d-flex gap-2 mb-3">
                <button
                  className={`btn btn-sm ${
                    isAutoSlippage ? "btn-primary" : "btn-outline-primary"
                  } rounded-pill flex-fill`}
                  onClick={() => handleSlippageToggle(true)}
                >
                  Auto
                </button>
                <button
                  className={`btn btn-sm ${
                    !isAutoSlippage ? "btn-primary" : "btn-outline-primary"
                  } rounded-pill flex-fill`}
                  onClick={() => handleSlippageToggle(false)}
                >
                  Custom
                </button>
              </div>
              {!isAutoSlippage && (
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control bg-secondary border-0 text-light rounded-pill"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    step="0.1"
                    min="0"
                    max="50"
                  />
                </div>
              )}
              <div className="alert alert-info bg-secondary border-0 text-light small mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Slippage tolerance</strong> is the maximum price
                movement you&#39;re willing to accept for your swap.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
SettingsPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  slippage: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isAutoSlippage: PropTypes.bool.isRequired,
  handleSlippageToggle: PropTypes.func.isRequired,
  setSlippage: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsPopup;
