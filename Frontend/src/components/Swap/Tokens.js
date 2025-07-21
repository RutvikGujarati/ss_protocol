// Frontend/src/components/Swap/Tokens.js
import { useEffect, useState } from "react";
import { TokensDetails } from "../../data/TokensDetails";
import state from "../../assets/statelogo.png";

export function useAllTokens() {
	const { tokens: dynamicTokens } = TokensDetails();
	const [apiTokensObj, setApiTokensObj] = useState({});

	useEffect(() => {
		async function fetchApiTokens() {
			try {
				const res = await fetch("https://raw.githubusercontent.com/piteasio/app-tokens/main/piteas-tokenlist.json");
				const data = await res.json();
				// Convert array to object keyed by symbol
				const obj = {};
				data.tokens.forEach(token => {
					obj[token.name] = {
						symbol: token.symbol,
						address: token.address,
						decimals: token.decimals,
						image: token.logoURI,
					};
				});
				setApiTokensObj(obj);
			} catch (e) {
				console.error(e);
				setApiTokensObj({});
			}
		}
		fetchApiTokens();
	}, []);

	const dynamicTokensObj = {};
	dynamicTokens
		.filter(token => token.tokenName !== "DAV") // Exclude DAV
		.forEach(token => {
			// Try to use image, then logoURI, then emoji
			let image = token.image || token.logoURI;
			let emoji = undefined;
			if (token.emoji) {
				emoji = token.emoji;
			}
			// If STATE, force image to imported state logo
			if (token.tokenName == "STATE") {
				image = state;
			}
			if (!image && emoji) {
				image = emoji;
			}

			dynamicTokensObj[token.tokenName] = {
				symbol: token.tokenName,
				address: token.TokenAddress,
				decimals: 18,
				image: image,
				...(emoji ? { emoji } : {}),
			};
		});

	// Add static tokens (except DAV)
	const allTokens = { ...dynamicTokensObj, ...apiTokensObj };

	return allTokens;
}