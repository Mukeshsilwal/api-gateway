import React from 'react';
import PropTypes from 'prop-types';

/**
 * useKeyboardNavigation Hook
 * P0 Feature: Fix keyboard navigation in table rows
 * Enables Enter key to expand/collapse rows
 */
export const useKeyboardNavigation = (options = {}) => {
    const {
        onEnter,
        onEscape,
        onArrowUp,
        onArrowDown,
        onSpace
    } = options;

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'Enter':
                    if (onEnter && !event.shiftKey) {
                        event.preventDefault();
                        onEnter(event);
                    }
                    break;
                case 'Escape':
                    if (onEscape) {
                        event.preventDefault();
                        onEscape(event);
                    }
                    break;
                case 'ArrowUp':
                    if (onArrowUp) {
                        event.preventDefault();
                        onArrowUp(event);
                    }
                    break;
                case 'ArrowDown':
                    if (onArrowDown) {
                        event.preventDefault();
                        onArrowDown(event);
                    }
                    break;
                case ' ':
                    if (onSpace) {
                        event.preventDefault();
                        onSpace(event);
                    }
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onEnter, onEscape, onArrowUp, onArrowDown, onSpace]);
};

/**
 * KeyboardNavigableRow Component
 * Wrapper for table rows with keyboard navigation support
 */
export const KeyboardNavigableRow = ({
    children,
    onExpand,
    isExpanded = false,
    index,
    ...props
}) => {
    const rowRef = React.useRef(null);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (onExpand) {
                onExpand(!isExpanded);
            }
        }
    };

    return (
        <tr
            ref={rowRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="button"
            aria-expanded={isExpanded}
            aria-label={`Row ${index + 1}${isExpanded ? ', expanded' : ', collapsed'}`}
            className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
            {...props}
        >
            {children}
        </tr>
    );
};

KeyboardNavigableRow.propTypes = {
    children: PropTypes.node.isRequired,
    onExpand: PropTypes.func,
    isExpanded: PropTypes.bool,
    index: PropTypes.number
};

/**
 * useFocusManagement Hook
 * Manages focus order and trap for modals/dialogs
 */
export const useFocusManagement = (isOpen, containerRef) => {
    React.useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement?.focus();

        const handleTabKey = (event) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);

        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen, containerRef]);
};

/**
 * useFilterPersistence Hook
 * P0 Feature: Persist filters in URL for shareability
 */
export const useFilterPersistence = (initialFilters = {}) => {
    const [filters, setFilters] = React.useState(() => {
        // Try to load from URL params on mount
        const params = new URLSearchParams(window.location.search);
        const urlFilters = {};

        params.forEach((value, key) => {
            try {
                urlFilters[key] = JSON.parse(value);
            } catch {
                urlFilters[key] = value;
            }
        });

        return Object.keys(urlFilters).length > 0 ? urlFilters : initialFilters;
    });

    // Update URL when filters change
    React.useEffect(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
            }
        });

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [filters]);

    return [filters, setFilters];
};

/**
 * useDebounce Hook
 * Debounces a value for performance optimization
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default {
    useKeyboardNavigation,
    useFocusManagement,
    useFilterPersistence,
    useDebounce
};
