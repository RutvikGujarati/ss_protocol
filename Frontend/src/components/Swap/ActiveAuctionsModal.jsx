import React, { useRef, useEffect, useState } from 'react';
import { useAuctionTokens } from "../../data/auctionTokenData";

const ActiveAuctionsModal = ({ isOpen, onClose, getTokenLogo, TOKENS, swapCardRef }) => {
    const { tokens: auctionTokens } = useAuctionTokens();
    const modalRef = useRef(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const activeAuctions = auctionTokens.filter(
        ({ isReversing, AuctionStatus }) =>
            AuctionStatus === "true" ||
            (AuctionStatus === "false" && isReversing === "true")
    );

    useEffect(() => {
        if (isOpen && swapCardRef?.current) {
            const swapCard = swapCardRef.current;
            const rect = swapCard.getBoundingClientRect();
            const footerHeight = 60; // Approximate footer height
            const windowHeight = window.innerHeight;

            // Calculate if modal would overlap with footer
            const modalHeight = 300;
            const spaceBelowSwap = windowHeight - rect.bottom;
            const spaceAboveFooter = windowHeight - footerHeight;

            let topPosition;
            if (spaceBelowSwap >= modalHeight) {
                // Enough space below swap card
                topPosition = rect.bottom;
            } else if (spaceAboveFooter >= modalHeight) {
                // Position above footer
                topPosition = spaceAboveFooter - modalHeight + 50;
            } else {
                // Not enough space, position at top with scroll
                topPosition = 150;
            }

            setModalPosition({
                top: topPosition,
                left: rect.left + (rect.width / 2) - 240 // Center the modal
            });
        }
    }, [isOpen, swapCardRef]);

    if (!isOpen) return null;

    return (
        <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
                zIndex: 2000,
                backdropFilter: "blur(1px)"
            }}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="simple-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: modalPosition.top,
                    left: modalPosition.left,
                    maxWidth: '480px',
                    width: '480px',
                    maxHeight: '300px',
                    overflow: 'auto'
                }}
            >
                <div className="simple-modal-header">
                    <h6 className="simple-modal-title text-light mb-0">Active Auctions</h6>
                    <button
                        type="button"
                        className="btn-close btn-close-white btn-close-sm"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
                <div className="simple-modal-body" style={{ maxHeight: 'calc(300px - 60px)' }}>
                    {activeAuctions.length === 0 ? (
                        <div className="text-center text-secondary">
                            <small>No active auctions</small>
                        </div>
                    ) : (
                        <div className="simple-auctions-list">
                            {activeAuctions.map((auction, idx) => (
                                <div key={idx} className="simple-auction-item">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="simple-token-logo">
                                            {getTokenLogo(auction.name)}
                                        </div>
                                        <div className="simple-token-info">
                                            <div className="simple-token-name text-light">
                                                {auction.name}
                                            </div>
                                            <div className="simple-auction-status text-secondary">
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
    );
};

export default ActiveAuctionsModal; 