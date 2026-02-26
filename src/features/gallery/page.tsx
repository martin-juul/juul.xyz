import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import './gallery.css';

type Image = {
  filename: string;
  path: string;
};

type Album = {
  name: string;
  slug: string;
  path: string;
  cover: string;
  images: Image[];
};

// Hardcoded album manifest
const ALBUMS: Album[] = [
  {
    name: 'Beginning',
    slug: 'beginning',
    path: '/assets/gallery/beginning',
    cover: '/assets/gallery/beginning/1.jpeg',
    images: [
      { filename: '1.jpeg', path: '/assets/gallery/beginning/1.jpeg' },
      { filename: '2.heic', path: '/assets/gallery/beginning/2.heic' },
      { filename: '3.jpeg', path: '/assets/gallery/beginning/3.jpeg' },
      { filename: '3-3.jpeg', path: '/assets/gallery/beginning/3-3.jpeg' },
      { filename: '3-4.jpeg', path: '/assets/gallery/beginning/3-4.jpeg' },
      { filename: '3-5.jpeg', path: '/assets/gallery/beginning/3-5.jpeg' },
      { filename: '3-6.jpeg', path: '/assets/gallery/beginning/3-6.jpeg' },
      { filename: '3-7.jpeg', path: '/assets/gallery/beginning/3-7.jpeg' },
      { filename: '3-8.jpeg', path: '/assets/gallery/beginning/3-8.jpeg' },
      { filename: '4.jpeg', path: '/assets/gallery/beginning/4.jpeg' },
      { filename: '5.jpeg', path: '/assets/gallery/beginning/5.jpeg' },
      { filename: '6.jpeg', path: '/assets/gallery/beginning/6.jpeg' },
      { filename: '6-5.jpeg', path: '/assets/gallery/beginning/6-5.jpeg' },
      { filename: '7.jpeg', path: '/assets/gallery/beginning/7.jpeg' },
      { filename: '7-5.jpeg', path: '/assets/gallery/beginning/7-5.jpeg' },
      { filename: '8.jpeg', path: '/assets/gallery/beginning/8.jpeg' },
      { filename: '8-6.jpeg', path: '/assets/gallery/beginning/8-6.jpeg' },
      { filename: '9.jpeg', path: '/assets/gallery/beginning/9.jpeg' },
      { filename: '9-3.jpeg', path: '/assets/gallery/beginning/9-3.jpeg' },
      { filename: '10.jpeg', path: '/assets/gallery/beginning/10.jpeg' },
      { filename: '11.jpeg', path: '/assets/gallery/beginning/11.jpeg' },
      { filename: '12.jpeg', path: '/assets/gallery/beginning/12.jpeg' },
      { filename: '13.jpeg', path: '/assets/gallery/beginning/13.jpeg' },
      { filename: '14.jpeg', path: '/assets/gallery/beginning/14.jpeg' },
      { filename: '15.jpeg', path: '/assets/gallery/beginning/15.jpeg' },
      { filename: '16.jpeg', path: '/assets/gallery/beginning/16.jpeg' },
      { filename: '17.jpeg', path: '/assets/gallery/beginning/17.jpeg' },
      { filename: '18.jpeg', path: '/assets/gallery/beginning/18.jpeg' },
      { filename: '19.jpeg', path: '/assets/gallery/beginning/19.jpeg' },
      { filename: '20.jpeg', path: '/assets/gallery/beginning/20.jpeg' },
      { filename: '21.jpeg', path: '/assets/gallery/beginning/21.jpeg' },
      { filename: '22.jpeg', path: '/assets/gallery/beginning/22.jpeg' },
      { filename: '23.jpeg', path: '/assets/gallery/beginning/23.jpeg' },
      { filename: '24.jpeg', path: '/assets/gallery/beginning/24.jpeg' },
      { filename: '25.jpeg', path: '/assets/gallery/beginning/25.jpeg' },
      { filename: '26.jpeg', path: '/assets/gallery/beginning/26.jpeg' },
      { filename: '27.jpeg', path: '/assets/gallery/beginning/27.jpeg' },
      { filename: '28.jpeg', path: '/assets/gallery/beginning/28.jpeg' },
      { filename: '29.jpeg', path: '/assets/gallery/beginning/29.jpeg' },
      { filename: '30.jpeg', path: '/assets/gallery/beginning/30.jpeg' },
      { filename: '31.jpeg', path: '/assets/gallery/beginning/31.jpeg' },
      { filename: '32.jpeg', path: '/assets/gallery/beginning/32.jpeg' },
      { filename: '33.jpeg', path: '/assets/gallery/beginning/33.jpeg' },
      { filename: '34.jpeg', path: '/assets/gallery/beginning/34.jpeg' },
      { filename: '35.jpeg', path: '/assets/gallery/beginning/35.jpeg' },
      { filename: '36.jpeg', path: '/assets/gallery/beginning/36.jpeg' },
    ],
  },
];

// Helper to find album by slug
function getAlbumBySlug(slug: string): Album | undefined {
  return ALBUMS.find(a => a.slug === slug);
}

// Cover List View - shows all albums
function CoverList({ onSelectAlbum }: { onSelectAlbum: (album: Album) => void }) {
  return (
    <div class="gallery-cover-list">
      {ALBUMS.map((album) => (
        <div
          key={album.slug}
          class="gallery-album-card"
          onDblClick={() => onSelectAlbum(album)}
          onClick={(e) => e.stopPropagation()}
        >
          <div class="gallery-album-cover">
            <img src={album.cover} alt={album.name} />
          </div>
          <div class="gallery-album-info">
            <span class="gallery-album-name">{album.name}</span>
            <span class="gallery-album-count">{album.images.length} images</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Slideshow Viewer - shows images in an album
function SlideshowViewer({
  album,
  currentIndex,
  onNavigate,
  onBack,
}: {
  album: Album;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onBack: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'file' | 'view' | 'help' | null>(null);
  const slideshowRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const currentImage = album.images[currentIndex];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Slideshow timer
  useEffect(() => {
    if (isPlaying) {
      slideshowRef.current = window.setInterval(() => {
        onNavigate((currentIndex + 1) % album.images.length);
      }, 3000);
    } else {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
        slideshowRef.current = null;
      }
    }
    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
      }
    };
  }, [isPlaying, currentIndex, album.images.length, onNavigate]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailRef.current) {
      const thumbnails = thumbnailRef.current.querySelectorAll('.gallery-thumb');
      if (thumbnails[currentIndex]) {
        thumbnails[currentIndex].scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, album.images.length, onBack]);

  const goToPrevious = useCallback(() => {
    const next = currentIndex === 0 ? album.images.length - 1 : currentIndex - 1;
    onNavigate(next);
  }, [currentIndex, album.images.length, onNavigate]);

  const goToNext = useCallback(() => {
    const next = (currentIndex + 1) % album.images.length;
    onNavigate(next);
  }, [currentIndex, album.images.length, onNavigate]);

  return (
    <div class="gallery-container">
      {/* Menu Bar */}
      <div class="gallery-menu-bar" ref={menuRef}>
        <div class="gallery-menu-trigger">
          <span
            class={`gallery-menu-item ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
          >
            File
          </span>
          {activeMenu === 'file' && (
            <div class="gallery-dropdown">
              <button class="gallery-dropdown-item" onClick={() => { setActiveMenu(null); onBack(); }}>
                Back to Albums
              </button>
              <div class="gallery-dropdown-separator" />
              <button class="gallery-dropdown-item" onClick={() => setActiveMenu(null)}>
                Exit
              </button>
            </div>
          )}
        </div>
        <span
          class="gallery-menu-item"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'view' ? null : 'view');
          }}
        >
          View
        </span>
        <span class="gallery-menu-item">Help</span>
      </div>

      {/* Toolbar */}
      <div class="gallery-toolbar">
        <button
          class="gallery-toolbar-btn"
          onClick={onBack}
          title="Back to Albums"
        >
          📁
        </button>
        <div class="gallery-toolbar-separator" />

        <button
          class="gallery-toolbar-btn"
          onClick={goToPrevious}
          title="Previous"
        >
          ◀
        </button>
        <button
          class={`gallery-toolbar-btn ${isPlaying ? 'active' : ''}`}
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause' : 'Play Slideshow'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          class="gallery-toolbar-btn"
          onClick={goToNext}
          title="Next"
        >
          ▶
        </button>

        <div class="gallery-toolbar-separator" />

        <span class="gallery-album-title">📁 {album.name}</span>

        <div class="gallery-toolbar-separator" />

        <span class="gallery-counter">
          {currentIndex + 1} / {album.images.length}
        </span>
      </div>

      {/* Main Image Display */}
      <div class="gallery-image-area">
        {currentImage && (
          <img
            key={currentImage.path}
            src={currentImage.path}
            alt={currentImage.filename}
            class="gallery-main-image"
          />
        )}
      </div>

      {/* Thumbnail Slider */}
      <div class="gallery-thumbnails" ref={thumbnailRef}>
        <div class="gallery-thumbnails-track">
          {album.images.map((image, index) => (
            <div
              key={image.filename}
              class={`gallery-thumb ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onNavigate(index)}
            >
              <img
                src={image.path}
                alt={image.filename}
                loading="lazy"
              />
            </div>
          ))}
        </div>
        {/* Progress Bar */}
        <div class="gallery-progress">
          <div
            class="gallery-progress-fill"
            style={{
              width: `${((currentIndex + 1) / album.images.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Gallery() {
  const { currentSubPath, navigateTo } = useLanguage();
  const [view, setView] = useState<'cover' | 'slideshow'>('cover');
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isNavigatingRef = useRef(false);

  // Parse subPath to determine view and state
  useEffect(() => {
    if (!currentSubPath) {
      // No subpath - show cover list
      setView('cover');
      setCurrentAlbum(null);
      return;
    }

    // subPath format: "album-slug/image-index" or just "album-slug"
    const parts = currentSubPath.split('/');
    const albumSlug = parts[0];
    const imageIndex = parts[1] ? parseInt(parts[1], 10) - 1 : 0; // URL is 1-indexed

    const album = getAlbumBySlug(albumSlug);
    if (album) {
      setCurrentAlbum(album);
      setView('slideshow');

      // Clamp index to valid range
      const validIndex = Math.max(0, Math.min(imageIndex, album.images.length - 1));
      if (validIndex !== imageIndex || !parts[1]) {
        // Invalid or missing index, update URL
        isNavigatingRef.current = true;
        navigateTo('gallery', `${album.slug}/1`, true);
      }
      setCurrentIndex(validIndex);
    } else {
      // Unknown album - show cover list
      setView('cover');
      setCurrentAlbum(null);
    }
  }, [currentSubPath, navigateTo]);

  // Navigate to a specific image in an album
  const handleNavigateImage = useCallback((index: number) => {
    if (!currentAlbum) return;
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }
    setCurrentIndex(index);
    const newSubPath = `${currentAlbum.slug}/${index + 1}`;
    navigateTo('gallery', newSubPath, true);
  }, [currentAlbum, navigateTo]);

  // Open an album
  const handleSelectAlbum = useCallback((album: Album) => {
    setCurrentAlbum(album);
    setCurrentIndex(0);
    setView('slideshow');
    navigateTo('gallery', `${album.slug}/1`, false);
  }, [navigateTo]);

  // Go back to cover list
  const handleBack = useCallback(() => {
    setView('cover');
    setCurrentAlbum(null);
    navigateTo('gallery', undefined, false);
  }, [navigateTo]);

  // Render cover list
  if (view === 'cover' || !currentAlbum) {
    return (
      <div class="gallery-container">
        {/* Menu Bar */}
        <div class="gallery-menu-bar">
          <span class="gallery-menu-item">File</span>
          <span class="gallery-menu-item">View</span>
          <span class="gallery-menu-item">Help</span>
        </div>

        {/* Toolbar */}
        <div class="gallery-toolbar">
          <span class="gallery-toolbar-title">📷 Image Gallery</span>
        </div>

        {/* Cover List */}
        <div class="gallery-cover-area">
          <CoverList onSelectAlbum={handleSelectAlbum} />
        </div>

        {/* Status Bar */}
        <div class="gallery-status-bar">
          <span>{ALBUMS.length} album(s) - Double-click to open</span>
        </div>
      </div>
    );
  }

  // Render slideshow viewer
  return (
    <SlideshowViewer
      album={currentAlbum}
      currentIndex={currentIndex}
      onNavigate={handleNavigateImage}
      onBack={handleBack}
    />
  );
}
