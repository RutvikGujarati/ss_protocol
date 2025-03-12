import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import XerionLogo from "../assets/layti.png";
import { useContext, useEffect, useState } from "react";
import { ContractContext } from "../Functions/ContractInitialize";
import { ethers } from "ethers";

const DeepStateTable = () => {
  const { AllContracts,signer,account } = useContext(ContractContext);
  const [balanceOfContract, setbalanceOfContract] = useState("0");
  const [PLSPrice, setPLSPrice] = useState("0");
  const [PLSUSD, setPLSUSD] = useState("0");
  const [DividendsUSD, setDividendsUSD] = useState("0");
  const [UsersTokens, setUsersTokens] = useState("0");
  const [UsersDividends, setUsersDividends] = useState("0");
  const [loading, setLoading] = useState(false);
  const [Sellloading, setSellLoading] = useState(false);
  const [Withdrawloading, setWithdrawLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [Sellamount, setSellAmount] = useState("");
  // Get token data
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAmount(value);
  };
  const handleSellInputChange = (e) => {
    const value = e.target.value;
    setSellAmount(value);
  };
  console.log("DeepStateContract",AllContracts.DeepStateContract);

  const contractBalance = async () => {
    try {
      if (!AllContracts || !AllContracts.DeepStateContract) {
        console.log("DeepStateContract is not initialized.");
        return;
      }

      const userAmount =
        await AllContracts.DeepStateContract.getContractBalance();
      const formattedBalance = ethers.formatEther(userAmount);

      console.log("deepstate balance:", userAmount);
      setbalanceOfContract(formattedBalance);
    } catch (error) {
      console.log("error in fetching deepState Balance:", error);
    }
  };
  const fetchPLSPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=pulsechain&vs_currencies=usd"
      );
      const data = await response.json();
      console.log("PLS price :", data.pulsechain.usd);
      setPLSPrice(data.pulsechain.usd);
    } catch (error) {
      console.log("Error fetching PLS price:", error);
      return 0; // Return 0 in case of an error
    }
  };
  const CalculateBalanceInUSD = async () => {
    try {
      const balanceInUSD = parseFloat(balanceOfContract) * PLSPrice; // Convert to USD
      console.log("DeepState Contract Balance in USD:", balanceOfContract);
      setPLSUSD(balanceInUSD.toFixed(8));
    } catch (error) {
      console.log("Error calculating balance in USD:", error);
      return "0.00";
    }
  };

  const BuyTokens = async (amount) => {
	try {
	  setLoading(true);
	  const amountInWei = ethers.parseUnits(amount.toString(), 18);
	  const tx = await signer.sendTransaction({
		to: AllContracts.DeepStateContract.target, // Contract address
		value: amountInWei, // Sending ETH directly
	  });
	  await tx.wait();
	  await contractBalance();
	  await CalculateBalanceInUSD();
	} catch (error) {
	  console.log("Error in buying tokens:", error);
	} finally {
	  setLoading(false);
	}
  };
  
  const SellTokens = async (amount) => {
    try {
      setSellLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.sell(amountInWei);
      await tx.wait();
      await contractBalance(), CalculateBalanceInUSD(), setSellLoading(false);
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setSellLoading(false);
    } finally {
      setSellLoading(false);
    }
  };
  const WithdrawDividends = async () => {
    try {
      setWithdrawLoading(true);
      const tx = await AllContracts.DeepStateContract.withdrawDividends();
      await tx.wait();
      setWithdrawLoading(false);
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setWithdrawLoading(false);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const UsersTotalTokens = async () => {
    try {
      const userAmount = await AllContracts.DeepStateContract.balanceOf(account); // Get amount in Wei
      const formattedAmount = ethers.formatEther(userAmount); // Convert to ETH
      setUsersTokens(formattedAmount); // Store in state
      console.log("User's total tokens in ETH:", formattedAmount);
    } catch (error) {
      console.log("Error fetching tokens amount:", error);
    }
  };
  const UsersTotalDividends = async () => {
    try {
      if (!AllContracts?.DeepStateContract) return;
      const userAmount = await AllContracts.DeepStateContract.availableDividends(account);
      setUsersDividends(parseFloat(ethers.formatEther(userAmount)).toFixed(4));
    } catch (error) {
      console.error("Error fetching dividends:", error);
      setUsersDividends("0");
    }
  };
  const CalculateDividendsInUSD = async () => {
    try {
      const balanceInUSD = parseFloat(UsersDividends) * PLSPrice; // Convert to USD
      console.log(
        "DeepState Contract Balance in USD:",
        balanceInUSD.toFixed(4)
      );
      setDividendsUSD(balanceInUSD.toFixed(8));
    } catch (error) {
      console.log("Error calculating balance in USD:", error);
      return "0.00";
    }
  };
  useEffect(() => {
    contractBalance();
	CalculateBalanceInUSD();
	fetchPLSPrice()
	UsersTotalTokens();
	UsersTotalDividends()
	CalculateDividendsInUSD();
  });
  return (
    <>
      <div className="container mt-4 datatablemarginbottom">
        <div className="table-responsive">
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 justify-content-center">
              {/* Contract Market Cap Box */}
              <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
                <div
                  className="announcement rounded bg-dark text-light flex-fill d-flex flex-column text-center"
                  style={{ minWidth: "180px", width: "100%", height: "120px" }}
                >
                  <div className="row w-100 h-100">
                    {/* Text Column */}
                    <div className="col-9 d-flex flex-column align-items-center justify-content-center">
                      <h1 className="fs-5 mb-1">{balanceOfContract} PLS</h1>
                      <p className="mb-1" style={{ fontSize: "10px" }}>
                        Contract Market Cap
                      </p>
                      <p className="mb-2 fs-6">Value: {PLSUSD} USD</p>
                    </div>

                    {/* Image Column */}
                    <div className="col-3 d-flex align-items-center justify-content-center">
                      <img src={XerionLogo} width={40} height={40} alt="Logo" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Tokens Box */}
              <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
                <div
                  className="announcement rounded bg-dark text-light flex-fill d-flex flex-column text-center"
                  style={{ minWidth: "180px", width: "100%", height: "120px" }}
                >
                  <div className="row w-100 h-100">
                    {/* Text Column */}
                    <div className="col-9 d-flex flex-column align-items-center justify-content-center">
                      <h1 className="fs-6 mb-1">{UsersTokens} DeepState</h1>
                      <p className="mb-1" style={{ fontSize: "12px" }}>
                        Your Tokens
                      </p>
                      <p className="mb-2 fs-6">Value: 0.0 USD</p>
                    </div>

                    {/* Image Column */}
                    <div className="col-3 d-flex align-items-center justify-content-center">
                      <img src={XerionLogo} width={40} height={40} alt="Logo" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Dividends Earnings Box */}
              <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
                <div
                  className="announcement rounded bg-dark text-light flex-fill d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minWidth: "180px", width: "100%", height: "120px" }}
                >
                  <h1 className="fs-5 mb-1">{UsersDividends} PLS</h1>
                  <p className="mb-1" style={{ fontSize: "12px" }}>
                    Your Dividends Earnings
                  </p>
                  <p className="mb-2 fs-6">Value: {DividendsUSD} USD</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-4">
          <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
            <div className="col-md-4 p-0 m-2 cards">
              <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                <div className="p-2">
                  <p className="mb-2 detailText">Buy TOKENS</p>
                  <input
                    type="text"
                    placeholder="Enter Value"
                    className="form-control text-center fw-bold mb-3"
                    value={amount}
                    onChange={handleInputChange}
                  />
                  <button
                    onClick={() => BuyTokens(amount)}
                    className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                  >
                    {loading ? "Buying..." : "Buy"}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-0 m-2 cards">
              <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                <div className="p-2">
                  <p className="mb-2 detailText">Sell TOKENS</p>
                  <input
                    type="text"
                    placeholder="Enter Value"
                    className="form-control text-center fw-bold mb-3"
                    value={Sellamount}
                    onChange={handleSellInputChange}
                  />
                  <button
                    onClick={() => SellTokens(Sellamount)}
                    className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                  >
                    {Sellloading ? "Selling..." : "Sell"}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-0 m-2 cards">
              <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                <div className="p-2">
                  <p className="mb-2 detailText">Withdraw Dividends</p>
                  <h1 className="fs-5 mb-1">{UsersDividends} PLS</h1>
                  <button
                    onClick={() => WithdrawDividends()}
                    className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                  >
                    {Withdrawloading ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeepStateTable;
