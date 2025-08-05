const { ethers } = require("hardhat");

async function main() {
    console.log("💸 ZITE 토큰 전송 시작...");
    
    // 계정들 가져오기
    const [admin1, user1, user2] = await ethers.getSigners();
    
    console.log("계정 주소:");
    console.log("Admin1:", admin1.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);
    
    // 토큰 컨트랙트 연결
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    // 각 계정에서 토큰 컨트랙트에 연결
    const tokenAsAdmin = await ethers.getContractAt("ZITEToken", tokenAddress, admin1);
    const tokenAsUser1 = await ethers.getContractAt("ZITEToken", tokenAddress, user1);
    const tokenAsUser2 = await ethers.getContractAt("ZITEToken", tokenAddress, user2);
    
    // 현재 잔액 확인
    const user1Balance = await tokenAsUser1.balanceOf(user1.address);
    const user2Balance = await tokenAsUser2.balanceOf(user2.address);
    const adminBalance = await tokenAsAdmin.balanceOf(admin1.address);
    
    console.log("\n현재 잔액:");
    console.log("Admin1:", ethers.formatEther(adminBalance), "ZITE");
    console.log("User1:", ethers.formatEther(user1Balance), "ZITE");
    console.log("User2:", ethers.formatEther(user2Balance), "ZITE");
    
    // 500 ZITE를 남기고 나머지 전송
    const keepAmount = ethers.parseEther("500");
    
    // User1에서 Admin1으로 전송
    if (user1Balance > keepAmount) {
        const transferAmount1 = user1Balance - keepAmount;
        console.log(`\nUser1에서 Admin1으로 ${ethers.formatEther(transferAmount1)} ZITE 전송 중...`);
        await tokenAsUser1.transfer(admin1.address, transferAmount1);
        console.log("✅ User1 전송 완료");
    }
    
    // User2에서 Admin1으로 전송
    if (user2Balance > keepAmount) {
        const transferAmount2 = user2Balance - keepAmount;
        console.log(`\nUser2에서 Admin1으로 ${ethers.formatEther(transferAmount2)} ZITE 전송 중...`);
        await tokenAsUser2.transfer(admin1.address, transferAmount2);
        console.log("✅ User2 전송 완료");
    }
    
    // 최종 잔액 확인
    const finalAdminBalance = await tokenAsAdmin.balanceOf(admin1.address);
    const finalUser1Balance = await tokenAsUser1.balanceOf(user1.address);
    const finalUser2Balance = await tokenAsUser2.balanceOf(user2.address);
    
    console.log("\n🏦 최종 잔액:");
    console.log("Admin1:", ethers.formatEther(finalAdminBalance), "ZITE");
    console.log("User1:", ethers.formatEther(finalUser1Balance), "ZITE");
    console.log("User2:", ethers.formatEther(finalUser2Balance), "ZITE");
    
    console.log("\n🎉 모든 전송이 완료되었습니다!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 전송 실패:", error);
        process.exit(1);
    });
