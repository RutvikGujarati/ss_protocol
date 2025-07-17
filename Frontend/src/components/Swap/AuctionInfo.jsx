import { useAuctionTokens } from "../../data/auctionTokenData";
import { formatWithCommas } from "../DetailsInfo";

const AuctionInfo = () => {
    const { tokens: auctionTokens } = useAuctionTokens();
    const activeAuctions = auctionTokens.filter(
        ({ isReversing, AuctionStatus }) =>
            AuctionStatus === "true" ||
            (AuctionStatus === "false" && isReversing === "true")
    );

    return (
        activeAuctions.length > 0 && (
            <div className="d-flex align-items-center justify-content-center" style={{ minWidth: 0, maxWidth: "360px", flex: 1, padding: "0 8px", boxSizing: "border-box" }}>
                <div
                    className="auction-info-box  rounded-3 shadow-sm border border-secondary px-3 py-3 w-100 text-center position-relative"
                    style={{
                        background: "#212529",
                        minHeight: "160px",
                        maxWidth: "360px",
                        margin: 0,
                        width: "100%",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        ":hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.4)"
                        }
                    }}
                >
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <div className="mb-2">
                            <span
                                className="d-inline-block bg-primary bg-opacity-70 rounded-circle p-2 shadow-sm"
                                style={{ fontSize: "24px", color: "#fff", lineHeight: "24px" }}
                            >
                                <i className="fas fa-gavel"></i>
                            </span>
                        </div>
                        <h5
                            className="fw-bold mb-2"
                            style={{ letterSpacing: "0.5px", fontSize: "1.25rem", color: "#e1e1e1" }}
                        >
                            Active Auctions
                        </h5>
                        {activeAuctions.map((auction, idx) => (
                            <div
                                key={idx}
                                className="text-light mb-1 px-2"
                                style={{ fontSize: "0.95rem", fontWeight: 400, lineHeight: "1.4" }}
                            >
                                <span className="text-info fw-medium">Swap</span>
                                <span className="fw-semibold"> {formatWithCommas(auction.outputToken)}</span> tokens for
                                <span className="fw-semibold"> {auction.name}</span> tokens on
                                <span className="text-warning fw-medium">{" "} STATE DEX</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    );
};

export default AuctionInfo;