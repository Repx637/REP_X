import { useState } from "react";
import { ShoppingCart, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RepX() {
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: "Beast Mode Tee", price: 899, image: "/images/beastmode.jpg" },
    { id: 2, name: "No Pain No Gain Tee", price: 799, image: "/images/nopain.jpg" },
    { id: 3, name: "One More Rep Tee", price: 849, image: "/images/onemore.jpg" },
    { id: 4, name: "King of Gains Tee", price: 999, image: "/images/king.jpg" },
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const checkoutHandler = async () => {
    if (cart.length === 0) return alert("Your cart is empty");

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: total * 100, // amount in paise
      currency: "INR",
      name: "repX Store",
      description: "Purchase T-Shirts",
      image: "/images/logo.png",
      handler: function (response) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        setCart([]);
      },
      prefill: {
        name: "repX Customer",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#000000",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-black text-white shadow-md">
        <div className="flex items-center space-x-2">
          <Dumbbell size={28} />
          <h1 className="text-2xl font-bold">repX</h1>
        </div>
        <Button variant="outline" className="text-black bg-white" onClick={checkoutHandler}>
          <ShoppingCart className="mr-2" /> Cart ({cart.length})
        </Button>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <h2 className="text-4xl font-bold mb-4">Welcome to repX</h2>
        <p className="text-lg mb-6">Premium Gym T-Shirts for Athletes & Fitness Enthusiasts</p>
        <Button className="px-6 py-3 text-lg rounded-2xl">Shop Now</Button>
      </section>

      {/* Product Grid */}
      <section className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-lg font-bold mb-3">₹{product.price}</p>
              <Button onClick={() => addToCart(product)} className="w-full">
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Footer */}
      <footer className="p-6 bg-black text-white text-center mt-12">
        <p>© 2025 repX. All rights reserved.</p>
      </footer>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
