
const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

// 네트워크 provider 설정 (Sepolia 등 외부 네트워크)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const app = express();
app.use(express.json());
// 블록 내 모든 트랜잭션 상세 및 토큰 전송 내역 조회 API
app.get("/block-txs", async (req, res) => {
    try {
        const { hash, number } = req.query;
        let block;
        if (hash) {
            block = await provider.getBlock(hash);
        } else if (number) {
            block = await provider.getBlock(Number(number));
        } else {
            return res.status(400).json({ error: "hash 또는 number 파라미터가 필요합니다." });
        }
        if (!block) {
            return res.status(404).json({ error: "해당 블록을 찾을 수 없습니다." });
        }
        // 트랜잭션 상세 정보 및 토큰 전송 내역 수집
        const tokenAddress = process.env.ZITE_TOKEN_ADDRESS;
        let ziteTokenIface;
        if (tokenAddress) {
            try {
                // ABI를 직접 불러와서 Interface 생성 필요 (여기선 하드코딩 또는 ABI json import 필요)
                const ZITETokenABI = require("../artifacts/contracts/ZITEToken.sol/ZITEToken.json").abi;
                ziteTokenIface = new ethers.Interface(ZITETokenABI);
            } catch (e) {
                ziteTokenIface = null;
            }
        }
        const txDetails = await Promise.all(
            block.transactions.map(async (txHash) => {
                const tx = await provider.getTransaction(txHash);
                const receipt = await provider.getTransactionReceipt(txHash);
                // 토큰 전송 이벤트 파싱
                let tokenTransfers = [];
                if (ziteTokenIface && tokenAddress && receipt) {
                    for (const log of receipt.logs) {
                        if (log.address.toLowerCase() === tokenAddress.toLowerCase()) {
                            try {
                                const parsed = ziteTokenIface.parseLog(log);
                                if (parsed && parsed.name === "Transfer") {
                                    tokenTransfers.push({
                                        from: parsed.args[0],
                                        to: parsed.args[1],
                                        value: ethers.formatEther(parsed.args[2])
                                    });
                                }
                            } catch (e) { /* skip non-matching logs */ }
                        }
                    }
                }
                return { tx, receipt, tokenTransfers };
            })
        );
        return res.json({ block, txDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});
// 블록해시 또는 블록넘버로 블록 정보 조회 API
app.get("/block", async (req, res) => {
    try {
        const { hash, number } = req.query;
        let block;
        if (hash) {
            block = await provider.getBlock(hash);
        } else if (number) {
            block = await provider.getBlock(Number(number));
        } else {
            return res.status(400).json({ error: "hash 또는 number 파라미터가 필요합니다." });
        }
        if (!block) {
            return res.status(404).json({ error: "해당 블록을 찾을 수 없습니다." });
        }
        return res.json({ block });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});

// 전체 사용자(하드햇 기본 signers) 주소 조회 API
// /users 엔드포인트는 외부 네트워크에서는 지원하지 않으므로 제거 또는 별도 구현 필요

// 주소로 ZITE 토큰 잔액 조회 API
// ETH 잔액과 ZITE(ERC-20) 잔액을 모두 반환하는 /balance API
app.get("/balance", async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: "address 파라미터가 필요합니다." });
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: "address 형식이 올바르지 않습니다." });
        }
        // ETH 잔액 조회
        let ethBalance;
        try {
            ethBalance = await provider.getBalance(address);
        } catch (err) {
            ethBalance = null;
        }
        // ZITE(ERC-20) 잔액 조회
        const tokenAddress = process.env.ZITE_TOKEN_ADDRESS;
        let ziteBalance = null;
        if (tokenAddress) {
            try {
                const ZITETokenABI = require("../artifacts/contracts/ZITEToken.sol/ZITEToken.json").abi;
                let ziteToken = new ethers.Contract(tokenAddress, ZITETokenABI, provider);
                ziteBalance = await ziteToken.balanceOf(address);
            } catch (err) {
                ziteBalance = null;
            }
        }
        return res.json({
            address,
            ethBalance: ethBalance ? ethers.formatEther(ethBalance) : null,
            ziteBalance: ziteBalance ? ethers.formatEther(ziteBalance) : null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});

app.get("/transfer", async (req, res) => {
    try {
        const { fromPrivateKey, toAddress, amount } = req.query;
        console.log("[API] /transfer 호출", { fromPrivateKey, toAddress, amount });
        if (!fromPrivateKey || !toAddress || !amount) {
            return res.status(400).json({ error: "fromPrivateKey, toAddress, amount 모두 필요합니다." });
        }
        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ error: "amount는 0보다 큰 숫자여야 합니다." });
        }

        // fromPrivateKey로 signer 생성
        let fromSigner;
        try {
            fromSigner = new ethers.Wallet(fromPrivateKey, provider);
        } catch (err) {
            return res.status(400).json({ error: `fromPrivateKey로 signer 생성 실패: ${err.message}` });
        }

        // .env에서 ZITE_TOKEN_ADDRESS 가져오기
        const tokenAddress = process.env.ZITE_TOKEN_ADDRESS;
        if (!tokenAddress) {
            return res.status(500).json({ error: ".env 파일에 ZITE_TOKEN_ADDRESS가 정의되어 있지 않습니다." });
        }

        // 배포된 ZITEToken 컨트랙트 연결
        const ZITETokenABI = require("../artifacts/contracts/ZITEToken.sol/ZITEToken.json").abi;
        let ziteToken = new ethers.Contract(tokenAddress, ZITETokenABI, fromSigner);

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
        console.log(`✅ ${fromSigner.address} → ${toAddress}: ${amount} ZITE 전송 완료`);
        console.log(`[API] /transfer from=${fromSigner.address}, to=${toAddress}, amount=${amount}, txHash=${tx.hash}`);
        console.log("트랜잭션 영수증:", receipt);
        console.log("트랜잭션 정보:", tx);
        // 최종 잔액 확인
        // 전송 후 from/to 잔액, 트랜잭션 정보, 영수증 등 모두 반환
        let txInfo, receiptInfo;
        try {
            txInfo = await provider.getTransaction(tx.hash);
            receiptInfo = await provider.getTransactionReceipt(tx.hash);
        } catch (err) {
            return res.status(500).json({ error: `최종 데이터 조회 실패: ${err.message}` });
        }

        return res.json({
            message: `✅ ${fromSigner.address} → ${toAddress}: ${amount} ZITE 전송 완료`,
            txHash: tx.hash,
            txInfo,
            receipt: receiptInfo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, tokenAddress: process.env.ZITE_TOKEN_ADDRESS });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ZITE API 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
