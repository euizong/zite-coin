
// [테스트넷 환경: Sepolia 기준]
// 이 스크립트는 Sepolia 테스트넷에서 배포하도록 설계되어 있습니다.
// .env 파일의 RPC_URL, PRIVATE_KEY, ZITE_TOKEN_ADDRESS가 Sepolia용으로 설정되어 있어야 합니다.
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 ZITE 토큰 배포 시작...");
    
    // 배포자 계정 가져오기
    const [deployer] = await ethers.getSigners();
    console.log("배포자 주소:", deployer.address);
    
    // 잔액 확인
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("배포자 MATIC 잔액:", ethers.formatEther(balance));
    
    // ZITE 토큰 컨트랙트 배포
    const ZITEToken = await ethers.getContractFactory("ZITEToken");
    const ziteToken = await ZITEToken.deploy(deployer.address);
    
    await ziteToken.waitForDeployment();

    const contractAddress = await ziteToken.getAddress();
    console.log("✅ ZITE 토큰이 배포되었습니다!");
    console.log("컨트랙트 주소:", contractAddress);
    console.log("토큰 이름:", await ziteToken.name());
    console.log("토큰 심볼:", await ziteToken.symbol());
    console.log("총 공급량:", ethers.formatEther(await ziteToken.totalSupply()));

    // .env 파일에 컨트랙트 주소 저장
    const fs = require("fs");
    const path = require("path");
    const envPath = path.resolve(__dirname, "../.env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
        // 기존 ZITE_TOKEN_ADDRESS 줄 제거
        envContent = envContent.replace(/^ZITE_TOKEN_ADDRESS=.*$/m, "");
        envContent = envContent.trim() + "\n";
    }
    envContent += `ZITE_TOKEN_ADDRESS=${contractAddress}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log(".env 파일에 컨트랙트 주소 저장 완료!");
    
    // 계정별 초기 분배
    const accounts = {
        "Admin1": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "Admin2": "0x2cc6F290ff0c54A9AE15d2508a771cEE097b6533",
        "Admin3": "0xb6D0A59A256E2a62c6005De6B75e30a733912b8E",
        "User1": "0xEDC29bF3B4559e5802c0Cc9Daa88828D552e76a2",
        "User2": "0x19f35E49a34732e6FC3e9A9f477E8A6535E89C6C"
    };

    for (const [name, address] of Object.entries(accounts)) {
        const amount = ethers.parseEther("1000000"); // 100만 ZITE
        await ziteToken.transfer(address, amount);
        console.log(`${name} (${address})에게 ${ethers.formatEther(amount)} ZITE 전송 완료`);
    }
    
    console.log("🎉 모든 배포 작업이 완료되었습니다!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 배포 실패:", error);
        process.exit(1);
    });
