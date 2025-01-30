export const TableRowWithClick = ({ label, value, action, buttonText }) => (
  <tr>
    <td className="d-flex align-items-center">{label}</td>
    <td className="d-flex align-items-center justify-content-center">
      {value || ""}
    </td>
    {action && (
      <td className="d-flex justify-content-end">
        <button
          onClick={action}
          className="btn btn-primary btn-sm swap-btn info-icon"
        >
          {buttonText || "Action"}
        </button>
      </td>
    )}
  </tr>
);
export const TableRowDataShow = ({ label, address, value }) => {
  return (
    <tr>
      <td className="d-flex align-items-center">{label}</td>
      <td className="d-flex align-items-center justify-content-center">
        <a
          href={`https://otter.pulsechain.com/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "12px" }}
        >
          {value || "contract details"}
        </a>
      </td>
      <td></td>
    </tr>
  );
};

export const TableRowForTokens = ({
  label,
  label2,
  tokenName,
  TokenAddress,
  value,
  priceTag,
  PercentageOfToken,
}) => {
  return (
    <>
      <tr>
        <td className="d-flex align-items-center">{label}</td>
        <td className="d-flex align-items-center justify-content-center position-relative px-3 small py-0">
          <span
            className="border-end h-75 position-absolute border-opacity-25"
            style={{ right: 0, opacity: 0.3 }}
          ></span>{" "}
          {tokenName || ""}
        </td>
        <td className="d-flex align-items-center">{label2}</td>
        <td className="d-flex align-items-center justify-content-center px-3">
          <a
            href={`https://otter.pulsechain.com/address/${TokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px" }}
          >
            {value || ""}
          </a>
        </td>
      </tr>
      <tr>
        <td className="d-flex align-items-center">Price</td>
        <td className="d-flex align-items-center justify-content-center position-relative px-3 small py-0">
          <span
            className="border-end h-75 position-absolute"
            style={{ right: 0, opacity: 0.3 }}
          ></span>
          {priceTag}
        </td>
        <td className="d-flex align-items-center">Current Distribution Rate</td>
        <td className="d-flex align-items-center justify-content-center px-3">
          {PercentageOfToken} %
        </td>
      </tr>
    </>
  );
};
