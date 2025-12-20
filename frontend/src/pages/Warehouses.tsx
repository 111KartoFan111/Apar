import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function WarehousesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: async () => (await api.get("/warehouses")).data });
  const parts = useQuery({ queryKey: ["parts"], queryFn: async () => (await api.get("/warehouses/parts")).data });
  const [whForm, setWhForm] = useState({ name: "", type: "stationary" });
  const [partForm, setPartForm] = useState({ sku: "", name: "", cost: "" });

  const createWh = useMutation({
    mutationFn: async () => api.post("/warehouses", whForm),
    onSuccess: () => {
      qc.invalidateQueries(["warehouses"]);
      setWhForm({ name: "", type: "stationary" });
    }
  });

  const createPart = useMutation({
    mutationFn: async () => api.post("/warehouses/parts", { ...partForm, cost: Number(partForm.cost || 0) }),
    onSuccess: () => {
      qc.invalidateQueries(["parts"]);
      setPartForm({ sku: "", name: "", cost: "" });
    }
  });

  const importParts = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/warehouses/parts/import", formData);
    qc.invalidateQueries(["parts"]);
  };

  const exportCsv = async (path: string, name: string) => {
    const res = await api.get(path);
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <div className="page">
      <SectionHeader
        title={t("warehouses")}
        subtitle="Склады, запчасти, движение и CSV обмен"
        actions={
          <>
            <Button variant="secondary" onClick={() => exportCsv("/warehouses/parts/export", "parts.csv")}>{t("exportCsv")}</Button>
            <Button variant="ghost" onClick={() => exportCsv("/warehouses/stocks/export", "stock.csv")}>Stock CSV</Button>
            <label>
              <input type="file" style={{ display: "none" }} onChange={(e) => e.target.files && importParts(e.target.files[0])} />
              <Button variant="ghost">{t("importCsv")}</Button>
            </label>
          </>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <Card title={t("warehouses")}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input placeholder="Name" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} />
            <select
              value={whForm.type}
              onChange={(e) => setWhForm({ ...whForm, type: e.target.value })}
            >
              <option value="stationary">Stationary</option>
              <option value="mobile">Mobile</option>
            </select>
            <Button onClick={() => createWh.mutate()}>{t("add")}</Button>
          </div>
          <ul style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
            {warehouses.data?.map((w: any) => (
              <li key={w.id} style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
                <span>{w.name}</span>
                <span className="text-slate-500">{w.type}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Parts">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input placeholder="SKU" value={partForm.sku} onChange={(e) => setPartForm({ ...partForm, sku: e.target.value })} />
            <Input placeholder="Name" value={partForm.name} onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} />
            <Input placeholder="Cost" value={partForm.cost} onChange={(e) => setPartForm({ ...partForm, cost: e.target.value })} />
            <Button onClick={() => createPart.mutate()}>{t("add")}</Button>
          </div>
          <div style={{ maxHeight: "260px", overflow: "auto", marginTop: "12px", fontSize: "14px" }}>
            {parts.data?.map((p: any) => (
              <div key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
                <span>{p.sku} — {p.name}</span>
                <span className="text-slate-500">{p.cost}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
