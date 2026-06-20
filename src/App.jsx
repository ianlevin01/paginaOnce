// App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/layout/Header";
import CartDrawer from "./components/cart/CartDrawer";
import ChatBot from "./components/layout/ChatBot";
import ShopPage from "./pages/ShopPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritesPage from "./pages/FavoritesPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import "./App.css";

function AppInner() {
  const { pathname } = useLocation();
  return (
    <>
      <Header />
      <CartDrawer />
      <Routes>
        <Route path="/"              element={<ShopPage />} />
        <Route path="/checkout"      element={<CheckoutPage />} />
        <Route path="/favoritos"     element={<FavoritesPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
      {pathname !== "/checkout" && <ChatBot />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
