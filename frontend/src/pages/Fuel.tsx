import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";

export default function FuelPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fuel = useQuery({ queryKey: ["fuel"], queryFn: async () => (await api.get("/vehicles/fuel")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [form, setForm] = useState({
    vehicle_id: "",
    date: "",
    liters: "",
    price: "",
    odometer: "",
    station: ""
  });

  const create = useMutation({
    mutationFn: async () => api.post(`/vehicles/${form.vehicle_id}/fuel`, { ...form, liters: Number(form.liters), price: Number(form.price), odometer: Number(form.odometer) }),
    onSuccess: () => {
      qc.invalidateQueries(["fuel"]);
      setForm({ vehicle_id: "", date: "", liters: "", price: "", odometer: "", station: "" });
    }
  });

  const importCsv = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/vehicles/fuel/import", formData);
    qc.invalidateQueries(["fuel"]);
  };

  const exportCsv = async () => {
    const res = await api.get("/vehicles/fuel/export");
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fuel.csv";
    a.click();
  };

  const avgConsumption =
    fuel.data && fuel.data.length > 0
      ? (fuel.data.reduce((sum: number, f: any) => sum + f.liters, 0) / fuel.data.length).toFixed(1)
      : 0;

  return (
    <div className="page">
      <SectionHeader
        title={t("fuel")}
        subtitle="Управление заправками, импорт/экспорт CSV, быстрый ввод"
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}>{t("exportCsv")}</Button>
            <label>
              <input
                type="file"
                style={{ display: "none" }}
                accept=".csv"
                onChange={(e) => e.target.files && importCsv(e.target.files[0])}
              />
              <Button variant="ghost">{t("importCsv")}</Button>
            </label>
          </>
        }
      />

      <Card title={`${t("add")} ${t("fuel")}`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          >
            <option value="">Vehicle</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Liters" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} />
          <Input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input placeholder="Odometer" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          <Input placeholder="Station" value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <Button onClick={() => create.mutate()}>{t("add")}</Button>
        </div>
      </Card>

      <Card title={t("fuelEntries")} subtitle={`Avg liters: ${avgConsumption}`}>
        <Table
          headers={["Vehicle", "Date", "Liters", "Price", "Odometer", "Station", "Anomaly"]}
          rows={(fuel.data || []).map((f: any) => [
            f.vehicle_id,
            f.date,
            f.liters,
            f.price,
            f.odometer,
            f.station,
            f.anomaly_flag ? "⚠" : ""
          ])}
          zebra
        />
      </Card>
    </div>
  );
}
