import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import state from "../../assets/statelogo.png";

const TokenSearchModal = ({ tokens, excludeToken, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTokens = useMemo(() => {
    return Object.keys(tokens).filter(
      (key) =>
        key !== excludeToken &&
        tokens[key].symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, excludeToken, tokens]);
 
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 2000 }}
    >
      <div
        className="bg-dark text-light rounded-4 shadow-lg p-4 border border-secondary"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0 fw-bold">Select a Token</h5>
          <button
            className="btn btn-close btn-close-white"
            onClick={onClose}
          ></button>
        </div>

        <div className="mb-3 position-relative">
          <input
            type="text"
            className="form-control bg-dark text-light border border-secondary rounded-pill px-4 py-2"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div
          style={{
            maxHeight: "320px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {filteredTokens.length > 0 ? (
            filteredTokens.map((key) => (
              <div
                key={key}
                className="px-3 py-2 rounded-3 mb-2 d-flex align-items-center justify-content-between text-light"
                style={{
                  backgroundColor: "#1e1e1e",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease-in-out",
                }}
                onClick={() => onSelect(key)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2c2f33")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1e1e1e")
                }
              >
                <div className="d-flex align-items-center gap-3">
                  {tokens[key]?.symbol === "STATE" ? (
                    <img
                      src={state}
                      alt="STATE"
                      style={{ width: "36px", height: "36px" }}
                      className="rounded-circle border border-secondary"
                    />
                  ) : tokens[key]?.image && (tokens[key].image.startsWith('http') || tokens[key].image.startsWith('/')) ? (
                    <img
                      src={tokens[key].image}
                      alt={tokens[key].symbol}
                      style={{ width: "36px", height: "36px" }}
                      className="rounded-circle border border-secondary"
                    />
                  ) : tokens[key]?.emoji ? (
                    <span style={{ fontSize: "28px" }}>{tokens[key].emoji}</span>
                  ) : (
                    <img
                      src="/default.png"
                      alt={tokens[key]?.symbol || key}
                      style={{ width: "36px", height: "36px" }}
                      className="rounded-circle border border-secondary"
                    />
                  )}
                  <div className="d-flex flex-column">
                    <span className="fw-semibold fs-6">
                      {tokens[key].symbol}
                    </span>
                    <small className="text-light">
                      {tokens[key].address.slice(0, 6)}...
                      {tokens[key].address.slice(-4)}
                    </small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            ))
          ) : (
            <div className="p-2 text-muted text-center">No tokens found</div>
          )}
        </div>
      </div>
    </div>
  );
};

TokenSearchModal.propTypes = {
  tokens: PropTypes.objectOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      image: PropTypes.string,
    })
  ).isRequired,
  excludeToken: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TokenSearchModal;
