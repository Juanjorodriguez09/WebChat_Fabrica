import { useState } from 'react';

export default function RatingPrompt({ onSubmit, onSkip }) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleConfirm = () => {
    if (selected < 1 || selected > 5) return;
    onSubmit(selected);
  };

  return (
    <div className="mc-rating-overlay">
      <div className="mc-rating-card">
        <div className="mc-rating-title">¿Cómo calificarías esta conversación?</div>
        <div className="mc-rating-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              className="mc-rating-star"
              onClick={() => setSelected(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            >
              {(hovered || selected) >= n ? '★' : '☆'}
            </button>
          ))}
        </div>
        <div className="mc-rating-actions">
          <button type="button" className="mc-rating-skip" onClick={onSkip}>Omitir</button>
          <button
            type="button"
            className="mc-rating-confirm"
            onClick={handleConfirm}
            disabled={selected === 0}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
