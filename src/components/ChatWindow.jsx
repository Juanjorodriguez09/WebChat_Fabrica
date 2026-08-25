import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { sendMessage } from '../services/api';
import { processPdf } from '../services/pdf';
import logoUrl from '../../public/logo.png';

const WELCOME = '👋 Soy el asistente de *MiComercio*. Te ayudo con ventas, inventario y gastos. ¿En qué te ayudo?';

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: WELCOME },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  };

  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const doSend = async (apiPayload, userMsg) => {
    addMessage(userMsg);
    setLoading(true);
    try {
      const res = await sendMessage(apiPayload);
      if (res.requires_confirmation) {
        setPendingConfirmation(true);
        addMessage({ role: 'bot', text: res.message, confirmation: true });
      } else {
        setPendingConfirmation(false);
        addMessage({ role: 'bot', text: res.message || '✅ Listo.' });
      }
    } catch {
      addMessage({ role: 'bot', text: '❌ Error de conexión. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (answer) => {
    setPendingConfirmation(false);
    await doSend({ text: answer }, { role: 'user', text: answer === 'SI' ? '✅ Confirmar' : '❌ Cancelar' });
  };

  const handleSend = async ({ text, file }) => {
    if (loading) return;

    let userMsg = { role: 'user', text: '' };
    let apiPayload = {};

    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name?.endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (isPdf) {
        userMsg.text = `📄 ${file.name}`;
        userMsg.filename = file.name;
        // Mostrar mensaje del usuario inmediatamente
        addMessage(userMsg);
        setLoading(true);
        try {
          const result = await processPdf(file);
          const payload = { text: '', imageBase64: result.imageBase64, imageMime: result.imageMime };
          try {
            const res = await sendMessage(payload);
            if (res.requires_confirmation) {
              setPendingConfirmation(true);
              addMessage({ role: 'bot', text: res.message, confirmation: true });
            } else {
              setPendingConfirmation(false);
              addMessage({ role: 'bot', text: res.message || '✅ Listo.' });
            }
          } catch {
            addMessage({ role: 'bot', text: '❌ Error de conexión. Intenta de nuevo.' });
          }
        } catch (err) {
          console.error('PDF error:', err);
          addMessage({ role: 'bot', text: '❌ No pude leer el PDF. Intenta de nuevo.' });
        } finally {
          setLoading(false);
        }
        return;
      } else if (isImage) {
        const reader = new FileReader();
        const base64 = await new Promise(res => {
          reader.onload = e => res(e.target.result);
          reader.readAsDataURL(file);
        });
        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)[1];
        userMsg.text = '🖼️ Imagen adjunta';
        userMsg.image = base64;
        apiPayload = { text: '', imageBase64: data, imageMime: mime };
      } else {
        addMessage({ role: 'bot', text: '❌ Formato no soportado. Solo imágenes y PDF.' });
        return;
      }
    } else {
      userMsg.text = text;
      apiPayload = { text };
    }

    await doSend(apiPayload, userMsg);
  };

  const handleWindowDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !loading) handleSend({ file });
  };

  return (
    <div
      className="chat-window"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleWindowDrop}
    >
      <div className="chat-header">
        <img src={logoUrl} alt="MiComercio" className="header-logo" />
        <div style={{ flex: 1 }}>
          <div className="header-title">MiComercio Asistente</div>
          <div className="header-sub">En línea</div>
        </div>
        {onClose && (
          <button className="header-close-btn" onClick={onClose} title="Cerrar">✕</button>
        )}
      </div>

      <div className="messages">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="bubble-wrapper bot">
            <div className="avatar"><img src={logoUrl} alt="MiComercio" /></div>
            <div className="bubble bubble-bot typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        {pendingConfirmation && !loading && (
          <div className="confirm-buttons">
            <button className="btn-confirm" onClick={() => handleConfirm('SI')}>✅ Confirmar</button>
            <button className="btn-cancel" onClick={() => handleConfirm('NO')}>❌ Cancelar</button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} loading={loading || pendingConfirmation} />
    </div>
  );
}
