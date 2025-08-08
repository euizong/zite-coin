import { ethers } from 'ethers';
import * as config from '../../../config';
import { 
  TokenTransferDTO, 
  TransferRequestDTO, 
  UserWalletDTO,
  BalanceHistoryDTO,
  GasFeeDTO 
} from '../domain/token.dto';

// ZITE 토큰 ABI (간단 버전)
const ZITE_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

class TokenService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    // 네트워크에 따른 RPC 설정
    const rpcUrl = config.RPC_URL;
    const contractAddress = config.TOKEN_CONTRACT_ADDRESS;
    const privateKey = config.PRIVATE_KEY;

    if (!rpcUrl || !contractAddress || !privateKey) {
      throw new Error('필수 환경변수가 설정되지 않았습니다.');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(contractAddress, ZITE_TOKEN_ABI, this.provider);
    
    // 서버 지갑 설정 (전송용)
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  // 토큰 정보 조회
  async getTokenInfo() {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        contractAddress: await this.contract.getAddress()
      };
    } catch (error) {
      throw new Error(`토큰 정보 조회 실패: ${error}`);
    }
  }

  // 지갑 잔액 조회
  async getBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(walletAddress);
      const decimals = await this.contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      throw new Error(`잔액 조회 실패: ${error}`);
    }
  }

  // 가스비 추정
  async estimateTransferGas(from: string, to: string, amount: string): Promise<{
    estimatedGas: bigint;
    gasPrice: bigint;
    estimatedFee: string;
  }> {
    try {
      const decimals = await this.contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      
      // 가스 추정
      const estimatedGas = await this.contract.transfer.estimateGas(to, parsedAmount);
      const gasPrice = await this.provider.getFeeData();
      
      const estimatedFee = ethers.formatEther(
        estimatedGas * (gasPrice.gasPrice || BigInt(30000000000)) // 30 Gwei 기본값
      );

      return {
        estimatedGas,
        gasPrice: gasPrice.gasPrice || BigInt(30000000000),
        estimatedFee
      };
    } catch (error) {
      throw new Error(`가스비 추정 실패: ${error}`);
    }
  }

  // 토큰 전송 (서버에서 직접 전송)
  async transferTokens(
    fromPrivateKey: string,
    to: string,
    amount: string
  ): Promise<{
    transactionHash: string;
    blockNumber?: number;
    gasUsed?: bigint;
  }> {
    try {
      const senderWallet = new ethers.Wallet(fromPrivateKey, this.provider);
      const contractWithSigner = new ethers.Contract(
        await this.contract.getAddress(),
        ZITE_TOKEN_ABI,
        senderWallet
      );
      
      const decimals = await this.contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await contractWithSigner.transfer(to, parsedAmount);
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    } catch (error) {
      throw new Error(`토큰 전송 실패: ${error}`);
    }
  }

  // 트랜잭션 확인
  async getTransactionReceipt(txHash: string) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      throw new Error(`트랜잭션 조회 실패: ${error}`);
    }
  }

  // 블록체인 이벤트 조회 (전송 히스토리)
  async getTransferEvents(
    fromBlock: number = 0,
    toBlock: number | string = 'latest'
  ) {
    try {
      const filter = this.contract.filters.Transfer();
      const events = await this.contract.queryFilter(filter, fromBlock, toBlock);
      
      return events.map(event => {
        // EventLog인지 확인
        if ('args' in event) {
          return {
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            from: event.args[0],
            to: event.args[1],
            amount: ethers.formatUnits(event.args[2], 18)
          };
        } else {
          // Log인 경우 기본값 반환
          return {
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            from: '0x0000000000000000000000000000000000000000',
            to: '0x0000000000000000000000000000000000000000',
            amount: '0'
          };
        }
      });
    } catch (error) {
      throw new Error(`전송 이벤트 조회 실패: ${error}`);
    }
  }

  // 현재 네트워크 정보
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: Number(network.chainId),
        currency: network.name === 'matic' ? 'MATIC' : 'ETH'
      };
    } catch (error) {
      throw new Error(`네트워크 정보 조회 실패: ${error}`);
    }
  }
}

export default new TokenService();
