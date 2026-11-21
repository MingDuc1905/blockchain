const { expect } = require("chai");
const { ethers, artifacts } = require("hardhat");
const { decodeMetadata } = require("../scripts/lib/metadata");

describe("Giải mã metadata bytecode (xác định compiler thật)", function () {
  it("đọc đúng phiên bản solc từ bytecode đã deploy và khớp bytecode biên dịch cục bộ", async function () {
    const [, arbiter] = await ethers.getSigners();
    const F = await ethers.getContractFactory("HoaDonDienTu");
    const c = await F.deploy(arbiter.address);
    await c.waitForDeployment();

    const onchain = await ethers.provider.getCode(await c.getAddress());
    const artifact = await artifacts.readArtifact("HoaDonDienTu");

    const a = decodeMetadata(onchain);
    const b = decodeMetadata(artifact.deployedBytecode);

    expect(a.solcVersion).to.equal("0.8.20");
    expect(b.solcVersion).to.equal("0.8.20");
    expect(a.ipfs).to.be.a("string").with.lengthOf(68); // 0x1220 + 32 byte hash
    // Contract không dùng immutable nên bytecode chạy khớp tuyệt đối
    expect(onchain.toLowerCase()).to.equal(artifact.deployedBytecode.toLowerCase());
    expect(a.code).to.equal(b.code);
  });
});
