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

export default function OrdersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["orders"], queryFn: async () => (await api.get("/orders")).data });
  const [form, setForm] = useState({ supplier: "", status: "draft" });
  const [isAddOpen, setIsAddOpen] = useState(false);

  const create = useMutation({
    mutationFn: async () => api.post("/orders", { ...form }),
    onSuccess: () => {
      qc.invalidateQueries(["orders"]);
      setForm({ supplier: "", status: "draft" });
      setIsAddOpen(false);
    }
  });

  return (
    <div className="page">
      <SectionHeader
        title={t("orders")}
        subtitle={t("ordersSubtitle")}
        actions={<Button variant="secondary" onClick={() => setIsAddOpen(true)}>{t("openAddOrder")}</Button>}
      />
      <Card>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {orders.data?.map((o: any) => (
            <li key={o.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.supplier || "N/A"}</div>
                <div style={{ marginTop: "6px" }}>
                  <StatusBadge status={o.status} />
                </div>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>Cost: {o.total_cost}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal open={isAddOpen} title={t("addOrder")} onClose={() => setIsAddOpen(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", alignItems: "end" }}>
          <Input placeholder={t("supplier")} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">{t("statusLabels.draft")}</option>
            <option value="submitted">{t("statusLabels.submitted")}</option>
            <option value="approved">{t("statusLabels.approved")}</option>
            <option value="received">{t("statusLabels.received")}</option>
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => create.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
