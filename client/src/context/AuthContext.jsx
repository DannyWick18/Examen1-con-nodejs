/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    // LOGIN
    const login = async (data) => {

        try {

            console.log("Intentando login...", data);

            const response = await api.post(
                "/auth/login",
                data
            );

            console.log("LOGIN OK:", response);

            setUser(response);

            return {
                success: true
            };

        } catch (error) {

            console.error("ERROR LOGIN:", error);

            return {
                success: false,
                message: error.message || "Error al iniciar sesión"
            };
        }
    };

    // LOGOUT
    const logout = async () => {

        await api.post("/auth/logout");

        setUser(null);
    };


    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await api.get("/auth/verify");
                setUser(response);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        void verifySession();
    }, []);


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);