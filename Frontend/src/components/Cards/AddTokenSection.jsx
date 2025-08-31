import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/InfoCards.css";
import { useEffect, useRef, useState } from "react";
import { useDAvContract } from "../../Functions/DavTokenFunctions";
import IOSpinner from "../../Constants/Spinner";
import toast from "react-hot-toast";
import axios from "axios";
import GraphemeSplitter from "grapheme-splitter";
import { chainCurrencyMap } from "../../../WalletConfig";
import { useChainId } from "wagmi";
import { formatWithCommas } from "../../Constants/Utils";

const AddTokenSection = () => {
    const splitter = new GraphemeSplitter();
    const chainId = useChainId();
    const {
        AddYourToken,
        TokenProcessing,
        TokenWithImageProcessing,
        isProcessingToken,
    } = useDAvContract();
    const [isUploadingToPinata, setIsUploadingToPinata] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUploaded, setFileUploaded] = useState(null);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [TokenName, setTokenName] = useState("");
    const [Emoji, setEmoji] = useState("");
    const uploadingToastIdRef = useRef(null);
    const customWidth = "180px";
    const nativeSymbol = chainCurrencyMap[chainId] || 'PLS';

    useEffect(() => {
        if (isUploadingToPinata) {
            if (!uploadingToastIdRef.current) {
                uploadingToastIdRef.current = toast.loading("Uploading image to Pinata...", {
                    position: "top-center",
                    autoClose: false,
                });
            }
        } else {
            if (uploadingToastIdRef.current) {
                toast.dismiss(uploadingToastIdRef.current);
                uploadingToastIdRef.current = null;
            }
        }
    }, [isUploadingToPinata]);

    const uploadToPinata = async (file) => {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        const gateway = import.meta.env.VITE_PINATA_GATEWAY;
        if (!gateway) {
            console.error("VITE_PINATA_GATEWAY is not defined in .env");
            throw new Error("Pinata gateway URL is not configured");
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
        formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
        try {
            const res = await axios.post(url, formData, {
                maxBodyLength: Infinity,
                headers: {
                    pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                    pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
                },
            });
            const ipfsHash = res.data.IpfsHash;
            const pinataURL = `${gateway.endsWith("/") ? gateway.slice(0, -1) : gateway}/${ipfsHash}`;
            return pinataURL;
        } catch (err) {
            console.error("Pinata upload failed:", err.response?.data || err.message);
            throw new Error("Failed to upload image to Pinata");
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setFileUploaded(null);
            return;
        }
        setIsFileUploaded(true);
        const validTypes = ["image/png", "image/jpeg"];
        const maxSize = 2 * 1024 * 1024;
        if (!validTypes.includes(file.type)) {
            alert("Only PNG or JPG images are allowed.");
            e.target.value = "";
            return;
        }
        if (file.size < 1 || file.size > maxSize) {
            alert("File size must be between 1 byte and 2 MB.");
            e.target.value = "";
            return;
        }
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const { width, height } = img;
            if (width < 30 || height < 30) {
                alert("Image dimensions must be at least 30x30 pixels.");
                e.target.value = "";
                return;
            }
            if (width !== height) {
                alert("Image must be square.");
                e.target.value = "";
                return;
            }
            setSelectedFile(file);
            setFileUploaded(null);
        };
        img.onerror = () => {
            alert("Failed to load image.");
            setIsFileUploaded(false);
            e.target.value = "";
        };
    };

    const handleTokenProcess = async () => {
        try {
            if (!TokenName || (!Emoji && !selectedFile)) {
                alert("Please enter an emoji or select an image.");
                return;
            }
            let tokenMedia = Emoji;
            let isImage = false;
            if (selectedFile) {
                if (!fileUploaded) {
                    setIsUploadingToPinata(true);
                    try {
                        const pinataURL = await uploadToPinata(selectedFile);
                        setFileUploaded(pinataURL);
                        tokenMedia = pinataURL;
                        isImage = true;
                    } catch (uploadErr) {
                        console.error("Pinata upload failed:", uploadErr);
                        alert("Image upload failed.");
                        setIsUploadingToPinata(false);
                        return;
                    }
                    setIsUploadingToPinata(false);
                } else {
                    tokenMedia = fileUploaded;
                    isImage = true;
                }
            }
            await AddYourToken(TokenName, tokenMedia, isImage);
            setTokenName("");
            setEmoji("");
            setFileUploaded(null);
            setSelectedFile(null);
        } catch (err) {
            console.error("Error processing token:", err);
        }
    };

    const handleWithDelay = (fn, delay = 100) => {
        setTimeout(async () => {
            try {
                await fn();
            } catch (err) {
                console.error("Async function failed:", err);
            }
        }, delay);
    };

    const handleInputChangeForAddtoken = (value) => {
        setTokenName(value);
    };

    const handleInputChangeForEmoji = (input) => {
        const graphemes = [...input];
        if (graphemes.length > 10) return;
        setEmoji(input);
    };

    const adjustedTokenProcessing = isFileUploaded ? Math.floor(TokenWithImageProcessing) : Math.floor(TokenProcessing);

    return (
        <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1">
                <div className="col-md-4 p-0 m-2 cards">
                    <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100" style={{ minHeight: "260px" }}>
                        <div className="p-2 pt-3 pb-2">
                            <p className="mb-2 detailText">ADD TOKEN NAME</p>
                            <div className="mb-2 d-flex align-items-center gap-2">
                                <div className="floating-input-container" style={{ maxWidth: "300px" }}>
                                    <input
                                        type="text"
                                        className={`form-control text-center fw-bold ${TokenName ? "filled" : ""}`}
                                        style={{ "--placeholder-color": "#6c757d" }}
                                        value={TokenName}
                                        maxLength={11}
                                        disabled={isProcessingToken}
                                        onChange={(e) => handleInputChangeForAddtoken(e.target.value.toUpperCase())}
                                    />
                                    <label htmlFor="affiliateLink" className="floating-label">Enter Token Name</label>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="floating-input-container" style={{ maxWidth: "300px" }}>
                                    <input
                                        type="text"
                                        className={`form-control text-center fw-bold ${Emoji ? "filled" : ""}`}
                                        style={{ "--placeholder-color": "#6c757d" }}
                                        value={Emoji}
                                        disabled={isProcessingToken || !!selectedFile}
                                        onChange={(e) => {
                                            const graphemes = splitter.splitGraphemes(e.target.value);
                                            const value = graphemes[0] || '';
                                            setFileUploaded(null);
                                            setIsFileUploaded(false);
                                            handleInputChangeForEmoji(value);
                                        }}
                                        inputMode="text"
                                    />
                                    <label htmlFor="affiliateLink" className="floating-label">Enter Emoji</label>
                                </div>
                            </div>
                            <h6 className="mt-4">
                                <ul style={{ listStyleType: "disc", textAlign: "left", paddingLeft: "20px", fontSize: "14px" }}>
                                    <li>Choose an image or an emoji.</li>
                                    <li>You can only select one.</li>
                                    <li>Emoji is free.</li>
                                </ul>
                            </h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 p-0 m-2 cards">
                    <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100">
                        <div className="p-2 pt-3 pb-2">
                            <p className="mb-2 detailText">Upload Image</p>
                            <div className="d-flex align-items-center gap-2">
                                <div className="floating-input-container" style={{ maxWidth: "300px" }}>
                                    <input
                                        type="file"
                                        className="form-control text-center fw-bold"
                                        style={{ "--placeholder-color": "#6c757d" }}
                                        disabled={isProcessingToken || !!Emoji}
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            <h6 className="mt-5 mx-5">
                                <ul style={{ listStyleType: "disc", textAlign: "left", paddingLeft: "20px", fontSize: "14px" }}>
                                    <li>Minimum 30px dimension</li>
                                    <li>Square with 1:1 aspect ratio</li>
                                    <li>Minimum 1 byte file size</li>
                                    <li>Maximum 2 MB file size</li>
                                </ul>
                            </h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 p-0 m-2 cards">
                    <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                        <div className="p-2 pt-3 pb-2">
                            <p className="mb-2 detailText ">TOKEN Fee</p>
                            <h6 className="text-center  mt-3">
                                {formatWithCommas(adjustedTokenProcessing)} {nativeSymbol}
                            </h6>

                            <button
                                onClick={() => handleWithDelay(handleTokenProcess)}
                                style={{ width: customWidth }}
                                className="btn btn-primary mx-5 mt-4 btn-sm d-flex justify-content-center align-items-center"
                                disabled={isProcessingToken || isUploadingToPinata}
                            >
                                {isProcessingToken || isUploadingToPinata ? (
                                    <>
                                        <IOSpinner className="me-2" />
                                        {isUploadingToPinata
                                            ? "Uploading..."
                                            : "Processing..."}
                                    </>
                                ) : (
                                    "Process Listing"
                                )}
                            </button>
                        </div>
                        <h6 className="mt-4">
                            <ul
                                style={{
                                    listStyleType: "disc",
                                    textAlign: "left",
                                    paddingLeft: "20px",
                                    fontSize: "14px",
                                }}
                            >
                                <li>Token Fee + Emoji Fee - 15 Million {nativeSymbol} </li>
                                <li>Token Fee + Image Fee - 20 Million {nativeSymbol} </li>
                            </ul>
                        </h6>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTokenSection;