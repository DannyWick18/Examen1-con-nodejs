import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container">
                <div className="auth-form auth-loading">
                    <h2>Cargando sesión...</h2>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="page-container">
            <LoginForm />
        </div>
    );
}
