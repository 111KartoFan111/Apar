import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { StatusBadge } from "../components/ui/StatusBadge";
import styles from "./Tires.module.css";

export default function TiresPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const tires = useQuery({ queryKey: ["tires"], queryFn: async () => (await api.get("/tires")).data });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: async () => (await api.get("/vehicles")).data });
  const assignments = useQuery({ queryKey: ["tire-assignments"], queryFn: async () => (await api.get("/tires/assignments")).data });
  const services = useQuery({ queryKey: ["tire-services"], queryFn: async () => (await api.get("/tires/services")).data });
  const alerts = useQuery({ queryKey: ["tire-alerts"], queryFn: async () => (await api.get("/tires/alerts")).data });
  const [form, setForm] = useState({ serial: "", brand: "", tread_depth: "", mileage: "", status: "in_stock" });
  const [updateForm, setUpdateForm] = useState({ tire_id: "", status: "", tread_depth: "", mileage: "" });
  const [assignForm, setAssignForm] = useState({ tire_id: "", vehicle_id: "", position: "", notes: "", assigned_date: "" });
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    tire_id: "",
    service_type: "inspection",
    service_date: "",
    mileage: "",
    tread_depth: "",
    notes: ""
  });

  const create = useMutation({
    mutationFn: async () =>
      api.post("/tires", {
        serial: form.serial,
        brand: form.brand,
        tread_depth: Number(form.tread_depth || 8),
        mileage: Number(form.mileage || 0),
        status: form.status || "in_stock"
      }),
    onSuccess: () => {
      qc.invalidateQueries(["tires"]);
      setForm({ serial: "", brand: "", tread_depth: "", mileage: "", status: "in_stock" });
    }
  });

  const updateTire = useMutation({
    mutationFn: async () =>
      api.patch(`/tires/${Number(updateForm.tire_id)}`, {
        status: updateForm.status || undefined,
        tread_depth: updateForm.tread_depth ? Number(updateForm.tread_depth) : undefined,
        mileage: updateForm.mileage ? Number(updateForm.mileage) : undefined
      }),
    onSuccess: () => {
      qc.invalidateQueries(["tires"]);
      setIsUpdateOpen(false);
    }
  });

  const assign = useMutation({
    mutationFn: async () =>
      api.post("/tires/assign", {
        tire_id: Number(assignForm.tire_id),
        vehicle_id: Number(assignForm.vehicle_id),
        position: assignForm.position || undefined,
        notes: assignForm.notes || undefined,
        assigned_date: assignForm.assigned_date || undefined
      }),
    onSuccess: () => {
      qc.invalidateQueries(["tires"]);
      qc.invalidateQueries(["tire-assignments"]);
      setAssignForm({ tire_id: "", vehicle_id: "", position: "", notes: "", assigned_date: "" });
      setIsAssignOpen(false);
    }
  });

  const createService = useMutation({
    mutationFn: async () =>
      api.post("/tires/services", {
        tire_id: Number(serviceForm.tire_id),
        service_type: serviceForm.service_type,
        service_date: serviceForm.service_date || undefined,
        mileage: serviceForm.mileage ? Number(serviceForm.mileage) : undefined,
        tread_depth: serviceForm.tread_depth ? Number(serviceForm.tread_depth) : undefined,
        notes: serviceForm.notes || undefined
      }),
    onSuccess: () => {
      qc.invalidateQueries(["tire-services"]);
      qc.invalidateQueries(["tires"]);
      setServiceForm({ tire_id: "", service_type: "inspection", service_date: "", mileage: "", tread_depth: "", notes: "" });
    }
  });

  const vehicleById = useMemo(
    () => new Map((vehicles.data || []).map((v: any) => [v.id, v])),
    [vehicles.data]
  );
  const tireById = useMemo(
    () => new Map((tires.data || []).map((t: any) => [t.id, t])),
    [tires.data]
  );

  const assignmentByTireId = useMemo(() => {
    const map = new Map<number, any>();
    (assignments.data || []).forEach((assignment: any) => {
      if (assignment.removed_date) {
        return;
      }
      const current = map.get(assignment.tire_id);
      if (!current || assignment.id > current.id) {
        map.set(assignment.tire_id, assignment);
      }
    });
    return map;
  }, [assignments.data]);

  const handleUpdateSelect = (value: string) => {
    const tire = tireById.get(Number(value));
    setUpdateForm({
      tire_id: value,
      status: tire?.status || "in_stock",
      tread_depth: tire?.tread_depth?.toString() || "",
      mileage: tire?.mileage?.toString() || ""
    });
  };

  const serviceTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      inspection: t("tireServiceInspection"),
      rotation: t("tireServiceRotation"),
      balance: t("tireServiceBalance"),
      repair: t("tireServiceRepair"),
      replace: t("tireServiceReplace")
    };
    return map[type] || type;
  };

  const tireRows = (tires.data || []).map((tire: any) => {
    const assignment = assignmentByTireId.get(tire.id);
    const vehicleLabel = assignment ? vehicleById.get(assignment.vehicle_id)?.plate_number || `#${assignment.vehicle_id}` : "-";
    return [
      tire.serial,
      tire.brand,
      <StatusBadge key={`status-${tire.id}`} status={tire.status} />,
      tire.tread_depth,
      tire.mileage,
      vehicleLabel
    ];
  });

  const serviceRows = (services.data || []).map((service: any) => {
    const tire = tireById.get(service.tire_id);
    return [
      service.service_date || "-",
      tire ? tire.serial : `#${service.tire_id}`,
      serviceTypeLabel(service.service_type),
      service.mileage ?? "-",
      service.tread_depth ?? "-",
      service.notes || "-"
    ];
  });

  const canAssign = Boolean(assignForm.tire_id) && Boolean(assignForm.vehicle_id);
  const canUpdate = Boolean(updateForm.tire_id);
  const canService = Boolean(serviceForm.tire_id) && Boolean(serviceForm.service_type);

  return (
    <div className="page">
      <SectionHeader
        title={t("tires")}
        subtitle={t("tiresSubtitle", { count: alerts.data?.length || 0 })}
      />
      <div className={styles.grid}>
        <div className={styles.column}>
          <Card title={t("addTire")}>
            <div className={styles.formStack}>
              <Input label={t("tireSerial")} value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} />
              <Input label={t("tireBrand")} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <Input label={t("tireTread")} type="number" min="0" step="0.1" value={form.tread_depth} onChange={(e) => setForm({ ...form, tread_depth: e.target.value })} />
              <Input label={t("tireMileage")} type="number" min="0" step="1" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
              <div className={styles.field}>
                <span className={styles.fieldLabel}>{t("status")}</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="in_stock">{t("statusLabels.in_stock")}</option>
                  <option value="installed">{t("statusLabels.installed")}</option>
                  <option value="service">{t("statusLabels.service")}</option>
                  <option value="retired">{t("statusLabels.retired")}</option>
                </select>
              </div>
              <Button onClick={() => create.mutate()}>{t("add")}</Button>
            </div>
          </Card>

          <Card title={t("tireActions")}>
            <div className={styles.actionRow}>
              <Button variant="secondary" onClick={() => setIsUpdateOpen(true)}>{t("openUpdateTire")}</Button>
              <Button variant="secondary" onClick={() => setIsAssignOpen(true)}>{t("openAssignTire")}</Button>
            </div>
          </Card>
        </div>

        <div className={styles.column}>
          <Card title={t("tireService")}>
            <div className={styles.formStack}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t("tire")}</span>
                  <select
                    value={serviceForm.tire_id}
                    onChange={(e) => setServiceForm({ ...serviceForm, tire_id: e.target.value })}
                  >
                    <option value="">{t("tire")}</option>
                    {tires.data?.map((tire: any) => (
                      <option key={tire.id} value={tire.id}>{tire.serial}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t("tireServiceType")}</span>
                  <select
                    value={serviceForm.service_type}
                    onChange={(e) => setServiceForm({ ...serviceForm, service_type: e.target.value })}
                  >
                    <option value="inspection">{t("tireServiceInspection")}</option>
                    <option value="rotation">{t("tireServiceRotation")}</option>
                    <option value="balance">{t("tireServiceBalance")}</option>
                    <option value="repair">{t("tireServiceRepair")}</option>
                    <option value="replace">{t("tireServiceReplace")}</option>
                  </select>
                </div>
                <Input
                  label={t("date")}
                  type="date"
                  value={serviceForm.service_date}
                  onChange={(e) => setServiceForm({ ...serviceForm, service_date: e.target.value })}
                />
              </div>
              <div className={styles.formRow}>
                <Input label={t("tireMileage")} type="number" min="0" step="1" value={serviceForm.mileage} onChange={(e) => setServiceForm({ ...serviceForm, mileage: e.target.value })} />
                <Input label={t("tireTread")} type="number" min="0" step="0.1" value={serviceForm.tread_depth} onChange={(e) => setServiceForm({ ...serviceForm, tread_depth: e.target.value })} />
                <Input label={t("notes")} value={serviceForm.notes} onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })} />
              </div>
              <Button disabled={!canService} onClick={() => createService.mutate()}>{t("add")}</Button>
            </div>
          </Card>

          <Card title={t("tireAlerts")}>
            {alerts.data?.length ? (
              <ul className={styles.list}>
                {alerts.data?.map((tire: any) => (
                  <li key={tire.id} className={styles.listItem}>
                    <div>
                      <div className={styles.listTitle}>{tire.serial}</div>
                      <div className={styles.listMeta}>{tire.brand}</div>
                    </div>
                    <StatusBadge status="alert" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>

          <Card title={t("tiresList")}>
            {tireRows.length ? (
              <Table
                headers={[t("tireSerial"), t("tireBrand"), t("status"), t("tireTread"), t("tireMileage"), t("vehicle")]}
                rows={tireRows}
                zebra
              />
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>

          <Card title={t("tireServiceLog")}>
            {serviceRows.length ? (
              <Table
                headers={[t("date"), t("tire"), t("tireServiceType"), t("tireMileage"), t("tireTread"), t("notes")]}
                rows={serviceRows}
                zebra
              />
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={isUpdateOpen} title={t("updateTire")} onClose={() => setIsUpdateOpen(false)}>
        <div className={styles.formStack}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t("tire")}</span>
            <select
              value={updateForm.tire_id}
              onChange={(e) => handleUpdateSelect(e.target.value)}
            >
              <option value="">{t("tire")}</option>
              {tires.data?.map((tire: any) => (
                <option key={tire.id} value={tire.id}>{tire.serial}</option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("status")}</span>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
              >
                <option value="in_stock">{t("statusLabels.in_stock")}</option>
                <option value="installed">{t("statusLabels.installed")}</option>
                <option value="service">{t("statusLabels.service")}</option>
                <option value="retired">{t("statusLabels.retired")}</option>
              </select>
            </div>
            <Input
              label={t("tireTread")}
              type="number"
              min="0"
              step="0.1"
              value={updateForm.tread_depth}
              onChange={(e) => setUpdateForm({ ...updateForm, tread_depth: e.target.value })}
            />
            <Input
              label={t("tireMileage")}
              type="number"
              min="0"
              step="1"
              value={updateForm.mileage}
              onChange={(e) => setUpdateForm({ ...updateForm, mileage: e.target.value })}
            />
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setIsUpdateOpen(false)}>{t("cancel")}</Button>
            <Button disabled={!canUpdate} onClick={() => updateTire.mutate()}>{t("save")}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={isAssignOpen} title={t("assignTire")} onClose={() => setIsAssignOpen(false)}>
        <div className={styles.formStack}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("tire")}</span>
              <select
                value={assignForm.tire_id}
                onChange={(e) => setAssignForm({ ...assignForm, tire_id: e.target.value })}
              >
                <option value="">{t("tire")}</option>
                {tires.data?.map((tire: any) => (
                  <option key={tire.id} value={tire.id}>{tire.serial}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("vehicle")}</span>
              <select
                value={assignForm.vehicle_id}
                onChange={(e) => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}
              >
                <option value="">{t("vehicle")}</option>
                {vehicles.data?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.plate_number}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <Input label={t("tirePosition")} value={assignForm.position} onChange={(e) => setAssignForm({ ...assignForm, position: e.target.value })} />
            <Input label={t("tireAssignedDate")} type="date" value={assignForm.assigned_date} onChange={(e) => setAssignForm({ ...assignForm, assigned_date: e.target.value })} />
            <Input label={t("notes")} value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} />
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setIsAssignOpen(false)}>{t("cancel")}</Button>
            <Button disabled={!canAssign} onClick={() => assign.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
