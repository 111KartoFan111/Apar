import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function OrdersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["orders"], queryFn: async () => (await api.get("/orders")).data });
  const [form, setForm] = useState({ supplier: "", status: "draft" });

  const create = useMutation({
    mutationFn: async () => api.post("/orders", { ...form }),
    onSuccess: () => {
      qc.invalidateQueries(["orders"]);
      setForm({ supplier: "", status: "draft" });
    }
  });

  return (
    <div className="page">
      <SectionHeader title={t("orders")} subtitle="Закупки и статусы согласования" />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", alignItems: "end" }}>
          <Input placeholder="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
          </select>
          <Button onClick={() => create.mutate()}>{t("add")}</Button>
        </div>
      </Card>
      <Card>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {orders.data?.map((o: any) => (
            <li key={o.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.supplier || "N/A"}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{o.status}</div>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>Cost: {o.total_cost}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
