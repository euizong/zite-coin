const { ethers } = require("hardhat");
require("dotenv").config();


const readline = require("readline");

async function main() {
    console.log("💸 ZITE 토큰 전송 시작...");

    // 입력 대기: 보내는 계정, 받는 계정, 금액을 각각 따로 입력
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function questionAsync(query) {
        return new Promise(resolve => rl.question(query, resolve));
    }

    const fromAddress = (await questionAsync("보내는 계정 주소를 입력하세요: ")).trim();
    const toAddress = (await questionAsync("받는 계정 주소를 입력하세요: ")).trim();
    const amount = (await questionAsync("보낼 ZITE 수량을 입력하세요 (예: 1000): ")).trim();
    rl.close();

    if (!fromAddress || !toAddress || !amount) {
        console.error("입력값이 올바르지 않습니다. 모두 입력해 주세요.");
        process.exit(1);
    }

    // Hardhat의 기본 signer들 가져오기
    const signers = await ethers.getSigners();
    const fromSigner = signers.find(s => s.address.toLowerCase() === fromAddress.toLowerCase());
    if (!fromSigner) {
        throw new Error(`fromAddress(${fromAddress})에 해당하는 signer를 찾을 수 없습니다.`);
    }

    // .env에서 ZITE_TOKEN_ADDRESS 가져오기
    const tokenAddress = process.env.ZITE_TOKEN_ADDRESS;
    if (!tokenAddress) {
        throw new Error(".env 파일에 ZITE_TOKEN_ADDRESS가 정의되어 있지 않습니다.");
    }

    // 배포된 ZITEToken 컨트랙트 연결
    const ziteToken = await ethers.getContractAt("ZITEToken", tokenAddress, fromSigner);

    // 보내는 사람 잔액 확인
    const fromBalance = await ziteToken.balanceOf(fromAddress);
    const transferAmount = ethers.parseEther(amount);
    if (BigInt(fromBalance) < BigInt(transferAmount)) {
        throw new Error("잔액이 부족합니다.");
    }

    // 전송 수행
    const tx = await ziteToken.transfer(toAddress, transferAmount);
    await tx.wait();
    console.log(`✅ ${fromAddress} → ${toAddress}: ${amount} ZITE 전송 완료`);

    // 최종 잔액 확인
    const finalFrom = await ziteToken.balanceOf(fromAddress);
    const finalTo = await ziteToken.balanceOf(toAddress);

    console.log("\n📦 최종 잔액");
    console.log("From:", ethers.formatEther(finalFrom), "ZITE");
    console.log("To:", ethers.formatEther(finalTo), "ZITE");
}

main().then(() => process.exit(0)).catch((error) => {
    console.error("❌ 전송 실패:", error);
    process.exit(1);
});
