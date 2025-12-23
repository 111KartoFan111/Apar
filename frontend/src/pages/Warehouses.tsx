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
import styles from "./Warehouses.module.css";

export default function WarehousesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: async () => (await api.get("/warehouses")).data });
  const parts = useQuery({ queryKey: ["parts"], queryFn: async () => (await api.get("/warehouses/parts")).data });
  const stocks = useQuery({ queryKey: ["stocks"], queryFn: async () => (await api.get("/warehouses/stocks")).data });
  const movements = useQuery({ queryKey: ["stock-movements"], queryFn: async () => (await api.get("/warehouses/movements")).data });
  const [whForm, setWhForm] = useState({ name: "", type: "stationary" });
  const [partForm, setPartForm] = useState({ sku: "", name: "", cost: "" });
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isPartOpen, setIsPartOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [movementForm, setMovementForm] = useState({
    warehouse_id: "",
    part_id: "",
    quantity: "",
    movement_type: "in",
    reference: ""
  });

  const createWh = useMutation({
    mutationFn: async () => api.post("/warehouses", whForm),
    onSuccess: () => {
      qc.invalidateQueries(["warehouses"]);
      setWhForm({ name: "", type: "stationary" });
      setIsWarehouseOpen(false);
    }
  });

  const createPart = useMutation({
    mutationFn: async () => api.post("/warehouses/parts", { ...partForm, cost: Number(partForm.cost || 0) }),
    onSuccess: () => {
      qc.invalidateQueries(["parts"]);
      setPartForm({ sku: "", name: "", cost: "" });
      setIsPartOpen(false);
    }
  });

  const moveStock = useMutation({
    mutationFn: async () =>
      api.post("/warehouses/stock", {
        warehouse_id: Number(movementForm.warehouse_id),
        part_id: Number(movementForm.part_id),
        quantity: Number(movementForm.quantity || 0),
        movement_type: movementForm.movement_type,
        reference: movementForm.reference || undefined
      }),
    onSuccess: () => {
      qc.invalidateQueries(["stocks"]);
      qc.invalidateQueries(["stock-movements"]);
      setMovementForm((current) => ({ ...current, quantity: "", reference: "" }));
      setIsMovementOpen(false);
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

  const warehouseById = useMemo(
    () => new Map((warehouses.data || []).map((w: any) => [w.id, w])),
    [warehouses.data]
  );
  const partById = useMemo(
    () => new Map((parts.data || []).map((p: any) => [p.id, p])),
    [parts.data]
  );

  const resolveWarehouse = (id: number) => warehouseById.get(id)?.name || `#${id}`;
  const resolvePart = (id: number) => {
    const part = partById.get(id);
    return part ? `${part.sku} - ${part.name}` : `#${id}`;
  };

  const stockRows = (stocks.data || []).map((s: any) => [
    resolveWarehouse(s.warehouse_id),
    resolvePart(s.part_id),
    s.quantity
  ]);

  const movementRows = (movements.data || []).map((m: any) => [
    resolveWarehouse(m.warehouse_id),
    resolvePart(m.part_id),
    <StatusBadge key={`move-${m.id}`} status={m.movement_type} />,
    m.quantity,
    m.reference || "-",
    m.created_at ? new Date(m.created_at).toLocaleString() : "-"
  ]);

  const quantityValue = Number(movementForm.quantity);
  const canMove =
    Boolean(movementForm.warehouse_id) && Boolean(movementForm.part_id) && Number.isFinite(quantityValue) && quantityValue > 0;

  return (
    <div className="page">
      <SectionHeader
        title={t("warehouses")}
        subtitle={t("warehousesSubtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={() => exportCsv("/warehouses/parts/export", "parts.csv")}>{t("exportCsv")}</Button>
            <Button variant="ghost" onClick={() => exportCsv("/warehouses/stocks/export", "stock.csv")}>{t("stockCsv")}</Button>
            <label>
              <input type="file" style={{ display: "none" }} onChange={(e) => e.target.files && importParts(e.target.files[0])} />
              <Button variant="ghost">{t("importCsv")}</Button>
            </label>
          </>
        }
      />
      <div className={styles.grid}>
        <div className={styles.column}>
          <Card title={t("warehouses")}>
            <div className={styles.cardActions}>
              <Button variant="secondary" onClick={() => setIsWarehouseOpen(true)}>{t("openAddWarehouse")}</Button>
            </div>
            {warehouses.data?.length ? (
              <ul className={styles.list}>
                {warehouses.data?.map((w: any) => (
                  <li key={w.id} className={styles.listItem}>
                    <span>{w.name}</span>
                    <span className={styles.listMeta}>
                      {w.type === "mobile" ? t("warehouseTypeMobile") : t("warehouseTypeStationary")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>

          <Card title={t("parts")}>
            <div className={styles.cardActions}>
              <Button variant="secondary" onClick={() => setIsPartOpen(true)}>{t("openAddPart")}</Button>
            </div>
            {parts.data?.length ? (
              <div className={styles.scroll}>
                {parts.data?.map((p: any) => (
                  <div key={p.id} className={styles.listItem}>
                    <span>{p.sku} - {p.name}</span>
                    <span className={styles.listMeta}>{p.cost}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>
        </div>

        <div className={styles.column}>
          <Card title={t("stockMovement")} subtitle={t("stockMovementHint")}>
            <div className={styles.cardActions}>
              <Button variant="secondary" onClick={() => setIsMovementOpen(true)}>{t("openMovement")}</Button>
            </div>
          </Card>

          <Card title={t("stockLevels")}>
            {stockRows.length ? (
              <Table headers={[t("warehouse"), t("part"), t("quantity")]} rows={stockRows} zebra />
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>

          <Card title={t("movements")}>
            {movementRows.length ? (
              <Table
                headers={[t("warehouse"), t("part"), t("movementType"), t("quantity"), t("reference"), t("date")]}
                rows={movementRows}
                zebra
              />
            ) : (
              <div className={styles.empty}>{t("noData")}</div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={isWarehouseOpen} title={t("addWarehouse")} onClose={() => setIsWarehouseOpen(false)}>
        <div className={styles.formStack}>
          <Input label={t("warehouseName")} value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} />
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t("warehouseType")}</span>
            <select
              value={whForm.type}
              onChange={(e) => setWhForm({ ...whForm, type: e.target.value })}
            >
              <option value="stationary">{t("warehouseTypeStationary")}</option>
              <option value="mobile">{t("warehouseTypeMobile")}</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setIsWarehouseOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => createWh.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={isPartOpen} title={t("addPart")} onClose={() => setIsPartOpen(false)}>
        <div className={styles.formStack}>
          <Input label={t("sku")} value={partForm.sku} onChange={(e) => setPartForm({ ...partForm, sku: e.target.value })} />
          <Input label={t("partName")} value={partForm.name} onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} />
          <Input
            label={t("cost")}
            type="number"
            min="0"
            step="0.01"
            value={partForm.cost}
            onChange={(e) => setPartForm({ ...partForm, cost: e.target.value })}
          />
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setIsPartOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => createPart.mutate()}>{t("add")}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={isMovementOpen} title={t("stockMovement")} onClose={() => setIsMovementOpen(false)}>
        <div className={styles.formStack}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("warehouse")}</span>
              <select
                value={movementForm.warehouse_id}
                onChange={(e) => setMovementForm({ ...movementForm, warehouse_id: e.target.value })}
              >
                <option value="">{t("warehouse")}</option>
                {warehouses.data?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("part")}</span>
              <select
                value={movementForm.part_id}
                onChange={(e) => setMovementForm({ ...movementForm, part_id: e.target.value })}
              >
                <option value="">{t("part")}</option>
                {parts.data?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <Input
              label={t("quantity")}
              type="number"
              min="0"
              step="0.01"
              value={movementForm.quantity}
              onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
            />
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("movementType")}</span>
              <select
                value={movementForm.movement_type}
                onChange={(e) => setMovementForm({ ...movementForm, movement_type: e.target.value })}
              >
                <option value="in">{t("movementIn")}</option>
                <option value="out">{t("movementOut")}</option>
              </select>
            </div>
            <Input
              label={t("reference")}
              value={movementForm.reference}
              onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
            />
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setIsMovementOpen(false)}>{t("cancel")}</Button>
            <Button onClick={() => moveStock.mutate()} disabled={!canMove}>{t("applyMovement")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
