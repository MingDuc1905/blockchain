"""Offline RPC tests: actual ABI encoding/signing; no network transactions."""
import contextlib
import io
import json
import os
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch

from web3 import Web3
from web3.providers import BaseProvider
from web3.exceptions import TimeExhausted
import sepolia_invoice as runner


class RpcStub(BaseProvider):
    def __init__(self, duplicate=False, status=None, timeout=False, mismatch=False, chain=11155111):
        super().__init__()
        self.calls = []
        self.duplicate, self.timeout, self.mismatch = duplicate, timeout, mismatch
        self.status = int(not duplicate) if status is None else status
        self.chain = chain
        self.sender = Web3().eth.account.from_key(bytes.fromhex("11" * 32)).address

    def is_connected(self, show_traceback=False):
        return True

    def make_request(self, method, params):
        self.calls.append(method)
        results = {
            "web3_clientVersion": "offline-test", "eth_chainId": hex(self.chain),
            "eth_getCode": "0x6000", "eth_getBalance": hex(10**18),
            "eth_getTransactionCount": "0x0", "eth_maxPriorityFeePerGas": hex(10**9),
            "eth_getBlockByNumber": {"number": "0xa", "timestamp": "0x64", "baseFeePerGas": hex(10**9)},
        }
        if method == "eth_call":
            data = params[0]["data"]
            selector = Web3.keccak(text="kiemTraTrungLap(string)")[:4].hex()
            if data[2:10] == selector:
                value = Web3().codec.encode(["bool"], [self.duplicate])
            else:
                value = Web3().codec.encode(["string", "address", "address", "uint256", "uint256"],
                    ["HD-TEST", self.sender, self.sender, 999 if self.mismatch else 1000000, 100])
            result = Web3.to_hex(value)
        elif method == "eth_sendRawTransaction":
            result = Web3.to_hex(Web3.keccak(hexstr=params[0]))
        elif method == "eth_getTransactionReceipt":
            if self.timeout:
                raise TimeExhausted("offline timeout")
            result = {"transactionHash": params[0], "blockHash": "0x" + "22" * 32,
                      "blockNumber": "0xa", "status": hex(self.status),
                      "gasUsed": "0xc350", "effectiveGasPrice": hex(10**9), "logs": []}
        elif method in results:
            result = results[method]
        else:
            raise AssertionError("Unexpected RPC: " + method)
        return {"jsonrpc": "2.0", "id": 1, "result": result}


class TransactionTests(unittest.TestCase):
    def execute(self, rpc):
        with tempfile.TemporaryDirectory() as directory:
            args = Namespace(rpc_url="http://unused", contract=runner.DEFAULT_CONTRACT,
                             code="HD-TEST", buyer=None, amount=1000000,
                             gas=500000, timeout=1, output_dir=directory)
            with patch.dict(os.environ, {"SEPOLIA_PRIVATE_KEY": "11" * 32}), \
                 patch.object(runner.Web3, "HTTPProvider", return_value=rpc), \
                 contextlib.redirect_stdout(io.StringIO()):
                result = runner.run(args, "duplicate" if rpc.duplicate else "issue")
            records = [json.loads(p.read_text(encoding="utf-8")) for p in Path(directory).glob("*.json")]
            return result, records[0]

    def test_duplicate_is_broadcast_without_estimation(self):
        rpc = RpcStub(duplicate=True)
        result, record = self.execute(rpc)
        self.assertEqual(result, 0)
        self.assertEqual(record["status"], 0)
        self.assertTrue(record["verified"])
        self.assertEqual(rpc.calls.count("eth_sendRawTransaction"), 1)
        self.assertNotIn("eth_estimateGas", rpc.calls)

    def test_issue_and_reconcile(self):
        result, record = self.execute(RpcStub())
        self.assertEqual(result, 0)
        self.assertEqual(record["status"], 1)
        self.assertTrue(record["verified"])

    def test_timeout_preserves_hash(self):
        result, record = self.execute(RpcStub(timeout=True))
        self.assertEqual(result, 2)
        self.assertEqual(record["state"], "pending_timeout")
        self.assertEqual(len(record["txHash"]), 66)
        self.assertNotIn("status", record)

    def test_unexpected_success_is_not_duplicate_proof(self):
        with self.assertRaisesRegex(RuntimeError, "Receipt status"):
            self.execute(RpcStub(duplicate=True, status=1))

    def test_mismatched_invoice_fails(self):
        with self.assertRaisesRegex(RuntimeError, "Doi soat"):
            self.execute(RpcStub(mismatch=True))

    def test_wrong_chain_never_broadcasts(self):
        rpc = RpcStub(chain=1)
        with self.assertRaises(ValueError):
            self.execute(rpc)
        self.assertNotIn("eth_sendRawTransaction", rpc.calls)


if __name__ == "__main__":
    unittest.main()
