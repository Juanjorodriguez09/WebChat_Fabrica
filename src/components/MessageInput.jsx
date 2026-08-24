import { useState, useRef } from 'react';

export default function MessageInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend({ text: text.trim() });
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendFile = (file) => {
    if (!file) return;
    onSend({ file });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (e) => sendFile(e.target.files[0]);

  // ── Drag & drop ──────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) sendFile(file);
  };

  // ── Paste (imagen del portapapeles) ──────────────────────────
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) sendFile(file);
        return;
      }
    }
  };

  return (
    <div
      className={`input-bar${dragging ? ' dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {dragging && <div className="drop-overlay">Suelta aquí para enviar</div>}
      <button
        className="attach-btn"
        onClick={() => fileRef.current.click()}
        disabled={loading}
        title="Adjuntar imagen o PDF"
      >
        📎
      </button>
      <input
        type="file"
        ref={fileRef}
        accept="image/*,.pdf,application/pdf"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <textarea
        className="input-text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Escribe un mensaje o pega una imagen..."
        rows={1}
        disabled={loading}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!text.trim() || loading}
      >
        {loading ? '⏳' : '➤'}
      </button>
    </div>
  );
}
