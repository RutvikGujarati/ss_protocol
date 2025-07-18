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
                        zIndex: 2000, backgroundColor: "#3141920", backdropFilter: "blur(2px)"
                    }}
                    onClick={() => setShowRoutePopup(false)}
                >
                    <div
                        className="bg-dark text-light rounded-4 shadow-lg p-4 position-absolute"
                        style={{
                            left: "50%",
                            top: "82%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 2001,
                            minWidth: "320px",
                            maxWidth: "95vw",
                            width: "800px",
                            boxSizing: "border-box",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ borderTop: "1px solid #333", marginBottom: 16 }}></div>
                        <div className="d-flex flex-column gap-3">
                            {routeDetails?.paths?.length > 0 &&
                                routeDetails?.swaps?.length > 0 ? (
                                routeDetails.paths.map((path, i) => (
                                    <div
                                        key={i}
                                        className="d-flex align-items-center gap-3 flex-wrap"
                                    >
                                        <div
                                            className="d-flex flex-column align-items-center"
                                            style={{ minWidth: 70 }}
                                        >
                                            {getTokenLogo(path[0]?.symbol)}
                                            <span className="badge bg-secondary mt-1">
                                                {(routeDetails.swaps[i]?.percent / 1000).toFixed(2)}%
                                            </span>
                                        </div>
                                        <div
                                            className="d-flex flex-row gap-3 flex-wrap align-items-center"
                                            style={{ flex: 1, minWidth: 0 }}
                                        >
                                            <div
                                                className="d-flex flex-row gap-3 flex-wrap align-items-center justify-content-center"
                                                style={{ flex: 1, minWidth: 0 }}
                                            >
                                                {path.map((token, idx) => {
                                                    if (idx === path.length - 1) return null;
                                                    const nextToken = path[idx + 1];
                                                    const swap = routeDetails.swaps[i];
                                                    const sub = swap?.subswaps?.[idx];
                                                    const p = sub?.paths?.[0];
                                                    const platform = p?.exchange || p?.poolName || "";
                                                    const percent = p?.percent
                                                        ? (p.percent / 1000).toFixed(2)
                                                        : "100.00";
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <div
                                                                className="bg-secondary bg-opacity-10 border border-secondary rounded-3 px-1 py-1 d-flex flex-column align-items-center"
                                                                style={{
                                                                    width: 120,
                                                                    minWidth: 90,
                                                                    maxWidth: 120,
                                                                    flex: "1 1 68px",
                                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                                                    marginBottom: 4,
                                                                }}
                                                            >
                                                                <div
                                                                    className="d-flex align-items-center mb-1"
                                                                    style={{ gap: 2, fontSize: "0.78rem" }}
                                                                >
                                                                    {TOKENS[token.symbol]?.symbol === "STATE" ? (
                                                                        <img
                                                                            src={state}
                                                                            alt="STATE"
                                                                            width="12"
                                                                            height="12"
                                                                            style={{ borderRadius: "50%" }}
                                                                        />
                                                                    ) : TOKENS[token.symbol]?.image &&
                                                                        TOKENS[token.symbol]?.image.startsWith(
                                                                            "http"
                                                                        ) ? (
                                                                        <img
                                                                            src={TOKENS[token.symbol].image}
                                                                            alt={token.symbol}
                                                                            width="12"
                                                                            height="12"
                                                                            style={{ borderRadius: "50%" }}
                                                                        />
                                                                    ) : TOKENS[token.symbol]?.emoji ? (
                                                                        <span style={{ fontSize: "0.78em" }}>
                                                                            {TOKENS[token.symbol].emoji}
                                                                        </span>
                                                                    ) : (
                                                                        <img
                                                                            src="/default.png"
                                                                            alt={token.symbol}
                                                                            width="12"
                                                                            height="12"
                                                                            style={{ borderRadius: "50%" }}
                                                                        />
                                                                    )}
                                                                    <span
                                                                        className="fw-bold"
                                                                        style={{ fontSize: "0.78em" }}
                                                                    >
                                                                        {token.symbol}
                                                                    </span>
                                                                    <span
                                                                        style={{ fontSize: "0.95rem", color: "#aaa" }}
                                                                    >
                                                                        →
                                                                    </span>
                                                                    {TOKENS[nextToken.symbol]?.symbol ===
                                                                        "STATE" ? (
                                                                        <img
                                                                            src={state}
                                                                            alt="STATE"
                                                                            width="12"
                                                                            height="12"
                                                                            style={{ borderRadius: "50%" }}
                                                                        />
                                                                    ) : TOKENS[nextToken.symbol]?.image &&
                                                                        TOKENS[nextToken.symbol]?.image.startsWith(
                                                                            "http"
                                                                        ) ? (
                                                                        <img
                                                                            src={TOKENS[nextToken.symbol].image}
                                                                            alt={nextToken.symbol}
                                                                            width="12"
                                                                            height="12"
                                                                            style={{ borderRadius: "50%" }}
                                                                        />
                                                                    ) : TOKENS[nextToken.symbol]?.emoji ? (
                                                                        <span style={{ fontSize: "0.78em" }}>
                                                                            {TOKENS[nextToken.symbol].emoji}
                                                                        </span>
                                                                    ) : (
                                                                        <img
                                                                            src="/default.png"
                                                                            alt={nextToken.symbol}
                                                                            width="12"
                                                                            height="12"
                                                                            style={{ borderRadius: "50%" }}
                                                                        />
                                                                    )}
                                                                    <span
                                                                        className="fw-bold"
                                                                        style={{ fontSize: "0.78em" }}
                                                                    >
                                                                        {nextToken.symbol}
                                                                    </span>
                                                                </div>
                                                                <div
                                                                    className="small text-secondary"
                                                                    style={{ fontSize: "0.68em", lineHeight: 1 }}
                                                                >
                                                                    {platform}
                                                                </div>
                                                                <div
                                                                    className="small"
                                                                    style={{ fontSize: "0.68em", lineHeight: 1 }}
                                                                >
                                                                    {percent}%
                                                                </div>
                                                            </div>
                                                            {idx < path.length - 2 && (
                                                                <div
                                                                    style={{
                                                                        width: 10,
                                                                        height: 2,
                                                                        borderBottom: "2px dotted #555",
                                                                        margin: "0 2px",
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div
                                            className="d-flex flex-column align-items-center"
                                            style={{ minWidth: 70 }}
                                        >
                                            {getTokenLogo(path[path.length - 1]?.symbol)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-secondary">
                                    No route details available.
                                </div>
                            )}
                        </div>
                        <div style={{ borderTop: "1px solid #333", margin: "16px 0" }}></div>
                        <p className="text-light small mb-0">
                            This route optimizes your total output by considering split routes,
                            multi-hops, and the gas cost of each step.
                        </p>
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
