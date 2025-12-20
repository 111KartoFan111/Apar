import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Table } from "../components/ui/Table";

export default function WaybillsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const waybills = useQuery({ queryKey: ["waybills"], queryFn: async () => (await api.get("/waybills")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [form, setForm] = useState({
    vehicle_id: "",
    driver: "",
    purpose: "",
    route_text: "",
    start_time: "",
    end_time: "",
    start_odometer: "",
    end_odometer: ""
  });

  const create = useMutation({
    mutationFn: async () =>
      api.post("/waybills", {
        ...form,
        vehicle_id: Number(form.vehicle_id),
        start_odometer: Number(form.start_odometer),
        end_odometer: form.end_odometer ? Number(form.end_odometer) : null
      }),
    onSuccess: () => {
      qc.invalidateQueries(["waybills"]);
      setForm({ vehicle_id: "", driver: "", purpose: "", route_text: "", start_time: "", end_time: "", start_odometer: "", end_odometer: "" });
    }
  });

  const improveText = async () => {
    const res = await api.post("/ai/waybill-normalize", { purpose: form.purpose, routeText: form.route_text });
    setForm({ ...form, purpose: res.data.purpose, route_text: res.data.route_summary });
  };

  const printWaybill = async (id: number) => {
    const res = await api.get(`/waybills/${id}/print`, { responseType: "text", headers: { Accept: "text/html" } });
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(res.data);
      printWindow.document.close();
    }
  };

  return (
    <div className="page">
      <SectionHeader
        title={t("waybills")}
        subtitle="Создание и печать путевых листов, улучшение текста через ИИ"
        actions={<Button onClick={improveText}>{t("aiImproveText")}</Button>}
      />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          >
            <option value="">Vehicle</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <Input placeholder={t("driver")} value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} />
          <Input placeholder={t("purpose")} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          <Textarea placeholder={t("route")} value={form.route_text} onChange={(e) => setForm({ ...form, route_text: e.target.value })} />
          <Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <Input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <Input placeholder="Start odometer" value={form.start_odometer} onChange={(e) => setForm({ ...form, start_odometer: e.target.value })} />
          <Input placeholder="End odometer" value={form.end_odometer} onChange={(e) => setForm({ ...form, end_odometer: e.target.value })} />
        </div>
        <Button style={{ marginTop: "12px" }} onClick={() => create.mutate()}>{t("add")}</Button>
      </Card>
      <Card>
        <Table
          headers={[t("driver"), "Vehicle", t("purpose"), t("route"), "Print"]}
          rows={(waybills.data || []).map((w: any) => [
            w.driver,
            w.vehicle_id,
            w.purpose,
            w.route_text,
            <Button key={w.id} variant="ghost" onClick={() => printWaybill(w.id)}>Печать</Button>
          ])}
          zebra
        />
      </Card>
    </div>
  );
}
