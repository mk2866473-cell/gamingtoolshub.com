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
    // Prerendered page: Do NOT take over automatically on page load!
    // Crawlers (like Googlebot) see 100% static content without any JavaScript redirects or re-renders.
    // The interactive SPA only mounts after a deliberate user action:
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
  }
}
