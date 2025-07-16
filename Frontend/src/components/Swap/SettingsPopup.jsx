import React from "react";

const SettingsPopup = ({ show, slippage, isAutoSlippage, handleSlippageToggle, setSlippage }) => {
    if (!show) return null;

    return (
        <div
            className="settings-popup position-absolute"
            style={{
                top: 0,
                right: 0,
                background: "#1e1e1e",
                borderRadius: "10px",
                padding: "16px 18px 12px 18px",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                zIndex: 1000,
                minWidth: 220,
                maxWidth: 320,
                width: "90vw",
                marginTop: 230, // below the settings button
                marginRight: 500,
            }}
        >
            <label className="text-light small mb-1">Max slippage</label>
            <div className="input-group mb-2">
                <input
                    type="text"
                    className="form-control border-0 bg-transparent text-light fs-5"
                    value={isAutoSlippage ? `${slippage}% (Auto)` : `${slippage}%`}
                    readOnly
                />
            </div>
            <div className="d-flex justify-content-between align-items-center gap-2">
                <button
                    className={`btn btn-sm ${isAutoSlippage ? "btn-primary" : "btn-outline-primary"} rounded-pill px-3`}
                    onClick={() => handleSlippageToggle(true)}
                >
                    Auto
                </button>
                <button
                    className={`btn btn-sm ${!isAutoSlippage ? "btn-primary" : "btn-outline-primary"} rounded-pill px-3`}
                    onClick={() => handleSlippageToggle(false)}
                >
                    Custom
                </button>
                {!isAutoSlippage && (
                    <input
                        type="number"
                        className="form-control bg-dark border-0 text-light rounded-pill shadow-sm w-25"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        step="0.1"
                        min="0"
                        style={{ minWidth: 60 }}
                    />
                )}
            </div>
            <style>{`
                @media (max-width: 600px) {
                    .settings-popup {
                        left: 50% !important;
                        right: auto !important;
                        transform: translateX(-50%) !important;
                        width: 98vw !important;
                        min-width: 0 !important;
                        max-width: 98vw !important;
                        margin-right: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SettingsPopup;