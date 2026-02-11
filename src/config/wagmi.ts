import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Trading Analytics Dashboard',
    projectId: 'trading-analytics-demo', // Replace with your WalletConnect project ID for production
    chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
    ssr: false,
});
