// Frontend/src/components/Swap/Tokens.js
import { TokensDetails } from "../../data/TokensDetails";

export function useAllTokens() {
	const { tokens: dynamicTokens } = TokensDetails();

	const dynamicTokensObj = {};
	dynamicTokens
		.filter(token => token.tokenName !== "DAV") // Exclude DAV
		.forEach(token => {
			// Prefer token.image, fallback to emoji as data URL, then to a default image
			let image = token.image;
			if (!image && token.emoji) {
				// Convert emoji to a data URL (SVG)
				image = token.emoji
			}
			
			dynamicTokensObj[token.tokenName] = {
				symbol: token.tokenName,
				address: token.TokenAddress,
				decimals: 18,
				image,
			};
		});

	// Add static tokens (except DAV)
	return {
		...dynamicTokensObj,
		PLS: {
			symbol: "PLS",
			address: "PLS",
			decimals: 18,
			image: "/PLS.svg",
		},
		WPLS: {
			symbol: "WPLS",
			address: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
			decimals: 18,
			image: "/wPLS.png",
		},
		pSTATE: {
			symbol: "pSTATE",
			address: "0x4208A56180C81De2da1765eE5b866C9Dec3b346E",
			decimals: 18,
			image: "/webLogo.png",
		},
		PLSX: {
			symbol: "PLSX",
			address: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab",
			decimals: 18,
			image: "/PLSX.png",
		},
		DAI: {
			symbol: "pDAI",
			address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
			decimals: 18,
			image: "/pDAI.png",
		},
		USDC: {
			symbol: "USDC",
			address: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07",
			decimals: 18,
			image: "/usdc.png",
		},
		"9MM": {
			symbol: "9MM",
			address: "0x7b39712Ef45F7dcED2bBDF11F3D5046bA61dA719",
			decimals: 18,
			image: "/nineMM.png",
		},
	};
}