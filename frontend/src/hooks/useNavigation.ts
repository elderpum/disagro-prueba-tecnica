import { useState } from 'react';

export interface NavigationItem {
    type: 'link' | 'dropdown' | 'subheading';
    label: string;
    icon?: string;
    route?: string;
    children?: NavigationItem[];
    badge?: {
        value: string;
        bgClass: string;
        textClass: string;
    };
}

interface UseNavigationReturn {
    items: NavigationItem[];
    openDropdowns: Set<string>;
    toggleDropdown: (label: string) => void;
    isDropdownOpen: (label: string) => boolean;
}

export function useNavigation(): UseNavigationReturn {
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    const items: NavigationItem[] = [
        {
            type: 'subheading',
            label: 'Principal',
            children: [
                {
                    type: 'link',
                    label: 'Dashboard',
                    icon: 'fas fa-home',
                    route: '/admin',
                },
            ],
        },
        {
            type: 'subheading',
            label: 'Gestión',
            children: [
                {
                    type: 'link',
                    label: 'Catálogo',
                    icon: 'fas fa-box-open',
                    route: '/admin/items',
                },
                {
                    type: 'link',
                    label: 'Confirmaciones',
                    icon: 'fas fa-calendar-check',
                    route: '/admin/confirmations',
                },
            ],
        },
        {
            type: 'subheading',
            label: 'Público',
            children: [
                {
                    type: 'link',
                    label: 'Formulario evento',
                    icon: 'fas fa-external-link-alt',
                    route: '/',
                },
            ],
        },
    ];

    const toggleDropdown = (label: string) => {
        setOpenDropdowns((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const isDropdownOpen = (label: string): boolean => {
        return openDropdowns.has(label);
    };

    return {
        items,
        openDropdowns,
        toggleDropdown,
        isDropdownOpen,
    };
}
