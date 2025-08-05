import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const NETWORK = process.env.NETWORK || 'mainnet';
export const RPC_URL = NETWORK === 'mainnet'
  ? process.env.RPC_URL_MAINNET
  : process.env.RPC_URL_TESTNET;

// 지갑 주소 설정 (메인넷/테스트넷 별도)
export const WALLET_ADDRESS = NETWORK === 'mainnet'
  ? process.env.WALLET_ADDRESS_MAINNET
  : process.env.WALLET_ADDRESS_TESTNET;

// 프라이빗키 설정 (메인넷/테스트넷 별도)
export const PRIVATE_KEY = NETWORK === 'mainnet'
  ? process.env.PRIVATE_KEY_MAINNET
  : process.env.PRIVATE_KEY_TESTNET;

// 퍼블릭키 설정 (메인넷/테스트넷 별도)
export const PUBLIC_KEY = NETWORK === 'mainnet'
  ? process.env.PUBLIC_KEY_MAINNET
  : process.env.PUBLIC_KEY_TESTNET;

// 토큰 컨트랙트 주소 설정 (메인넷/테스트넷 별도)
export const TOKEN_CONTRACT_ADDRESS = NETWORK === 'mainnet'
  ? process.env.TOKEN_CONTRACT_ADDRESS_MAINNET
  : process.env.TOKEN_CONTRACT_ADDRESS_TESTNET;

// API 키 설정
export const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
export const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
