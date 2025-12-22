import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { StatusBadge } from "../components/ui/StatusBadge";
import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const { t } = useTranslation();
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const fuel = useQuery({ queryKey: ["fuel"], queryFn: async () => (await api.get("/vehicles/fuel")).data });
  const waybills = useQuery({ queryKey: ["waybills"], queryFn: async () => (await api.get("/waybills")).data });
  const alerts = useQuery({ queryKey: ["maintenance-alerts"], queryFn: async () => (await api.get("/maintenance/alerts")).data });

  const fuelTotal = useMemo(() => Math.round((fuel.data || []).reduce((sum: number, f: any) => sum + (f.price || 0), 0)), [fuel.data]);
  const inMaintenance = useMemo(
    () => (vehicles.data || []).filter((v: any) => v.status?.toLowerCase()?.includes("maint")).length,
    [vehicles.data]
  );
  const activeVehicles = useMemo(() => (vehicles.data || []).filter((v: any) => v.status === "active").length, [vehicles.data]);

  const recent = useMemo(() => {
    const list: { type: string; title: string; date: string; status?: string }[] = [];
    (waybills.data || []).slice(0, 5).forEach((w: any) =>
      list.push({ type: "Waybill", title: `${w.driver} — ${w.purpose}`, date: w.start_time, status: "In transit" })
    );
    (fuel.data || []).slice(0, 5).forEach((f: any) =>
      list.push({ type: "Fuel", title: `Vehicle ${f.vehicle_id} ${f.liters}L`, date: f.date, status: f.anomaly_flag ? "Alert" : "OK" })
    );
    return list.slice(0, 6);
  }, [waybills.data, fuel.data]);

  return (
    <div className="page">
      <div className={styles.hero}>
        <div className={styles.heroPanel}>
          <div className="page-title">{t("dashboard")}</div>
          <div className="page-subtitle">Сегодняшние инсайты: статус парка, аномалии топлива, ТО</div>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <Button>Экспорт CSV</Button>
            <Button variant="primary">{t("aiBuildReport")}</Button>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Всего ТС</div>
            <div className={styles.statValue}>{vehicles.data?.length || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>В работе</div>
            <div className={styles.statValue}>{activeVehicles}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>В обслуживании</div>
            <div className={styles.statValue} style={{ color: "var(--color-warning)" }}>{inMaintenance}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Алерты</div>
            <div className={styles.statValue} style={{ color: "var(--color-danger)" }}>{alerts.data?.length || 0}</div>
          </div>
        </div>
      </div>

      <div className={styles.cardsRow}>
        <Card title="Финансы" subtitle="Fuel / Maintenance">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Топливо</span>
              <strong style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>{fuelTotal} ₸</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>ТО (план)</span>
              <strong style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-muted)" }}>—</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Запчасти (план)</span>
              <strong style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-muted)" }}>—</strong>
            </div>
          </div>
        </Card>
        <Card title="Алерты" subtitle="ТО, аномалии топлива">
          {(alerts.data || []).slice(0, 4).map((a: any, idx: number) => (
            <div key={idx} className={styles.activityItem}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: "4px" }}>{a.description || "Maintenance"}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{a.due_date}</div>
              </div>
              <StatusBadge status="Alert" />
            </div>
          ))}
        </Card>
        <Card title="Последние события">
          <div className={styles.activity}>
            {recent.map((item, idx) => (
              <div key={idx} className={styles.activityItem}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{item.type} · {item.date}</div>
                </div>
                <StatusBadge status={item.status || "OK"} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.cardsRow}>
        <Card title="Распределение статусов">
          <div className={styles.miniChart} />
        </Card>
        <Card title="Стоимость км (топ-5)">
          <div className={styles.miniChart} />
        </Card>
        <Card title="Операционная активность">
          <Table
            headers={["Тип", "О чем", "Дата", "Статус"]}
            rows={recent.map((r) => [r.type, r.title, r.date, <StatusBadge status={r.status || "OK"} />])}
            zebra
          />
        </Card>
      </div>
    </div>
  );
}
