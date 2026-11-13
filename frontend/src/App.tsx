import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth, useAuth } from "./auth";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Login from "./pages/Login";

export default function App() {
  const { email, logout } = useAuth();
  return (
    <>
      <header className="bar">
        <Link to="/" className="brand">Shopfront</Link>
        <nav>
          {email ? (
            <>
              <span className="muted">{email}</span>
              <button className="link" onClick={logout}>Sign out</button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products/new" element={<RequireAuth><ProductForm /></RequireAuth>} />
          <Route path="/products/:id/edit" element={<RequireAuth><ProductForm /></RequireAuth>} />
          <Route path="*" element={<p>Page not found. <Link to="/">Back to products</Link></p>} />
        </Routes>
      </main>
    </>
  );
}
