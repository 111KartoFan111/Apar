import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Table } from "../components/ui/Table";

export default function ReportsPage() {
  const { t } = useTranslation();
  const templates = useQuery({ queryKey: ["report-templates"], queryFn: async () => (await api.get("/reports/templates")).data });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customTemplate, setCustomTemplate] = useState<string>('{"type":"fuel_cost"}');
  const [aiPrompt, setAiPrompt] = useState("");
  const [result, setResult] = useState<any>(null);

  const runReport = useMutation({
    mutationFn: async (template: any) => (await api.post("/reports/run", { template })).data,
    onSuccess: (data) => setResult(data)
  });

  const createTemplate = useMutation({
    mutationFn: async () =>
      api.post("/reports/templates", {
        name: "Custom",
        description: "Saved from UI",
        template: JSON.parse(customTemplate || "{}")
      }),
    onSuccess: () => templates.refetch()
  });

  const buildWithAI = async () => {
    const res = await api.post("/ai/report-builder", { prompt: aiPrompt });
    setCustomTemplate(JSON.stringify(res.data.template, null, 2));
  };

  const exportCsv = () => {
    if (!result?.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  return (
    <div className="page">
      <SectionHeader
        title={t("reports")}
        subtitle="Шаблоны, кастомные отчёты и сборка через ИИ"
        actions={<Button onClick={buildWithAI}>{t("aiBuildReport")}</Button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        <Card title="Шаблоны">
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {templates.data?.map((tpl: any) => (
              <li key={tpl.id} style={{ padding: "12px", borderRadius: "8px", background: "#f8fafc", border: "1px solid rgba(15, 23, 42, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{tpl.name}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{tpl.description}</div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedTemplate(tpl.template)}>Запустить</Button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}>JSON шаблон</div>
              <Textarea value={customTemplate} onChange={(e) => setCustomTemplate(e.target.value)} style={{ fontFamily: "monospace", minHeight: "140px" }} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="ghost" onClick={() => runReport.mutate(JSON.parse(customTemplate))}>Предпросмотр</Button>
              <Button variant="secondary" onClick={() => createTemplate.mutate()}>{t("save")}</Button>
            </div>
            <Input placeholder="AI prompt" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
          </div>
        </Card>
        <Card title="Результат">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
            {selectedTemplate && (
              <Button onClick={() => runReport.mutate(selectedTemplate)}>Запустить выбранный</Button>
            )}
            <Button variant="ghost" onClick={exportCsv}>{t("exportCsv")}</Button>
          </div>
          {result ? (
            <Table
              headers={result.headers}
              rows={result.rows}
              zebra
            />
          ) : (
            <div style={{ color: "var(--color-text-muted)", fontSize: "14px", padding: "24px", textAlign: "center" }}>Запустите отчет, чтобы увидеть данные</div>
          )}
        </Card>
      </div>
    </div>
  );
}
