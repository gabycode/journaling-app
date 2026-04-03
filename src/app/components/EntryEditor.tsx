import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDiario } from '../context/DiarioContext';
import { ArrowLeft, Lock, Globe, Trash2, Check, ExternalLink } from 'lucide-react';

const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const badWords = [
  'asqueroso',
  'basura',
  'carajo',
  'estupido',
  'estupida',
  'feo',
  'fea',
  'idiota',
  'imbecil',
  'joder',
  'maldito',
  'maldita',
  'malo',
  'mala',
  'mierda',
  'odio',
  'puto',
  'puta',
];

function normalizeForFilter(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBadWordsRegex(words: string[]) {
  const wordPatterns = words.map((word) => {
    const chars = [...word].map((char) => `${escapeForRegex(char)}+`);
    return chars.join('[\\s._-]*');
  });

  return new RegExp(`\\b(?:${wordPatterns.join('|')})\\b`, 'gi');
}

const badWordsRegex = buildBadWordsRegex(badWords);

function findBadWords(text: string) {
  const normalized = normalizeForFilter(text);
  if (!normalized) return [];

  const matches = new Set<string>();
  badWordsRegex.lastIndex = 0;

  for (const match of normalized.matchAll(badWordsRegex)) {
    const found = match[0]?.replace(/[\s._-]+/g, '');
    if (found) matches.add(found);
  }

  return [...matches];
}

function wordCount(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function EntryEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, getEntry, createEntry, updateEntry, deleteEntry } = useDiario();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [savedState, setSavedState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [entryId, setEntryId] = useState<string | undefined>(id);
  const [linkCopied, setLinkCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    if (!isNew && id) {
      const entry = getEntry(id);
      if (entry && entry.userId === user.id) {
        setTitle(entry.title);
        setContent(entry.content);
        setIsPublic(entry.isPublic);
      } else {
        navigate('/dashboard');
      }
    } else {
      // Focus title on new entry
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [id, user]);

  const autoResizeTitle = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, []);

  const autoResizeContent = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = Math.max(contentRef.current.scrollHeight, 400) + 'px';
    }
  }, []);

  useEffect(() => { autoResizeTitle(); }, [title]);
  useEffect(() => { autoResizeContent(); }, [content]);

  const handleSave = async () => {
    if (!user) return;

    const textToValidate = `${title} ${content}`.trim();
    const foundBadWords = findBadWords(textToValidate);
    if (foundBadWords.length > 0) {
      const wordsText = foundBadWords.slice(0, 3).join(', ');
      setValidationError(`Tu entrada contiene palabras no permitidas: ${wordsText}.`);
      setSavedState('idle');
      return;
    }

    setValidationError(null);
    setSavedState('saving');
    if (isNew || !entryId) {
      const newId = createEntry(title.trim() || 'Sin título', content, isPublic);
      setEntryId(newId);
      window.history.replaceState({}, '', `/editor/${newId}`);
    } else {
      updateEntry(entryId, { title: title.trim() || 'Sin título', content, isPublic });
    }
    setIsDirty(false);
    setSavedState('saved');
    setTimeout(() => setSavedState('idle'), 2500);
  };

  const handleDelete = () => {
    if (entryId) deleteEntry(entryId);
    navigate('/dashboard');
  };

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('¿Salir sin guardar los cambios?')) navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
    setValidationError(null);
    setSavedState('idle');
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
    setValidationError(null);
    setSavedState('idle');
  };

  const handleTogglePrivacy = () => {
    setIsPublic(p => !p);
    setIsDirty(true);
    setSavedState('idle');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/entry/${entryId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const words = wordCount(content);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', fontFamily: sans, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'rgba(250, 250, 248, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '0.5px solid rgba(26,26,24,0.1)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>

        {/* Left: back + word count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleBack}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B65', fontFamily: sans, fontSize: '13px', padding: '6px 0', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1A1A18'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B6B65'}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span className="hidden sm:inline">Mis entradas</span>
          </button>

          <div style={{ width: '0.5px', height: '16px', backgroundColor: 'rgba(26,26,24,0.15)' }} />

          <span style={{ fontSize: '12px', color: '#9B9B95', fontFamily: sans }}>
            {words === 0 ? 'Sin texto' : words === 1 ? '1 palabra' : `${words} palabras`}
          </span>
        </div>

        {/* Right: privacy toggle + save + delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Public link button */}
          {isPublic && entryId && !isNew && (
            <button
              onClick={handleCopyLink}
              title="Copiar enlace público"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: 'none', border: '0.5px solid rgba(26,26,24,0.15)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#2D6A4F', fontFamily: sans, transition: 'all 0.15s' }}
            >
              {linkCopied ? <><Check size={12} strokeWidth={2} /> Copiado</> : <><ExternalLink size={12} strokeWidth={1.5} /><span className="hidden sm:inline"> Compartir</span></>}
            </button>
          )}

          {/* Privacy toggle */}
          <button
            onClick={handleTogglePrivacy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isPublic ? '#EEF6F1' : '#F0EDEA',
              border: `0.5px solid ${isPublic ? 'rgba(45,106,79,0.25)' : 'rgba(26,26,24,0.15)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12.5px',
              color: isPublic ? '#2D6A4F' : '#6B6B65',
              fontFamily: sans,
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            {isPublic ? <Globe size={12} strokeWidth={2} /> : <Lock size={12} strokeWidth={2} />}
            <span className="hidden sm:inline">{isPublic ? 'Pública' : 'Privada'}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              backgroundColor: savedState === 'saved' ? '#EEF6F1' : '#1A1A18',
              color: savedState === 'saved' ? '#2D6A4F' : '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: sans,
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { if (savedState !== 'saved') e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {savedState === 'saved' ? <><Check size={13} strokeWidth={2} /> Guardado</> : savedState === 'saving' ? 'Guardando…' : 'Guardar'}
          </button>

          {/* Delete — only for existing entries */}
          {!isNew && entryId && (
            confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#B85C3A', fontFamily: sans }}>¿Eliminar?</span>
                <button onClick={handleDelete} style={{ padding: '6px 10px', backgroundColor: '#B85C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: sans, cursor: 'pointer' }}>Sí</button>
                <button onClick={() => setConfirmDelete(false)} style={{ padding: '6px 10px', backgroundColor: 'transparent', color: '#6B6B65', border: '0.5px solid rgba(26,26,24,0.15)', borderRadius: '6px', fontSize: '12px', fontFamily: sans, cursor: 'pointer' }}>No</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Eliminar entrada"
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '0.5px solid rgba(26,26,24,0.15)', borderRadius: '6px', cursor: 'pointer', color: '#9B9B95', transition: 'all 0.15s', padding: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#B85C3A'; e.currentTarget.style.borderColor = 'rgba(184,92,58,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9B9B95'; e.currentTarget.style.borderColor = 'rgba(26,26,24,0.15)'; }}
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Writing area */}
      <div style={{ flex: 1, maxWidth: '680px', margin: '0 auto', width: '100%', padding: '48px 24px 80px' }}>

        {validationError && (
          <div
            style={{
              marginBottom: '18px',
              backgroundColor: '#FFF1EE',
              border: '0.5px solid rgba(184,92,58,0.35)',
              borderRadius: '8px',
              color: '#8F3F24',
              fontSize: '13px',
              fontFamily: sans,
              padding: '10px 12px',
            }}
          >
            {validationError}
          </div>
        )}

        {/* Title */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="Título de tu entrada..."
          rows={1}
          style={{
            width: '100%',
            fontFamily: serif,
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: '400',
            color: '#1A1A18',
            background: 'none',
            border: 'none',
            outline: 'none',
            resize: 'none',
            lineHeight: '1.25',
            marginBottom: '4px',
            padding: '0',
            boxSizing: 'border-box',
            overflowY: 'hidden',
            letterSpacing: '-0.5px',
          }}
          onFocus={autoResizeTitle}
        />

        {/* Separator */}
        <div style={{ width: '40px', height: '0.5px', backgroundColor: 'rgba(26,26,24,0.2)', margin: '20px 0 28px' }} />

        {/* Content */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Escribe lo que sientes..."
          style={{
            width: '100%',
            fontFamily: sans,
            fontSize: '16px',
            color: '#1A1A18',
            background: 'none',
            border: 'none',
            outline: 'none',
            resize: 'none',
            lineHeight: '1.85',
            padding: '0',
            boxSizing: 'border-box',
            overflowY: 'hidden',
            minHeight: '400px',
          }}
          onFocus={autoResizeContent}
        />
      </div>
    </div>
  );
}
