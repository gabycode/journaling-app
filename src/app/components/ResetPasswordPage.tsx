import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { apiResetPassword } from "../api";

const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("No encontramos un token de recuperación en el enlace.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiResetPassword(token, newPassword);
      setSuccess(res.mensaje || "Contraseña actualizada correctamente.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAFAF8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: sans,
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              fontFamily: serif,
              fontSize: "44px",
              fontWeight: "400",
              color: "#1A1A18",
              letterSpacing: "-1px",
              lineHeight: "1",
              marginBottom: "10px",
            }}
          >
            diario
          </div>
          <p style={{ color: "#6B6B65", fontSize: "14px", margin: 0 }}>
            Restablecer contraseña
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "0.5px solid rgba(26,26,24,0.14)",
            borderRadius: "8px",
            padding: "28px",
          }}
        >
          {!token && (
            <p style={{ color: "#B85C3A", fontSize: "13px", marginTop: 0 }}>
              El enlace no incluye token. Solicita uno nuevo desde iniciar
              sesión.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: "#B85C3A", fontSize: "13px", marginTop: 0 }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{ color: "#4A8C5C", fontSize: "13px", marginTop: 0 }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !token}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#1A1A18",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: sans,
                fontWeight: "500",
                cursor: submitting || !token ? "not-allowed" : "pointer",
                opacity: submitting || !token ? 0.65 : 1,
              }}
            >
              {submitting ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "#6B6B65",
              fontSize: "13px",
              marginTop: "16px",
              marginBottom: 0,
            }}
          >
            <Link to="/login" style={{ color: "#1A1A18" }}>
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#6B6B65",
  marginBottom: "7px",
  fontFamily: "'Inter', -apple-system, sans-serif",
  fontWeight: "500",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "#F7F6F3",
  border: "0.5px solid rgba(26,26,24,0.15)",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#1A1A18",
  outline: "none",
  fontFamily: sans,
  boxSizing: "border-box",
};
