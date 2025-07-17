import { useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import state from "../../assets/statelogo.png";

const TokenSearchModal = ({ tokens, excludeToken, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) {
      return Object.keys(tokens).filter(key => key !== excludeToken);
    }

    const searchLower = searchTerm.toLowerCase();
    return Object.keys(tokens).filter((key) => {
      if (key === excludeToken) return false;

      const token = tokens[key];
      const symbolMatch = token.symbol.toLowerCase().includes(searchLower);
      const addressMatch = token.address.toLowerCase().includes(searchLower);
      const nameMatch = token.name?.toLowerCase().includes(searchLower);

      return symbolMatch || addressMatch || nameMatch;
    });
  }, [searchTerm, excludeToken, tokens]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const getTokenLogo = (token) => {
    if (token.symbol === "STATE") {
      return (
        <img
          src={state}
          alt="STATE"
          className="rounded-circle border border-secondary"
          style={{ width: "32px", height: "32px" }}
        />
      );
    }

    if (token.image && (token.image.startsWith('http') || token.image.startsWith('/'))) {
      return (
        <img
          src={token.image}
          alt={token.symbol}
          className="rounded-circle border border-secondary"
          style={{ width: "32px", height: "32px" }}
        />
      );
    }

    if (token.emoji) {
      return (
        <div
          className="rounded-circle border border-secondary d-flex align-items-center justify-content-center"
          style={{ width: "32px", height: "32px", fontSize: "16px" }}
        >
          {token.emoji}
        </div>
      );
    }

    return (
      <img
        src="/default.png"
        alt={token.symbol}
        className="rounded-circle border border-secondary"
        style={{ width: "32px", height: "32px" }}
      />
    );
  };

  const highlightSearchTerm = (text) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-warning text-dark px-1 rounded">{part}</mark>
      ) : part
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 2040 }}
      />

      {/* Modal */}
      <div
        className="modal d-block"
        tabIndex="-1"
        style={{ zIndex: 2050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-light border border-secondary rounded-4 shadow-lg">
            {/* Header */}
            <div className="modal-header border-0 pb-0 py-2">
              <h6 className="modal-title fw-bold mb-0">
                <i className="bi bi-search me-2 text-primary"></i>
                Select Token
              </h6>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body pt-0 py-2">
              {/* Enhanced Search Input */}
              <div className="mb-3">
                <div className="position-relative">
                  <div className="input-group input-group-sm shadow-sm">
                    <span className="input-group-text bg-secondary border-0 text-light rounded-start-pill">
                      <i className="bi bi-search fs-6"></i>
                    </span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="form-control border-0 bg-secondary text-light fs-6 py-2"
                      placeholder="Search by name, symbol, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-0 text-light rounded-end-pill"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-1 d-flex align-items-center gap-1">
                    <i className="bi bi-info-circle text-muted small"></i>
                    <small className="text-muted small">
                      Type token name, symbol, or paste contract address
                    </small>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div
                className="border border-secondary rounded-3 shadow-sm"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  scrollbarWidth: "thin"
                }}
              >
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((key, index) => {
                    const token = tokens[key];

                    return (
                      <div
                        key={key}
                        className={`px-3 py-2 d-flex align-items-center justify-content-between cursor-pointer border-bottom border-secondary ${index === filteredTokens.length - 1 ? 'border-bottom-0' : ''
                          }`}
                        style={{
                          cursor: "pointer",
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => onSelect(key)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(131, 110, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {getTokenLogo(token)}
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <span className="fw-semibold small">
                                {highlightSearchTerm(token.symbol)}
                              </span>
                              {token.name && token.name !== token.symbol && (
                                <small className="text-muted small">
                                  ({highlightSearchTerm(token.name)})
                                </small>
                              )}
                            </div>
                            <small className="text-light small font-monospace">
                              {token.address.slice(0, 8) + '...' + token.address.slice(-6)}
                            </small>
                          </div>
                        </div>

                        <div className="d-flex align-items-center">
                          <i className="bi bi-chevron-right text-muted small"></i>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center">
                    <i className="bi bi-search display-6 text-muted mb-2 d-block"></i>
                    <p className="text-muted mb-1 small fw-medium">No tokens found</p>
                    <small className="text-muted small">
                      Try searching with a different term or paste a contract address
                    </small>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-2">
                <div className="alert alert-info bg-secondary border-0 text-light small mb-0 rounded-3 py-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-keyboard me-1 small"></i>
                    <div className="small">
                      <strong>Keyboard shortcuts:</strong> Press Esc to close
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

TokenSearchModal.propTypes = {
  tokens: PropTypes.objectOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      name: PropTypes.string,
      image: PropTypes.string,
      emoji: PropTypes.string,
    })
  ).isRequired,
  excludeToken: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TokenSearchModal;
