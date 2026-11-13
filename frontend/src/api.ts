export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
};
export type ProductInput = Omit<Product, "id" | "createdAt">;
export type Paged<T> = { items: T[]; page: number; pageSize: number; total: number };
export type AuthResponse = { token: string; email: string };

const TOKEN_KEY = "shopfront.token";
const EMAIL_KEY = "shopfront.email";

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  email: () => localStorage.getItem(EMAIL_KEY),
  save: (a: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, a.token);
    localStorage.setItem(EMAIL_KEY, a.email);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = session.token();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...init, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? body.title ?? message;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  listProducts: (q: string, page: number, pageSize = 10) =>
    request<Paged<Product>>(`/products?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`),
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createProduct: (p: ProductInput) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(p) }),
  updateProduct: (id: number, p: ProductInput) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  deleteProduct: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),
};
