import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const navy = "#0d2e5e";
const navyLight = "#1c6bbd";

const S = {
  form: { display: "flex", flexDirection: "column", gap: 18 },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { 
    fontSize: 12.5, fontWeight: 700, color: "#374151",
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },

  inputWrap: { position: "relative" },
  iconLeft: {
    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
    width: 15, height: 15, color: "#94a3b8", pointerEvents: "none",
    display: 'flex', alignItems: 'center',
  },
  input: {
    width: "100%", padding: "11px 14px 11px 38px",
    border: "1.5px solid #e5e7eb", borderRadius: 12,
    fontSize: 13.5, fontFamily: "inherit",
    background: "#f8fafc", color: "#111827",
    outline: "none", boxSizing: "border-box",
    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
    fontWeight: 500,
  },
  inputActive: { 
    border: `1.5px solid ${navyLight}`, 
    boxShadow: `0 0 0 3px rgba(28,107,189,0.12)`,
    background: '#ffffff',
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    padding: 0, color: "#94a3b8", display: "flex", alignItems: "center",
    transition: 'color 0.15s',
  },
  errorText: { fontSize: 11.5, color: "#ef4444", fontWeight: 600 },

  row: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  checkLabel: { 
    display: "flex", alignItems: "center", gap: 7, 
    fontSize: 13, color: "#6b7280", cursor: "pointer", fontWeight: 500,
  },
  checkbox: { width: 15, height: 15, accentColor: navyLight, cursor: "pointer" },
  forgotBtn: {
    background: "none", border: "none", fontSize: 13, fontWeight: 700,
    color: navyLight, cursor: "pointer", padding: 0, fontFamily: "inherit",
    transition: 'opacity 0.15s',
  },

  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: 12, padding: "10px 14px",
    fontSize: 13, color: "#dc2626", textAlign: "center",
    fontWeight: 500,
  },

  btn: {
    width: "100%", padding: "13px 16px",
    background: `linear-gradient(135deg, ${navy} 0%, ${navyLight} 100%)`,
    color: "#fff",
    border: "none", borderRadius: 12,
    fontSize: 14, fontWeight: 800, fontFamily: "inherit",
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: '0 4px 16px rgba(13,46,94,0.3)',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    letterSpacing: '0.01em',
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  divider: {
    display: "flex", alignItems: "center", gap: 14, margin: "4px 0",
  },
  dividerLine: {
    flex: 1, height: 1, background: "#f1f5f9",
  },
  dividerText: {
    fontSize: 11.5, color: "#94a3b8", fontWeight: 600, whiteSpace: 'nowrap',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },

  socialButtons: {
    display: "flex", gap: 10,
  },
  socialBtn: {
    flex: 1, padding: "10px 14px",
    background: "#f8fafc", color: "#374151",
    border: "1.5px solid #e5e7eb", borderRadius: 12,
    fontSize: 13, fontWeight: 700, fontFamily: "inherit",
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all 0.2s",
  },
};

const IconEmail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const Spinner = () => (
  <>
    <style>{`@keyframes kdf-spin { to { transform: rotate(360deg) } }`}</style>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      style={{ animation: "kdf-spin 0.7s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const IconMicrosoft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
    <rect x="13" y="1" width="10" height="10" fill="#7fba00"/>
    <rect x="1" y="13" width="10" height="10" fill="#00a4ef"/>
    <rect x="13" y="13" width="10" height="10" fill="#ffb900"/>
  </svg>
);

export const LoginForm = ({ onForgot }) => {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState(null);
  const [hoverBtn, setHoverBtn] = useState(false);

  const login   = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error   = useAuthStore((s) => s.error);

  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithMicrosoft = useAuthStore((s) => s.loginWithMicrosoft);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      toast.success("¡Bienvenido!");
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "tu-google-client-id.apps.googleusercontent.com") {
      toast.error("Google Client ID no configurado en el archivo .env del frontend.");
      return;
    }
    if (!window.google) {
      toast.error("El SDK de Google no se ha cargado correctamente. Inténtalo de nuevo.");
      return;
    }
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid profile email",
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            const loadingToast = toast.loading("Iniciando sesión con Google...");
            const res = await loginWithGoogle(tokenResponse.access_token);
            toast.dismiss(loadingToast);
            if (res.success) {
              toast.success(res.message || "¡Bienvenido!");
              navigate("/dashboard");
            } else {
              toast.error(res.error || "Error al iniciar sesión con Google");
            }
          } else {
            toast.error("No se pudo obtener el token de Google.");
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (err) {
      toast.error("Error al iniciar el flujo de Google: " + err.message);
    }
  };

  const handleMicrosoftLogin = () => {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    if (!clientId || clientId === "tu-microsoft-client-id") {
      toast.error("Microsoft Client ID no configurado en el archivo .env del frontend.");
      return;
    }
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=openid%20profile%20email%20User.Read&state=microsoft&response_mode=fragment`;
    const width = 600, height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top  = window.screen.height / 2 - height / 2;
    const popup = window.open(url, "microsoft-login", `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`);
    if (!popup) {
      toast.error("El bloqueador de popups impidió abrir el diálogo de Microsoft.");
      return;
    }
    const loadingToast = toast.loading("Esperando inicio de sesión con Microsoft...");
    const interval = setInterval(async () => {
      try {
        if (!popup || popup.closed) { clearInterval(interval); toast.dismiss(loadingToast); return; }
        if (popup.location.href.includes(window.location.origin)) {
          const hash = popup.location.hash;
          popup.close(); clearInterval(interval);
          const params = new URLSearchParams(hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          if (accessToken) {
            toast.loading("Iniciando sesión con Microsoft...", { id: loadingToast });
            const res = await loginWithMicrosoft(accessToken);
            toast.dismiss(loadingToast);
            if (res.success) {
              toast.success(res.message || "¡Bienvenido!");
              navigate("/dashboard");
            } else {
              toast.error(res.error || "Error al iniciar sesión con Microsoft");
            }
          } else {
            toast.dismiss(loadingToast);
            toast.error("No se pudo obtener el token de Microsoft.");
          }
        }
      } catch (e) { /* Cross-origin warnings expected */ }
    }, 500);
  };

  const inp = (field) => ({ ...S.input, ...(focused === field ? S.inputActive : {}) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={S.form}>

      <div style={S.field}>
        <label style={S.label}>Correo institucional</label>
        <div style={S.inputWrap}>
          <span style={S.iconLeft}><IconEmail /></span>
          <input
            type="email"
            placeholder="correo@kinal.edu.gt"
            style={inp("email")}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            {...register("email", {
              required: "El correo es obligatorio",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo inválido" },
            })}
          />
        </div>
        {errors.email && <p style={S.errorText}>⚠ {errors.email.message}</p>}
      </div>

      <div style={S.field}>
        <label style={S.label}>Contraseña</label>
        <div style={S.inputWrap}>
          <span style={S.iconLeft}><IconLock /></span>
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            style={{ ...inp("pwd"), paddingRight: 38 }}
            onFocus={() => setFocused("pwd")}
            onBlur={() => setFocused(null)}
            {...register("password", { required: "La contraseña es obligatoria" })}
          />
          <button type="button" style={S.eyeBtn} onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
            {showPwd ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
        {errors.password && <p style={S.errorText}>⚠ {errors.password.message}</p>}
      </div>

      <div style={S.row}>
        <label style={S.checkLabel}>
          <input type="checkbox" style={S.checkbox} />
          Recordarme
        </label>
        <button type="button" style={S.forgotBtn} onClick={onForgot}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <div style={S.errorBox}>{error}</div>}

      <button 
        type="submit" 
        disabled={loading} 
        style={{ 
          ...S.btn, 
          ...(loading ? S.btnDisabled : {}),
          ...(hoverBtn && !loading ? { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(13,46,94,0.35)' } : {}),
        }}
        onMouseEnter={() => setHoverBtn(true)}
        onMouseLeave={() => setHoverBtn(false)}
      >
        {loading ? <><Spinner /> Iniciando sesión…</> : "Iniciar sesión"}
      </button>

      <div style={S.divider}>
        <div style={S.dividerLine} />
        <span style={S.dividerText}>o continúa con</span>
        <div style={S.dividerLine} />
      </div>

      <div style={S.socialButtons}>
        <button 
          type="button" 
          style={S.socialBtn}
          onClick={handleGoogleLogin}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <IconGoogle />
          Google
        </button>
        <button 
          type="button" 
          style={S.socialBtn}
          onClick={handleMicrosoftLogin}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <IconMicrosoft />
          Microsoft
        </button>
      </div>
    </form>
  );
};
