import { useState, useRef } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  // 'closed': ChatWindow desmontado (conversación se pierde).
  // 'open': ChatWindow visible y expandido.
  // 'minimized': ChatWindow sigue montado (conversación se conserva) pero oculto.
  const [status, setStatus] = useState('closed');
  const chatWindowRef = useRef(null);

  const isMounted = status !== 'closed';
  const isOpen = status === 'open';

  const handleToggleClick = () => {
    if (isOpen) {
      chatWindowRef.current?.requestClose();
    } else {
      setStatus('open');
    }
  };

  return (
    <div className="mc-widget-root">
      {isMounted && (
        <ChatWindow
          ref={chatWindowRef}
          hidden={!isOpen}
          onClose={() => setStatus('closed')}
          onMinimize={() => setStatus('minimized')}
        />
      )}
      <button
        className="mc-toggle-btn"
        onClick={handleToggleClick}
        title={isOpen ? 'Cerrar chat' : 'Abrir asistente MiComercio'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
