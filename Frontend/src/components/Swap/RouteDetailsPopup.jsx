import React from "react";
import PropTypes from "prop-types";

const RouteDetailsPopup = ({
    routeDetails,
    showRoutePopup,
    setShowRoutePopup,
    getTokenLogo,
    TOKENS,
    state,
}) => {
    return (
        <>
            {showRoutePopup && (
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        zIndex: 2000,
                        backdropFilter: "blur(1px)"
                    }}
                    onClick={() => setShowRoutePopup(false)}
                >
                    <div
                        className="simple-modal-content"
                        style={{
                            backgroundColor: '#2d3238',
                            position: 'absolute',
                            left: "50%",
                            top: "72%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 2001,
                            maxWidth: '480px',
                            width: '480px',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="simple-modal-header">
                            <h6 className="simple-modal-title text-light mb-0">Routes</h6>
                            <button
                                type="button"
                                className="btn-close btn-close-white btn-close-sm"
                                onClick={() => setShowRoutePopup(false)}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="simple-modal-body" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                            {routeDetails?.paths?.length > 0 &&
                                routeDetails?.swaps?.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                    {routeDetails.paths.map((path, i) => {
                                        const swap = routeDetails.swaps[i];
                                        const routePercent = (swap?.percent / 1000).toFixed(2);

                                        return (
                                            <div key={i} className="p-2 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <div className="simple-token-logo">
                                                        {getTokenLogo(path[0]?.symbol)}
                                                    </div>
                                                    <div className="flex-grow-1 min-w-0">
                                                        <div className="text-light fw-medium small mb-1 text-truncate">
                                                            {path.map((token, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <span className="fw-medium text-light">{token.symbol}</span>
                                                                    {idx < path.length - 1 && (
                                                                        <span className="text-secondary mx-1 small">→</span>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                        <div className="text-secondary small opacity-75">
                                                            {routePercent}% of total
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Show each pair with exchange and percentage */}
                                                <div className="d-flex flex-column gap-1 mt-2 pt-2 border-top border-secondary border-opacity-25">
                                                    {path.map((token, idx) => {
                                                        if (idx === path.length - 1) return null;
                                                        const nextToken = path[idx + 1];
                                                        const subswap = swap?.subswaps?.[idx];
                                                        const subPath = subswap?.paths?.[0];
                                                        const exchangeName = subPath?.exchange || subPath?.poolName || "Unknown";
                                                        const pairPercent = subPath?.percent ? (subPath.percent / 1000).toFixed(2) : "100.00";

                                                        return (
                                                            <div key={idx} className="p-2 bg-dark bg-opacity-10 rounded border border-secondary border-opacity-10">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center gap-1 small">
                                                                        <span className="fw-medium text-light">{token.symbol}</span>
                                                                        <span className="text-secondary small">→</span>
                                                                        <span className="fw-medium text-light">{nextToken.symbol}</span>
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-2 small">
                                                                        <span className="text-secondary fw-medium">{exchangeName}</span>
                                                                        <span className="text-secondary small opacity-75">{pairPercent}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-secondary">
                                    <small>No route details available</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

RouteDetailsPopup.propTypes = {
    routeDetails: PropTypes.shape({
        paths: PropTypes.array,
        swaps: PropTypes.array,
    }),
    showRoutePopup: PropTypes.bool.isRequired,
    setShowRoutePopup: PropTypes.func.isRequired,
    getTokenLogo: PropTypes.func.isRequired,
    TOKENS: PropTypes.object.isRequired,
    state: PropTypes.string.isRequired,
};

export default RouteDetailsPopup;
