import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigation, type NavigationItem } from '../hooks/useNavigation';
import './Sidebar.css';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items, toggleDropdown, isDropdownOpen } = useNavigation();

    const renderNavItem = (item: NavigationItem, level: number = 0) => {
        if (item.type === 'subheading') {
            return (
                <div key={item.label} className="nav-subheading">
                    <span>{item.label}</span>
                    {item.children?.map((child) => renderNavItem(child, level + 1))}
                </div>
            );
        }

        if (item.type === 'dropdown') {
            const isOpen = isDropdownOpen(item.label);
            return (
                <div key={item.label} className={`nav-item nav-dropdown ${isOpen ? 'open' : ''}`}>
                    <div
                        className="nav-link"
                        onClick={() => toggleDropdown(item.label)}
                        role="button"
                        tabIndex={0}
                    >
                        {item.icon && <i className={`${item.icon} nav-icon`}></i>}
                        <span className="nav-label">{item.label}</span>
                        <i className={`fas fa-chevron-${isOpen ? 'down' : 'right'} nav-chevron`}></i>
                    </div>
                    {isOpen && item.children && (
                        <div className="nav-dropdown-menu">
                            {item.children.map((child) => renderNavItem(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        }

        const isActive = item.route
            ? item.route === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.route)
            : false;

        return (
            <a
                key={item.label}
                href={item.route || '#'}
                className={`nav-item nav-link ${level > 0 ? 'nav-sub-item' : ''} ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    if (item.route && item.route !== '#') {
                        navigate(item.route);
                    }
                }}
            >
                {item.icon && <i className={`${item.icon} nav-icon`}></i>}
                <span className="nav-label">{item.label}</span>
            </a>
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <i className="fas fa-seedling me-2"></i>
                    <span>Disagro</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                {items.map((item) => renderNavItem(item))}
            </nav>
        </aside>
    );
}
