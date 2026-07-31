import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import kinalLogo from "@/assets/logo.png";
import backgroundImage from "@/assets/logo1.png";

/* ─── Keyframes injected once ─── */
const KeyframesStyle = () => (
  <style>{`
    @keyframes auth-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-8px) rotate(1deg); }
      66% { transform: translateY(-4px) rotate(-1deg); }
    }
    @keyframes auth-fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes auth-slide-right {
      from { opacity: 0; transform: translateX(32px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes auth-pulse-ring {
      0%   { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes auth-shimmer {
      from { background-position: -200% center; }
      to   { background-position: 200% center; }
    }
    @keyframes auth-orbit {
      from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
    }
    @keyframes auth-spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `}</style>
);

/* ─── Floating Orb Decorations ─── */
const OrbDecoration = () => (
  <>
    {/* Large bg orb */}
    <div style={{
      position: 'absolute', top: '-120px', right: '-100px',
      width: '380px', height: '380px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(240,140,43,0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    {/* Medium orb bottom-left */}
    <div style={{
      position: 'absolute', bottom: '60px', left: '-60px',
      width: '260px', height: '260px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(28,107,189,0.12) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    {/* Small floating ring */}
    <div style={{
      position: 'absolute', top: '38%', left: '55%',
      width: '160px', height: '160px', borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.07)',
      pointerEvents: 'none',
      animation: 'auth-spin-slow 20s linear infinite',
    }} />
    {/* Grid lines */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '48px 48px',
      pointerEvents: 'none',
    }} />
  </>
);

/* ─── Feature Card ─── */
const FeatureItem = ({ icon, label, delay = 0 }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    textAlign: 'center',
    animation: `auth-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
  }}>
    <div style={{
      width: 50, height: 50, borderRadius: 14,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
      animation: `auth-float 4s ease-in-out ${delay / 1000 * 1.5}s infinite`,
    }}>
      {icon}
    </div>
    <p style={{
      color: 'rgba(255,255,255,0.75)',
      fontWeight: 700, fontSize: 11.5,
      lineHeight: 1.4, margin: 0,
      letterSpacing: '0.01em',
    }}>
      {label}
    </p>
  </div>
);

/* ─── Stats Pill ─── */
const StatPill = ({ value, label, delay = 0 }) => (
  <div style={{
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '12px 18px',
    backdropFilter: 'blur(8px)',
    animation: `auth-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
  }}>
    <div style={{ color: '#f08c2b', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5, fontWeight: 600, marginTop: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
  </div>
);

export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      background: '#0d1f3c',
    }}>
      <KeyframesStyle />

      {/* ══ LEFT PANEL ══ */}
      <div style={{
        width: '52%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 52px 36px',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(155deg, rgba(5,14,30,0.95) 0%, rgba(13,31,60,0.88) 45%, rgba(5,14,30,0.97) 100%)',
          zIndex: 0,
        }} />
        <OrbDecoration />

        {/* Left Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Brand Top */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            animation: 'auth-fade-in 0.5s ease both',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #f08c2b 0%, #e07b1b 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16, color: '#fff',
              boxShadow: '0 4px 20px rgba(240,140,43,0.45)',
              letterSpacing: '-0.02em',
            }}>KF</div>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0, letterSpacing: '-0.02em' }}>K-Don'tForget</p>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, margin: 0, fontWeight: 500 }}>Sistema de Citas y Recordatorios</p>
            </div>
          </div>

          {/* Hero */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 0 36px' }}>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(240,140,43,0.15)', border: '1px solid rgba(240,140,43,0.3)',
              borderRadius: 99, padding: '5px 14px', marginBottom: 24, width: 'fit-content',
              animation: 'auth-fade-in 0.5s 0.1s ease both',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f08c2b', boxShadow: '0 0 8px #f08c2b' }} />
              <span style={{ fontSize: 12, color: '#f08c2b', fontWeight: 700, letterSpacing: '0.04em' }}>PLATAFORMA EDUCATIVA</span>
            </div>

            <h1 style={{
              color: '#fff',
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 16,
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              animation: 'auth-fade-in 0.6s 0.15s ease both',
            }}>
              Organiza, gestiona<br />
              y <span style={{ 
                color: '#f08c2b',
                position: 'relative',
              }}>recuerda</span> cada cita.
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 14.5, lineHeight: 1.8,
              maxWidth: 300, margin: 0,
              animation: 'auth-fade-in 0.6s 0.2s ease both',
              fontWeight: 400,
            }}>
              Conecta a padres de familia con coordinadores de manera eficiente, segura y sencilla.
            </p>

            {/* Stats row */}
            <div style={{
              display: 'flex', gap: 12, marginTop: 36,
              animation: 'auth-fade-in 0.6s 0.3s ease both',
            }}>
              <StatPill value="500+" label="Usuarios activos" delay={350} />
              <StatPill value="98%" label="Satisfacción" delay={400} />
              <StatPill value="24/7" label="Disponible" delay={450} />
            </div>

            {/* Feature items */}
            <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
              <FeatureItem
                delay={500}
                label="Citas organizadas"
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                }
              />
              <FeatureItem
                delay={560}
                label="Recordatorios inteligentes"
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                }
              />
              <FeatureItem
                delay={620}
                label="Estadísticas en tiempo real"
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Footer */}
          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 500 }}>
            © 2025 Fundación Kinal. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f8ff',
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background decoration */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(41,64,104,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,140,43,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%', maxWidth: 380, position: 'relative', zIndex: 1,
          animation: 'auth-slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        }}>

          {/* Logo */}
          <div style={{ width: 80, height: 80, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={kinalLogo}
              alt="Kinal"
              style={{ height: 80, width: 'auto', objectFit: 'contain', borderRadius: 12, filter: 'drop-shadow(0 4px 12px rgba(41,64,104,0.15))' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Title Block */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#111827', fontSize: 24, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
              {isForgot ? "Recuperar contraseña" : "Bienvenido"}
            </h2>
            <p style={{ color: '#6b7280', fontSize: 13.5, margin: 0, fontWeight: 500 }}>
              {isForgot
                ? "Te enviaremos un enlace a tu correo"
                : "Ingresa tus credenciales para continuar"}
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '28px 28px',
            boxShadow: '0 4px 32px rgba(41,64,104,0.08), 0 1px 3px rgba(41,64,104,0.06)',
            border: '1px solid rgba(171,188,203,0.4)',
          }}>
            {isForgot
              ? <ForgotPasswordForm onBack={() => setIsForgot(false)} />
              : <LoginForm onForgot={() => setIsForgot(true)} />
            }
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24, fontWeight: 500 }}>
            © 2025 Fundación Kinal. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
