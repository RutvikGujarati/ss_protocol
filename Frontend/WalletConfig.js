import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalanche, pulsechain, sonic, mainnet ,bsc} from 'viem/chains';

export const config = getDefaultConfig({
	appName: 'ss-protocol',
	projectId: '204f006744ca21d941871530c5aea514',
	chains: [pulsechain, avalanche, mainnet,bsc,sonic],
	ssr: true,
	autoConnect: true,
});


export const chainCurrencyMap = {
	[avalanche.id]: avalanche.nativeCurrency.symbol,
	[bsc.id]: bsc.nativeCurrency.symbol,
	[sonic.id]: sonic.nativeCurrency.symbol,
	[pulsechain.id]: pulsechain.nativeCurrency.symbol,
	[mainnet.id]: mainnet.nativeCurrency.symbol,
};