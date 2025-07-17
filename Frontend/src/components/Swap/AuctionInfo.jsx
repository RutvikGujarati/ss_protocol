import { useAuctionTokens } from "../../data/auctionTokenData";

const AuctionInfo = ({ swapCardHeight }) => {
  const { tokens: auctionTokens } = useAuctionTokens();
  const activeAuctions = auctionTokens.filter(
    ({ isReversing, AuctionStatus }) =>
      AuctionStatus === "true" ||
      (AuctionStatus === "false" && isReversing === "true")
  );

  return (
    activeAuctions.length > 0 && (
      <div
        className="card-container"
        style={{
          height: swapCardHeight ? swapCardHeight : undefined,
          width: 480,
          padding: "0 8px",
          boxSizing: "border-box",
        }}
      >
        <div
          className="auction-info-box swap-card rounded-3 shadow-sm border border-secondary px-3 py-3 w-100 text-center position-relative"
          style={{ height: "100%" }}
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
              style={{
                letterSpacing: "0.5px",
                fontSize: "1.25rem",
                color: "#e1e1e1",
              }}
            >
              Active Auctions
            </h5>
            <div style={{ width: "100%", flex: 1, overflow: "hidden" }}>
              <ul
                style={{
                  textAlign: "left",
                  margin: 0,
                  padding: 0,
                  listStyle: "disc inside",
                  width: "100%",
                  maxHeight: swapCardHeight ? swapCardHeight - 90 : 200,
                  overflowY: "auto",
                  transition: "max-height 0.2s",
                }}
              >
                {activeAuctions.map((auction, idx) => (
                  <li
                    key={idx}
                    className="text-light mb-1 px-2"
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 400,
                      lineHeight: "1.4",
                    }}
                  >
                    <span className="text-info fw-medium">Swap</span>
                    <span className="fw-semibold"> {auction.outputToken}</span> tokens for
                    <span className="fw-semibold"> {auction.name}</span> tokens on
                    <span className="text-warning fw-medium"> STATE DEX</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AuctionInfo;
