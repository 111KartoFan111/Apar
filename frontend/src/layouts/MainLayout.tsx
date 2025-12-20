import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n";
import { useState } from "react";
import styles from "./MainLayout.module.css";

const navItems = [
  { to: "/dashboard", labelKey: "dashboard" },
  { to: "/fleet", labelKey: "fleet" },
  { to: "/fuel", labelKey: "fuel" },
  { to: "/maintenance", labelKey: "maintenance" },
  { to: "/waybills", labelKey: "waybills" },
  { to: "/warehouses", labelKey: "warehouses" },
  { to: "/orders", labelKey: "orders" },
  { to: "/fines", labelKey: "fines" },
  { to: "/tires", labelKey: "tires" },
  { to: "/reports", labelKey: "reports" }
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
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <button className={styles.mobileNav} onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle navigation">☰</button>
          <div className={styles.actions}>
            <button className={styles.select} aria-label="Search">🔍</button>
            <button className={styles.select} aria-label="Notifications">🔔</button>
            <select
              className={styles.select}
              value={i18n.language}
              onChange={(e) => handleLang(e.target.value)}
            >
              <option value="ru">RU</option>
              <option value="kz">KZ</option>
            </select>
            <div className={styles.avatar}>IT</div>
            <button
              className={styles.select}
              onClick={() => {
                logout();
                navigate("/login");
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
                {t(item.labelKey)}
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
