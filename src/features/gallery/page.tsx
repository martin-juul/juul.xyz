import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import './gallery.css';

type Image = {
  filename: string;
  thumb: string;
  full: string;
};

type Album = {
  name: string;
  slug: string;
  cover: string;
  images: Image[];
};

// Album manifest with WebP thumbnails and full-size images
const ALBUMS: Album[] = [
  {
    name: 'Beginning',
    slug: 'beginning',
    cover: '/assets/gallery/beginning/thumbs/1.webp',
    images: [
      { filename: '1', thumb: '/assets/gallery/beginning/thumbs/1.webp', full: '/assets/gallery/beginning/full/1.webp' },
      { filename: '3-3', thumb: '/assets/gallery/beginning/thumbs/3-3.webp', full: '/assets/gallery/beginning/full/3-3.webp' },
      { filename: '3-4', thumb: '/assets/gallery/beginning/thumbs/3-4.webp', full: '/assets/gallery/beginning/full/3-4.webp' },
      { filename: '3-5', thumb: '/assets/gallery/beginning/thumbs/3-5.webp', full: '/assets/gallery/beginning/full/3-5.webp' },
      { filename: '3-6', thumb: '/assets/gallery/beginning/thumbs/3-6.webp', full: '/assets/gallery/beginning/full/3-6.webp' },
      { filename: '3-7', thumb: '/assets/gallery/beginning/thumbs/3-7.webp', full: '/assets/gallery/beginning/full/3-7.webp' },
      { filename: '3-8', thumb: '/assets/gallery/beginning/thumbs/3-8.webp', full: '/assets/gallery/beginning/full/3-8.webp' },
      { filename: '3', thumb: '/assets/gallery/beginning/thumbs/3.webp', full: '/assets/gallery/beginning/full/3.webp' },
      { filename: '4', thumb: '/assets/gallery/beginning/thumbs/4.webp', full: '/assets/gallery/beginning/full/4.webp' },
      { filename: '5', thumb: '/assets/gallery/beginning/thumbs/5.webp', full: '/assets/gallery/beginning/full/5.webp' },
      { filename: '6-5', thumb: '/assets/gallery/beginning/thumbs/6-5.webp', full: '/assets/gallery/beginning/full/6-5.webp' },
      { filename: '6', thumb: '/assets/gallery/beginning/thumbs/6.webp', full: '/assets/gallery/beginning/full/6.webp' },
      { filename: '7-5', thumb: '/assets/gallery/beginning/thumbs/7-5.webp', full: '/assets/gallery/beginning/full/7-5.webp' },
      { filename: '7', thumb: '/assets/gallery/beginning/thumbs/7.webp', full: '/assets/gallery/beginning/full/7.webp' },
      { filename: '8-6', thumb: '/assets/gallery/beginning/thumbs/8-6.webp', full: '/assets/gallery/beginning/full/8-6.webp' },
      { filename: '8', thumb: '/assets/gallery/beginning/thumbs/8.webp', full: '/assets/gallery/beginning/full/8.webp' },
      { filename: '9-3', thumb: '/assets/gallery/beginning/thumbs/9-3.webp', full: '/assets/gallery/beginning/full/9-3.webp' },
      { filename: '9', thumb: '/assets/gallery/beginning/thumbs/9.webp', full: '/assets/gallery/beginning/full/9.webp' },
      { filename: '10', thumb: '/assets/gallery/beginning/thumbs/10.webp', full: '/assets/gallery/beginning/full/10.webp' },
      { filename: '11', thumb: '/assets/gallery/beginning/thumbs/11.webp', full: '/assets/gallery/beginning/full/11.webp' },
      { filename: '12', thumb: '/assets/gallery/beginning/thumbs/12.webp', full: '/assets/gallery/beginning/full/12.webp' },
      { filename: '14', thumb: '/assets/gallery/beginning/thumbs/14.webp', full: '/assets/gallery/beginning/full/14.webp' },
      { filename: '15', thumb: '/assets/gallery/beginning/thumbs/15.webp', full: '/assets/gallery/beginning/full/15.webp' },
      { filename: '16', thumb: '/assets/gallery/beginning/thumbs/16.webp', full: '/assets/gallery/beginning/full/16.webp' },
      { filename: '17', thumb: '/assets/gallery/beginning/thumbs/17.webp', full: '/assets/gallery/beginning/full/17.webp' },
      { filename: '18', thumb: '/assets/gallery/beginning/thumbs/18.webp', full: '/assets/gallery/beginning/full/18.webp' },
      { filename: '19', thumb: '/assets/gallery/beginning/thumbs/19.webp', full: '/assets/gallery/beginning/full/19.webp' },
      { filename: '20', thumb: '/assets/gallery/beginning/thumbs/20.webp', full: '/assets/gallery/beginning/full/20.webp' },
      { filename: '21', thumb: '/assets/gallery/beginning/thumbs/21.webp', full: '/assets/gallery/beginning/full/21.webp' },
      { filename: '22', thumb: '/assets/gallery/beginning/thumbs/22.webp', full: '/assets/gallery/beginning/full/22.webp' },
      { filename: '23', thumb: '/assets/gallery/beginning/thumbs/23.webp', full: '/assets/gallery/beginning/full/23.webp' },
      { filename: '24', thumb: '/assets/gallery/beginning/thumbs/24.webp', full: '/assets/gallery/beginning/full/24.webp' },
      { filename: '25', thumb: '/assets/gallery/beginning/thumbs/25.webp', full: '/assets/gallery/beginning/full/25.webp' },
      { filename: '26', thumb: '/assets/gallery/beginning/thumbs/26.webp', full: '/assets/gallery/beginning/full/26.webp' },
      { filename: '27', thumb: '/assets/gallery/beginning/thumbs/27.webp', full: '/assets/gallery/beginning/full/27.webp' },
      { filename: '28', thumb: '/assets/gallery/beginning/thumbs/28.webp', full: '/assets/gallery/beginning/full/28.webp' },
      { filename: '29', thumb: '/assets/gallery/beginning/thumbs/29.webp', full: '/assets/gallery/beginning/full/29.webp' },
      { filename: '30', thumb: '/assets/gallery/beginning/thumbs/30.webp', full: '/assets/gallery/beginning/full/30.webp' },
      { filename: '31', thumb: '/assets/gallery/beginning/thumbs/31.webp', full: '/assets/gallery/beginning/full/31.webp' },
      { filename: '32', thumb: '/assets/gallery/beginning/thumbs/32.webp', full: '/assets/gallery/beginning/full/32.webp' },
      { filename: '33', thumb: '/assets/gallery/beginning/thumbs/33.webp', full: '/assets/gallery/beginning/full/33.webp' },
      { filename: '34', thumb: '/assets/gallery/beginning/thumbs/34.webp', full: '/assets/gallery/beginning/full/34.webp' },
      { filename: '35', thumb: '/assets/gallery/beginning/thumbs/35.webp', full: '/assets/gallery/beginning/full/35.webp' },
      { filename: '36', thumb: '/assets/gallery/beginning/thumbs/36.webp', full: '/assets/gallery/beginning/full/36.webp' },
    ],
  },
  {
    name: 'Certificates',
    slug: 'certificates',
    cover: '/assets/gallery/certificates/thumbs/angular-certificate.webp',
    images: [
      { filename: 'angular-certificate', thumb: '/assets/gallery/certificates/thumbs/angular-certificate.webp', full: '/assets/gallery/certificates/full/angular-certificate.webp' },
    ]
  }
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const slideshowRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const currentImage = album.images[currentIndex];

  // Reset zoom when changing images
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle scroll zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 5));
  }, []);

  // Add wheel event listener
  useEffect(() => {
    const imageArea = imageAreaRef.current;
    if (imageArea) {
      imageArea.addEventListener('wheel', handleWheel, { passive: false });
      return () => imageArea.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Handle mouse drag for panning when zoomed
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset zoom button
  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

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

  // Prefetch adjacent images after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prefetch previous image
      const prevIndex = currentIndex === 0 ? album.images.length - 1 : currentIndex - 1;
      const prevImg = new Image();
      prevImg.src = album.images[prevIndex].full;

      // Prefetch next image
      const nextIndex = (currentIndex + 1) % album.images.length;
      const nextImg = new Image();
      nextImg.src = album.images[nextIndex].full;
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex, album.images]);

  // Virtualized thumbnail visibility
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIndices = new Set<number>();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            visibleIndices.add(index);
          }
        });

        if (visibleIndices.size > 0) {
          const indices = Array.from(visibleIndices).sort((a, b) => a - b);
          const buffer = 5;
          setVisibleRange({
            start: Math.max(0, indices[0] - buffer),
            end: Math.min(album.images.length - 1, indices[indices.length - 1] + buffer),
          });
        }
      },
      { root: thumbnailRef.current, threshold: 0 }
    );

    thumbRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [album.images.length]);

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

        <div class="gallery-toolbar-separator" />

        {/* Zoom controls */}
        <button
          class="gallery-toolbar-btn"
          onClick={() => setZoom((z) => Math.max(z * 0.9, 0.5))}
          title="Zoom Out"
        >
          ➖
        </button>
        <span class="gallery-zoom-level" onClick={handleResetZoom} style={{ cursor: 'pointer' }} title="Reset Zoom">
          {Math.round(zoom * 100)}%
        </span>
        <button
          class="gallery-toolbar-btn"
          onClick={() => setZoom((z) => Math.min(z * 1.1, 5))}
          title="Zoom In"
        >
          ➕
        </button>
      </div>

      {/* Main Image Display */}
      <div
        ref={imageAreaRef}
        class="gallery-image-area"
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={handleMouseDown}
      >
        {currentImage && (
          <img
            key={currentImage.full}
            src={currentImage.full}
            alt={currentImage.filename}
            class="gallery-main-image"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Thumbnail Slider */}
      <div class="gallery-thumbnails" ref={thumbnailRef}>
        <div class="gallery-thumbnails-track">
          {album.images.map((image, index) => {
            const isVisible = index >= visibleRange.start && index <= visibleRange.end;
            return (
              <div
                key={image.filename}
                ref={(el) => { thumbRefs.current[index] = el; }}
                data-index={index}
                class={`gallery-thumb ${index === currentIndex ? 'active' : ''}`}
                onClick={() => onNavigate(index)}
              >
                {isVisible && (
                  <img
                    src={image.thumb}
                    alt={image.filename}
                  />
                )}
              </div>
            );
          })}
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
