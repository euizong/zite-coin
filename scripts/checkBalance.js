const { ethers } = require("hardhat");

async function main() {
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const token = await ethers.getContractAt("ZITEToken", tokenAddress);
    
    const accounts = {
        "Admin1": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "User1": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "User2": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    };
    
    console.log("🏦 ZITE 토큰 잔액 확인");
    console.log("=" * 40);
    
    for (const [name, address] of Object.entries(accounts)) {
        const balance = await token.balanceOf(address);
        const formattedBalance = ethers.formatEther(balance);
        console.log(`${name}: ${formattedBalance} ZITE`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
