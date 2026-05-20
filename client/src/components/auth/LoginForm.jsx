import { useState } from "react";

import AuthInput from "./AuthInput";

import Button from "../common/Button";

import { useAuth } from "../../context/AuthContext";

import { useNavigate } from "react-router-dom";

export default function LoginForm() {

    const { login } = useAuth();

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(form);

        console.log("RESULT:", result);

        if (result.success) {

            navigate("/");

        } else {

            alert(result.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="auth-form"
        >

            <h2>Chess Login</h2>

            <AuthInput
                type="email"
                name="email"
                placeholder="Correo"
                value={form.email}
                onChange={handleChange}
            />

            <AuthInput
                type="password"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
            />

            <Button
                text="Ingresar"
                type="submit"
            />

        </form>
    );
}