import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {  pulsechainV4, pulsechain} from 'viem/chains';

export  const config = getDefaultConfig({
  appName: 'ss-protocol',
  projectId: '204f006744ca21d941871530c5aea514',
  chains: [pulsechainV4,pulsechain],
  ssr: true, 
});