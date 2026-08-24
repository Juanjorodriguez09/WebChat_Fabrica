import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
import './styles.css';

// Busca el contenedor o lo crea automáticamente
const container = document.getElementById('micomercio-chat') || (() => {
  const el = document.createElement('div');
  el.id = 'micomercio-chat';
  document.body.appendChild(el);
  return el;
})();

createRoot(container).render(<ChatWidget />);
