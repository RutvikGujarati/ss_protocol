import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, pulsechain, pulsechainV4 } from 'viem/chains';

export const config = getDefaultConfig({
	appName: 'ss-protocol',
	projectId: '204f006744ca21d941871530c5aea514',
	chains: [pulsechain,polygon],
	ssr: true,
	autoConnect: true,
});
