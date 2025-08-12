// Frontend/src/components/Swap/Tokens.js
import { useEffect, useState } from "react";
import { TokensDetails } from "../../data/TokensDetails";
import { useChainId } from "wagmi";
import state from "../../assets/statelogo.png";

export function useAllTokens() {
	const chainId = useChainId();
	const { tokens: dynamicTokens } = TokensDetails();
	const [apiTokensObj, setApiTokensObj] = useState({});

	useEffect(() => {
		let mounted = true;

		async function fetchApiTokens() {
			try {
				let tokensData = [];

				if (chainId === 369) {
					// PulseChain → Piteas list with filter
					const res = await fetch(
						"https://raw.githubusercontent.com/piteasio/app-tokens/main/piteas-tokenlist.json"
					);
					if (!res.ok) throw new Error("Failed to fetch Piteas tokenlist");
					const data = await res.json();

					// Allowed tokens
					const allowedNames = [
						"PulseChain from pump.tires",
						"HEX",
						"PulseX",
						"Incentive",
					];

					// Find WPLS logo
					const wplsToken = data.tokens.find(
						(token) => token.name === "Wrapped Pulse"
					);
					const wplsLogoURI = wplsToken ? wplsToken.logoURI : null;

					tokensData = data.tokens.filter((token) =>
						allowedNames.includes(token.name)
					);

					const obj = {};
					tokensData.forEach((token) => {
						if (token.name === "PulseChain from pump.tires" && wplsLogoURI) {
							obj[token.name] = {
								symbol: token.symbol,
								address: token.address,
								decimals: token.decimals,
								image: wplsLogoURI,
								name: token.name,
							};
						} else {
							obj[token.name] = {
								symbol: token.symbol,
								address: token.address,
								decimals: token.decimals,
								image: token.logoURI || null,
								name: token.name,
							};
						}
					});
					if (mounted) setApiTokensObj(obj);
					return; // stop here for PulseChain
				} else {
					// All other chains → Uniswap token list
					const res = await fetch("https://ipfs.io/ipns/tokens.uniswap.org");
					if (!res.ok) throw new Error("Failed to fetch Uniswap tokenlist");
					const data = await res.json();
					tokensData =
						data.tokens?.filter((t) => t.chainId === chainId) || [];
				}

				// Default mapping for non-PulseChain
				const obj = {};
				tokensData.forEach((t) => {
					obj[t.name || t.symbol] = {
						symbol: t.symbol,
						address: t.address,
						decimals: t.decimals,
						image: t.logoURI || null,
						name: t.name,
					};
				});

				if (mounted) setApiTokensObj(obj);
			} catch (e) {
				console.error("fetchApiTokens error:", e);
				if (mounted) setApiTokensObj({});
			}
		}

		fetchApiTokens();
		return () => {
			mounted = false;
		};
	}, [chainId]);

	// Keep your dynamic tokens
	const dynamicTokensObj = {};
	dynamicTokens
		.filter((token) => token.tokenName !== "DAV")
		.forEach((token) => {
			let image = token.image || token.logoURI;
			let emoji;
			if (token.emoji) emoji = token.emoji;
			if (token.tokenName === "STATE") image = state;
			if (!image && emoji) image = emoji;

			dynamicTokensObj[token.tokenName] = {
				symbol: token.tokenName,
				address: token.TokenAddress,
				decimals: token.decimals ?? 18,
				image,
				...(emoji ? { emoji } : {}),
			};
		});

	// Merge dynamic tokens with API tokens (dynamic overrides API)
	return { ...dynamicTokensObj, ...apiTokensObj };
}
