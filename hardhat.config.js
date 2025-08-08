require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// 네트워크별 프라이빗키 가져오기
const getPrivateKey = () => {
  const network = process.env.NETWORK || 'testnet';
  if (network === 'mainnet') {
    return process.env.PRIVATE_KEY_MAINNET;
  } else {
    return process.env.PRIVATE_KEY_TESTNET;
  }
};

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: process.env.PRIVATE_KEY_TESTNET ? [process.env.PRIVATE_KEY_TESTNET] : [],
      chainId: 80001,
      gasPrice: 20000000000,
      timeout: 120000,
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    polygon: {
      url: process.env.RPC_URL_MAINNET || `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: process.env.PRIVATE_KEY_MAINNET ? [process.env.PRIVATE_KEY_MAINNET] : [],
      chainId: 137,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.05, // 자동 가스비에 5% 여유분 (일반적인 설정)
      timeout: 120000, // 60초 타임아웃
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    sepolia: {
      url: process.env.RPC_URL_TESTNET || "https://sepolia.infura.io/v3/1bcb95c318484ffd86a797e9d81835fb",
      accounts: process.env.PRIVATE_KEY_TESTNET ? [process.env.PRIVATE_KEY_TESTNET] : [],
      chainId: 11155111,
      gasPrice: 20000000000,
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY
    }
  }
};
