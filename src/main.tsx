import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const isPrerendered = rootElement.getAttribute('data-prerendered') === 'true';

  if (!isPrerendered) {
    // Normal SPA boot (e.g. homepage SPA root or dynamic navigation)
    createRoot(rootElement).render(<App />);
  } else {
    // Prerendered page: the static HTML stays in the document for crawlers,
    // but real visitors get the interactive SPA automatically — no click needed.
    // The SPA mounts on window load (or after a short fallback delay, or
    // instantly if the launch button is clicked first).
    let isMounted = false;
    const mountSpa = () => {
      if (isMounted) return;
      isMounted = true;
      rootElement.removeAttribute('data-prerendered');
      createRoot(rootElement).render(<App />);
    };

    // Attach to the deliberate user action button ("Open the interactive tool")
    const launchBtn = document.getElementById('open-interactive-tool-btn');
    if (launchBtn) {
      launchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mountSpa();
      });
    }

    // Also listen to any secondary launch action elements
    document.querySelectorAll('.launch-tool-action').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        mountSpa();
      });
    });

    // Auto-mount for real visitors: on full page load, with a fallback
    // timer so a slow asset can never leave the visitor on the static page.
    if (document.readyState === 'complete') {
      mountSpa();
    } else {
      window.addEventListener('load', mountSpa);
      setTimeout(mountSpa, 1000);
    }
  }
}
