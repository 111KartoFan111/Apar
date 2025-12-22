import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { StatusBadge } from "../components/ui/StatusBadge";
import styles from "./Fines.module.css";

export default function FinesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fines = useQuery({ queryKey: ["fines"], queryFn: async () => (await api.get("/fines")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [form, setForm] = useState({ vehicle_id: "", amount: "", status: "unpaid", category: "traffic", payment_details: "", date: "" });
  const [fineEdits, setFineEdits] = useState<Record<number, { status: string; payment_details: string }>>({});
  const today = new Date().toISOString().split("T")[0];

  const create = useMutation({
    mutationFn: async () =>
      api.post("/fines", {
        vehicle_id: Number(form.vehicle_id),
        amount: Number(form.amount),
        status: form.status,
        category: form.category,
        payment_details: form.payment_details || null,
        date: form.date || today
      }),
    onSuccess: () => {
      qc.invalidateQueries(["fines"]);
      setForm({ vehicle_id: "", amount: "", status: "unpaid", category: "traffic", payment_details: "", date: "" });
    }
  });

  const updateFine = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { status: string; payment_details: string } }) =>
      api.patch(`/fines/${id}`, payload),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries(["fines"]);
      setFineEdits((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
    }
  });

  const vehicleById = useMemo(
    () => new Map((vehicles.data || []).map((v: any) => [v.id, v])),
    [vehicles.data]
  );

  const setFineEdit = (id: number, patch: Partial<{ status: string; payment_details: string }>) => {
    setFineEdits((prev) => {
      const current = prev[id] || { status: "", payment_details: "" };
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const getVehicleLabel = (id: number) => vehicleById.get(id)?.plate_number || `#${id}`;

  return (
    <div className="page">
      <SectionHeader title={t("fines")} subtitle={t("finesSubtitle")} />
      <Card>
        <div className={styles.formGrid}>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          >
            <option value="">{t("vehicle")}</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="traffic">{t("fineCategoryTraffic")}</option>
            <option value="parking">{t("fineCategoryParking")}</option>
            <option value="other">{t("fineCategoryOther")}</option>
          </select>
          <Input
            placeholder={t("amount")}
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="unpaid">{t("statusLabels.unpaid")}</option>
            <option value="paid">{t("statusLabels.paid")}</option>
          </select>
          <Input
            placeholder={t("paymentDetails")}
            value={form.payment_details}
            onChange={(e) => setForm({ ...form, payment_details: e.target.value })}
          />
          <Button onClick={() => create.mutate()}>{t("add")}</Button>
        </div>
      </Card>
      <Card>
        <ul className={styles.list}>
          {fines.data?.map((f: any) => {
            const edit = fineEdits[f.id];
            const statusValue = edit?.status || f.status;
            const detailsValue = edit?.payment_details ?? f.payment_details ?? "";
            const hasChanges = statusValue !== f.status || detailsValue !== (f.payment_details || "");
            const categoryKey = f.category
              ? `fineCategory${f.category.charAt(0).toUpperCase()}${f.category.slice(1)}`
              : "fineCategoryOther";
            const categoryLabel = t(categoryKey);
            return (
              <li key={f.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{getVehicleLabel(f.vehicle_id)} - {f.amount}</div>
                  <div className={styles.rowMeta}>
                    {t("fineCategoryLabel", { category: categoryLabel })} - {f.date}
                  </div>
                  <StatusBadge status={statusValue} />
                </div>
                <div className={styles.edit}>
                  <select
                    className={styles.select}
                    value={statusValue}
                    onChange={(e) => setFineEdit(f.id, { status: e.target.value })}
                  >
                    <option value="unpaid">{t("statusLabels.unpaid")}</option>
                    <option value="paid">{t("statusLabels.paid")}</option>
                  </select>
                  <Input
                    className={styles.detailsField}
                    placeholder={t("paymentDetails")}
                    value={detailsValue}
                    onChange={(e) => setFineEdit(f.id, { payment_details: e.target.value })}
                  />
                  <Button
                    variant="secondary"
                    disabled={!hasChanges}
                    onClick={() =>
                      updateFine.mutate({ id: f.id, payload: { status: statusValue, payment_details: detailsValue } })
                    }
                  >
                    {t("save")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
