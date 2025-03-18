import PropTypes from "prop-types";
import { useDAvContract } from "../../Functions/DavTokenFunctions";
import DotAnimation from "../../Animations/Animation";

export const TableRowWithClick = ({ label, value, action, buttonText }) => (
  <tr>
    <td className="d-flex align-items-center">{label}</td>
    <td className="d-flex align-items-center justify-content-center">
      {value || ""}
    </td>
    {action && (
      <td className="d-flex justify-content-end ">
        <button
          onClick={action}
          className="btn btn-primary btn-sm swap-btn info-icon "
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
          className="d-flex align-items-center gap-1 mx-2"
          style={{ fontSize: "12px" }}
        >
          {value || "contract details"}
        </a>
        <a
          href={`https://repo.sourcify.dev/369/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center gap-1 "
          style={{ fontSize: "12px" }}
        >
          <i className="bi bi-box-arrow-up-right"></i>
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
        <td className="d-flex align-items-center">Minted Supply</td>
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
export const TableRowForSwapTokens = ({
  label,
  label2,
  tokenName,
  TokenAddress,
  value,
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
            className="mx-2"
            rel="noopener noreferrer"
            style={{ fontSize: "12px" }}
          >
            {value || ""}
          </a>
          <a
            href={`https://repo.sourcify.dev/369/${TokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center gap-1 "
            style={{ fontSize: "12px" }}
          >
            <i className="bi bi-box-arrow-up-right"></i>
          </a>
        </td>
      </tr>
    </>
  );
};

export const SmallTokenDetails = ({ label, data }) => {
  const { isLoading } = useDAvContract();
  return (
    <>
      <tr>
        <td className="d-flex align-items-center">{label}</td>
        <td className="d-flex align-items-center justify-content-center">
          {isLoading ? <DotAnimation /> : data}
        </td>
        <td></td>
      </tr>
    </>
  );
};

export const DoubleValues = ({ label1, firstData, label2, SecondData }) => {
  return (
    <tr>
      <td className="d-flex align-items-center">{label1}</td>
      <td className="d-flex align-items-center justify-content-center position-relative px-3 small py-0">
        {firstData}
        <span
          className="border-end h-75 position-absolute"
          style={{ right: 0, opacity: 0.3 }}
        ></span>
      </td>
      <td className="d-flex align-items-center">{label2}</td>
      <td className="d-flex align-items-center justify-content-center px-3">
        {SecondData}
      </td>
    </tr>
  );
};

export const ReanounceContractsComponent = ({
  label,
  condition1,
  ClickAction,
}) => {
  return (
    <tr>
      <td className="d-flex align-items-center">{label}</td>

      <td className="d-flex align-items-center justify-content-center">
        {condition1 == null ? "Loading..." : condition1 ? "Yes" : "No"}{" "}
      </td>
      <td className="d-flex justify-content-end ">
        {condition1 ? (
          <button
            // onClick={() =>
            //   window.open(
            //     `https://otter.pulsechain.com/tx/${hash}`,
            //     "_blank",
            //     "noopener,noreferrer"
            //   )
            // }
            className="btn btn-primary btn-sm swap-btn info-icon mx-4"
          >
            Renounced
          </button>
        ) : (
          <button
            onClick={ClickAction}
            className="btn btn-primary btn-sm swap-btn info-icon"
          >
            Set
          </button>
        )}
      </td>
    </tr>
  );
};
TableRowForTokens.propTypes = {
  label: PropTypes.isRequired,
  label2: PropTypes.isRequired,
  tokenName: PropTypes.isRequired,
  TokenAddress: PropTypes.isRequired,
  value: PropTypes.isRequired,
  priceTag: PropTypes.isRequired,
  PercentageOfToken: PropTypes.isRequired,
};
TableRowForSwapTokens.propTypes = {
  label: PropTypes.isRequired,
  label2: PropTypes.isRequired,
  tokenName: PropTypes.isRequired,
  TokenAddress: PropTypes.isRequired,
  value: PropTypes.isRequired,
  priceTag: PropTypes.isRequired,
  PercentageOfToken: PropTypes.isRequired,
};

TableRowWithClick.propTypes = {
  label: PropTypes.isRequired,
  value: PropTypes.isRequired,
  action: PropTypes.func,
  buttonText: PropTypes.string,
};

TableRowDataShow.propTypes = {
  label: PropTypes.isRequired,
  address: PropTypes.isRequired,
  value: PropTypes.isRequired,
};
SmallTokenDetails.propTypes = {
  label: PropTypes.isRequired,
  data: PropTypes.isRequired,
};
DoubleValues.propTypes = {
  label1: PropTypes.isRequired,
  firstData: PropTypes.isRequired,
  label2: PropTypes.isRequired,
  SecondData: PropTypes.isRequired,
};

ReanounceContractsComponent.propTypes = {
  condition1: PropTypes.any,
  label: PropTypes.any,
  condition2: PropTypes.any,
  hash: PropTypes.string,
  ClickAction: PropTypes.func,
};
