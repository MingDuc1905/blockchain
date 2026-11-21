"""Shared Sepolia transaction runner. Never simulates phatHanhHoaDon via eth_call."""
import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from web3 import Web3
from web3.exceptions import TimeExhausted

CHAIN_ID = 11155111
DEFAULT_CONTRACT = "0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C"


def function_abi(name, inputs, outputs, mutability="view"):
    return {"type": "function", "name": name, "stateMutability": mutability,
            "inputs": [{"name": n, "type": t} for n, t in inputs],
            "outputs": [{"name": n, "type": t} for n, t in outputs]}


ABI = [
    function_abi("phatHanhHoaDon", [("_maHoaDon", "string"), ("_nguoiMua", "address"),
                                   ("_giaTri", "uint256")], [], "nonpayable"),
    function_abi("kiemTraTrungLap", [("_maHoaDon", "string")], [("", "bool")]),
    function_abi("traCuuHoaDon", [("_maHoaDon", "string")], [
        ("maHoaDon", "string"), ("nguoiBan", "address"), ("nguoiMua", "address"),
        ("giaTri", "uint256"), ("thoiGianPhatHanh", "uint256")]),
]


def save_evidence(path, evidence):
    path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run(args, mode):
    key = os.environ.get("SEPOLIA_PRIVATE_KEY") or os.environ.get("PRIVATE_KEY")
    if not key:
        raise ValueError("Thieu SEPOLIA_PRIVATE_KEY (hoac PRIVATE_KEY) trong bien moi truong.")
    # Do not include private-key contents or RPC credentials in error output.
    try:
        account = Web3().eth.account.from_key(key)
    except Exception:
        raise ValueError("Private key khong hop le.") from None
    w3 = Web3(Web3.HTTPProvider(args.rpc_url, request_kwargs={"timeout": 30}))
    if not w3.is_connected():
        raise RuntimeError("Khong ket noi duoc RPC.")
    if w3.eth.chain_id != CHAIN_ID:
        raise ValueError("RPC khong phai Ethereum Sepolia (11155111). Dung gui.")
    address = Web3.to_checksum_address(args.contract)
    if not w3.eth.get_code(address):
        raise ValueError("Dia chi contract khong co bytecode tren Sepolia.")
    contract = w3.eth.contract(address=address, abi=ABI)
    code = args.code.strip() if args.code else (
        "HD-PY-" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S") + "-" + uuid4().hex[:8])
    if not code or len(code.encode("utf-8")) > 128:
        raise ValueError("Ma hoa don phai dai 1..128 byte UTF-8.")
    buyer = Web3.to_checksum_address(args.buyer or account.address)
    if int(buyer, 16) == 0 or not 0 < args.amount < 2**256:
        raise ValueError("Vi mua phai khac 0; so tien phai la so nguyen duong uint256.")
    if args.gas < 100000 or args.timeout <= 0:
        raise ValueError("Gas phai >= 100000; timeout phai > 0.")

    # Read-only calls are for preconditions/reconciliation, not simulated issuance.
    exists = contract.functions.kiemTraTrungLap(code).call()
    if exists != (mode == "duplicate"):
        raise ValueError("Can ma DA ton tai." if mode == "duplicate" else "Ma da ton tai; chon ma moi.")
    before = list(contract.functions.traCuuHoaDon(code).call()) if exists else None
    block = w3.eth.get_block("latest")
    tip = w3.eth.max_priority_fee
    fee = 2 * block["baseFeePerGas"] + tip
    if w3.eth.get_balance(account.address) < args.gas * fee:
        raise ValueError("Vi khong du Sepolia ETH cho gas limit * maxFeePerGas.")
    # Explicit gas is critical: build_transaction must NOT estimate gas for a revert.
    tx = contract.functions.phatHanhHoaDon(code, buyer, args.amount).build_transaction({
        "from": account.address, "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "chainId": CHAIN_ID, "gas": args.gas, "value": 0, "type": 2,
        "maxFeePerGas": fee, "maxPriorityFeePerGas": tip,
    })
    signed = account.sign_transaction(tx)
    tx_hash = Web3.to_hex(Web3.keccak(signed.raw_transaction))
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / (mode + "_" + tx_hash + ".json")
    evidence = {"mode": mode, "chainId": CHAIN_ID, "contract": address,
                "sender": account.address, "buyer": buyer, "invoiceCode": code,
                "amount": args.amount, "txHash": tx_hash, "nonce": tx["nonce"],
                "gasLimit": args.gas, "before": before, "state": "signed_not_broadcast",
                "explorerUrl": "https://sepolia.etherscan.io/tx/" + tx_hash}
    # Save hash before broadcasting so a timeout never loses the transaction identity.
    save_evidence(path, evidence)
    print("Ma hoa don:", code)
    print("Tx hash (da ky; chua xac nhan broadcast):", tx_hash, flush=True)
    print("Bang chung:", path.resolve(), flush=True)
    try:
        returned_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    except Exception:
        evidence["state"] = "broadcast_error_or_unknown"
        save_evidence(path, evidence)
        raise RuntimeError("RPC khong xac nhan broadcast. Kiem tra hash da in truoc khi chay lai.") from None
    if Web3.to_hex(returned_hash) != tx_hash:
        raise RuntimeError("RPC tra ve hash khong khop giao dich da ky.")
    evidence["state"] = "submitted"
    save_evidence(path, evidence)
    print("Da gui eth_sendRawTransaction:", evidence["explorerUrl"], flush=True)
    try:
        receipt = w3.eth.wait_for_transaction_receipt(returned_hash, timeout=args.timeout, poll_latency=3)
    except TimeExhausted:
        evidence["state"] = "pending_timeout"
        save_evidence(path, evidence)
        print("Het thoi gian cho; CHUA ket luan thanh cong/that bai. Theo doi hash, khong gui lai.")
        return 2
    evidence.update({"state": "mined", "status": receipt["status"],
                     "blockNumber": receipt["blockNumber"],
                     "blockHash": Web3.to_hex(receipt["blockHash"]),
                     "gasUsed": receipt["gasUsed"],
                     "effectiveGasPrice": receipt["effectiveGasPrice"],
                     "feeWei": receipt["gasUsed"] * receipt["effectiveGasPrice"]})
    save_evidence(path, evidence)
    expected_status = 0 if mode == "duplicate" else 1
    if receipt["status"] != expected_status:
        raise RuntimeError("Receipt status khong dung ky vong; xem file bang chung.")
    after = list(contract.functions.traCuuHoaDon(code).call(block_identifier=receipt["blockNumber"]))
    if mode == "duplicate":
        verified = after == before and not receipt["logs"] and receipt["gasUsed"] < args.gas
    else:
        mined_block = w3.eth.get_block(receipt["blockNumber"])
        verified = (after[0] == code and after[1].lower() == account.address.lower()
                    and after[2].lower() == buyer.lower() and after[3] == args.amount
                    and after[4] == mined_block["timestamp"])
    evidence.update({"after": after, "verified": verified})
    save_evidence(path, evidence)
    if not verified:
        raise RuntimeError("Doi soat khong khop; xem file bang chung.")
    print("Receipt status:", receipt["status"], "| Block:", receipt["blockNumber"])
    print("traCuuHoaDon:", json.dumps(after, ensure_ascii=False))
    print("PASS: giao dich trung ma FAIL that; hoa don goc khong doi." if mode == "duplicate"
          else "PASS: phat hanh thanh cong va doi soat khop ca 5 truong.")
    return 0


def main(mode):
    parser = argparse.ArgumentParser(description="Giao dich hoa don THAT tren Sepolia: " + mode)
    parser.add_argument("--code", required=mode == "duplicate", help="Ma hoa don; issue tu sinh neu bo trong")
    parser.add_argument("--buyer", help="Vi mua; mac dinh la vi ky")
    parser.add_argument("--amount", type=int, default=1000000, help="Tong tien VND, mac dinh 1000000")
    parser.add_argument("--gas", type=int, default=1000000 if mode == "issue" else 500000,
                        help="Gas limit co dinh: issue 1000000, duplicate 500000; khong estimate")
    parser.add_argument("--timeout", type=int, default=180, help="So giay cho receipt")
    parser.add_argument("--rpc-url", default=os.environ.get("SEPOLIA_RPC_URL", "https://ethereum-sepolia-rpc.publicnode.com"))
    parser.add_argument("--contract", default=os.environ.get("CONTRACT_ADDRESS", DEFAULT_CONTRACT))
    parser.add_argument("--output-dir", default=str(Path(__file__).resolve().parents[1] / "artifacts" / "sepolia"))
    args = parser.parse_args()
    try:
        return run(args, mode)
    except (ValueError, RuntimeError) as exc:
        # Only our own validation errors are printed verbatim.
        print("LOI:", str(exc) if type(exc) in (ValueError, RuntimeError) else type(exc).__name__)
        return 1
    except Exception as exc:
        print("LOI:", type(exc).__name__, "- kiem tra RPC/cau hinh va file bang chung neu da gui.")
        return 1
