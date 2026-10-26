/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';

// Pages
import HomePage from './pages/HomePage';
import MinecraftHubPage from './pages/MinecraftHubPage';
import RobloxHubPage from './pages/RobloxHubPage';
import FortniteHubPage from './pages/FortniteHubPage';
import PokemonGoHubPage from './pages/PokemonGoHubPage';
import PalworldHubPage from './pages/PalworldHubPage';
import ToolsDirectoryPage from './pages/ToolsDirectoryPage';
import ToolDetailPage from './pages/ToolDetailPage';
import GamesPage from './pages/GamesPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import DisclaimerPage from './pages/DisclaimerPage';
import NotFoundPage from './pages/NotFoundPage';

import { getToolBySlug } from './data/gamesAndTools';
import AdLayout from './components/ads/AdLayout';

export default function App() {
  // Parse current route from window.location (clean HTML5 pathname) without any page-load history rewrites
  const getInitialPath = (): string => {
    // 1. Handle GitHub Pages 404 SPA redirect stored in sessionStorage (if any)
    if (typeof window !== 'undefined' && window.sessionStorage?.redirect) {
      const redirectUrl = window.sessionStorage.redirect;
      delete window.sessionStorage.redirect;
      try {
        const url = new URL(redirectUrl);
        return (url.pathname + url.search) || '/';
      } catch {
        // ignore and fallback
      }
    }

    // 2. Handle GitHub Pages query parameter (?p=/tools/slug or ?/tools/slug)
    const search = typeof window !== 'undefined' ? window.location.search : '';
    if (search && search.startsWith('?/')) {
      const decoded = decodeURIComponent(search.slice(1).replace(/~and~/g, '&'));
      return decoded || '/';
    }
    const searchParams = new URLSearchParams(search);
    if (searchParams.has('p')) {
      return searchParams.get('p') || '/';
    }

    // 3. Backward compatibility: if user hits a legacy hash URL (#/tools/slug)
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#')) {
      const hashPath = window.location.hash.replace(/^#\/?/, '/');
      if (hashPath && hashPath !== '/') {
        return hashPath;
      }
    }

    // 4. Standard clean URL pathname + search query
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    return `${path}${search}` || '/';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialPath());
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getInitialPath());
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Track page views in Google Analytics on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: currentRoute,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [currentRoute]);

  // Programmatic navigate function using HTML5 clean URLs (No hash!)
  const navigate = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname + window.location.search !== cleanPath) {
      window.history.pushState(null, '', cleanPath);
    }
    setCurrentRoute(cleanPath);
    window.scrollTo(0, 0);
  };

  // Route resolver
  const renderCurrentPage = () => {
    const rawPath = currentRoute.split('?')[0];
    const cleanRoute = (rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '')) || '/';
    const queryString = currentRoute.includes('?') ? currentRoute.split('?')[1] : '';
    const queryParams = new URLSearchParams(queryString);

    // 1. Home
    if (cleanRoute === '/' || cleanRoute === '') {
      return (
        <HomePage
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      );
    }

    // 2. Dedicated Minecraft Hub
    if (cleanRoute === '/minecraft' || cleanRoute === '/games/minecraft') {
      return <MinecraftHubPage onNavigate={navigate} />;
    }

    // 3. Dedicated Roblox Hub
    if (cleanRoute === '/roblox' || cleanRoute === '/games/roblox') {
      return <RobloxHubPage onNavigate={navigate} />;
    }

    // 4. Dedicated Fortnite Hub
    if (cleanRoute === '/fortnite' || cleanRoute === '/games/fortnite') {
      return <FortniteHubPage onNavigate={navigate} />;
    }

    // 5. Dedicated Pokémon GO Hub
    if (cleanRoute === '/pokemongo' || cleanRoute === '/games/pokemongo') {
      return <PokemonGoHubPage onNavigate={navigate} />;
    }

    // 6. Dedicated Palworld Hub
    if (cleanRoute === '/games/palworld' || cleanRoute === '/palworld' || cleanRoute === '/games/palworld/') {
      return <PalworldHubPage onNavigate={navigate} />;
    }

    // 7. Dedicated Genshin Impact Hub / Filter
    if (cleanRoute === '/genshin' || cleanRoute === '/games/genshin') {
      return <GamesPage selectedGameSlug="genshin" onNavigate={navigate} />;
    }

    // 8. Individual Tool Page (/tools/:slug)
    if (cleanRoute.startsWith('/tools/')) {
      const slug = cleanRoute.replace('/tools/', '').replace(/\/$/, '');
      const tool = getToolBySlug(slug);
      if (tool) {
        return <ToolDetailPage tool={tool} onNavigate={navigate} />;
      }
      return <NotFoundPage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }

    // 9. Tools Directory (/tools)
    if (cleanRoute === '/tools') {
      return <ToolsDirectoryPage onNavigate={navigate} />;
    }

    // 10. Games Page (/games)
    if (cleanRoute === '/games') {
      const gameSlug = queryParams.get('game');
      if (gameSlug === 'minecraft') {
        return <MinecraftHubPage onNavigate={navigate} />;
      }
      if (gameSlug === 'roblox') {
        return <RobloxHubPage onNavigate={navigate} />;
      }
      if (gameSlug === 'fortnite') {
        return <FortniteHubPage onNavigate={navigate} />;
      }
      if (gameSlug === 'pokemongo') {
        return <PokemonGoHubPage onNavigate={navigate} />;
      }
      if (gameSlug === 'palworld') {
        return <PalworldHubPage onNavigate={navigate} />;
      }
      return <GamesPage selectedGameSlug={gameSlug} onNavigate={navigate} />;
    }

    // 6. Categories Page (/categories)
    if (cleanRoute === '/categories') {
      const catId = queryParams.get('cat');
      return <CategoriesPage selectedCategoryId={catId} onNavigate={navigate} />;
    }

    // 7. Informational pages
    if (cleanRoute === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (cleanRoute === '/privacy') {
      return <PrivacyPolicyPage onNavigate={navigate} />;
    }
    if (cleanRoute === '/terms') {
      return <TermsPage onNavigate={navigate} />;
    }
    if (cleanRoute === '/disclaimer') {
      return <DisclaimerPage onNavigate={navigate} />;
    }

    // 8. 404
    return <NotFoundPage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <div>
        <Navbar
          currentPath={currentRoute}
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* 1. Top Header Banner Ad Area */}
        <AdLayout.Header currentPath={currentRoute} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {renderCurrentPage()}
        </main>
      </div>

      <Footer onNavigate={navigate} />

      {/* Global Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={(slug) => navigate(`/tools/${slug}`)}
      />
    </div>
  );
}
