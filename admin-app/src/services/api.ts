export type AdminLoginResponse = {
  id: string;
  idAdmin: string;
  username: string;
  message?: string;
};

export type AuthUser = {
  id: string;
  employeeCode: number;
  username: string;
  displayName: string;
  rawRole: string;
  role: 'Admin' | 'Thu ngân' | 'Phục vụ' | string;
  workType: string;
  shift: string;
  loginAt: string;
  permissions: Record<string, boolean>;
};

export type MonAn = {
  _id?: string;
  idMon: number;
  tenMon: string;
  idLoai: number;
  gia: number;
  image?: string;
  soLuongTon?: number;
  mucCanhBao?: number;
};

export type MonAnInput = {
  tenMon: string;
  idLoai: number;
  gia: number;
  soLuongTon?: number;
  mucCanhBao?: number;
};

export type BanAn = {
  id?: string;
  idBan: number;
  tenBan?: string;
  maQR?: string;
  qrImageBase64?: string;
  trangThai?: number;
  ghiChu?: string;
};

export type ChiTietDonHang = {
  _id: string;
  idChiTiet: number;
  idDonHang: number;
  soLuong: number;
  trangThai: number;
  donGiaThanhTien?: {
    donGia: number;
    thanhTien: number;
  };
};

export type Employee = {
  id: string;
  idNV: number;
  hoVaTen: string;
  username: string;
  chucVu: string;
  hinhThuc: string;
  soDienThoai: string;
  trangThai: string;
  caLam?: string;
};

export type EmployeeInput = {
  hoVaTen: string;
  username: string;
  chucVu: string;
  hinhThuc: string;
  soDienThoai: string;
  matKhau?: string;
  caLam?: string;
};

export type RolePermission = {
  tenVaiTro: string;
  soNguoi: number;
  quyen: Record<string, boolean>;
};

export type LoaiMonAn = {
  idLoai: number;
  tenLoai: string;
  moTa?: string;
};

export type InventoryResponse = {
  tongNguyenLieu: number;
  nguyenLieuSapHet: number;
  nguyenLieuItems: NguyenLieuItem[];
};

export type NguyenLieuItem = {
  idNL: number;
  tenNguyenLieu: string;
  donViTinh: string;
  loai: string;
  soLuongTon: number;
  mucCanhBao: number;
  canhBao: boolean;
};

export type NguyenLieuInput = {
  tenNguyenLieu: string;
  donViTinh: string;
  loai: string;
  soLuongTon?: number;
  mucCanhBao?: number;
};

export type StockInput = {
  soLuongTon?: number;
  mucCanhBao?: number;
};

export type ReportResponse = {
  doanhThu: number;
  doanhThuDaThanhToan: number;
  soDon: number;
  trungBinhDon: number;
  choXuLy: number;
  daXacNhan: number;
  daHuy: number;
  doanhThuTheoGio: Record<string, number>;
  topSanPham: {
    tenMon: string;
    quantity: number;
    revenue: number;
  }[];
};

export type OrderHistory = {
  _id: string;
  idLichSu: number;
  idChiTiet: number;
  idDonHang: number;
  idBan: number;
  tongTienGoc: number;
  tienGiam: number;
  tongTienThanhToan: number;
  thoiGian: string | null;
  trangThai: number;
  items: { tenMon: string; soLuong: number }[];
};

const DEFAULT_API_BASE_URL =
  process.env.EXPO_OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseError(response: Response) {
  const text = await response.text().catch(() => '');

  if (!text) {
    return `Request failed with status ${response.status}`;
  }

  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    return json.message ?? json.error ?? text;
  } catch {
    return text;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(`Không kết nối được backend tại ${API_BASE_URL}`, 0);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export const coffeeApi = {
  login(username: string, matKhau: string) {
    const body = new URLSearchParams({ username, matKhau });

    return request<AuthUser>('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
  },

  loginAdmin(username: string, matKhau: string) {
    const body = new URLSearchParams({ username, matKhau });

    return request<AdminLoginResponse>('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
  },

  getMonAn() {
    return request<MonAn[]>('/api/mon-an');
  },

  getLoaiMonAn() {
    return request<LoaiMonAn[]>('/api/mon-an/loai');
  },

  createMonAn(payload: MonAnInput) {
    return request<MonAn>('/api/mon-an', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  updateMonAn(id: string, payload: MonAnInput) {
    return request<MonAn>(`/api/mon-an/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  deleteMonAn(id: string) {
    return request<void>(`/api/mon-an/${id}`, { method: 'DELETE' });
  },

  updateMonAnStock(idMon: number, payload: StockInput) {
    return request<unknown>(`/api/management/mon-an/${idMon}/ton-kho`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  getBanAn() {
    return request<BanAn[]>('/api/ban-an');
  },

  updateTableStatus(idBan: number, trangThai: number) {
    return request<void>(`/api/ban-an/${idBan}/trang-thai/${trangThai}`, { method: 'PUT' });
  },

  resetAllTables() {
    return request<void>('/api/ban-an/reset', { method: 'PUT' });
  },

  getChiTietDonHang() {
    return request<ChiTietDonHang[]>('/api/chi-tiet-don');
  },

  getEmployees() {
    return request<Employee[]>('/api/management/nhan-vien');
  },

  getEmployee(id: string) {
    return request<Employee>(`/api/management/nhan-vien/${id}`);
  },

  createEmployee(payload: EmployeeInput) {
    return request<Employee>('/api/management/nhan-vien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  updateEmployee(id: string, payload: EmployeeInput) {
    return request<Employee>(`/api/management/nhan-vien/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  deleteEmployee(id: string) {
    return request<void>(`/api/management/nhan-vien/${id}`, { method: 'DELETE' });
  },

  getRoles() {
    return request<RolePermission[]>('/api/management/phan-quyen');
  },

  updatePermission(tenVaiTro: string, tenQuyen: string, enabled: boolean) {
    return request<RolePermission>('/api/management/phan-quyen', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tenVaiTro, tenQuyen, enabled }),
    });
  },

  getInventory() {
    return request<InventoryResponse>('/api/management/kho');
  },

  getNguyenLieu() {
    return request<NguyenLieuItem[]>('/api/management/nguyen-lieu');
  },

  createNguyenLieu(payload: NguyenLieuInput) {
    return request<NguyenLieuItem>('/api/management/nguyen-lieu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  updateNguyenLieuStock(idNL: number, payload: StockInput) {
    return request<NguyenLieuItem>(`/api/management/ton-kho/${idNL}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  getReport() {
    return request<ReportResponse>('/api/management/bao-cao');
  },

  getOrderHistory() {
    return request<OrderHistory[]>('/api/management/lich-su-don-hang');
  },
};
