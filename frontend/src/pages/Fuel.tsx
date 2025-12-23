import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";

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
  const [isAddOpen, setIsAddOpen] = useState(false);

  const create = useMutation({
    mutationFn: async () => api.post(`/vehicles/${form.vehicle_id}/fuel`, { ...form, liters: Number(form.liters), price: Number(form.price), odometer: Number(form.odometer) }),
    onSuccess: () => {
      qc.invalidateQueries(["fuel"]);
      setForm({ vehicle_id: "", date: "", liters: "", price: "", odometer: "", station: "" });
      setIsAddOpen(false);
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
        subtitle={t("fuelSubtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(true)}>{t("openAddFuel")}</Button>
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

      <Card title={t("fuelEntries")} subtitle={t("avgLiters", { value: avgConsumption })}>
        <Table
          headers={[t("vehicle"), t("date"), t("liters"), t("price"), t("odometer"), t("station"), t("anomaly")]}
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

      <Modal open={isAddOpen} title={t("addFuel")} onClose={() => setIsAddOpen(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          >
            <option value="">{t("vehicle")}</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder={t("liters")} value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} />
          <Input placeholder={t("price")} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input placeholder={t("odometer")} value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          <Input placeholder={t("station")} value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => create.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
