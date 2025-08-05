const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 메인넷에 ZITE 토큰 배포 시작...");
  
  // 현재 네트워크 확인
  const network = await ethers.provider.getNetwork();
  console.log(`📡 네트워크: ${network.name} (Chain ID: ${network.chainId})`);
  
  // 배포자 지갑 확인
  const [deployer] = await ethers.getSigners();
  console.log(`👤 배포자 주소: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 배포자 잔액: ${ethers.formatEther(balance)} MATIC`);
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ 배포를 위한 MATIC이 부족합니다. 최소 0.01 MATIC 필요");
    console.log("💡 Polygon 메인넷에서는 MATIC이 가스비로 사용됩니다.");
    return;
  }
  
  // ZITE 토큰 컨트랙트 배포
  console.log("\n📝 ZITE 토큰 컨트랙트 배포 중...");
  const ZITEToken = await ethers.getContractFactory("ZITEToken");
  const ziteToken = await ZITEToken.deploy(deployer.address);
  
  await ziteToken.waitForDeployment();
  const tokenAddress = await ziteToken.getAddress();
  
  console.log(`✅ ZITE 토큰이 성공적으로 배포되었습니다!`);
  console.log(`📍 컨트랙트 주소: ${tokenAddress}`);
  console.log(`👤 소유자: ${deployer.address}`);
  
  // 토큰 정보 확인
  const name = await ziteToken.name();
  const symbol = await ziteToken.symbol();
  const decimals = await ziteToken.decimals();
  const totalSupply = await ziteToken.totalSupply();
  
  console.log(`\n📊 토큰 정보:`);
  console.log(`   이름: ${name}`);
  console.log(`   심볼: ${symbol}`);
  console.log(`   소수점: ${decimals}`);
  console.log(`   총 공급량: ${ethers.formatUnits(totalSupply, decimals)} ZITE`);
  
  console.log(`\n🔧 .env 파일에 다음 주소를 추가하세요:`);
  console.log(`TOKEN_CONTRACT_ADDRESS_MAINNET=${tokenAddress}`);
  
  // 검증을 위한 정보 출력
  console.log(`\n🔍 Polygonscan에서 확인: https://polygonscan.com/address/${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });
