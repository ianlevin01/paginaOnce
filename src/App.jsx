import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Header from "./components/layout/Header";
import CartDrawer from "./components/cart/CartDrawer";
import ChatBot from "./components/layout/ChatBot";
import ShopPage from "./pages/ShopPage";
import CheckoutPage from "./pages/CheckoutPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
        <ChatBot />
      </CartProvider>
    </BrowserRouter>
  );
}
