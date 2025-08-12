import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, pulsechain, sonic, mainnet,polygonAmoy } from 'viem/chains';

export const config = getDefaultConfig({
	appName: 'ss-protocol',
	projectId: '204f006744ca21d941871530c5aea514',
	chains: [pulsechain, polygonAmoy,polygon, sonic, mainnet],
	ssr: true,
	autoConnect: true,
});


export const chainCurrencyMap = {
	[polygon.id]: polygon.nativeCurrency.symbol,
	[sonic.id]: sonic.nativeCurrency.symbol,
	[pulsechain.id]: pulsechain.nativeCurrency.symbol,
	[polygonAmoy.id]: polygonAmoy.nativeCurrency.symbol,
	[mainnet.id]: mainnet.nativeCurrency.symbol,
};