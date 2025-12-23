import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Modal } from "../components/ui/Modal";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const schedules = useQuery({ queryKey: ["schedules"], queryFn: async () => (await api.get("/maintenance/schedules")).data });
  const alerts = useQuery({ queryKey: ["maintenance-alerts"], queryFn: async () => (await api.get("/maintenance/alerts")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [form, setForm] = useState({ vehicle_id: "", description: "", due_date: "" });
  const [isAddOpen, setIsAddOpen] = useState(false);

  const create = useMutation({
    mutationFn: async () =>
      api.post("/maintenance/schedules", {
        vehicle_id: Number(form.vehicle_id),
        description: form.description,
        due_date: form.due_date || null
      }),
    onSuccess: () => {
      qc.invalidateQueries(["schedules"]);
      qc.invalidateQueries(["maintenance-alerts"]);
      setForm({ vehicle_id: "", description: "", due_date: "" });
      setIsAddOpen(false);
    }
  });

  return (
    <div className="page">
      <SectionHeader
        title={t("maintenance")}
        subtitle={t("maintenanceSubtitle", { count: alerts.data?.length || 0 })}
        actions={<Button variant="secondary" onClick={() => setIsAddOpen(true)}>{t("openAddSchedule")}</Button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {schedules.data?.map((s: any) => (
          <Card key={s.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>{s.description}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Vehicle: {s.vehicle_id}</div>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Due: {s.due_date || "-"}</div>
          </Card>
        ))}
      </div>

      <Modal open={isAddOpen} title={t("addSchedule")} onClose={() => setIsAddOpen(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "end" }}>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          >
            <option value="">{t("vehicle")}</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <Input placeholder={t("description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => create.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
