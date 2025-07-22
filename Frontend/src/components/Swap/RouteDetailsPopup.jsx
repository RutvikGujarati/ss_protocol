import React from "react";
import PropTypes from "prop-types";

const RouteDetailsPopup = ({
    routeDetails
}) => {
    return (
        <div className="d-flex flex-column gap-2">
            {routeDetails?.paths?.length > 0 && routeDetails?.swaps?.length > 0 ? (
                routeDetails.paths.map((path, i) => {
                    const swap = routeDetails.swaps[i];
                    const routePercent = (swap?.percent / 1000).toFixed(2);
                    return (
                        <div key={i} className="p-2 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="flex-grow-1 min-w-0">
                                    <div className="text-secondary  small mb-1 text-truncate">
                                        {path.map((token, idx) => (
                                            <React.Fragment key={idx}>
                                                <span className=" text-secondary">{token.symbol}</span>
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
                                                    <span className=" text-secondary">{token.symbol}</span>
                                                    <span className="text-secondary small">→</span>
                                                    <span className=" text-secondary">{nextToken.symbol}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 small">
                                                    <span className="text-secondary ">{exchangeName}</span>
                                                    <span className="text-secondary small opacity-75">{pairPercent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center text-secondary">
                    <small>No route details available</small>
                </div>
            )}
        </div>
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
    inline: PropTypes.bool,
};

export default RouteDetailsPopup;
