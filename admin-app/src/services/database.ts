import * as SQLite from 'expo-sqlite';

// ─── Primary database (synced data) ───────────────────────────────────────────
let db: SQLite.SQLiteDatabase | null = null;

// ─── Local-storage database (device-only data) ────────────────────────────────
let localDb: SQLite.SQLiteDatabase | null = null;

// Khởi tạo Database và các bảng
// expo-sqlite v56 tự quản lý thư mục DB — không cần tạo thư mục thủ công
export const initDB = async () => {
  try {
    console.log('--- STARTING SQLITE INITIALIZATION ---');

    if (!db) {
      db = await SQLite.openDatabaseAsync('CoffeeShop.db');
      console.log('Database opened at:', (db as any).databasePath ?? 'CoffeeShop.db');
    }

    // Tạo bảng MonAn
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS monan (
        id TEXT PRIMARY KEY,
        maMonAn TEXT,
        tenMonAn TEXT,
        gia REAL,
        hinhAnh TEXT,
        danhMuc TEXT,
        moTa TEXT,
        trangThai TEXT
      );
    `);

    // Tạo bảng BanAn
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS banan (
        id TEXT PRIMARY KEY,
        maBan TEXT,
        tenBan TEXT,
        trangThai TEXT
      );
    `);

    // Tạo bảng LoaiMonAn (Danh mục món ăn)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS loai_mon_an (
        id TEXT PRIMARY KEY,
        idLoai INTEGER UNIQUE,
        tenLoai TEXT NOT NULL,
        moTa TEXT
      );
    `);

    // Tạo bảng KhuyenMai (Khuyến mãi)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS khuyen_mai (
        id TEXT PRIMARY KEY,
        idKhuyenMai INTEGER UNIQUE,
        tenKM TEXT,
        loaiKM TEXT,
        giaTridonToiThieu REAL,
        ngayBatDau TEXT,
        ngayKetThuc TEXT,
        trangThai INTEGER,
        ghiChu TEXT
      );
    `);

    // Tạo bảng DonHang (chỉ lưu đơn đang hoạt động)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS don_hang (
        id TEXT PRIMARY KEY,
        idDonHang INTEGER UNIQUE,
        idGioHang INTEGER,
        idKhuyenMai INTEGER,
        ghiChu TEXT,
        tongTien REAL,
        trangThai INTEGER,
        thoiGian TEXT
      );
    `);

    // Tạo bảng ChiTietDon (chi tiết đơn hàng đang hoạt động)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chi_tiet_don (
        id TEXT PRIMARY KEY,
        idChiTiet INTEGER UNIQUE,
        idDonHang INTEGER,
        idNV INTEGER,
        soLuong INTEGER,
        donGia REAL,
        thanhTien REAL,
        ghiChu TEXT,
        trangThai INTEGER
      );
    `);

    console.log('Database and tables initialized successfully');

    // ── Khởi tạo Local Database ───────────────────────────────────────────────
    await initLocalDB();

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('CoffeeShop.db');
  }
  return db;
};


// ─── Local Database (CoffeeShopLocal.db) ─────────────────────────────────────
// Dùng để lưu dữ liệu cục bộ trên thiết bị (không đồng bộ với server)

export const initLocalDB = async () => {
  try {
    if (!localDb) {
      localDb = await SQLite.openDatabaseAsync('CoffeeShopLocal.db');
      console.log('Local database opened at:', (localDb as any).databasePath ?? 'CoffeeShopLocal.db');
    }

    // Tạo bảng NhanVien (nhân viên - cache cục bộ)
    await localDb.execAsync(`
      CREATE TABLE IF NOT EXISTS nhan_vien (
        id TEXT PRIMARY KEY,
        idNV INTEGER UNIQUE,
        tenNV TEXT,
        chucVu TEXT,
        soDienThoai TEXT,
        email TEXT,
        trangThai INTEGER
      );
    `);

    console.log('Local database and tables initialized successfully');
  } catch (error) {
    console.error('Error initializing local database:', error);
    throw error;
  }
};

export const getLocalDB = async () => {
  if (!localDb) {
    localDb = await SQLite.openDatabaseAsync('CoffeeShopLocal.db');
  }
  return localDb;
};


// NhanVien (Nhân viên - Local only)


export const syncNhanVien = async (nhanVienList: any[]) => {
  const database = await getLocalDB();
  try {
    const statement = await database.prepareAsync(
      `INSERT OR REPLACE INTO nhan_vien
        (id, idNV, tenNV, chucVu, soDienThoai, email, trangThai)
       VALUES
        ($id, $idNV, $tenNV, $chucVu, $soDienThoai, $email, $trangThai)`
    );

    await database.withTransactionAsync(async () => {
      await database.execAsync('DELETE FROM nhan_vien;');
      for (const item of nhanVienList) {
        await statement.executeAsync({
          $id: item._id || item.id || String(item.idNV),
          $idNV: item.idNV || 0,
          $tenNV: item.tenNV || '',
          $chucVu: item.chucVu || '',
          $soDienThoai: item.soDienThoai || '',
          $email: item.email || '',
          $trangThai: item.trangThai ?? 1,
        });
      }
    });

    await statement.finalizeAsync();
    console.log('Sync NhanVien to CoffeeShopLocal.db complete!');
  } catch (error) {
    console.error('Error syncing NhanVien:', error);
  }
};

export const getLocalNhanVien = async () => {
  const database = await getLocalDB();
  try {
    return await database.getAllAsync(
      'SELECT * FROM nhan_vien WHERE trangThai = 1 ORDER BY idNV ASC'
    );
  } catch (error) {
    console.error('Error fetching NhanVien from CoffeeShopLocal.db:', error);
    return [];
  }
};


// Món Ăn


export const syncMonAn = async (monAnList: any[]) => {
  const database = await getDB();
  try {
    const statement = await database.prepareAsync(
      'INSERT OR REPLACE INTO monan (id, maMonAn, tenMonAn, gia, hinhAnh, danhMuc, moTa, trangThai) VALUES ($id, $maMonAn, $tenMonAn, $gia, $hinhAnh, $danhMuc, $moTa, $trangThai)'
    );

    await database.withTransactionAsync(async () => {
      await database.execAsync('DELETE FROM monan;');
      for (const item of monAnList) {
        await statement.executeAsync({
          $id: item.id || item._id || '',
          $maMonAn: item.maMonAn || '',
          $tenMonAn: item.tenMonAn || '',
          $gia: item.gia || 0,
          $hinhAnh: item.hinhAnh || item.image || '',
          $danhMuc: item.danhMuc || item.idLoai?.toString() || '',
          $moTa: item.moTa || '',
          $trangThai: item.trangThai || 'CO_SAN',
        });
      }
    });

    await statement.finalizeAsync();
    console.log('Sync MonAn to SQLite complete!');
  } catch (error) {
    console.error('Error syncing MonAn:', error);
  }
};

export const getLocalMonAn = async () => {
  const database = await getDB();
  try {
    return await database.getAllAsync('SELECT * FROM monan');
  } catch (error) {
    console.error('Error fetching MonAn from SQLite:', error);
    return [];
  }
};

// Bàn Ăn


export const syncBanAn = async (banAnList: any[]) => {
  const database = await getDB();
  try {
    const statement = await database.prepareAsync(
      'INSERT OR REPLACE INTO banan (id, maBan, tenBan, trangThai) VALUES ($id, $maBan, $tenBan, $trangThai)'
    );

    await database.withTransactionAsync(async () => {
      await database.execAsync('DELETE FROM banan;');
      for (const item of banAnList) {
        await statement.executeAsync({
          $id: item.id || item._id || '',
          $maBan: item.maBan || item.idBan?.toString() || '',
          $tenBan: item.tenBan || '',
          $trangThai: item.trangThai?.toString() || 'TRONG',
        });
      }
    });

    await statement.finalizeAsync();
    console.log('Sync BanAn to SQLite complete!');
  } catch (error) {
    console.error('Error syncing BanAn:', error);
  }
};

export const getLocalBanAn = async () => {
  const database = await getDB();
  try {
    return await database.getAllAsync('SELECT * FROM banan ORDER BY tenBan ASC');
  } catch (error) {
    console.error('Error fetching BanAn from SQLite:', error);
    return [];
  }
};


// Loại Món Ăn (Danh mục)


export const syncLoaiMonAn = async (loaiList: any[]) => {
  const database = await getDB();
  try {
    const statement = await database.prepareAsync(
      'INSERT OR REPLACE INTO loai_mon_an (id, idLoai, tenLoai, moTa) VALUES ($id, $idLoai, $tenLoai, $moTa)'
    );

    await database.withTransactionAsync(async () => {
      await database.execAsync('DELETE FROM loai_mon_an;');
      for (const item of loaiList) {
        await statement.executeAsync({
          $id: item._id || item.id || String(item.idLoai),
          $idLoai: item.idLoai || 0,
          $tenLoai: item.tenLoai || '',
          $moTa: item.moTa || '',
        });
      }
    });

    await statement.finalizeAsync();
    console.log('Sync LoaiMonAn to SQLite complete!');
  } catch (error) {
    console.error('Error syncing LoaiMonAn:', error);
  }
};

export const getLocalLoaiMonAn = async () => {
  const database = await getDB();
  try {
    return await database.getAllAsync('SELECT * FROM loai_mon_an ORDER BY idLoai ASC');
  } catch (error) {
    console.error('Error fetching LoaiMonAn from SQLite:', error);
    return [];
  }
};


// Khuyến Mãi


export const syncKhuyenMai = async (kmList: any[]) => {
  const database = await getDB();
  try {
    const statement = await database.prepareAsync(
      `INSERT OR REPLACE INTO khuyen_mai
        (id, idKhuyenMai, tenKM, loaiKM, giaTridonToiThieu, ngayBatDau, ngayKetThuc, trangThai, ghiChu)
       VALUES
        ($id, $idKhuyenMai, $tenKM, $loaiKM, $giaTridonToiThieu, $ngayBatDau, $ngayKetThuc, $trangThai, $ghiChu)`
    );

    await database.withTransactionAsync(async () => {
      await database.execAsync('DELETE FROM khuyen_mai;');
      for (const item of kmList) {
        await statement.executeAsync({
          $id: item._id || item.id || String(item.idKhuyenMai),
          $idKhuyenMai: item.idKhuyenMai || 0,
          $tenKM: item.tenKM || '',
          $loaiKM: item.loaiKM || '',
          $giaTridonToiThieu: item.giaTridonToiThieu || 0,
          $ngayBatDau: item.ngayBatDau || '',
          $ngayKetThuc: item.ngayKetThuc || '',
          $trangThai: item.trangThai ?? 1,
          $ghiChu: item.ghiChu || '',
        });
      }
    });

    await statement.finalizeAsync();
    console.log('Sync KhuyenMai to SQLite complete!');
  } catch (error) {
    console.error('Error syncing KhuyenMai:', error);
  }
};

export const getLocalKhuyenMai = async () => {
  const database = await getDB();
  try {
    // Chỉ trả về các khuyến mãi đang hoạt động (trangThai = 1)
    return await database.getAllAsync(
      'SELECT * FROM khuyen_mai WHERE trangThai = 1 ORDER BY idKhuyenMai ASC'
    );
  } catch (error) {
    console.error('Error fetching KhuyenMai from SQLite:', error);
    return [];
  }
};


// Đơn Hàng (chỉ lưu đơn đang xử lý - trangThai = 0)


export const syncDonHang = async (donHangList: any[]) => {
  const database = await getDB();
  try {
    const statement = await database.prepareAsync(
      `INSERT OR REPLACE INTO don_hang
        (id, idDonHang, idGioHang, idKhuyenMai, ghiChu, tongTien, trangThai, thoiGian)
       VALUES
        ($id, $idDonHang, $idGioHang, $idKhuyenMai, $ghiChu, $tongTien, $trangThai, $thoiGian)`
    );

    await database.withTransactionAsync(async () => {
      // Chỉ xóa và cập nhật đơn đang chờ xử lý
      await database.execAsync('DELETE FROM don_hang WHERE trangThai = 0;');
      const pendingOrders = donHangList.filter((item) => item.trangThai === 0);
      for (const item of pendingOrders) {
        await statement.executeAsync({
          $id: item._id || item.id || String(item.idDonHang),
          $idDonHang: item.idDonHang || 0,
          $idGioHang: item.idGioHang || 0,
          $idKhuyenMai: item.idKhuyenMai ?? null,
          $ghiChu: item.ghiChu || '',
          $tongTien: item.tongTien || 0,
          $trangThai: item.trangThai ?? 0,
          $thoiGian: item.thoiGian || '',
        });
      }
    });

    await statement.finalizeAsync();
    console.log(`Sync DonHang complete! (${donHangList.filter((i) => i.trangThai === 0).length} đơn đang xử lý)`);
  } catch (error) {
    console.error('Error syncing DonHang:', error);
  }
};

export const getLocalDonHang = async () => {
  const database = await getDB();
  try {
    return await database.getAllAsync(
      'SELECT * FROM don_hang WHERE trangThai = 0 ORDER BY idDonHang DESC'
    );
  } catch (error) {
    console.error('Error fetching DonHang from SQLite:', error);
    return [];
  }
};


// Chi Tiết Đơn


export const syncChiTietDon = async (chiTietList: any[]) => {
  const database = await getDB();
  try {
    const statement = await database.prepareAsync(
      `INSERT OR REPLACE INTO chi_tiet_don
        (id, idChiTiet, idDonHang, idNV, soLuong, donGia, thanhTien, ghiChu, trangThai)
       VALUES
        ($id, $idChiTiet, $idDonHang, $idNV, $soLuong, $donGia, $thanhTien, $ghiChu, $trangThai)`
    );

    await database.withTransactionAsync(async () => {
      await database.execAsync('DELETE FROM chi_tiet_don;');
      for (const item of chiTietList) {
        await statement.executeAsync({
          $id: item._id || item.id || String(item.idChiTiet),
          $idChiTiet: item.idChiTiet || 0,
          $idDonHang: item.idDonHang || 0,
          $idNV: item.idNV || 0,
          $soLuong: item.soLuong || 0,
          $donGia: item.donGiaThanhTien?.donGia || 0,
          $thanhTien: item.donGiaThanhTien?.thanhTien || 0,
          $ghiChu: item.ghiChu || '',
          $trangThai: item.trangThai ?? 0,
        });
      }
    });

    await statement.finalizeAsync();
    console.log('Sync ChiTietDon to SQLite complete!');
  } catch (error) {
    console.error('Error syncing ChiTietDon:', error);
  }
};

export const getLocalChiTietDon = async (idDonHang?: number) => {
  const database = await getDB();
  try {
    if (idDonHang !== undefined) {
      return await database.getAllAsync(
        'SELECT * FROM chi_tiet_don WHERE idDonHang = ? ORDER BY idChiTiet ASC',
        [idDonHang]
      );
    }
    return await database.getAllAsync(
      'SELECT * FROM chi_tiet_don ORDER BY idDonHang DESC, idChiTiet ASC'
    );
  } catch (error) {
    console.error('Error fetching ChiTietDon from SQLite:', error);
    return [];
  }
};
