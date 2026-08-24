// Import estático — pdfjs worker se registra sincrónicamente (WorkerMessageHandler)
import 'pdfjs-dist/build/pdf.worker.min.mjs';

// Polyfill corre después del import pero antes de cualquier mensaje entrante
if (typeof Promise.try === 'undefined') {
  Promise.try = function(fn) {
    return new Promise((resolve, reject) => {
      try { resolve(fn()); } catch(e) { reject(e); }
    });
  };
}
