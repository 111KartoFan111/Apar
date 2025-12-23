import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

export default function InspectionsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const templates = useQuery({ queryKey: ["templates"], queryFn: async () => (await api.get("/inspections/templates")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const [templateForm, setTemplateForm] = useState({ name: "", description: "" });
  const [resultForm, setResultForm] = useState({ vehicle_id: "", template_id: "", payload: "" });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const createTemplate = useMutation({
    mutationFn: async () => api.post("/inspections/templates", { ...templateForm, schema: { fields: ["ok"] } }),
    onSuccess: () => {
      qc.invalidateQueries(["templates"]);
      setTemplateForm({ name: "", description: "" });
      setIsTemplateOpen(false);
    }
  });

  const submitResult = async () => {
    const formData = new FormData();
    formData.append("vehicle_id", resultForm.vehicle_id);
    formData.append("template_id", resultForm.template_id);
    formData.append("payload", resultForm.payload || "{}");
    if (attachment) {
      formData.append("file", attachment);
    }
    await api.post("/inspections/results", formData, { headers: { "Content-Type": "multipart/form-data" } });
    setResultForm({ vehicle_id: "", template_id: "", payload: "" });
    setAttachment(null);
    setIsResultOpen(false);
  };

  return (
    <div className="page">
      <SectionHeader
        title={t("inspections")}
        subtitle={t("inspectionsSubtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsTemplateOpen(true)}>{t("openAddTemplate")}</Button>
            <Button variant="secondary" onClick={() => setIsResultOpen(true)}>{t("openAddInspection")}</Button>
          </>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        <Card title={t("templates")}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {templates.data?.map((tpl: any) => (
              <li key={tpl.id} style={{ padding: "12px", borderRadius: "8px", background: "#f8fafc", border: "1px solid rgba(15, 23, 42, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 500 }}>{tpl.name}</span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{tpl.description}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("fillInspection")}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>{t("fillInspectionHint")}</div>
            <Button variant="secondary" onClick={() => setIsResultOpen(true)}>{t("openAddInspection")}</Button>
          </div>
        </Card>
      </div>

      <Modal open={isTemplateOpen} title={t("addTemplate")} onClose={() => setIsTemplateOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input placeholder={t("templateName")} value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
          <Input placeholder={t("templateDescription")} value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="ghost" onClick={() => setIsTemplateOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => createTemplate.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={isResultOpen} title={t("fillInspection")} onClose={() => setIsResultOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <select
            value={resultForm.vehicle_id}
            onChange={(e) => setResultForm({ ...resultForm, vehicle_id: e.target.value })}
          >
            <option value="">{t("vehicle")}</option>
            {vehicles.data?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plate_number}</option>
            ))}
          </select>
          <select
            value={resultForm.template_id}
            onChange={(e) => setResultForm({ ...resultForm, template_id: e.target.value })}
          >
            <option value="">{t("template")}</option>
            {templates.data?.map((tpl: any) => (
              <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
            ))}
          </select>
          <Textarea placeholder={t("payloadJson")} value={resultForm.payload} onChange={(e) => setResultForm({ ...resultForm, payload: e.target.value })} />
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="ghost" onClick={() => setIsResultOpen(false)}>{t("cancel")}</Button>
            <Button onClick={submitResult}>{t("save")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
