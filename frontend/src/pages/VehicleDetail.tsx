import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function VehicleDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [advice, setAdvice] = useState<string[]>([]);

  const vehicle = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => (await api.get(`/vehicles/${id}`)).data,
    enabled: !!id
  });

  const loadAdvice = async () => {
    const summary = `${vehicle.data?.plate_number} mileage ${vehicle.data?.mileage}`;
    const res = await api.post("/ai/maintenance-advice", { vehicleSummary: summary });
    setAdvice(res.data.advice || []);
  };

  if (!vehicle.data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page">
      <SectionHeader
        title={vehicle.data.plate_number}
        subtitle={vehicle.data.model}
        actions={<Button onClick={loadAdvice}>{t("aiAdvice")}</Button>}
      />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", fontSize: "15px" }}>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "4px" }}>Status</div>
            <div style={{ fontWeight: 600 }}>{vehicle.data.status}</div>
          </div>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "4px" }}>Mileage</div>
            <div style={{ fontWeight: 600 }}>{vehicle.data.mileage}</div>
          </div>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "4px" }}>Fuel</div>
            <div style={{ fontWeight: 600 }}>{vehicle.data.fuel_type}</div>
          </div>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "4px" }}>Avg consumption</div>
            <div style={{ fontWeight: 600 }}>{vehicle.data.avg_consumption}</div>
          </div>
        </div>
      </Card>
      {advice.length > 0 && (
        <Card title={t("aiAdvice") as string}>
          <ul style={{ paddingLeft: "20px", display: "grid", gap: "12px", fontSize: "14px", listStyle: "disc" }}>
            {advice.map((a, idx) => (
              <li key={idx} style={{ color: "var(--color-text-secondary)", lineHeight: "1.6" }}>{a}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
