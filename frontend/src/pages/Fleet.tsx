import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { SectionHeader } from "../components/SectionHeader";
import styles from "./Fleet.module.css";

export default function FleetPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");

  const create = useMutation({
    mutationFn: async () => api.post("/vehicles", { plate_number: plate, model }),
    onSuccess: () => {
      qc.invalidateQueries(["vehicles"]);
      setPlate("");
      setModel("");
    }
  });

  const importCsv = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    await api.post("/vehicles/import", form);
    qc.invalidateQueries(["vehicles"]);
  };

  const exportCsv = async () => {
    const res = await api.get("/vehicles/export");
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vehicles.csv";
    link.click();
  };

  return (
    <div className="page">
      <SectionHeader
        title={t("fleet")}
        subtitle="Список ТС, быстрый ввод и импорт/экспорт CSV"
        actions={
          <div className={styles.actionGroup}>
            <Button variant="secondary" onClick={exportCsv}>{t("exportCsv")}</Button>
            <label>
              <input
                type="file"
                style={{ display: "none" }}
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) importCsv(e.target.files[0]);
                }}
              />
              <Button variant="ghost">{t("importCsv")}</Button>
            </label>
          </div>
        }
      />

      <div className={styles.wrapper}>
        <Card title="Быстрое добавление ТС">
          <div className={styles.quickAddForm}>
            <Input label="Plate" value={plate} onChange={(e) => setPlate(e.target.value)} />
            <Input label="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <Button onClick={() => create.mutate()}>{t("add")}</Button>
          </div>
        </Card>

        <div className={styles.vehicleGrid}>
          {vehicles.data?.map((v: any) => (
            <Link to={`/fleet/${v.id}`} key={v.id}>
              <Card className={styles.vehicleCard}>
                <div className={styles.vehicleHeader}>
                  <div>
                    <div className={styles.vehicleTitle}>{v.plate_number}</div>
                    <div className={styles.meta}>{v.model}</div>
                  </div>
                  <span className={styles.statusPill}>{v.status}</span>
                </div>
                <div className={styles.meta}>Пробег: {v.mileage}</div>
                <div className={styles.meta}>Топливо: {v.fuel_type}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
