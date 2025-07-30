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
				// Only include tokens with specific names
				const allowedNames = [
					"PulseChain from pump.tires",
					"HEX",
					"PulseX",
					"Incentive"
				];
				const obj = {};
				
				// Find WPLS logo URI first
				const wplsToken = data.tokens.find(token => token.name === "Wrapped Pulse");
				const wplsLogoURI = wplsToken ? wplsToken.logoURI : null;
				
				data.tokens
					.filter(token => allowedNames.includes(token.name))
					.forEach(token => {
						// If it's "PulseChain from pump.tires", use WPLS logo
						if (token.name === "PulseChain from pump.tires" && wplsLogoURI) {
							obj[token.name] = {
								symbol: token.symbol,
								address: token.address,
								decimals: token.decimals,
								image: wplsLogoURI,
							};
						} else {
							obj[token.name] = {
								symbol: token.symbol,
								address: token.address,
								decimals: token.decimals,
								image: token.logoURI,
							};
						}
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