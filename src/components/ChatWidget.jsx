import { useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mc-widget-root">
      {open && <ChatWindow onClose={() => setOpen(false)} />}
      <button
        className="mc-toggle-btn"
        onClick={() => setOpen(o => !o)}
        title={open ? 'Cerrar chat' : 'Abrir asistente MiComercio'}
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}
