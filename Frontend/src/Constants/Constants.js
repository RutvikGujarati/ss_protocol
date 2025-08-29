export const PULSEX_ROUTER_ADDRESS = '0x165C3410fC91EF562C50559f7d2289fEbed552d9';
export const WPLS_ADDRESS = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27';

export const PULSEX_ROUTER_ABI = [
    'function factory() external view returns (address)',
    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
];

export const PULSEX_FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)',
];