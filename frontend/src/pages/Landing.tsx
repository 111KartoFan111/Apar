import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Landing.module.css";




export default function LandingPage() {
  const iconProps = {
  width: 35,
  height: 35,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false"
} as const;
  const { t } = useTranslation();

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

  return (
    <div className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>Apar ITS</div>
          <nav className={styles.nav}>
            <a href="#features" className={styles.navLink}>{t("features")}</a>
            <a href="#about" className={styles.navLink}>{t("about")}</a>
          </nav>
          <div className={styles.headerActions}>
            <Link to="/login" className={styles.loginLink}>{t("login")}</Link>
            <Link to="/login" className={styles.ctaButton}>{t("tryForFree")}</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroTag}>{t("intelligentSystem")}</div>
          <h1 className={styles.heroTitle}>
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")}
            <br />
            {t("heroTitle3")}
          </h1>
          <p className={styles.heroDescription}>
            {t("heroDescription")}
          </p>
          <Link to="/login" className={styles.heroButton}>
            {t("getStarted")}
          </Link>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Trusted By Section */}
        <section className={styles.trustedBy}>
          <h2 className={styles.trustedByTitle}>{t("trustedBy")}</h2>
          <div className={styles.logosGrid}>
            {[
              "Алматы Транспорт", "Астана Логистик", "Казахстан Транзит",
              "Транспорт Сервис", "Логистик Групп"
            ].map((company, idx) => (
              <div key={idx} className={styles.logoCard}>
                <div className={styles.logoText}>{company}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Video Demo Section */}
        <section className={styles.videoSection}>
          <h2 className={styles.sectionTitle}>{t("seeItInAction")}</h2>
          <p className={styles.sectionDescription}>{t("videoDescription")}</p>
          <div className={styles.videoPlaceholder}>
            <div className={styles.videoIcon}>▶</div>
            <p className={styles.videoPlaceholderText}>{t("videoPlaceholder")}</p>
          </div>
        </section>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Why Choose Us Section */}
        <section className={styles.whyChooseUs}>
          <h2 className={styles.sectionTitle}>{t("whyChooseUs")}</h2>
          <div className={styles.whyChooseGrid}>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseNumber}>01</div>
              <h3 className={styles.whyChooseTitle}>{t("whyChoose1Title")}</h3>
              <p className={styles.whyChooseDescription}>{t("whyChoose1Desc")}</p>
            </div>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseNumber}>02</div>
              <h3 className={styles.whyChooseTitle}>{t("whyChoose2Title")}</h3>
              <p className={styles.whyChooseDescription}>{t("whyChoose2Desc")}</p>
            </div>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseNumber}>03</div>
              <h3 className={styles.whyChooseTitle}>{t("whyChoose3Title")}</h3>
              <p className={styles.whyChooseDescription}>{t("whyChoose3Desc")}</p>
            </div>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseNumber}>04</div>
              <h3 className={styles.whyChooseTitle}>{t("whyChoose4Title")}</h3>
              <p className={styles.whyChooseDescription}>{t("whyChoose4Desc")}</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Features Section */}
        <section id="features" className={styles.features}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>{navIcons.fleet}</div>
              <h3 className={styles.featureTitle}>{t("featureFleet")}</h3>
              <p className={styles.featureDescription}>{t("featureFleetDesc")}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>{navIcons.fuel}</div>
              <h3 className={styles.featureTitle}>{t("featureFuel")}</h3>
              <p className={styles.featureDescription}>{t("featureFuelDesc")}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>{navIcons.maintenance}</div>
              <h3 className={styles.featureTitle}>{t("featureMaintenance")}</h3>
              <p className={styles.featureDescription}>{t("featureMaintenanceDesc")}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>{navIcons.dashboard}</div>
              <h3 className={styles.featureTitle}>{t("featureAnalytics")}</h3>
              <p className={styles.featureDescription}>{t("featureAnalyticsDesc")}</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* About Section */}
        <section id="about" className={styles.about}>
          <h2 className={styles.sectionTitle}>{t("aboutTitle")}</h2>
          <p className={styles.sectionDescription}>
            {t("aboutDescription")}
          </p>
        </section>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
          <p className={styles.ctaDescription}>{t("ctaDescription")}</p>
          <Link to="/login" className={styles.ctaButtonLarge}>
            {t("getStartedForFree")}
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>© Apar ITS 2025. {t("allRightsReserved")}</div>
        </div>
      </footer>
    </div>
  );
}

