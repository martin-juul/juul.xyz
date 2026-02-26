import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import './gallery.css';

type Image = {
  filename: string;
  path: string;
};

type Album = {
  name: string;
  path: string;
  images: Image[];
};

// Hardcoded album manifest
const ALBUMS: Album[] = [
  {
    name: 'Beginning',
    path: '/assets/gallery/beginning',
    images: [
      { filename: '1.jpeg', path: '/assets/gallery/beginning/1.jpeg' },
      { filename: '2.heic', path: '/assets/gallery/beginning/2.heic' },
      { filename: '3.jpeg', path: '/assets/gallery/beginning/3.jpeg' },
      { filename: '4.jpeg', path: '/assets/gallery/beginning/4.jpeg' },
      { filename: '5.jpeg', path: '/assets/gallery/beginning/5.jpeg' },
      { filename: '6.jpeg', path: '/assets/gallery/beginning/6.jpeg' },
      { filename: '7.jpeg', path: '/assets/gallery/beginning/7.jpeg' },
      { filename: '8.jpeg', path: '/assets/gallery/beginning/8.jpeg' },
      { filename: '9.jpeg', path: '/assets/gallery/beginning/9.jpeg' },
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
    ],
  },
];

export function Gallery() {
  const [currentAlbum, setCurrentAlbum] = useState<Album>(ALBUMS[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'file' | 'view' | 'help' | null>(null);
  const [showAlbumDropdown, setShowAlbumDropdown] = useState(false);
  const slideshowRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const currentImage = currentAlbum.images[currentIndex];

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
        setCurrentIndex((prev) => (prev + 1) % currentAlbum.images.length);
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
  }, [isPlaying, currentAlbum.images.length]);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAlbum.images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? currentAlbum.images.length - 1 : prev - 1
    );
  }, [currentAlbum.images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % currentAlbum.images.length);
  }, [currentAlbum.images.length]);

  const selectAlbum = (album: Album) => {
    setCurrentAlbum(album);
    setCurrentIndex(0);
    setShowAlbumDropdown(false);
    setIsPlaying(false);
  };

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

        {/* Album Selector */}
        <div class="gallery-album-selector">
          <button
            class="gallery-album-btn"
            onClick={() => setShowAlbumDropdown(!showAlbumDropdown)}
          >
            📁 {currentAlbum.name} ({currentAlbum.images.length})
            <span class="gallery-album-arrow">▼</span>
          </button>
          {showAlbumDropdown && (
            <div class="gallery-album-dropdown">
              {ALBUMS.map((album) => (
                <button
                  key={album.name}
                  class={`gallery-album-option ${album.name === currentAlbum.name ? 'selected' : ''}`}
                  onClick={() => selectAlbum(album)}
                >
                  {album.name} ({album.images.length})
                </button>
              ))}
            </div>
          )}
        </div>

        <div class="gallery-toolbar-separator" />

        <span class="gallery-counter">
          {currentIndex + 1} / {currentAlbum.images.length}
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
          {currentAlbum.images.map((image, index) => (
            <div
              key={image.filename}
              class={`gallery-thumb ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
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
              width: `${((currentIndex + 1) / currentAlbum.images.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
