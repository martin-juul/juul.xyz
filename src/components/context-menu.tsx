import { useState, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../context/language-context';

type ContextMenuItem = {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick: () => void;
};

type ContextMenuProps = {
  items: ContextMenuItem[];
  onClose: () => void;
  position: { x: number; y: number };
};

export function ContextMenu({ items, onClose, position }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Focus first item when menu opens
  useEffect(() => {
    if (menuRef.current) {
      const firstItem = menuRef.current.querySelector('button:not(:disabled)') as HTMLButtonElement;
      firstItem?.focus();
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const menuItems = Array.from(
        menuRef.current?.querySelectorAll('button:not(:disabled)') || []
      ) as HTMLButtonElement[];

      if (menuItems.length === 0) return;

      const currentIndex = menuItems.indexOf(document.activeElement as HTMLButtonElement);
      let nextIndex: number;

      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % menuItems.length;
      } else {
        nextIndex = currentIndex === -1 ? menuItems.length - 1 : (currentIndex - 1 + menuItems.length) % menuItems.length;
      }

      menuItems[nextIndex].focus();
    }
  };

  return (
    <div
      ref={menuRef}
      class="context-menu"
      role="menu"
      style={{ left: position.x, top: position.y }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        // Empty label indicates separator
        if (!item.label) {
          return <div key={index} class="context-menu-separator" role="separator" />;
        }

        return (
          <button
            key={index}
            class={`context-menu-item ${item.disabled ? 'context-menu-item-disabled' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            role="menuitem"
          >
            {item.icon && <img src={item.icon} alt="" class="context-menu-icon" aria-hidden="true" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type UseContextMenuResult = {
  contextMenu: { x: number; y: number } | null;
  openContextMenu: (e: MouseEvent) => void;
  closeContextMenu: () => void;
  ContextMenuRenderer: (props?: { items: ContextMenuItem[] }) => JSX.Element | null;
};

type UseDesktopContextMenuResult = {
  contextMenu: { x: number; y: number } | null;
  openContextMenu: (e: MouseEvent) => void;
  closeContextMenu: () => void;
  ContextMenuRenderer: () => JSX.Element | null;
};

export function useContextMenu(): UseContextMenuResult {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const openContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const ContextMenuRenderer = (props?: { items: ContextMenuItem[] }) => {
    if (!contextMenu) return null;
    return <ContextMenu items={props?.items || []} onClose={closeContextMenu} position={contextMenu} />;
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
    ContextMenuRenderer,
  };
}

export function useDesktopContextMenu(onOpenTaskManager?: () => void): UseDesktopContextMenuResult {
  const { t } = useLanguage();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const openContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const getDesktopMenuItems = (): ContextMenuItem[] => {
    return [
      {
        label: 'Refresh',
        icon: '/assets/icons/windows.png',
        onClick: () => {
          window.location.reload();
        },
      },
      { label: '', icon: '', onClick: () => {} }, // Separator
      {
        label: 'Arrange Icons',
        icon: '/assets/icons/gallery.png',
        disabled: true,
        onClick: () => {},
      },
      {
        label: 'Line Up Icons',
        disabled: true,
        onClick: () => {},
      },
      { label: '', icon: '', onClick: () => {} }, // Separator
      {
        label: 'New',
        disabled: true,
        onClick: () => {},
      },
      { label: '', icon: '', onClick: () => {} }, // Separator
      {
        label: 'Properties',
        icon: '/assets/icons/document.png',
        onClick: () => {
          // Open display properties or similar
          alert('Desktop Properties - Display Settings');
        },
      },
      { label: '', icon: '', onClick: () => {} }, // Separator
      ...(onOpenTaskManager
        ? [
            {
              label: t.nav.taskmanager,
              icon: '/assets/icons/windows.png',
              onClick: () => {
                if (onOpenTaskManager) {
                  onOpenTaskManager();
                }
              },
            } as ContextMenuItem,
          ]
        : []),
    ];
  };

  const ContextMenuRenderer = () => {
    if (!contextMenu) return null;
    const items = getDesktopMenuItems();
    return <ContextMenu items={items} onClose={closeContextMenu} position={contextMenu} />;
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
    ContextMenuRenderer,
  };
}
