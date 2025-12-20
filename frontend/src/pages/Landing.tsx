import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Landing.module.css";

export default function LandingPage() {
  const { t } = useTranslation();

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
              "Транспорт Сервис", "Логистик Групп", "Транзит Экспресс",
              "Городской Транспорт", "Мегаполис Логистик", "Транспорт Плюс",
              "Логистик Сервис", "Транзит Логистик", "Транспорт Групп",
              "Алматы Логистик", "Столичный Транспорт", "Транзит Сервис"
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
              <div className={styles.featureIcon}>🚗</div>
              <h3 className={styles.featureTitle}>{t("featureFleet")}</h3>
              <p className={styles.featureDescription}>{t("featureFleetDesc")}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⛽</div>
              <h3 className={styles.featureTitle}>{t("featureFuel")}</h3>
              <p className={styles.featureDescription}>{t("featureFuelDesc")}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔧</div>
              <h3 className={styles.featureTitle}>{t("featureMaintenance")}</h3>
              <p className={styles.featureDescription}>{t("featureMaintenanceDesc")}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
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

