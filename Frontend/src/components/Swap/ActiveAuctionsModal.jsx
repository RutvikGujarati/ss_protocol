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

const ActiveAuctionsModal = ({ isOpen, onClose, getTokenLogo, TOKENS }) => {
    const { tokens: auctionTokens } = useAuctionTokens();

    const activeAuctions = auctionTokens.filter(
        ({ isReversing, AuctionStatus }) =>
            AuctionStatus === "false" ||
            (AuctionStatus === "false" && isReversing === "true")
    );

    if (!isOpen) return null;

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    zIndex: 2000,
                    backdropFilter: "blur(1px)"
                }}
                onClick={onClose}
            >
                <div
                    className="border border-secondary border-opacity-25 rounded shadow-lg position-absolute"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: '#2d3238',
                        top: "73%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        maxWidth: '480px',
                        width: '480px',
                        maxHeight: '300px',
                        overflow: 'auto'
                    }}
                >
                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
                    <h6 className="simple-modal-title text-light mb-0">Active Auctions</h6>
                    <button
                            type="button"
                            className="btn-close btn-close-white btn-close-sm"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="p-3 custom-scrollbar" style={{
                        maxHeight: 'calc(300px - 60px)',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#4a4a4a #1e1e1e'
                    }}>
                        {activeAuctions.length === 0 ? (
                            <div className="text-center text-secondary">
                                <small>No active auctions</small>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {activeAuctions.map((auction, idx) => (
                                    <div key={idx} className="p-2 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                                                {getTokenLogo(auction.name)}
                                            </div>
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="text-light fw-medium small mb-1">
                                                    <span className="text-secondary">Swap</span> <span className="text-light">{auction.outputToken}</span> <span className="text-secondary">for</span> <span className="text-light">{auction.name}</span>
                                                </div>
                                                <div className="text-secondary small opacity-75">
                                                    {auction.isReversing === "true" ? "Reverse Auction" : "Auction Active"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActiveAuctionsModal; 