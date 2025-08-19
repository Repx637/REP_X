import { useEffect, useMemo, useState } from "react";
import { Dumbbell, ShoppingCart, X, Minus, Plus, Trash2, Loader2, ShieldCheck, Truck, IndianRupee, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * repX — Gym T‑Shirt Store (Single‑file demo)
 * - Cart with size selection
 * - Persistent cart via localStorage
 * - Razorpay Checkout (test-ready; set NEXT_PUBLIC_RAZORPAY_KEY_ID)
 * - Coupon demo (REPX10 = 10% off)
 * - Clean, mobile-first UI with Tailwind + shadcn
 */

const CURRENCY = "₹";
const COUPON_CODE = "REPX10"; // 10% off demo

const CATALOG = [
  { id: 1, name: "Beast Mode Tee", price: 899, image: "/images/beastmode.jpg", colors: ["Black", "Charcoal"], tags: ["Best Seller"] },
  { id: 2, name: "No Pain No Gain Tee", price: 799, image: "/images/nopain.jpg", colors: ["White", "Navy"], tags: ["Trending"] },
  { id: 3, name: "One More Rep Tee", price: 849, image: "/images/onemore.jpg", colors: ["Black"], tags: [] },
  { id: 4, name: "King of Gains Tee", price: 999, image: "/images/king.jpg", colors: ["Black", "Olive"], tags: ["New"] },
  { id: 5, name: "Old School Iron Tee", price: 899, image: "/images/oldschool.jpg", colors: ["Grey"], tags: [] },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

function formatInr(n) {
  try {
    return new Intl.NumberFormat("en-IN").format(n);
  } catch {
    return String(n);
  }
}

export default function RepXStore() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [loadingPay, setLoadingPay] = useState(false);
  const [coupon, setCoupon] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("repx_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("repx_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const discount = useMemo(() => (coupon.trim().toUpperCase() === COUPON_CODE ? Math.round(subtotal * 0.1) : 0), [coupon, subtotal]);
  const shipping = useMemo(() => (subtotal > 1499 ? 0 : subtotal > 0 ? 49 : 0), [subtotal]);
  const total = Math.max(subtotal - discount + shipping, 0);

  const addToCart = (product, size = "L", color = product.colors?.[0] || "Black") => {
    setCart((c) => {
      const existingIdx = c.findIndex((x) => x.id === product.id && x.size === size && x.color === color);
      if (existingIdx >= 0) {
        const copy = [...c];
        copy[existingIdx] = { ...copy[existingIdx], qty: copy[existingIdx].qty + 1 };
        return copy;
      }
      return [...c, { id: product.id, name: product.name, price: product.price, image: product.image, size, color, qty: 1 }];
    });
  };

  const updateQty = (idx, delta) => {
    setCart((c) => {
      const copy = [...c];
      copy[idx].qty = Math.max(1, copy[idx].qty + delta);
      return copy;
    });
  };

  const removeItem = (idx) => setCart((c) => c.filter((_, i) => i !== idx));
  const clearCart = () => setCart([]);

  const handleCheckout = async () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (globalThis as any).NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      alert("Add NEXT_PUBLIC_RAZORPAY_KEY_ID to use live checkout. Proceeding with demo order...");
    }
    if (!total) return;

    const options = {
      key: key || "rzp_test_xxxxxxxx", // demo key fallback
      amount: total * 100, // paise
      currency: "INR",
      name: "repX",
      description: "repX Order",
      image: "/favicon.ico",
      handler: function (response) {
        alert(`Payment success! Payment ID: ${response.razorpay_payment_id || "demo"}`);
        clearCart();
        setCartOpen(false);
      },
      prefill: { name: "repX Customer", email: "customer@example.com", contact: "9999999999" },
      notes: { brand: "repX" },
      theme: { color: "#111827" },
    };

    try {
      setLoadingPay(true);
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Unable to open checkout. Please try again.");
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex justify-between items-center p-4 sm:p-6 bg-black text-white shadow">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6" />
          <h1 className="text-2xl font-extrabold tracking-tight">repX</h1>
          <Badge variant="secondary" className="ml-2">Gym Wear</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setCartOpen(true)} className="rounded-2xl">
            <ShoppingCart className="mr-2 w-4 h-4" /> Cart ({cart.reduce((s, i) => s + i.qty, 0)})
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-14 bg-gradient-to-r from-gray-900 to-black text-white">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Fuel Your Grind with repX</h2>
        <p className="max-w-xl mx-auto opacity-90 mb-6">Premium gym T‑shirts engineered for sweat, stretch and style. Free shipping over {CURRENCY}{formatInr(1499)}.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="px-6 py-6 text-base rounded-2xl">Shop Now</Button>
          <Button variant="outline" className="px-6 py-6 text-base rounded-2xl bg-white text-black" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="mr-2 w-4 h-4" /> View Cart
          </Button>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATALOG.map((p) => (
          <Card key={p.id} className="shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-64 object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {p.tags?.map((t) => (
                    <Badge key={t} className="bg-white/90 text-black">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-3">Ultra-soft, breathable cotton blend. Athletic fit.</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-lg">{CURRENCY}{formatInr(p.price)}</div>
                  <div className="flex gap-1">
                    {p.colors?.map((c) => (
                      <span key={c} title={c} className="w-5 h-5 rounded-full border border-black/10 inline-block" style={{ background: c.toLowerCase() }}></span>
                    ))}
                  </div>
                </div>
                <SizeAndAdd onAdd={(size, color) => addToCart(p, size, color)} colors={p.colors} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Trust bar */}
      <section className="px-6 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow"><ShieldCheck /> <div><p className="font-semibold">Premium Quality</p><p className="text-sm text-gray-600">Durable prints. 240 GSM cotton blend.</p></div></div>
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow"><Truck /> <div><p className="font-semibold">Fast Shipping</p><p className="text-sm text-gray-600">Pan‑India delivery, COD available.</p></div></div>
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow"><CreditCard /> <div><p className="font-semibold">Secure Checkout</p><p className="text-sm text-gray-600">Razorpay UPI / Cards / Wallets.</p></div></div>
      </section>

      {/* Footer */}
      <footer className="p-6 bg-black text-white text-center mt-12">
        <p className="font-semibold">© {new Date().getFullYear()} repX. All rights reserved.</p>
        <p className="text-xs opacity-70 mt-1">Made for athletes by athletes.</p>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Your Cart</h3>
              <Button variant="ghost" onClick={() => setCartOpen(false)}><X /></Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty. Add some tees!</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-3 items-center border-b py-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-500">Size {item.size} · {item.color}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Button size="icon" variant="outline" onClick={() => updateQty(idx, -1)} className="rounded-full"><Minus className="w-4 h-4" /></Button>
                        <span className="min-w-[24px] text-center">{item.qty}</span>
                        <Button size="icon" variant="outline" onClick={() => updateQty(idx, 1)} className="rounded-full"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{CURRENCY}{formatInr(item.price * item.qty)}</div>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>{CURRENCY}{formatInr(subtotal)}</span></div>
              <div className="flex items-center justify-between text-sm"><span>Shipping</span><span>{shipping ? `${CURRENCY}${formatInr(shipping)}` : "FREE"}</span></div>
              <div className="flex items-center justify-between text-sm"><span>Discount</span><span className={discount?"text-green-600":""}>{discount?`- ${CURRENCY}${formatInr(discount)}`:"—"}</span></div>
              <div className="flex items-center justify-between font-bold text-lg"><span>Total</span><span>{CURRENCY}{formatInr(total)}</span></div>

              <div className="flex gap-2">
                <Input placeholder={`Coupon (try ${COUPON_CODE})`} value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                <Button variant="outline" onClick={() => setCoupon(COUPON_CODE)}>Apply</Button>
              </div>

              <Button disabled={!cart.length || loadingPay} onClick={handleCheckout} className="w-full rounded-2xl py-6 text-base flex items-center justify-center gap-2">
                {loadingPay ? <Loader2 className="w-5 h-5 animate-spin" /> : <IndianRupee className="w-5 h-5" />} {loadingPay ? "Opening Checkout..." : "Checkout with Razorpay"}
              </Button>
              <Button variant="outline" onClick={clearCart} disabled={!cart.length} className="w-full rounded-2xl">Clear Cart</Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SizeAndAdd({ onAdd, colors = ["Black"] }) {
  const [size, setSize] = useState("L");
  const [color, setColor] = useState(colors[0] || "Black");
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-1">Size</p>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`px-3 py-1 rounded-full border ${size === s ? "bg-black text-white" : "bg-white"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-1">Color</p>
        <div className="flex gap-2 items-center">
          {colors.map((c) => (
            <button key={c} onClick={() => setColor(c)} title={c} className={`w-7 h-7 rounded-full border ${color === c ? "ring-2 ring-black" : ""}`} style={{ background: c.toLowerCase() }} />
          ))}
        </div>
      </div>
      <Button onClick={() => onAdd(size, color)} className="w-full rounded-2xl">Add to Cart</Button>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Dumbbell, ShoppingCart, X, Minus, Plus, Trash2, Loader2, ShieldCheck, Truck, IndianRupee, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * repX — Gym T‑Shirt Store (Single‑file demo)
 * - Cart with size selection
 * - Persistent cart via localStorage
 * - Razorpay Checkout (test-ready; set NEXT_PUBLIC_RAZORPAY_KEY_ID)
 * - Coupon demo (REPX10 = 10% off)
 * - Clean, mobile-first UI with Tailwind + shadcn
 */

const CURRENCY = "₹";
const COUPON_CODE = "REPX10"; // 10% off demo

const CATALOG = [
  { id: 1, name: "Beast Mode Tee", price: 899, image: "/images/beastmode.jpg", colors: ["Black", "Charcoal"], tags: ["Best Seller"] },
  { id: 2, name: "No Pain No Gain Tee", price: 799, image: "/images/nopain.jpg", colors: ["White", "Navy"], tags: ["Trending"] },
  { id: 3, name: "One More Rep Tee", price: 849, image: "/images/onemore.jpg", colors: ["Black"], tags: [] },
  { id: 4, name: "King of Gains Tee", price: 999, image: "/images/king.jpg", colors: ["Black", "Olive"], tags: ["New"] },
  { id: 5, name: "Old School Iron Tee", price: 899, image: "/images/oldschool.jpg", colors: ["Grey"], tags: [] },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

function formatInr(n) {
  try {
    return new Intl.NumberFormat("en-IN").format(n);
  } catch {
    return String(n);
  }
}

export default function RepXStore() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [loadingPay, setLoadingPay] = useState(false);
  const [coupon, setCoupon] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("repx_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("repx_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const discount = useMemo(() => (coupon.trim().toUpperCase() === COUPON_CODE ? Math.round(subtotal * 0.1) : 0), [coupon, subtotal]);
  const shipping = useMemo(() => (subtotal > 1499 ? 0 : subtotal > 0 ? 49 : 0), [subtotal]);
  const total = Math.max(subtotal - discount + shipping, 0);

  const addToCart = (product, size = "L", color = product.colors?.[0] || "Black") => {
    setCart((c) => {
      const existingIdx = c.findIndex((x) => x.id === product.id && x.size === size && x.color === color);
      if (existingIdx >= 0) {
        const copy = [...c];
        copy[existingIdx] = { ...copy[existingIdx], qty: copy[existingIdx].qty + 1 };
        return copy;
      }
      return [...c, { id: product.id, name: product.name, price: product.price, image: product.image, size, color, qty: 1 }];
    });
  };

  const updateQty = (idx, delta) => {
    setCart((c) => {
      const copy = [...c];
      copy[idx].qty = Math.max(1, copy[idx].qty + delta);
      return copy;
    });
  };

  const removeItem = (idx) => setCart((c) => c.filter((_, i) => i !== idx));
  const clearCart = () => setCart([]);

  const handleCheckout = async () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (globalThis as any).NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      alert("Add NEXT_PUBLIC_RAZORPAY_KEY_ID to use live checkout. Proceeding with demo order...");
    }
    if (!total) return;

    const options = {
      key: key || "rzp_test_xxxxxxxx", // demo key fallback
      amount: total * 100, // paise
      currency: "INR",
      name: "repX",
      description: "repX Order",
      image: "/favicon.ico",
      handler: function (response) {
        alert(`Payment success! Payment ID: ${response.razorpay_payment_id || "demo"}`);
        clearCart();
        setCartOpen(false);
      },
      prefill: { name: "repX Customer", email: "customer@example.com", contact: "9999999999" },
      notes: { brand: "repX" },
      theme: { color: "#111827" },
    };

    try {
      setLoadingPay(true);
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Unable to open checkout. Please try again.");
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex justify-between items-center p-4 sm:p-6 bg-black text-white shadow">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6" />
          <h1 className="text-2xl font-extrabold tracking-tight">repX</h1>
          <Badge variant="secondary" className="ml-2">Gym Wear</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setCartOpen(true)} className="rounded-2xl">
            <ShoppingCart className="mr-2 w-4 h-4" /> Cart ({cart.reduce((s, i) => s + i.qty, 0)})
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-14 bg-gradient-to-r from-gray-900 to-black text-white">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Fuel Your Grind with repX</h2>
        <p className="max-w-xl mx-auto opacity-90 mb-6">Premium gym T‑shirts engineered for sweat, stretch and style. Free shipping over {CURRENCY}{formatInr(1499)}.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="px-6 py-6 text-base rounded-2xl">Shop Now</Button>
          <Button variant="outline" className="px-6 py-6 text-base rounded-2xl bg-white text-black" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="mr-2 w-4 h-4" /> View Cart
          </Button>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATALOG.map((p) => (
          <Card key={p.id} className="shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-64 object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {p.tags?.map((t) => (
                    <Badge key={t} className="bg-white/90 text-black">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-3">Ultra-soft, breathable cotton blend. Athletic fit.</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-lg">{CURRENCY}{formatInr(p.price)}</div>
                  <div className="flex gap-1">
                    {p.colors?.map((c) => (
                      <span key={c} title={c} className="w-5 h-5 rounded-full border border-black/10 inline-block" style={{ background: c.toLowerCase() }}></span>
                    ))}
                  </div>
                </div>
                <SizeAndAdd onAdd={(size, color) => addToCart(p, size, color)} colors={p.colors} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Trust bar */}
      <section className="px-6 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow"><ShieldCheck /> <div><p className="font-semibold">Premium Quality</p><p className="text-sm text-gray-600">Durable prints. 240 GSM cotton blend.</p></div></div>
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow"><Truck /> <div><p className="font-semibold">Fast Shipping</p><p className="text-sm text-gray-600">Pan‑India delivery, COD available.</p></div></div>
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow"><CreditCard /> <div><p className="font-semibold">Secure Checkout</p><p className="text-sm text-gray-600">Razorpay UPI / Cards / Wallets.</p></div></div>
      </section>

      {/* Footer */}
      <footer className="p-6 bg-black text-white text-center mt-12">
        <p className="font-semibold">© {new Date().getFullYear()} repX. All rights reserved.</p>
        <p className="text-xs opacity-70 mt-1">Made for athletes by athletes.</p>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Your Cart</h3>
              <Button variant="ghost" onClick={() => setCartOpen(false)}><X /></Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty. Add some tees!</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-3 items-center border-b py-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-500">Size {item.size} · {item.color}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Button size="icon" variant="outline" onClick={() => updateQty(idx, -1)} className="rounded-full"><Minus className="w-4 h-4" /></Button>
                        <span className="min-w-[24px] text-center">{item.qty}</span>
                        <Button size="icon" variant="outline" onClick={() => updateQty(idx, 1)} className="rounded-full"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{CURRENCY}{formatInr(item.price * item.qty)}</div>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>{CURRENCY}{formatInr(subtotal)}</span></div>
              <div className="flex items-center justify-between text-sm"><span>Shipping</span><span>{shipping ? `${CURRENCY}${formatInr(shipping)}` : "FREE"}</span></div>
              <div className="flex items-center justify-between text-sm"><span>Discount</span><span className={discount?"text-green-600":""}>{discount?`- ${CURRENCY}${formatInr(discount)}`:"—"}</span></div>
              <div className="flex items-center justify-between font-bold text-lg"><span>Total</span><span>{CURRENCY}{formatInr(total)}</span></div>

              <div className="flex gap-2">
                <Input placeholder={`Coupon (try ${COUPON_CODE})`} value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                <Button variant="outline" onClick={() => setCoupon(COUPON_CODE)}>Apply</Button>
              </div>

              <Button disabled={!cart.length || loadingPay} onClick={handleCheckout} className="w-full rounded-2xl py-6 text-base flex items-center justify-center gap-2">
                {loadingPay ? <Loader2 className="w-5 h-5 animate-spin" /> : <IndianRupee className="w-5 h-5" />} {loadingPay ? "Opening Checkout..." : "Checkout with Razorpay"}
              </Button>
              <Button variant="outline" onClick={clearCart} disabled={!cart.length} className="w-full rounded-2xl">Clear Cart</Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SizeAndAdd({ onAdd, colors = ["Black"] }) {
  const [size, setSize] = useState("L");
  const [color, setColor] = useState(colors[0] || "Black");
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-1">Size</p>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`px-3 py-1 rounded-full border ${size === s ? "bg-black text-white" : "bg-white"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-1">Color</p>
        <div className="flex gap-2 items-center">
          {colors.map((c) => (
            <button key={c} onClick={() => setColor(c)} title={c} className={`w-7 h-7 rounded-full border ${color === c ? "ring-2 ring-black" : ""}`} style={{ background: c.toLowerCase() }} />
          ))}
        </div>
      </div>
      <Button onClick={() => onAdd(size, color)} className="w-full rounded-2xl">Add to Cart</Button>
    </div>
  );
}
