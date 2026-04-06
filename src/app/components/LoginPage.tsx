import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useDiario } from "../context/DiarioContext";
import { apiForgotPassword } from "../api";

const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login, register } = useDiario();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotState, setForgotState] = useState<
    "idle" | "submitting" | "sent" | "error"
  >("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (tab === "login") {
        const result = await login(email, password);
        if (!result.ok)
          setError(
            result.error ||
              "Credenciales incorrectas. ¿Quizás necesitas registrarte?",
          );
        else navigate("/dashboard");
      } else {
        if (!name.trim()) {
          setError("Ingresa tu nombre para crear la cuenta.");
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres.");
          setSubmitting(false);
          return;
        }
        const result = await register(name.trim(), email, password);
        if (!result.ok)
          setError(
            result.error ||
              "No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.",
          );
        else navigate("/dashboard");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async () => {
    setError("");
    if (!email.trim()) {
      setError("Ingresa tu correo para enviarte el enlace de recuperación.");
      setForgotState("error");
      return;
    }

    setForgotState("submitting");
    try {
      await apiForgotPassword(email.trim());
      setForgotState("sent");
      setTimeout(() => setForgotState("idle"), 3500);
    } catch (err) {
      setForgotState("error");
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el enlace. Verifica el correo e intenta de nuevo.",
      );
      setTimeout(() => setForgotState("idle"), 3500);
    }
  };

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    setError("");
    setForgotState("idle");
    setName("");
    setEmail("");
    setPassword("");
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    backgroundColor: focusedField === field ? "#FFFFFF" : "#F7F6F3",
    border: `0.5px solid ${focusedField === field ? "rgba(26,26,24,0.35)" : "rgba(26,26,24,0.15)"}`,
    borderRadius: "8px",
    fontSize: "14px",
    color: "#1A1A18",
    outline: "none",
    fontFamily: sans,
    boxSizing: "border-box",
    transition: "background-color 0.15s, border-color 0.15s",
  });

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
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div
            style={{
              fontFamily: serif,
              fontSize: "48px",
              fontWeight: "400",
              color: "#1A1A18",
              letterSpacing: "-1px",
              lineHeight: "1",
              marginBottom: "12px",
            }}
          >
            diario
          </div>
          <p
            style={{
              color: "#6B6B65",
              fontSize: "14px",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Un espacio íntimo para tus pensamientos.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "0.5px solid rgba(26,26,24,0.14)",
            borderRadius: "8px",
            padding: "32px 32px 28px",
          }}
        >
          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              borderBottom: "0.5px solid rgba(26,26,24,0.1)",
              marginBottom: "28px",
            }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1,
                  padding: "8px 0 11px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    tab === t
                      ? "1.5px solid #1A1A18"
                      : "1.5px solid transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: tab === t ? "#1A1A18" : "#9B9B95",
                  fontFamily: sans,
                  fontWeight: tab === t ? "500" : "400",
                  marginBottom: "-0.5px",
                  transition: "color 0.15s",
                  letterSpacing: "0.1px",
                }}
              >
                {t === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            {tab === "register" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  style={inputStyle("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                style={inputStyle("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: tab === "login" ? "10px" : "24px" }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle("password")}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Forgot password */}
            {tab === "login" && (
              <div style={{ textAlign: "right", marginBottom: "24px" }}>
                <button
                  type="button"
                  onClick={handleForgot}
                  disabled={forgotState === "submitting"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: forgotState === "submitting" ? "wait" : "pointer",
                    fontSize: "12px",
                    color:
                      forgotState === "sent"
                        ? "#4A8C5C"
                        : forgotState === "error"
                          ? "#B85C3A"
                          : "#9B9B95",
                    fontFamily: sans,
                    padding: 0,
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    transition: "color 0.2s",
                    opacity: forgotState === "submitting" ? 0.7 : 1,
                  }}
                >
                  {forgotState === "submitting"
                    ? "Enviando enlace..."
                    : forgotState === "sent"
                      ? "Enlace enviado a tu correo"
                      : forgotState === "error"
                        ? "Reintentar envío"
                        : "¿Olvidaste tu contraseña?"}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p
                style={{
                  color: "#B85C3A",
                  fontSize: "13px",
                  marginBottom: "16px",
                  fontFamily: sans,
                  lineHeight: "1.4",
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
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
                cursor: "pointer",
                letterSpacing: "0.2px",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {submitting
                ? "Cargando…"
                : tab === "login"
                  ? "Entrar"
                  : "Crear cuenta"}
            </button>
          </form>
        </div>

        {/* Privacy note */}
        <p
          style={{
            textAlign: "center",
            color: "#9B9B95",
            fontSize: "12px",
            marginTop: "20px",
            fontFamily: sans,
            lineHeight: "1.7",
          }}
        >
          Tus entradas son privadas por defecto. <br />
          Solo tú puedes leerlas.
        </p>
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
