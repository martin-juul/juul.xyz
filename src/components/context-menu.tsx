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

  return (
    <div
      ref={menuRef}
      class="context-menu"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => {
        // Empty label indicates separator
        if (!item.label) {
          return <div key={index} class="context-menu-separator"></div>;
        }

        return (
          <div
            key={index}
            class={`context-menu-item ${item.disabled ? 'context-menu-item-disabled' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
          >
            {item.icon && <img src={item.icon} alt="" class="context-menu-icon" />}
            <span>{item.label}</span>
          </div>
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
