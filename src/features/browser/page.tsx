import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';

type HistoryEntry = {
  url: string | null;
  title: string;
};

type GitHubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
} | null;

type GitHubOrg = {
  login: string;
  name: string | null;
  description: string | null;
  html_url: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  blog: string | null;
  location: string | null;
} | null;

type GitHubDataType = 'repo' | 'org' | null;

// Check if URL is a GitHub URL
function isGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com';
  } catch {
    return false;
  }
}

// Parse GitHub URL to determine type and extract info
function parseGitHubUrl(url: string): { type: GitHubDataType; owner: string; repo?: string } | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { type: 'repo', owner: pathParts[0], repo: pathParts[1] };
    } else if (pathParts.length === 1) {
      return { type: 'org', owner: pathParts[0] };
    }
  } catch {}
  return null;
}

export function Browser() {
  const { t } = useLanguage();
  const { setStatusText } = useStatus();
  const projects = t.projects.items;

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([{ url: null, title: t.browser.home }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [githubRepo, setGithubRepo] = useState<GitHubRepo>(null);
  const [githubOrg, setGithubOrg] = useState<GitHubOrg>(null);
  const [githubType, setGithubType] = useState<GitHubDataType>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const displayUrl = currentUrl || 'about:home';
  const isGitHub = currentUrl ? isGitHubUrl(currentUrl) : false;

  // Update status bar
  useEffect(() => {
    if (isLoading) {
      setStatusText(t.browser.loading);
    } else if (currentUrl) {
      setStatusText(t.browser.done);
    } else {
      setStatusText(t.browser.welcome);
    }
    return () => setStatusText('');
  }, [currentUrl, isLoading, setStatusText, t.browser]);

  // Fetch GitHub data when URL changes
  useEffect(() => {
    if (!currentUrl || !isGitHubUrl(currentUrl)) {
      setGithubRepo(null);
      setGithubOrg(null);
      setGithubType(null);
      setGithubError(null);
      return;
    }

    const githubInfo = parseGitHubUrl(currentUrl);
    if (!githubInfo) {
      setGithubError('Invalid GitHub URL');
      setGithubRepo(null);
      setGithubOrg(null);
      setGithubType(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setGithubError(null);
    setGithubRepo(null);
    setGithubOrg(null);
    setGithubType(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const apiUrl = githubInfo.type === 'repo'
      ? `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repo}`
      : `https://api.github.com/orgs/${githubInfo.owner}`;

    fetch(apiUrl, {
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          const notFoundMsg = githubInfo.type === 'repo' ? 'Repository not found' : 'Organization not found';
          throw new Error(res.status === 404 ? notFoundMsg : 'Failed to fetch');
        }
        return res.json();
      })
      .then((data) => {
        if (githubInfo.type === 'repo') {
          setGithubRepo(data);
          setGithubType('repo');
        } else {
          setGithubOrg(data);
          setGithubType('org');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setGithubError('Request timed out');
        } else {
          setGithubError(err.message || 'Failed to load');
        }
        setGithubRepo(null);
        setGithubOrg(null);
        setGithubType(null);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentUrl]);

  const navigateTo = useCallback((url: string, title: string) => {
    setGithubRepo(null);
    setGithubOrg(null);
    setGithubType(null);
    setGithubError(null);

    // Truncate history if we're not at the end
    const newHistory = [...history.slice(0, historyIndex + 1), { url, title }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(url);

    // For non-GitHub URLs, set loading (iframe handles it)
    if (!isGitHubUrl(url)) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newUrl = history[newIndex].url;
      setHistoryIndex(newIndex);
      setCurrentUrl(newUrl);
      setGithubRepo(null);
      setGithubOrg(null);
      setGithubType(null);
      setGithubError(null);

      // Only set loading timeout for non-GitHub URLs
      if (!newUrl || !isGitHubUrl(newUrl)) {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 300);
      }
    }
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const newUrl = history[newIndex].url;
      setHistoryIndex(newIndex);
      setCurrentUrl(newUrl);
      setGithubRepo(null);
      setGithubOrg(null);
      setGithubType(null);
      setGithubError(null);

      // Only set loading timeout for non-GitHub URLs
      if (!newUrl || !isGitHubUrl(newUrl)) {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 300);
      }
    }
  }, [historyIndex, history]);

  const goHome = useCallback(() => {
    setCurrentUrl(null);
    setGithubRepo(null);
    setGithubOrg(null);
    setGithubType(null);
    setGithubError(null);
    setHistory([{ url: null, title: t.browser.home }]);
    setHistoryIndex(0);
  }, [t.browser.home]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div class="ie-browser">
      <div class="ie-menu-bar">
        <span class="ie-menu-item">File</span>
        <span class="ie-menu-item">Edit</span>
        <span class="ie-menu-item">View</span>
        <span class="ie-menu-item">Go</span>
        <span class="ie-menu-item">Favorites</span>
        <span class="ie-menu-item">Help</span>
      </div>

      <div class="ie-toolbar">
        <button
          class={`ie-toolbar-btn win98-tooltip ${!canGoBack ? 'ie-toolbar-btn-disabled' : ''}`}
          onClick={goBack}
          disabled={!canGoBack}
          title="Back"
        >
          <img src="/assets/icons/ie-back.png" alt="Back" class="ie-toolbar-icon" />
        </button>
        <button
          class={`ie-toolbar-btn win98-tooltip ${!canGoForward ? 'ie-toolbar-btn-disabled' : ''}`}
          onClick={goForward}
          disabled={!canGoForward}
          title="Forward"
        >
          <img src="/assets/icons/ie-forward.png" alt="Forward" class="ie-toolbar-icon" />
        </button>
        <button
          class={`ie-toolbar-btn win98-tooltip ${isLoading ? 'ie-toolbar-btn-active' : 'ie-toolbar-btn-disabled'}`}
          onClick={() => setIsLoading(false)}
          disabled={!isLoading}
          title="Stop"
        >
          <img src="/assets/icons/ie-stop.png" alt="Stop" class="ie-toolbar-icon" />
        </button>
        <button
          class="ie-toolbar-btn win98-tooltip"
          onClick={goHome}
          title="Home"
        >
          <img src="/assets/icons/ie-home.png" alt="Home" class="ie-toolbar-icon" />
        </button>
      </div>

      <div class="ie-address-bar">
        <span class="ie-address-label">Address</span>
        <div class="ie-address-input-wrapper">
          <input
            type="text"
            class="ie-address-input"
            value={displayUrl}
            readOnly
          />
        </div>
        <button
          class="ie-go-btn"
          onClick={() => {
            if (currentUrl) {
              if (isGitHub) {
                // Re-trigger fetch
                setGithubRepo(null);
                setGithubOrg(null);
                setGithubType(null);
                setIsLoading(true);
                const githubInfo = parseGitHubUrl(currentUrl);
                if (githubInfo) {
                  const apiUrl = githubInfo.type === 'repo'
                    ? `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repo}`
                    : `https://api.github.com/orgs/${githubInfo.owner}`;

                  fetch(apiUrl)
                    .then(res => {
                      if (!res.ok) throw new Error('Failed to fetch');
                      return res.json();
                    })
                    .then(data => {
                      if (githubInfo.type === 'repo') {
                        setGithubRepo(data);
                        setGithubType('repo');
                      } else {
                        setGithubOrg(data);
                        setGithubType('org');
                      }
                      setIsLoading(false);
                    })
                    .catch(err => {
                      setGithubError(err.message || 'Failed to load');
                      setIsLoading(false);
                    });
                }
              } else {
                setIsLoading(true);
                if (iframeRef.current) {
                  iframeRef.current.src = currentUrl;
                }
                setTimeout(() => setIsLoading(false), 500);
              }
            }
          }}
        >Go</button>
      </div>

      {/* Browser Content Area */}
      <div class="ie-content">
        {currentUrl ? (
          isGitHub ? (
            // GitHub API View
            <div class="github-view">
              {isLoading ? (
                <div class="github-loading">
                  <div class="github-spinner"></div>
                  <p>{t.browser.loading}</p>
                </div>
              ) : githubError ? (
                <div class="github-error">
                  <h2>Error</h2>
                  <p>{githubError}</p>
                  <button class="github-back-btn" onClick={goHome}>
                    {t.browser.home}
                  </button>
                </div>
              ) : githubType === 'repo' && githubRepo ? (
                <div class="github-repo">
                  <div class="github-header">
                    <img
                      src={githubRepo.owner.avatar_url}
                      alt={githubRepo.owner.login}
                      class="github-avatar"
                    />
                    <div class="github-title">
                      <h1>
                        <a href={`https://github.com/${githubRepo.owner.login}`} target="_blank" rel="noopener">
                          {githubRepo.owner.login}
                        </a>
                        /
                        <a href={githubRepo.html_url} target="_blank" rel="noopener">
                          {githubRepo.name}
                        </a>
                      </h1>
                      {githubRepo.description && (
                        <p class="github-description">{githubRepo.description}</p>
                      )}
                    </div>
                  </div>

                  <div class="github-stats">
                    <div class="github-stat">
                      <img src="/assets/icons/star.png" alt="stars" class="github-stat-icon" />
                      <span class="github-stat-value">{githubRepo.stargazers_count.toLocaleString()}</span>
                      <span class="github-stat-label">stars</span>
                    </div>
                    <div class="github-stat">
                      <img src="/assets/icons/fork.png" alt="forks" class="github-stat-icon" />
                      <span class="github-stat-value">{githubRepo.forks_count.toLocaleString()}</span>
                      <span class="github-stat-label">forks</span>
                    </div>
                    {githubRepo.language && (
                      <div class="github-stat">
                        <span class="github-lang-dot" data-lang={githubRepo.language}></span>
                        <span class="github-stat-value">{githubRepo.language}</span>
                      </div>
                    )}
                  </div>

                  <div class="github-actions">
                    <a
                      href={githubRepo.html_url}
                      target="_blank"
                      rel="noopener"
                      class="github-btn github-btn-primary"
                    >
                      View on GitHub
                    </a>
                  </div>

                  <div class="github-footer">
                    <p>This repository is viewed via the GitHub API.</p>
                    <p>Click "View on GitHub" to visit the full repository.</p>
                  </div>
                </div>
              ) : githubType === 'org' && githubOrg ? (
                <div class="github-repo">
                  <div class="github-header">
                    <img
                      src={githubOrg.avatar_url}
                      alt={githubOrg.login}
                      class="github-avatar"
                    />
                    <div class="github-title">
                      <h1>
                        <a href={githubOrg.html_url || `https://github.com/${githubOrg.login}`} target="_blank" rel="noopener">
                          {githubOrg.name || githubOrg.login}
                        </a>
                      </h1>
                      {githubOrg.description && (
                        <p class="github-description">{githubOrg.description}</p>
                      )}
                    </div>
                  </div>

                  <div class="github-stats">
                    <div class="github-stat">
                      <img src="/assets/icons/repos.png" alt="repos" class="github-stat-icon" />
                      <span class="github-stat-value">{githubOrg.public_repos.toLocaleString()}</span>
                      <span class="github-stat-label">repos</span>
                    </div>
                    <div class="github-stat">
                      <img src="/assets/icons/people.png" alt="followers" class="github-stat-icon" />
                      <span class="github-stat-value">{githubOrg.followers.toLocaleString()}</span>
                      <span class="github-stat-label">followers</span>
                    </div>
                    {githubOrg.location && (
                      <div class="github-stat">
                        <img src="/assets/icons/location.png" alt="location" class="github-stat-icon" />
                        <span class="github-stat-value">{githubOrg.location}</span>
                      </div>
                    )}
                  </div>

                  {githubOrg.blog && (
                    <div class="github-org-link">
                      <a href={githubOrg.blog.startsWith('http') ? githubOrg.blog : `https://${githubOrg.blog}`} target="_blank" rel="noopener">
                        {githubOrg.blog}
                      </a>
                    </div>
                  )}

                  <div class="github-actions">
                    <a
                      href={githubOrg.html_url || `https://github.com/${githubOrg.login}`}
                      target="_blank"
                      rel="noopener"
                      class="github-btn github-btn-primary"
                    >
                      View on GitHub
                    </a>
                  </div>

                  <div class="github-footer">
                    <p>This organization is viewed via the GitHub API.</p>
                    <p>Click "View on GitHub" to visit the full organization page.</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            // Regular iframe for non-GitHub URLs
            <iframe
              ref={iframeRef}
              class="ie-iframe"
              src={currentUrl}
              onLoad={() => setIsLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Browser content"
            />
          )
        ) : (
          // Juuliverse Homepage
          <div class="aol-homepage">
            {/* Juuliverse Style Header */}
            <div class="aol-header">
              <div class="aol-logo">Juuliverse</div>
              <div class="aol-welcome">
                <h1>{t.browser.welcome}</h1>
                <p class="aol-got-mail">{t.browser.youveGotMail}</p>
              </div>
            </div>

            {/* Channels Section */}
            <div class="aol-section">
              <h2 class="aol-section-title">{t.browser.myProjects}</h2>
              <div class="aol-channels">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    class="aol-channel-btn"
                    onClick={() => navigateTo(project.url, project.name)}
                  >
                    <div class="aol-channel-icon">
                      <span class="aol-icon-globe"></span>
                    </div>
                    <div class="aol-channel-info">
                      <span class="aol-channel-name">{project.name}</span>
                      <span class="aol-channel-desc">{t.browser.clickToVisit}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div class="aol-footer">
              <span>Today on Juuliverse:</span>
              <a href="https://erdetdns.dk" target="_blank">DNS</a> |
              <a href="https://github.com/baander-app/baander/" target="_blank"> Music</a> |
              <a href="https://iplease.dk" target="_blank"> IP</a> |
              <a href="https://luft.dk" target="_blank"> Luft</a>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div class="ie-status-bar">
        <div class="ie-status-text">
          {isLoading ? t.browser.loading : (currentUrl ? t.browser.done : t.browser.welcome)}
        </div>
        <div class="ie-status-zone">
          <span class="ie-zone-icon"></span>
          {t.browser.internetZone}
        </div>
      </div>
    </div>
  );
}
