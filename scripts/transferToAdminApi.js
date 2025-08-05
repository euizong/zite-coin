const express = require("express");
const { ethers } = require("hardhat");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/transfer", async (req, res) => {
    try {
        const { fromAddress, toAddress, amount } = req.query;
        console.log("[API] /transfer 호출", { fromAddress, toAddress, amount });
        if (!fromAddress || !toAddress || !amount) {
            return res.status(400).json({ error: "fromAddress, toAddress, amount 모두 필요합니다." });
        }
        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ error: "amount는 0보다 큰 숫자여야 합니다." });
        }

        // Hardhat의 기본 signer들 가져오기
        const signers = await ethers.getSigners();
        const fromSigner = signers.find(s => s.address.toLowerCase() === fromAddress.toLowerCase());
        if (!fromSigner) {
            return res.status(400).json({ error: `fromAddress(${fromAddress})에 해당하는 signer를 찾을 수 없습니다.` });
        }

        // .env에서 ZITE_TOKEN_ADDRESS 가져오기
        const tokenAddress = process.env.ZITE_TOKEN_ADDRESS;
        if (!tokenAddress) {
            return res.status(500).json({ error: ".env 파일에 ZITE_TOKEN_ADDRESS가 정의되어 있지 않습니다." });
        }

        // 배포된 ZITEToken 컨트랙트 연결
        let ziteToken;
        try {
            ziteToken = await ethers.getContractAt("ZITEToken", tokenAddress, fromSigner);
        } catch (err) {
            return res.status(500).json({ error: `ZITEToken 컨트랙트 연결 실패: ${err.message}`, tokenAddress });
        }

        // 전송 수행 (잔액 확인 없이 바로 실행)
        let transferAmount;
        try {
            transferAmount = ethers.parseEther(amount);
        } catch (err) {
            return res.status(400).json({ error: `amount 파싱 실패: ${err.message}`, amount });
        }
        let tx, receipt;
        try {
            tx = await ziteToken.transfer(toAddress, transferAmount);
            receipt = await tx.wait();
        } catch (err) {
            return res.status(500).json({ error: `토큰 전송 실패: ${err.message}` });
        }
        if (receipt.status !== 1) {
            return res.status(500).json({ error: "트랜잭션이 실패했습니다.", txHash: tx.hash });
        }
        return res.json({
            message: `✅ ${fromAddress} → ${toAddress}: ${amount} ZITE 전송 완료`,
            txHash: tx.hash
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, tokenAddress: process.env.ZITE_TOKEN_ADDRESS });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ZITE 토큰 전송 API 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
