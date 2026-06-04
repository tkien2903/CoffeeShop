export type AdminLoginResponse = {
  id: string;
  idAdmin: string;
  username: string;
  message?: string;
};

export type MonAn = {
  _id?: string;
  idMon: number;
  tenMon: string;
  idLoai: number;
  gia: number;
  image?: string;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const coffeeApi = {
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

  getBanAn() {
    return request<BanAn[]>('/api/ban-an');
  },

  getChiTietDonHang() {
    return request<ChiTietDonHang[]>('/api/chi-tiet-don');
  },
};
