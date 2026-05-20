import { useAuth } from "../../context/AuthContext";

export default function Navbar() {

    const {
        user,
        logout
    } = useAuth();

    return (
        <nav className="navbar">

            <h2>Chess Online</h2>

            <div>

                <span>
                    {user?.username}
                </span>

                <button onClick={logout}>
                    Logout
                </button>

            </div>

        </nav>
    );
}