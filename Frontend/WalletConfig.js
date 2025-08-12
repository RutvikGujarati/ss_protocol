import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, pulsechain, sonic, mainnet } from 'viem/chains';

export const config = getDefaultConfig({
	appName: 'ss-protocol',
	projectId: '204f006744ca21d941871530c5aea514',
	chains: [pulsechain, polygon, sonic, mainnet],
	ssr: true,
	autoConnect: true,
});


export const chainCurrencyMap = {
	[polygon.id]: polygon.nativeCurrency.symbol,
	[sonic.id]: sonic.nativeCurrency.symbol,
	[pulsechain.id]: pulsechain.nativeCurrency.symbol,
	[mainnet.id]: mainnet.nativeCurrency.symbol,
};