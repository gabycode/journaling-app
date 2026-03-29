import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useDiario, type Entry } from '../context/DiarioContext';
import { Lock } from 'lucide-react';

const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const MONTH_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function fmtDateLong(str: string) {
  const d = new Date(str);
  return `${d.getDate()} de ${MONTH_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function PublicEntryView() {
  const { id } = useParams<{ id: string }>();
  const { getEntry } = useDiario();
  const [entry, setEntry] = useState<Entry | null | 'loading'>('loading');

  useEffect(() => {
    if (!id) { setEntry(null); return; }
    // Small delay to simulate async load feel
    const t = setTimeout(() => {
      const found = getEntry(id);
      setEntry(found || null);
    }, 180);
    return () => clearTimeout(t);
  }, [id]);

  if (entry === 'loading') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans }}>
        <div style={{ color: '#9B9B95', fontSize: '14px' }}>Cargando…</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: sans }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ fontFamily: serif, fontSize: '32px', fontWeight: '400', color: '#C4C0BA', marginBottom: '12px' }}>404</div>
          <p style={{ color: '#6B6B65', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            Esta entrada no existe o no está disponible.
          </p>
          <Link to="/login" style={{ fontSize: '13px', color: '#1A1A18', fontFamily: sans, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Ir a diario
          </Link>
        </div>
      </div>
    );
  }

  if (!entry.isPublic) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: sans }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F0EDEA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} strokeWidth={1.5} color="#8C7A6B" />
            </div>
          </div>
          <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: '400', color: '#1A1A18', marginBottom: '10px' }}>
            Entrada privada
          </div>
          <p style={{ color: '#6B6B65', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            El autor ha mantenido esta entrada como privada.
          </p>
          <Link to="/login" style={{ fontSize: '13px', color: '#1A1A18', fontFamily: sans, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Ir a diario
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = entry.content.split(/\n+/).filter(p => p.trim());

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', fontFamily: sans }}>

      {/* Minimal top bar */}
      <div style={{ borderBottom: '0.5px solid rgba(26,26,24,0.08)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link to="/login" style={{ fontFamily: serif, fontSize: '18px', fontWeight: '400', color: '#9B9B95', textDecoration: 'none', letterSpacing: '-0.3px', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1A1A18')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9B9B95')}
        >
          diario
        </Link>
      </div>

      {/* Content */}
      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* Title */}
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(30px, 5vw, 44px)',
          fontWeight: '400',
          color: '#1A1A18',
          lineHeight: '1.2',
          margin: '0 0 20px',
          letterSpacing: '-0.5px',
        }}>
          {entry.title || 'Sin título'}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#9B9B95', fontFamily: sans }}>
            {entry.authorName}
          </span>
          <span style={{ color: 'rgba(26,26,24,0.2)' }}>·</span>
          <span style={{ fontSize: '13px', color: '#9B9B95', fontFamily: sans }}>
            {fmtDateLong(entry.createdAt)}
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: '48px', height: '0.5px', backgroundColor: 'rgba(26,26,24,0.2)', marginBottom: '40px' }} />

        {/* Body text */}
        <div>
          {paragraphs.length > 0 ? paragraphs.map((para, i) => (
            <p key={i} style={{
              fontFamily: sans,
              fontSize: '17px',
              color: '#1A1A18',
              lineHeight: '1.85',
              margin: '0 0 24px',
            }}>
              {para}
            </p>
          )) : (
            <p style={{ color: '#9B9B95', fontFamily: sans, fontSize: '16px', fontStyle: 'italic' }}>
              Esta entrada está vacía.
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '48px', height: '0.5px', backgroundColor: 'rgba(26,26,24,0.15)', margin: '56px 0 32px' }} />

        {/* Watermark */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/login"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontFamily: serif, fontSize: '15px', fontWeight: '400', color: '#C4C0BA', letterSpacing: '-0.2px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6B6B65')}
              onMouseLeave={e => (e.currentTarget.style.color = '#C4C0BA')}
            >
              escrito en diario
            </span>
          </Link>
        </div>
      </article>
    </div>
  );
}
