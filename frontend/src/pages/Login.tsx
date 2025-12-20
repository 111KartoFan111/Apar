import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, attachToken } from "../api/client";
import { useAuth } from "../lib/auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import styles from "./Login.module.css";

export default function LoginPage() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", new URLSearchParams({ username, password }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      setToken(res.data.access_token);
      attachToken(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className={styles.loginPage}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>Apar ITS</Link>
      </header>
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>{t("login")}</h1>
          <p className={styles.subtitle}>{t("loginSubtitle")}</p>
          <Card className={styles.card}>
            <form className={styles.form} onSubmit={submit}>
              <Input 
                label={t("username")} 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <Input 
                label={t("password")} 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              {error && <div className={styles.error}>{error}</div>}
              <Button type="submit" className={styles.submitButton}>
                {t("signIn")}
              </Button>
            </form>
          </Card>
          <div className={styles.footer}>
            <Link to="/" className={styles.backLink}>{t("backToHome")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
