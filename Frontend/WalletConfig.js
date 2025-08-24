import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { avalanche, pulsechain, pulsechainV4, bsc, mainnet, sonic } from "@reown/appkit/networks";
import { QueryClient } from "@tanstack/react-query";

// 0. Setup queryClient
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			cacheTime: 1000 * 60 * 60 * 24, // 24 hours
			refetchOnWindowFocus: false,
		},
	},
});

// 1. Get projectId from environment variable
const projectId = process.env.VITE_REOWN_PROJECT_ID || "7d41cc4a6870d3e7287eb8442cb70f7a";
if (!projectId) throw new Error("Reown projectId is not defined");

// 2. Create metadata object
const metadata = {
	name: "My App",
	description: "A decentralized application using Reown AppKit",
	url: "https://your-app-domain.com", // Replace with your actual domain
	icons: ["https://avatars.githubusercontent.com/u/179229932"], // Replace with your app's icon
};

// 3. Define networks
const networks = [mainnet, avalanche, pulsechain, pulsechainV4, bsc, sonic];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
	networks,
	projectId,
	ssr: false, // Enable SSR if using Next.js
});

// 5. Create AppKit configuration
try {
	createAppKit({
		adapters: [wagmiAdapter],
		networks,
		projectId,
		metadata,
		features: {
			socials:false
		},
	});
} catch (error) {
	console.error("Failed to initialize AppKit:", error);
}

export { wagmiAdapter, queryClient, networks };

// Remove RainbowKit-related exports
// export const config = ... (removed)
// export const chains = ... (removed)
// export const chainCurrencyMap = ... (removed)
export const chains = [pulsechain, pulsechainV4, avalanche, mainnet, bsc, sonic];

// Keep config lightweight


export const chainCurrencyMap = {
	[avalanche.id]: avalanche.nativeCurrency.symbol,
	[bsc.id]: bsc.nativeCurrency.symbol,
	[sonic.id]: sonic.nativeCurrency.symbol,
	[pulsechain.id]: pulsechain.nativeCurrency.symbol,
	[pulsechain.id]: pulsechain.nativeCurrency.symbol,
	[mainnet.id]: mainnet.nativeCurrency.symbol,
};
