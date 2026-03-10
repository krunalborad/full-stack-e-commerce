import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

/* ===================== APP ===================== */
export default function App() {
  return (
    <BrowserRouter>
      <Shop />
    </BrowserRouter>
  );
}

/* ===================== SHOP ===================== */
function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartHighlight, setCartHighlight] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    fetch("https://full-stack-e-commerce-gkn4.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      return found
        ? prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...product, quantity: 1 }];
    });

    setCartHighlight(true);
    setTimeout(() => setCartHighlight(false), 400);
  };

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      {/* HEADER */}
      <header
        style={{
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
          background: "#131921",
          color: "white",
        }}
      >
        <Link to="/" style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>
          MyShop
        </Link>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "50%",
              padding: "8px 12px",
              borderRadius: 4,
              border: "none",
              outline: "none",
            }}
          />
        </div>

        <Link to="/admin" style={{ color: "white", fontSize: 14 }}>
          Admin
        </Link>

        <Link
          to="/cart"
          style={{
            position: "relative",
            padding: "6px 12px",
            borderRadius: 6,
            background: cartHighlight ? "#facc15" : "transparent",
            color: cartHighlight ? "black" : "white",
          }}
        >
          🛒 Cart
          {totalItems > 0 && (
            <span
              style={{
                position: "absolute",
                top: -8,
                right: -12,
                background: "#facc15",
                color: "black",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {totalItems}
            </span>
          )}
        </Link>
      </header>

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <p style={{ padding: 24 }}>Loading products...</p>
            ) : (
              <Products
                products={products.filter((p) =>
                  p.name.toLowerCase().includes(search.toLowerCase())
                )}
                addToCart={addToCart}
              />
            )
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              removeFromCart={removeFromCart}
              total={total}
            />
          }
        />

        <Route
          path="/address"
          element={
            <Address
              cartItems={cartItems}
              total={total}
              clearCart={clearCart}
            />
          }
        />

        <Route path="/success" element={<OrderSuccess />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  );
}

/* ===================== PRODUCTS ===================== */
function Products({ products, addToCart }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>Products</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              padding: 16,
              textAlign: "center",
            }}
          >
            <img src={p.image} alt={p.name} style={{ height: 120 }} />
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>

            <button
              onClick={() => addToCart(p)}
              style={{
                background: "#facc15",
                border: "none",
                padding: "8px 14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== CART ===================== */
function Cart({ cartItems, increaseQty, decreaseQty, removeFromCart, total }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 && <p>Cart is empty</p>}
      {cartItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid #ddd",
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <img src={item.image} style={{ width: 60 }} />
          <div style={{ flex: 1 }}>
            <h4>{item.name}</h4>
            <p>₹{item.price}</p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: 4,
              overflow: "hidden",
              height: 36,
            }}
          >
            <button
              onClick={() => decreaseQty(item.id)}
              style={{
                width: 32,
                height: "100%",
                border: "none",
                background: "#f3f4f6",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              −
            </button>
            <input
              type="text"
              value={item.quantity}
              readOnly
              style={{
                width: 36,
                height: "100%",
                textAlign: "center",
                border: "none",
                outline: "none",
                fontWeight: "bold",
              }}
            />
            <button
              onClick={() => increaseQty(item.id)}
              style={{
                width: 32,
                height: "100%",
                border: "none",
                background: "#f3f4f6",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              +
            </button>
          </div>
          <button onClick={() => removeFromCart(item.id)}>❌</button>
        </div>
      ))}
      {cartItems.length > 0 && (
        <>
          <h3>Total: ₹{total}</h3>
          <Link to="/address">
            <button>Proceed to Checkout</button>
          </Link>
        </>
      )}
    </div>
  );
}

/* ===================== ADDRESS PAGE ===================== */
function Address({ cartItems, total, clearCart }) {
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // ✅ payment state
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const isValid = Object.values(address).every((v) => v.trim() !== "");

  return (
    <div style={{ padding: 24 }}>
      {/* 🔹 Checkout Title */}
      <h2>Checkout</h2>

      {/* 🔹 Cart Items */}
      {cartItems.length === 0 && <p>Cart is empty</p>}

      {cartItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <img src={item.image} alt={item.name} style={{ width: 50 }} />
          <div>
            <p style={{ margin: 0 }}>
              {item.name} × {item.quantity}
            </p>
            <small>₹{item.price * item.quantity}</small>
          </div>
        </div>
      ))}

      {/* 🔹 Shipping Address Title */}
      <h3 style={{ marginTop: 28}}>Shipping Address</h3>

      {/* 🔹 Address Inputs */}
      <input
        placeholder="Full Name"
        onChange={(e) => setAddress({ ...address, name: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
      />
      <input
        placeholder="Address"
        onChange={(e) => setAddress({ ...address, address: e.target.value })}
      />
      <input
        placeholder="City"
        onChange={(e) => setAddress({ ...address, city: e.target.value })}
      />
      <input
        placeholder="Pincode"
        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
      />

      {/* 🔹 Total */}
      <h3>Total: ₹{total}</h3>

      {/* ================= PAYMENT OPTIONS ================= */}
<h3>Payment Method</h3>

<label>
  <input
    type="radio"
    name="payment"
    value="COD"
    checked={paymentMethod === "COD"}
    onChange={(e) => setPaymentMethod(e.target.value)}
  />
  Cash on Delivery
</label>

<br />

<label>
  <input
    type="radio"
    name="payment"
    value="CARD"
    checked={paymentMethod === "CARD"}
    onChange={(e) => setPaymentMethod(e.target.value)}
  />
  Card Payment
</label>

{paymentMethod === "CARD" && (
  <p style={{ color: "green" }}>Card Selected</p>
)}

<br />

<button
  disabled={!isValid}
  onClick={() => {
    const orderData = {
      cartItems,
      address,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "CARD" ? "PAID" : "PENDING",
    };

    fetch("https://full-stack-e-commerce-gkn4.onrender.com/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then(() => {
        clearCart();
        navigate("/success", { state: orderData });
      })
      .catch((err) => console.error("Error placing order:", err));
  }}
>
  Place Order
</button>

<button style={{ marginLeft: 10 }} onClick={() => navigate("/cart")}>
  Back to Cart
</button>
</div>
);
}

function OrderSuccess() {
const { state } = useLocation();

if (!state) {
return <h3>No order data found</h3>;
}

const { cartItems, total, paymentMethod, paymentStatus, address } = state;

return (
<div style={{ padding: 40 }}>
<h2>✅ Order Placed Successfully</h2>

<h3>Order Summary</h3>
<p><b>Total:</b> ₹{total}</p>
<p><b>Payment Method:</b> {paymentMethod}</p>
<p><b>Payment Status:</b> {paymentStatus}</p>

<h3>Shipping Address</h3>
<p>{address.name}</p>
<p>{address.address}, {address.city}</p>
<p>{address.pincode}</p>

<h3>Items</h3>
{cartItems.map((item, i) => (
<p key={i}>
{item.name} × {item.quantity}
</p>
))}

<Link to="/">
<button style={{ marginTop: 20 }}>Continue Shopping</button>
</Link>
</div>
);
}

/* ===================== ADMIN PANEL ===================== */

function AdminPanel() {
const [password, setPassword] = useState("");
const [authorized, setAuthorized] = useState(false);

const [products, setProducts] = useState([]);
const [orders, setOrders] = useState([]);

const [newProduct, setNewProduct] = useState({
name: "",
price: "",
image: "",
});

useEffect(() => {
fetch("https://full-stack-e-commerce-gkn4.onrender.com/api/products")
.then((res) => res.json())
.then((data) => setProducts(data));

fetch("https://full-stack-e-commerce-gkn4.onrender.com/api/orders")
.then((res) => res.json())
.then((data) => setOrders(data));
}, []);

const deleteOrder = (id) => {
fetch(`https://full-stack-e-commerce-gkn4.onrender.com/api/orders/${id}`, {
method: "DELETE",
})
.then((res) => res.json())
.then(() => {
setOrders((prev) => prev.filter((o) => o.id !== id));
});
};

const addProduct = () => {
if (!newProduct.name || !newProduct.price || !newProduct.image) {
alert("Fill all product fields");
return;
}

const product = {
id: Date.now(),
name: newProduct.name,
price: Number(newProduct.price),
image: newProduct.image,
};

setProducts((prev) => [...prev, product]);
setNewProduct({ name: "", price: "", image: "" });
};

/* ================= ADMIN LOGIN ================= */

if (!authorized) {
return (
<div style={{ padding: 40 }}>
<h2>Admin Login</h2>

<input
type="password"
placeholder="Enter admin password"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={{ padding: 8 }}
/>

<br /><br />

<button
onClick={() => {
if (password === "admin") {
setAuthorized(true);
} else {
alert("Wrong password");
}
}}
>
Login
</button>
</div>
);
}

/* ================= ADMIN PANEL ================= */

return (
<div style={{ padding: 24 }}>
<h2>Admin Panel</h2>

<h3>Add Product</h3>

<input
placeholder="Product Name"
value={newProduct.name}
onChange={(e) =>
setNewProduct({ ...newProduct, name: e.target.value })
}
/>

<br />

<input
placeholder="Price"
value={newProduct.price}
onChange={(e) =>
setNewProduct({ ...newProduct, price: e.target.value })
}
/>

<br />

<input
placeholder="Image path"
value={newProduct.image}
onChange={(e) =>
setNewProduct({ ...newProduct, image: e.target.value })
}
/>

<br /><br />

<button onClick={addProduct}>Add Product</button>

<hr />

<h3>Products</h3>

{products.map((p) => (
<p key={p.id}>
{p.id}. {p.name} – ₹{p.price}
</p>
))}

<hr />

<h3>Orders</h3>

{orders.length === 0 && <p>No orders yet</p>}

{orders.map((o) => (
<div
key={o.id}
style={{
marginBottom: 12,
border: "1px solid #ccc",
padding: 10,
}}
>
<p><b>Order #{o.id}</b></p>

<p>Total: ₹{o.total}</p>

<p>
Payment Method:
<b>{o.paymentMethod ? o.paymentMethod : "COD"}</b>
</p>

<p>
Payment Status:
<b>{o.paymentStatus ? o.paymentStatus : "PENDING"}</b>
</p>

<button onClick={() => deleteOrder(o.id)}>
Delete Order
</button>

</div>
))}

</div>
);
}
