import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function FinesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fines = useQuery({ queryKey: ["fines"], queryFn: async () => (await api.get("/fines")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [form, setForm] = useState({ vehicle_id: "", amount: "", status: "unpaid" });

  const create = useMutation({
    mutationFn: async () => api.post("/fines", { vehicle_id: Number(form.vehicle_id), amount: Number(form.amount), status: form.status, date: new Date().toISOString().split("T")[0] }),
    onSuccess: () => {
      qc.invalidateQueries(["fines"]);
      setForm({ vehicle_id: "", amount: "", status: "unpaid" });
    }
  });

  return (
    <div className="page">
      <SectionHeader title={t("fines")} subtitle="Учёт штрафов и оплат" />
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          >
            <option value="">Vehicle</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <Input placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
          <Button onClick={() => create.mutate()}>{t("add")}</Button>
        </div>
      </Card>
      <Card>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {fines.data?.map((f: any) => (
            <li key={f.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Vehicle {f.vehicle_id}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{f.status}</div>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>{f.amount}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
