import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { apiGetEntradaPublica, type EntradaPublicaAPI } from "../api";

const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const MONTH_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function fmtDateLong(str: string) {
  const d = new Date(str);
  return `${d.getDate()} de ${MONTH_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function PublicEntryView() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<EntradaPublicaAPI | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "not_found">(
    "loading",
  );

  useEffect(() => {
    if (!id) {
      setStatus("not_found");
      return;
    }
    apiGetEntradaPublica(id)
      .then((data) => {
        setEntry(data);
        setStatus("ok");
      })
      .catch(() => setStatus("not_found"));
  }, [id]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
        }}
      >
        <div style={{ color: "#9B9B95", fontSize: "14px" }}>Cargando…</div>
      </div>
    );
  }

  if (status === "not_found" || !entry) {
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
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <div
            style={{
              fontFamily: serif,
              fontSize: "32px",
              fontWeight: "400",
              color: "#C4C0BA",
              marginBottom: "12px",
            }}
          >
            404
          </div>
          <p
            style={{
              color: "#6B6B65",
              fontSize: "15px",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            Esta entrada no existe o no está disponible.
          </p>
          <Link
            to="/login"
            style={{
              fontSize: "13px",
              color: "#1A1A18",
              fontFamily: sans,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Ir a diario
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = entry.nota.split(/\n+/).filter((p) => p.trim());

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAFAF8",
        fontFamily: sans,
      }}
    >
      <div
        style={{
          borderBottom: "0.5px solid rgba(26,26,24,0.08)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Link
          to="/login"
          style={{
            fontFamily: serif,
            fontSize: "18px",
            fontWeight: "400",
            color: "#9B9B95",
            textDecoration: "none",
            letterSpacing: "-0.3px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1A18")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9B95")}
        >
          diario
        </Link>
      </div>

      <article
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "64px 24px 96px",
        }}
      >
        <h1
          style={{
            fontFamily: serif,
            fontSize: "clamp(30px, 5vw, 44px)",
            fontWeight: "400",
            color: "#1A1A18",
            lineHeight: "1.2",
            margin: "0 0 20px",
            letterSpacing: "-0.5px",
          }}
        >
          {entry.titulo || "Sin título"}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <span
            style={{ fontSize: "13px", color: "#9B9B95", fontFamily: sans }}
          >
            {fmtDateLong(entry.fecha)}
          </span>
        </div>

        <div
          style={{
            width: "48px",
            height: "0.5px",
            backgroundColor: "rgba(26,26,24,0.2)",
            marginBottom: "40px",
          }}
        />

        <div>
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: sans,
                  fontSize: "17px",
                  color: "#1A1A18",
                  lineHeight: "1.85",
                  margin: "0 0 24px",
                }}
              >
                {para}
              </p>
            ))
          ) : (
            <p
              style={{
                color: "#9B9B95",
                fontFamily: sans,
                fontSize: "16px",
                fontStyle: "italic",
              }}
            >
              Esta entrada está vacía.
            </p>
          )}
        </div>

        <div
          style={{
            width: "48px",
            height: "0.5px",
            backgroundColor: "rgba(26,26,24,0.15)",
            margin: "56px 0 32px",
          }}
        />

        <div style={{ textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: "15px",
                fontWeight: "400",
                color: "#C4C0BA",
                letterSpacing: "-0.2px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#6B6B65")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#C4C0BA")}
            >
              volver
            </span>
          </Link>
        </div>
      </article>
    </div>
  );
}
