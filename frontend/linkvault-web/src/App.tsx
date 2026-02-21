import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Categories  from "./pages/Categories";
import CollectionLinks from "./pages/CollectionLinks";
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/collections/:id"
        element={
          <ProtectedRoute>
            <CollectionLinks />
          </ProtectedRoute>
        }
      />
     
    </Routes>
    <Toaster richColors />
    </>
  );
}
