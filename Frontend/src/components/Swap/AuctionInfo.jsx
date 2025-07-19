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
          className="auction-info-box swap-card rounded-3 shadow-sm  px-3 py-3 w-100 text-center position-relative"
          style={{
            height: "100%",
            border: "1px solid #ffffff26",
            fontWeight: "100"
          }}
        >
          <div className="d-flex flex-column align-items-start justify-content-center h-100 mt-2">

            <p className="mb-1 detailText detail-text text-start w-100 font-weight-normal">
              ACTIVE AUCTIONS
            </p>
            <div style={{ width: "100%", flex: 1, overflow: "hidden" }} className="mt-2">
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
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    <span>Swap</span>
                    <span> {auction.outputToken}</span> for
                    <span> {auction.name}</span>
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
