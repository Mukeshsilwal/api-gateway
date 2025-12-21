import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitySearch } from '../../hooks/useEntitySearch';
import { Search, User, Settings, FileText, Shield, Bus, Map, Film, Home, Loader2, Ticket, LucideIcon } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandItem {
    icon: LucideIcon;
    label: string;
    path?: string;
    action?: () => void;
    id?: string | number;
    subLabel?: string;
    category?: string;
}

interface CommandGroup {
    category: string;
    items: CommandItem[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState<string>('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Debounced Search Hook
    const { results: searchResults, loading } = useEntitySearch(query, isOpen);

    // Static Navigation Commands
    const commands: CommandGroup[] = [
        {
            category: "Navigation",
            items: [
                { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
                { icon: User, label: "Users", path: "/admin/users" },
                { icon: Shield, label: "Roles & Permissions", path: "/admin/roles" },
                { icon: Bus, label: "Bus Manager", path: "/admin/buses" },
                { icon: Map, label: "Route Manager", path: "/admin/routes" },
                { icon: Film, label: "Cinema Manager", path: "/admin/cinema" },
                { icon: FileText, label: "Reports", path: "/admin/reports" },
                { icon: Settings, label: "Settings", path: "/admin/settings" },
            ]
        }
    ];

    // Combine Static Commands + Dynamic Search Results
    const getDisplayedItems = (): CommandGroup[] => {
        if (!query) return commands;

        const filteredStatic = commands.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        })).filter(group => group.items.length > 0);

        const dynamicGroup: CommandGroup[] = searchResults.length > 0 ? [{
            category: "Search Results",
            items: searchResults.map((item: any) => ({
                id: item.id,
                label: item.title,
                subLabel: item.subtitle || item.entity,
                path: `/admin/${item.entity === 'bus' ? 'buses' : item.entity === 'route' ? 'routes' : 'tickets'}?id=${item.id}`, // Example routing
                icon: item.entity === 'bus' ? Bus : item.entity === 'route' ? Map : Ticket
            }))
        }] : [];

        return [...filteredStatic, ...dynamicGroup];
    };

    const displayedGroups = getDisplayedItems();
    const flatItems = displayedGroups.flatMap(group => group.items);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-command-palette'));
            }

            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % flatItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = flatItems[selectedIndex];
                if (item) {
                    if (item.path) navigate(item.path);
                    if (item.action) item.action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, flatItems, selectedIndex, navigate, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in ring-1 ring-gray-200">
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    {loading ? (
                        <Loader2 className="w-5 h-5 text-indigo-500 mr-3 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-lg"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="hidden sm:flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">ESC</kbd>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {flatItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            {loading ? "Searching..." : `No results found for "${query}"`}
                        </div>
                    ) : (
                        displayedGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="mb-2">
                                <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {group.category}
                                </div>
                                {group.items.map((item, itemIndex) => {
                                    // Calculate global index for selection
                                    const globalIndex = displayedGroups
                                        .slice(0, groupIndex)
                                        .reduce((acc, g) => acc + g.items.length, 0) + itemIndex;

                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <button
                                            key={itemIndex}
                                            onClick={() => {
                                                if (item.path) navigate(item.path);
                                                if (item.action) item.action();
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                            className={`w-full flex items-center px-4 py-3 text-left transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 mr-3 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-medium truncate">{item.label}</div>
                                                {item.subLabel && <div className="text-xs text-gray-500 truncate">{item.subLabel}</div>}
                                            </div>
                                            {isSelected && <span className="text-xs text-indigo-600 font-medium whitespace-nowrap ml-2">Jump to</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                    <span>Use <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to navigate</span>
                    <span><kbd className="font-sans">↵</kbd> to select</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
