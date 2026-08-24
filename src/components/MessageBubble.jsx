import logoUrl from '../../public/logo.png';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  const formatText = (text) => {
    return text
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`bubble-wrapper ${isUser ? 'user' : 'bot'}`}>
      {!isUser && (
        <div className="avatar"><img src={logoUrl} alt="MiComercio" /></div>
      )}
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
        {message.image && (
          <img src={message.image} alt="adjunto" className="bubble-image" />
        )}
        {message.filename && (
          <div className="bubble-file">📄 {message.filename}</div>
        )}
        <span dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
      </div>
    </div>
  );
}
