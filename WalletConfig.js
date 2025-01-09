import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { pulsechainV4, pulsechain } from 'viem/chains';

export const config = getDefaultConfig({
	appName: 'ss-protocol',
	projectId: '204f006744ca21d941871530c5aea514',
	chains: [pulsechainV4, pulsechain],
	ssr: true,
});

export const tokenAddresses = {
	pulsechain: {
		DAV: "0x8037E06539b2Dc1b87BD56BE622663022f4b5aC1",
		STATE: "0x9Cd5fe7149CA9220844dB106cEffEa3Ef4e2B6f9",
		RATIO: "0x0Bd9BA2FF4F82011eeC33dd84fc09DC89ac5B5EA",
	},
	pulsechainV4: {
		DAV: "0xTestNetDAVTokenAddress",
		STATE: "0xTestNetStateTokenAddress",
		RATIO: "0xTestNetRatioTokenAddress",
	},
};
