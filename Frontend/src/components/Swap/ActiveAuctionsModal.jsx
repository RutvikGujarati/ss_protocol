import React from 'react';
import { useAuctionTokens } from "../../data/auctionTokenData";

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1e1e1e;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
  }
`;

const ActiveAuctionsInline = ({ getTokenLogo, TOKENS }) => {
    const { tokens: auctionTokens } = useAuctionTokens();

    const activeAuctions = auctionTokens.filter(
        ({ isReversing, AuctionStatus }) =>
            AuctionStatus === "true" ||
            (AuctionStatus === "false" && isReversing === "true")
    );

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div
                className="border border-secondary border-opacity-25 rounded shadow-sm custom-scrollbar"
                style={{
                    backgroundColor: '#2d3238',
                    maxWidth: '480px',
                    width: '100%',
                    maxHeight: '180px',
                    overflow: 'auto',
                    padding: '8px 12px',
                }}
            >
                {activeAuctions.length === 0 ? (
                    <div className="text-center text-secondary">
                        <small>No active auctions</small>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {activeAuctions.map((auction, idx) => (
                            <div key={idx} className="d-flex align-items-center gap-2" style={{ minHeight: '28px' }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                    {getTokenLogo(auction.name)}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="text-light fw-medium small mb-1">
                                        <span className="text-secondary">Swap {auction.outputToken} for {auction.name}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ActiveAuctionsInline; 