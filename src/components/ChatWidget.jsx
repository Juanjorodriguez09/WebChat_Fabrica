import { useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  // 'closed': ChatWindow desmontado (conversación se pierde).
  // 'open': ChatWindow visible y expandido.
  // 'minimized': ChatWindow sigue montado (conversación se conserva) pero oculto.
  const [status, setStatus] = useState('closed');

  const isMounted = status !== 'closed';
  const isOpen = status === 'open';

  return (
    <div className="mc-widget-root">
      {isMounted && (
        <ChatWindow
          hidden={!isOpen}
          onClose={() => setStatus('closed')}
          onMinimize={() => setStatus('minimized')}
        />
      )}
      <button
        className="mc-toggle-btn"
        onClick={() => setStatus(isOpen ? 'closed' : 'open')}
        title={isOpen ? 'Cerrar chat' : 'Abrir asistente MiComercio'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
