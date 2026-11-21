const { expect } = require("chai");
const { ethers } = require("hardhat");

// Trạng thái (khớp enum TrangThai trong contract)
const TT = { Pending: 0, Confirmed: 1, Rejected: 2, Cancelled: 3, Disputed: 4 };

describe("HoaDonDienTu v2 - vòng đời hóa đơn & Arbiter", function () {
  let contract, owner, arbiter, seller, buyer, other;
  const MA = "HD-2026-001";
  const GIA = 150_000_000n;

  beforeEach(async function () {
    [owner, arbiter, seller, buyer, other] = await ethers.getSigners();
    const F = await ethers.getContractFactory("HoaDonDienTu");
    contract = await F.deploy(arbiter.address);
    await contract.waitForDeployment();
  });

  // Phát hành 1 hóa đơn Pending từ seller cho buyer
  async function phatHanh(ma = MA) {
    await contract.connect(seller).phatHanhHoaDon(ma, buyer.address, GIA);
  }

  // Đưa hóa đơn tới trạng thái Rejected
  async function tuChoi(ma = MA, lyDo = "Sai thong tin MST") {
    await phatHanh(ma);
    await contract.connect(buyer).tuChoiHoaDon(ma, lyDo);
  }

  describe("constructor & Arbiter", function () {
    it("lưu owner và arbiter", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.arbiter()).to.equal(arbiter.address);
    });

    it("từ chối Arbiter là address(0)", async function () {
      const F = await ethers.getContractFactory("HoaDonDienTu");
      await expect(F.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "Loi: Dia chi Arbiter khong hop le!"
      );
    });

    it("chỉ owner được đổi Arbiter và phát event", async function () {
      await expect(contract.connect(other).setArbiter(other.address)).to.be.revertedWith(
        "Loi: Chi chu so huu hop dong moi duoc thuc hien!"
      );
      await expect(contract.setArbiter(other.address))
        .to.emit(contract, "ArbiterThayDoi")
        .withArgs(arbiter.address, other.address);
      expect(await contract.arbiter()).to.equal(other.address);
      await expect(contract.setArbiter(ethers.ZeroAddress)).to.be.revertedWith(
        "Loi: Dia chi Arbiter khong hop le!"
      );
    });
  });

  describe("phát hành", function () {
    it("tạo hóa đơn ở trạng thái Pending, ghiChu rỗng", async function () {
      await expect(contract.connect(seller).phatHanhHoaDon(MA, buyer.address, GIA)).to.emit(
        contract,
        "HoaDonPhatHanh"
      );
      const hd = await contract.traCuuHoaDon(MA);
      expect(hd.maHoaDon).to.equal(MA);
      expect(hd.nguoiBan).to.equal(seller.address);
      expect(hd.nguoiMua).to.equal(buyer.address);
      expect(hd.giaTri).to.equal(GIA);
      expect(hd.trangThai).to.equal(TT.Pending);
      expect(hd.ghiChu).to.equal("");
      expect(await contract.layTrangThai(MA)).to.equal(TT.Pending);
      expect(await contract.layTongSoHoaDon()).to.equal(1n);
    });

    it("chặn mã trùng (cơ chế chống gian lận cốt lõi)", async function () {
      await phatHanh();
      await expect(
        contract.connect(seller).phatHanhHoaDon(MA, buyer.address, 1n)
      ).to.be.revertedWith("Loi: Ma hoa don da ton tai tren he thong!");
    });

    it("chặn các đầu vào không hợp lệ", async function () {
      await expect(
        contract.connect(seller).phatHanhHoaDon("", buyer.address, GIA)
      ).to.be.revertedWith("Loi: Ma hoa don khong duoc de trong!");
      await expect(
        contract.connect(seller).phatHanhHoaDon(MA, ethers.ZeroAddress, GIA)
      ).to.be.revertedWith("Loi: Dia chi nguoi mua khong hop le!");
      await expect(
        contract.connect(seller).phatHanhHoaDon(MA, seller.address, GIA)
      ).to.be.revertedWith("Loi: Nguoi mua khong duoc trung voi nguoi ban!");
      await expect(
        contract.connect(seller).phatHanhHoaDon(MA, buyer.address, 0)
      ).to.be.revertedWith("Loi: Gia tri hoa don phai lon hon 0!");
    });
  });

  describe("xacNhanHoaDon (Pending -> Confirmed)", function () {
    it("người mua xác nhận thành công và phát event", async function () {
      await phatHanh();
      await expect(contract.connect(buyer).xacNhanHoaDon(MA))
        .to.emit(contract, "TrangThaiThayDoi")
        .withArgs(MA, TT.Pending, TT.Confirmed, buyer.address, "");
      expect(await contract.layTrangThai(MA)).to.equal(TT.Confirmed);
    });

    it("chỉ người mua được xác nhận", async function () {
      await phatHanh();
      await expect(contract.connect(seller).xacNhanHoaDon(MA)).to.be.revertedWith(
        "Loi: Chi nguoi mua moi duoc xac nhan hoa don!"
      );
      await expect(contract.connect(other).xacNhanHoaDon(MA)).to.be.revertedWith(
        "Loi: Chi nguoi mua moi duoc xac nhan hoa don!"
      );
    });

    it("không xác nhận lần 2 hoặc khi đã ở trạng thái khác Pending", async function () {
      await phatHanh();
      await contract.connect(buyer).xacNhanHoaDon(MA);
      await expect(contract.connect(buyer).xacNhanHoaDon(MA)).to.be.revertedWith(
        "Loi: Hoa don khong o trang thai Pending!"
      );
    });

    it("báo lỗi khi mã không tồn tại", async function () {
      await expect(contract.connect(buyer).xacNhanHoaDon("KHONG-CO")).to.be.revertedWith(
        "Loi: Khong tim thay hoa don voi ma so nay!"
      );
    });
  });

  describe("tuChoiHoaDon (Pending -> Rejected)", function () {
    it("người mua từ chối kèm lý do, lưu ghiChu và phát event", async function () {
      await phatHanh();
      await expect(contract.connect(buyer).tuChoiHoaDon(MA, "Sai gia tri"))
        .to.emit(contract, "TrangThaiThayDoi")
        .withArgs(MA, TT.Pending, TT.Rejected, buyer.address, "Sai gia tri");
      const hd = await contract.traCuuHoaDon(MA);
      expect(hd.trangThai).to.equal(TT.Rejected);
      expect(hd.ghiChu).to.equal("Sai gia tri");
    });

    it("bắt buộc có lý do và giới hạn độ dài", async function () {
      await phatHanh();
      await expect(contract.connect(buyer).tuChoiHoaDon(MA, "")).to.be.revertedWith(
        "Loi: Phai nhap ly do tu choi!"
      );
      await expect(contract.connect(buyer).tuChoiHoaDon(MA, "x".repeat(501))).to.be.revertedWith(
        "Loi: Ghi chu qua dai!"
      );
      // đúng 500 byte vẫn hợp lệ
      await contract.connect(buyer).tuChoiHoaDon(MA, "x".repeat(500));
      expect(await contract.layTrangThai(MA)).to.equal(TT.Rejected);
    });

    it("chỉ người mua được từ chối", async function () {
      await phatHanh();
      await expect(contract.connect(seller).tuChoiHoaDon(MA, "ly do")).to.be.revertedWith(
        "Loi: Chi nguoi mua moi duoc tu choi hoa don!"
      );
      await expect(contract.connect(arbiter).tuChoiHoaDon(MA, "ly do")).to.be.revertedWith(
        "Loi: Chi nguoi mua moi duoc tu choi hoa don!"
      );
    });

    it("không từ chối hóa đơn đã Confirmed", async function () {
      await phatHanh();
      await contract.connect(buyer).xacNhanHoaDon(MA);
      await expect(contract.connect(buyer).tuChoiHoaDon(MA, "doi y")).to.be.revertedWith(
        "Loi: Hoa don khong o trang thai Pending!"
      );
    });
  });

  describe("huyHoaDon (Pending -> Cancelled)", function () {
    it("người bán hủy khi còn Pending và phát event", async function () {
      await phatHanh();
      await expect(contract.connect(seller).huyHoaDon(MA))
        .to.emit(contract, "TrangThaiThayDoi")
        .withArgs(MA, TT.Pending, TT.Cancelled, seller.address, "");
      expect(await contract.layTrangThai(MA)).to.equal(TT.Cancelled);
    });

    it("mã đã hủy vẫn bị chiếm, không thể phát hành lại", async function () {
      await phatHanh();
      await contract.connect(seller).huyHoaDon(MA);
      expect(await contract.kiemTraTrungLap(MA)).to.equal(true);
      await expect(
        contract.connect(seller).phatHanhHoaDon(MA, buyer.address, GIA)
      ).to.be.revertedWith("Loi: Ma hoa don da ton tai tren he thong!");
    });

    it("chỉ người bán được hủy", async function () {
      await phatHanh();
      await expect(contract.connect(buyer).huyHoaDon(MA)).to.be.revertedWith(
        "Loi: Chi nguoi ban moi duoc huy hoa don!"
      );
      await expect(contract.connect(other).huyHoaDon(MA)).to.be.revertedWith(
        "Loi: Chi nguoi ban moi duoc huy hoa don!"
      );
    });

    it("không hủy được khi đã Confirmed / Rejected / Cancelled", async function () {
      await phatHanh("A");
      await contract.connect(buyer).xacNhanHoaDon("A");
      await expect(contract.connect(seller).huyHoaDon("A")).to.be.revertedWith(
        "Loi: Chi duoc huy hoa don khi con Pending!"
      );

      await tuChoi("B");
      await expect(contract.connect(seller).huyHoaDon("B")).to.be.revertedWith(
        "Loi: Chi duoc huy hoa don khi con Pending!"
      );

      await phatHanh("C");
      await contract.connect(seller).huyHoaDon("C");
      await expect(contract.connect(seller).huyHoaDon("C")).to.be.revertedWith(
        "Loi: Chi duoc huy hoa don khi con Pending!"
      );
    });

    it("người mua không còn xác nhận / từ chối được hóa đơn đã hủy", async function () {
      await phatHanh();
      await contract.connect(seller).huyHoaDon(MA);
      await expect(contract.connect(buyer).xacNhanHoaDon(MA)).to.be.revertedWith(
        "Loi: Hoa don khong o trang thai Pending!"
      );
      await expect(contract.connect(buyer).tuChoiHoaDon(MA, "ly do")).to.be.revertedWith(
        "Loi: Hoa don khong o trang thai Pending!"
      );
    });
  });

  describe("raiseDispute (Rejected -> Disputed)", function () {
    it("người bán khiếu nại hóa đơn bị từ chối", async function () {
      await tuChoi();
      await expect(contract.connect(seller).raiseDispute(MA))
        .to.emit(contract, "TrangThaiThayDoi")
        .withArgs(MA, TT.Rejected, TT.Disputed, seller.address, "");
      expect(await contract.layTrangThai(MA)).to.equal(TT.Disputed);
      expect(await contract.daTungTranhChap(MA)).to.equal(true);
    });

    it("chỉ người bán được khiếu nại", async function () {
      await tuChoi();
      await expect(contract.connect(buyer).raiseDispute(MA)).to.be.revertedWith(
        "Loi: Chi nguoi ban moi duoc khieu nai!"
      );
      await expect(contract.connect(arbiter).raiseDispute(MA)).to.be.revertedWith(
        "Loi: Chi nguoi ban moi duoc khieu nai!"
      );
    });

    it("chỉ khiếu nại được khi đang Rejected", async function () {
      await phatHanh("P");
      await expect(contract.connect(seller).raiseDispute("P")).to.be.revertedWith(
        "Loi: Chi duoc khieu nai hoa don dang bi tu choi!"
      );

      await phatHanh("C");
      await contract.connect(buyer).xacNhanHoaDon("C");
      await expect(contract.connect(seller).raiseDispute("C")).to.be.revertedWith(
        "Loi: Chi duoc khieu nai hoa don dang bi tu choi!"
      );

      await phatHanh("X");
      await contract.connect(seller).huyHoaDon("X");
      await expect(contract.connect(seller).raiseDispute("X")).to.be.revertedWith(
        "Loi: Chi duoc khieu nai hoa don dang bi tu choi!"
      );
    });

    it("không khiếu nại lần 2 khi đang Disputed", async function () {
      await tuChoi();
      await contract.connect(seller).raiseDispute(MA);
      await expect(contract.connect(seller).raiseDispute(MA)).to.be.revertedWith(
        "Loi: Chi duoc khieu nai hoa don dang bi tu choi!"
      );
    });
  });

  describe("resolveDispute (Disputed -> Confirmed | Rejected)", function () {
    beforeEach(async function () {
      await tuChoi();
      await contract.connect(seller).raiseDispute(MA);
    });

    it("Arbiter xác nhận -> Confirmed", async function () {
      await expect(contract.connect(arbiter).resolveDispute(MA, true))
        .to.emit(contract, "TrangThaiThayDoi")
        .withArgs(MA, TT.Disputed, TT.Confirmed, arbiter.address, "");
      expect(await contract.layTrangThai(MA)).to.equal(TT.Confirmed);
    });

    it("Arbiter bác bỏ -> Rejected, giữ nguyên lý do từ chối ban đầu", async function () {
      await expect(contract.connect(arbiter).resolveDispute(MA, false))
        .to.emit(contract, "TrangThaiThayDoi")
        .withArgs(MA, TT.Disputed, TT.Rejected, arbiter.address, "");
      const hd = await contract.traCuuHoaDon(MA);
      expect(hd.trangThai).to.equal(TT.Rejected);
      expect(hd.ghiChu).to.equal("Sai thong tin MST");
    });

    it("sau phán quyết Rejected, người bán không thể khiếu nại lại", async function () {
      await contract.connect(arbiter).resolveDispute(MA, false);
      await expect(contract.connect(seller).raiseDispute(MA)).to.be.revertedWith(
        "Loi: Hoa don da duoc dua ra tranh chap truoc do!"
      );
    });

    it("chỉ Arbiter được phán quyết", async function () {
      for (const s of [seller, buyer, owner, other]) {
        await expect(contract.connect(s).resolveDispute(MA, true)).to.be.revertedWith(
          "Loi: Chi Arbiter moi duoc thuc hien!"
        );
      }
    });

    it("không phán quyết hóa đơn không ở trạng thái Disputed", async function () {
      await phatHanh("P");
      await expect(contract.connect(arbiter).resolveDispute("P", true)).to.be.revertedWith(
        "Loi: Hoa don khong o trang thai Disputed!"
      );
      await contract.connect(arbiter).resolveDispute(MA, true);
      // đã phán quyết xong, không phán quyết lại
      await expect(contract.connect(arbiter).resolveDispute(MA, false)).to.be.revertedWith(
        "Loi: Hoa don khong o trang thai Disputed!"
      );
    });

    it("báo lỗi khi mã không tồn tại", async function () {
      await expect(contract.connect(arbiter).resolveDispute("KHONG-CO", true)).to.be.revertedWith(
        "Loi: Khong tim thay hoa don voi ma so nay!"
      );
    });

    it("Arbiter không được là bên liên quan của hóa đơn (xung đột lợi ích)", async function () {
      // owner đổi Arbiter thành chính người bán của hóa đơn đang tranh chấp
      await contract.setArbiter(seller.address);
      await expect(contract.connect(seller).resolveDispute(MA, true)).to.be.revertedWith(
        "Loi: Arbiter khong duoc la ben lien quan cua hoa don!"
      );
      // ... hoặc chính người mua
      await contract.setArbiter(buyer.address);
      await expect(contract.connect(buyer).resolveDispute(MA, false)).to.be.revertedWith(
        "Loi: Arbiter khong duoc la ben lien quan cua hoa don!"
      );
    });
  });

  describe("truy vấn", function () {
    it("traCuuHoaDon báo lỗi khi không tìm thấy", async function () {
      await expect(contract.traCuuHoaDon("KHONG-CO")).to.be.revertedWith(
        "Loi: Khong tim thay hoa don voi ma so nay!"
      );
      await expect(contract.layTrangThai("KHONG-CO")).to.be.revertedWith(
        "Loi: Khong tim thay hoa don voi ma so nay!"
      );
    });

    it("danh sách mã và tổng số hóa đơn", async function () {
      await phatHanh("A");
      await phatHanh("B");
      expect(await contract.layTongSoHoaDon()).to.equal(2n);
      expect(await contract.layDanhSachMaHoaDon()).to.deep.equal(["A", "B"]);
    });

    it("hóa đơn độc lập nhau: đổi trạng thái hóa đơn này không ảnh hưởng hóa đơn khác", async function () {
      await phatHanh("A");
      await phatHanh("B");
      await contract.connect(buyer).xacNhanHoaDon("A");
      expect(await contract.layTrangThai("A")).to.equal(TT.Confirmed);
      expect(await contract.layTrangThai("B")).to.equal(TT.Pending);
    });
  });

  describe("kịch bản đầy đủ", function () {
    it("Pending -> Rejected -> Disputed -> Confirmed", async function () {
      await tuChoi();
      await contract.connect(seller).raiseDispute(MA);
      await contract.connect(arbiter).resolveDispute(MA, true);
      const hd = await contract.traCuuHoaDon(MA);
      expect(hd.trangThai).to.equal(TT.Confirmed);
    });
  });
});
