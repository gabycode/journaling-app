import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useDiario, type Entry } from '../context/DiarioContext';
import { BookOpen, PenLine, Globe, Settings, LogOut, Pencil, Trash2, Lock, Plus, X, Check } from 'lucide-react';

const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const MONTH_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fmtDate(str: string) {
  const d = new Date(str);
  return `${d.getDate()} de ${MONTH_ES[d.getMonth()]}`;
}
function fmtDateFull(str: string) {
  const d = new Date(str);
  return `${d.getDate()} ${MONTH_ES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}
function preview(content: string, max = 120) {
  const clean = content.replace(/\n+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

type FilterType = 'all' | 'private' | 'public';

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, entries, logout, deleteEntry, updateProfile } = useDiario();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

  const rawFilter = searchParams.get('filter') as FilterType | null;
  const filter: FilterType = rawFilter === 'private' || rawFilter === 'public' ? rawFilter : 'all';

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (user) setSettingsName(user.name);
  }, [user]);

  if (!user) return null;

  const filtered = entries
    .filter(e => filter === 'all' ? true : filter === 'private' ? !e.isPublic : e.isPublic)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const setFilter = (f: FilterType) => {
    if (f === 'all') setSearchParams({});
    else setSearchParams({ filter: f });
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setDeleteConfirmId(null);
  };

  const handleSaveProfile = () => {
    if (settingsName.trim()) {
      updateProfile(settingsName.trim());
    }
    setShowSettings(false);
  };

  const navItems = [
    { label: 'Mis entradas', icon: BookOpen, action: () => { setFilter('all'); setMobileMenuOpen(false); }, active: filter === 'all' && !showSettings },
    { label: 'Nueva entrada', icon: PenLine, action: () => { navigate('/editor/new'); setMobileMenuOpen(false); }, active: false },
    { label: 'Entradas públicas', icon: Globe, action: () => { setFilter('public'); setMobileMenuOpen(false); }, active: filter === 'public' && !showSettings },
    { label: 'Configuración', icon: Settings, action: () => { setShowSettings(true); setMobileMenuOpen(false); }, active: showSettings },
  ];

  const filterCounts = {
    all: entries.length,
    private: entries.filter(e => !e.isPublic).length,
    public: entries.filter(e => e.isPublic).length,
  };

  const pageTitle = showSettings ? 'Configuración' : filter === 'public' ? 'Entradas públicas' : filter === 'private' ? 'Entradas privadas' : 'Mis entradas';

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FAFAF8', fontFamily: sans, overflow: 'hidden' }}>

      {/* Sidebar — desktop */}
      <aside style={{ width: '152px', minWidth: '152px', backgroundColor: '#F4F2EF', borderRight: '0.5px solid rgba(26,26,24,0.1)', flexDirection: 'column', padding: '0' }} className="hidden md:flex">

        {/* Logo */}
        <div style={{ padding: '28px 20px 24px', borderBottom: '0.5px solid rgba(26,26,24,0.08)' }}>
          <span style={{ fontFamily: serif, fontSize: '22px', fontWeight: '400', color: '#1A1A18', letterSpacing: '-0.5px' }}>diario</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '9px 20px',
                background: item.active ? 'rgba(26,26,24,0.06)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '12.5px',
                color: item.active ? '#1A1A18' : '#6B6B65',
                fontFamily: sans,
                fontWeight: item.active ? '500' : '400',
                borderRadius: '0',
                transition: 'background 0.12s, color 0.12s',
                lineHeight: '1.3',
              }}
              onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = 'rgba(26,26,24,0.04)'; e.currentTarget.style.color = '#1A1A18'; } }}
              onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B6B65'; } }}
            >
              <item.icon size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(26,26,24,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#DDD9D2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#6B6B65', fontFamily: sans }}>{initials(user.name)}</span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#1A1A18', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: '#9B9B95', fontFamily: sans, padding: '0', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1A1A18'}
            onMouseLeave={e => e.currentTarget.style.color = '#9B9B95'}
          >
            <LogOut size={12} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#F4F2EF', borderBottom: '0.5px solid rgba(26,26,24,0.1)', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', height: '56px' }}>
        <span style={{ fontFamily: serif, fontSize: '22px', fontWeight: '400', color: '#1A1A18', letterSpacing: '-0.5px' }}>diario</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A18', padding: 0 }}>
          {mobileMenuOpen ? <X size={18} strokeWidth={1.5} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A18" strokeWidth="1.5"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="flex md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: '#F4F2EF', paddingTop: '56px', flexDirection: 'column' }}>
          <nav style={{ padding: '16px 0' }}>
            {navItems.map(item => (
              <button key={item.label} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: item.active ? 'rgba(26,26,24,0.06)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '15px', color: item.active ? '#1A1A18' : '#6B6B65', fontFamily: sans, fontWeight: item.active ? '500' : '400' }}>
                <item.icon size={15} strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding: '20px 24px', borderTop: '0.5px solid rgba(26,26,24,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DDD9D2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B6B65' }}>{initials(user.name)}</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#1A1A18', fontWeight: '500' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#9B9B95' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#9B9B95', fontFamily: sans, padding: 0 }}>
              <LogOut size={13} strokeWidth={1.5} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto' }} className="pt-14 md:pt-0">
        <div style={{ maxWidth: '720px', margin: '0 auto', paddingTop: '40px', paddingBottom: '60px' }} className="px-5 md:px-8">

          {showSettings ? (
            /* Settings panel */
            <div>
              <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: '400', color: '#1A1A18', margin: '0 0 32px', letterSpacing: '-0.3px' }}>Configuración</h1>
              <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(26,26,24,0.12)', borderRadius: '8px', padding: '28px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={smLabel}>Nombre</label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={e => setSettingsName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: '#F7F6F3', border: '0.5px solid rgba(26,26,24,0.15)', borderRadius: '8px', fontSize: '14px', color: '#1A1A18', outline: 'none', fontFamily: sans, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={smLabel}>Correo electrónico</label>
                  <div style={{ padding: '10px 14px', backgroundColor: '#F7F6F3', border: '0.5px solid rgba(26,26,24,0.1)', borderRadius: '8px', fontSize: '14px', color: '#9B9B95', fontFamily: sans }}>{user.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleSaveProfile} style={{ padding: '10px 20px', backgroundColor: '#1A1A18', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: sans, fontWeight: '500', cursor: 'pointer' }}>
                    Guardar cambios
                  </button>
                  <button onClick={() => setShowSettings(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#6B6B65', border: '0.5px solid rgba(26,26,24,0.18)', borderRadius: '8px', fontSize: '13px', fontFamily: sans, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '20px', backgroundColor: '#FFFFFF', border: '0.5px solid rgba(26,26,24,0.12)', borderRadius: '8px', padding: '24px 28px' }}>
                <div style={{ fontSize: '13px', color: '#6B6B65', marginBottom: '14px', fontFamily: sans }}>Cuenta</div>
                <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '0.5px solid rgba(186,90,60,0.25)', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontSize: '13px', color: '#B85C3A', fontFamily: sans }}>
                  <LogOut size={13} strokeWidth={1.5} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            /* Entries panel */
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: '400', color: '#1A1A18', margin: '0 0 4px', letterSpacing: '-0.3px' }}>{pageTitle}</h1>
                  <span style={{ fontSize: '13px', color: '#9B9B95', fontFamily: sans }}>
                    {filtered.length === 1 ? '1 entrada' : `${filtered.length} entradas`}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/editor/new')}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', backgroundColor: '#1A1A18', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: sans, fontWeight: '500', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Plus size={14} strokeWidth={2} />
                  Nueva
                </button>
              </div>

              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                {([['all', 'Todas'], ['private', 'Privadas'], ['public', 'Públicas']] as const).map(([f, label]) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: filter === f ? '0.5px solid rgba(26,26,24,0.4)' : '0.5px solid rgba(26,26,24,0.15)',
                      backgroundColor: filter === f ? '#1A1A18' : 'transparent',
                      color: filter === f ? '#FFFFFF' : '#6B6B65',
                      fontSize: '12.5px',
                      fontFamily: sans,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: filter === f ? '500' : '400',
                    }}
                  >
                    {label} <span style={{ opacity: 0.65 }}>·</span> {filterCounts[f]}
                  </button>
                ))}
              </div>

              {/* Entry list */}
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9B9B95' }}>
                  <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: '400', marginBottom: '10px', color: '#C4C0BA' }}>Silencio por aquí.</div>
                  <p style={{ fontSize: '14px', fontFamily: sans, lineHeight: '1.6', margin: '0 0 24px' }}>
                    {filter === 'public' ? 'Aún no tienes entradas públicas.' : filter === 'private' ? 'No hay entradas privadas.' : 'Empieza escribiendo tu primera entrada.'}
                  </p>
                  <button onClick={() => navigate('/editor/new')} style={{ padding: '10px 20px', backgroundColor: '#1A1A18', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: sans, fontWeight: '500', cursor: 'pointer' }}>
                    Escribir algo
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filtered.map(entry => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      isHovered={hoveredEntry === entry.id}
                      isConfirmingDelete={deleteConfirmId === entry.id}
                      onHover={() => setHoveredEntry(entry.id)}
                      onHoverEnd={() => setHoveredEntry(null)}
                      onEdit={() => navigate(`/editor/${entry.id}`)}
                      onDeleteRequest={() => setDeleteConfirmId(entry.id)}
                      onDeleteConfirm={() => handleDelete(entry.id)}
                      onDeleteCancel={() => setDeleteConfirmId(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface EntryCardProps {
  entry: Entry;
  isHovered: boolean;
  isConfirmingDelete: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function EntryCard({ entry, isHovered, isConfirmingDelete, onHover, onHoverEnd, onEdit, onDeleteRequest, onDeleteConfirm, onDeleteCancel }: EntryCardProps) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      style={{
        backgroundColor: '#FFFFFF',
        border: `0.5px solid ${isHovered ? 'rgba(26,26,24,0.2)' : 'rgba(26,26,24,0.1)'}`,
        borderRadius: '8px',
        padding: '18px 20px',
        transition: 'border-color 0.15s',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        {/* Left content */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onEdit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '17px', fontWeight: '400', color: '#1A1A18', margin: 0, lineHeight: '1.3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {entry.title || 'Sin título'}
            </h2>
            <PrivacyBadge isPublic={entry.isPublic} />
          </div>
          <p style={{ fontSize: '13.5px', color: '#6B6B65', margin: '0 0 10px', fontFamily: "'Inter', sans-serif", lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {preview(entry.content)}
          </p>
          <span style={{ fontSize: '12px', color: '#9B9B95', fontFamily: "'Inter', sans-serif" }}>
            {fmtDateFull(entry.updatedAt)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, opacity: isHovered || isConfirmingDelete ? 1 : 0, transition: 'opacity 0.15s' }}>
          {isConfirmingDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#B85C3A', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>¿Eliminar?</span>
              <button onClick={onDeleteConfirm} style={iconBtnStyle('#EEF6F1', '#2D6A4F')} title="Confirmar">
                <Check size={13} strokeWidth={2} />
              </button>
              <button onClick={onDeleteCancel} style={iconBtnStyle('#FFF', '#6B6B65')} title="Cancelar">
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={onEdit} style={iconBtnStyle('#FFF', '#6B6B65')} title="Editar">
                <Pencil size={13} strokeWidth={1.5} />
              </button>
              <button onClick={onDeleteRequest} style={iconBtnStyle('#FFF', '#B85C3A')} title="Eliminar">
                <Trash2 size={13} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PrivacyBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '10px',
      backgroundColor: isPublic ? '#EEF6F1' : '#F0EDEA',
      fontSize: '11px',
      fontFamily: "'Inter', sans-serif",
      fontWeight: '500',
      color: isPublic ? '#2D6A4F' : '#8C7A6B',
      flexShrink: 0,
      letterSpacing: '0.2px',
    }}>
      {isPublic
        ? <><Globe size={10} strokeWidth={2} /> pública</>
        : <><Lock size={10} strokeWidth={2} /> privada</>
      }
    </span>
  );
}

function iconBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bg,
    border: '0.5px solid rgba(26,26,24,0.12)',
    borderRadius: '6px',
    cursor: 'pointer',
    color,
    transition: 'background 0.12s',
    padding: 0,
  };
}

const smLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#6B6B65',
  marginBottom: '7px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: '500',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
};