import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n";
import { useState } from "react";
import styles from "./MainLayout.module.css";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false"
} as const;

const navIcons = {
  dashboard: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  fleet: (
    <svg {...iconProps}>
      <rect x="3" y="7" width="11" height="8" rx="1" />
      <path d="M14 10h3l3 3v2h-6z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  fuel: (
    <svg {...iconProps}>
      <path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11z" />
    </svg>
  ),
  maintenance: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
    </svg>
  ),
  waybills: (
    <svg {...iconProps}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h8M9 17h8" />
    </svg>
  ),
  warehouses: (
    <svg {...iconProps}>
      <path d="M3 10l9-6 9 6v9H3z" />
      <path d="M9 19v-5h6v5" />
    </svg>
  ),
  orders: (
    <svg {...iconProps}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 10h6M9 14h6" />
    </svg>
  ),
  fines: (
    <svg {...iconProps}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  ),
  tires: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 5v4M12 15v4M5 12h4M15 12h4M7.5 7.5l2.8 2.8M13.7 13.7l2.8 2.8M7.5 16.5l2.8-2.8M13.7 10.3l2.8-2.8" />
    </svg>
  ),
  reports: (
    <svg {...iconProps}>
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-7" />
    </svg>
  )
};


const navItems = [
  { to: "/dashboard", labelKey: "dashboard", icon: navIcons.dashboard },
  { to: "/fleet", labelKey: "fleet", icon: navIcons.fleet },
  { to: "/fuel", labelKey: "fuel", icon: navIcons.fuel },
  { to: "/maintenance", labelKey: "maintenance", icon: navIcons.maintenance },
  { to: "/waybills", labelKey: "waybills", icon: navIcons.waybills },
  { to: "/warehouses", labelKey: "warehouses", icon: navIcons.warehouses },
  { to: "/orders", labelKey: "orders", icon: navIcons.orders },
  { to: "/fines", labelKey: "fines", icon: navIcons.fines },
  { to: "/tires", labelKey: "tires", icon: navIcons.tires },
  { to: "/reports", labelKey: "reports", icon: navIcons.reports }
];

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLang = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/dashboard" className={styles.logo}>Apar ITS</Link>
        <div className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <button className={styles.mobileNav} onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle navigation">☰</button>
          <div className={styles.actions}>
            <select
              className={styles.select}
              value={i18n.language}
              onChange={(e) => handleLang(e.target.value)}
            >
              <option value="ru">RU</option>
              <option value="kz">KZ</option>
            </select>
            <button
              className={styles.select}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              {t("logout")}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </nav>
        )}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
