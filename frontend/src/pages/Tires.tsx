import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function TiresPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const tires = useQuery({ queryKey: ["tires"], queryFn: async () => (await api.get("/tires")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [form, setForm] = useState({ serial: "", brand: "", tread_depth: "" });
  const [assignForm, setAssignForm] = useState({ tire_id: "", vehicle_id: "" });

  const create = useMutation({
    mutationFn: async () => api.post("/tires", { serial: form.serial, brand: form.brand, tread_depth: Number(form.tread_depth || 8) }),
    onSuccess: () => {
      qc.invalidateQueries(["tires"]);
      setForm({ serial: "", brand: "", tread_depth: "" });
    }
  });

  const assign = useMutation({
    mutationFn: async () => api.post("/tires/assign", { tire_id: Number(assignForm.tire_id), vehicle_id: Number(assignForm.vehicle_id) }),
    onSuccess: () => {
      qc.invalidateQueries(["tires"]);
      setAssignForm({ tire_id: "", vehicle_id: "" });
    }
  });

  const alerts = useQuery({ queryKey: ["tire-alerts"], queryFn: async () => (await api.get("/tires/alerts")).data });

  return (
    <div className="page">
      <SectionHeader title={t("tires")} subtitle={`Alerts: ${alerts.data?.length || 0}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <Card title={`${t("add")} tire`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input placeholder="Serial" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} />
            <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input placeholder="Tread depth" value={form.tread_depth} onChange={(e) => setForm({ ...form, tread_depth: e.target.value })} />
            <Button onClick={() => create.mutate()}>{t("add")}</Button>
          </div>
        </Card>
        <Card title="Assign">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <select
              value={assignForm.tire_id}
              onChange={(e) => setAssignForm({ ...assignForm, tire_id: e.target.value })}
            >
              <option value="">Tire</option>
              {tires.data?.map((t: any) => (
                <option key={t.id} value={t.id}>{t.serial}</option>
              ))}
            </select>
            <select
              value={assignForm.vehicle_id}
              onChange={(e) => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}
            >
              <option value="">Vehicle</option>
              {vehicles.data?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.plate_number}</option>
              ))}
            </select>
            <Button onClick={() => assign.mutate()}>{t("add")}</Button>
          </div>
        </Card>
      </div>
      <Card title="Tires List">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {tires.data?.map((t: any) => (
            <div key={t.id} style={{ padding: "16px", borderRadius: "8px", background: "#f8fafc", border: "1px solid rgba(15, 23, 42, 0.08)", transition: "all 0.2s" }}>
              <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px" }}>{t.serial}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "4px" }}>{t.brand}</div>
              <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Tread: {t.tread_depth}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
