import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const S = {
    form: { display: "flex", flexDirection: "column", gap: 18 },
    desc: { fontSize: 13, color: "#6b7280", textAlign: "center", lineHeight: 1.6, margin: 0 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 13, fontWeight: 700, color: "#374151", fontFamily: "inherit" },
    inputWrap: { position: "relative" },
    iconLeft: {
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        width: 16, height: 16, color: "#9ca3af", pointerEvents: "none",
    },
    input: {
        width: "100%",
        padding: "10px 12px 10px 36px",
        border: "1.5px solid #e5e7eb",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "inherit",
        background: "#f9fafb",
        color: "#111827",
        outline: "none",
        boxSizing: "border-box",
    },
    inputFocus: { borderColor: "#0d2e5e", boxShadow: "0 0 0 3px rgba(13,46,94,0.10)" },
    errorText: { fontSize: 11, color: "#ef4444" },
    submitBtn: {
        width: "100%", padding: "11px 16px",
        background: "#0d2e5e", color: "#fff",
        border: "none", borderRadius: 10,
        fontSize: 14, fontWeight: 700, fontFamily: "inherit",
        cursor: "pointer", transition: "opacity 0.15s",
    },
    backBtn: {
        width: "100%", padding: "10px",
        background: "none", border: "1.5px solid #e5e7eb",
        borderRadius: 10, fontSize: 13, fontWeight: 700,
        color: "#6b7280", cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    },
};

const IconEmail = () => (
    <svg style={S.iconLeft} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m2 7 10 7 10-7"/>
    </svg>
);

const IconBack = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
    </svg>
);

export const ForgotPasswordForm = ({ onBack }) => {
    const forgotPassword = useAuthStore((s) => s.forgotPassword);
    const loading        = useAuthStore((s) => s.loading);
    const [focused, setFocused] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async ({ email }) => {
        const res = await forgotPassword(email);
        if (res.success) {
        toast.success("Si el correo existe, recibirás un enlace de recuperación.", { duration: 6000 });
        } else {
        toast.error(res.error || "Error al enviar el correo");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={S.form}>
        <p style={S.desc}>
            Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div style={S.field}>
            <label style={S.label}>Correo institucional</label>
            <div style={S.inputWrap}>
            <IconEmail />
            <input
                type="email"
                placeholder="correo@kinal.edu.gt"
                style={{ ...S.input, ...(focused ? S.inputFocus : {}) }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...register("email", {
                required: "El correo es obligatorio",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Ingresa un correo válido" },
                })}
            />
            </div>
            {errors.email && <p style={S.errorText}>{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={loading} style={{ ...S.submitBtn, ...(loading ? { opacity: 0.6 } : {}) }}>
            {loading ? "Enviando…" : "Enviar enlace de recuperación"}
        </button>

        <button type="button" onClick={onBack} style={S.backBtn}>
            <IconBack />
            Volver al inicio de sesión
        </button>
        </form>
    );
};