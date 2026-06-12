export type CartItem = {
  productId: number;
  name: string;
  option: string;
  image: string;
  price: number;
  qty: number;
  checked: boolean;
};

const STORAGE_KEY = "cozycare_cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (it): it is CartItem =>
        typeof it === "object" &&
        it !== null &&
        typeof (it as CartItem).productId === "number" &&
        typeof (it as CartItem).qty === "number"
    );
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(item: Omit<CartItem, "checked">): CartItem[] {
  const items = read();
  const existing = items.find(
    (it) => it.productId === item.productId && it.option === item.option
  );
  if (existing) {
    existing.qty += item.qty;
  } else {
    items.push({ ...item, checked: true });
  }
  write(items);
  return items;
}

export function setQty(productId: number, option: string, qty: number): CartItem[] {
  const items = read();
  const target = items.find((it) => it.productId === productId && it.option === option);
  if (target) target.qty = Math.max(1, qty);
  write(items);
  return items;
}

export function removeItem(productId: number, option: string): CartItem[] {
  const items = read().filter(
    (it) => !(it.productId === productId && it.option === option)
  );
  write(items);
  return items;
}

export function setChecked(productId: number, option: string, checked: boolean): CartItem[] {
  const items = read();
  const target = items.find((it) => it.productId === productId && it.option === option);
  if (target) target.checked = checked;
  write(items);
  return items;
}

export function setAllChecked(checked: boolean): CartItem[] {
  const items = read().map((it) => ({ ...it, checked }));
  write(items);
  return items;
}

export function removeChecked(): CartItem[] {
  const items = read().filter((it) => !it.checked);
  write(items);
  return items;
}

export function clearCart(): void {
  write([]);
}
