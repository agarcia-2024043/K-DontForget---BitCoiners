export const UnauthorizedPage = () => (
    <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#f9fafb", padding: 24,
        fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
    }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0d2e5e", marginBottom: 8 }}>Acceso denegado</h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>No tienes permisos para ver esta página.</p>
    </div>
);
