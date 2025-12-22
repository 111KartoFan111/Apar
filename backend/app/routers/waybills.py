from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/waybills", tags=["waybills"])


@router.get("", response_model=list[schemas.WaybillOut])
def list_waybills(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Waybill).order_by(models.Waybill.start_time.desc()).all()


@router.post("", response_model=schemas.WaybillOut)
def create_waybill(waybill_in: schemas.WaybillCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle = db.get(models.Vehicle, waybill_in.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    waybill = models.Waybill(**waybill_in.dict())
    db.add(waybill)
    db.commit()
    db.refresh(waybill)
    return waybill


@router.put("/{waybill_id}", response_model=schemas.WaybillOut)
def update_waybill(waybill_id: int, waybill_in: schemas.WaybillCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    waybill = db.get(models.Waybill, waybill_id)
    if not waybill:
        raise HTTPException(status_code=404, detail="Waybill not found")
    for field, value in waybill_in.dict(exclude_none=True).items():
        setattr(waybill, field, value)
    db.commit()
    db.refresh(waybill)
    return waybill


@router.get("/{waybill_id}/print", response_class=HTMLResponse)
def print_waybill(waybill_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    waybill = db.get(models.Waybill, waybill_id)
    if not waybill:
        raise HTTPException(status_code=404, detail="Waybill not found")
    vehicle = db.get(models.Vehicle, waybill.vehicle_id)
    html = f"""
    <!doctype html>
    <html lang="ru">
    <head>
      <meta charset="utf-8"/>
      <title>Путевой лист {waybill.id}</title>
      <style>
        body {{ font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }}
        h1 {{ font-size: 20px; margin-bottom: 12px; }}
        .section {{ border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 12px; }}
        .row {{ display: flex; justify-content: space-between; margin-bottom: 6px; }}
        .label {{ color: #64748b; width: 180px; }}
        .signature {{ margin-top: 16px; padding-top: 12px; border-top: 1px dashed #94a3b8; height: 80px; }}
      </style>
    </head>
    <body>
      <h1>Путевой лист #{waybill.id}</h1>
      <div class="section">
        <div class="row"><span class="label">Транспорт:</span><span>{vehicle.plate_number if vehicle else waybill.vehicle_id}</span></div>
        <div class="row"><span class="label">Водитель:</span><span>{waybill.driver}</span></div>
        <div class="row"><span class="label">Цель:</span><span>{waybill.purpose}</span></div>
        <div class="row"><span class="label">Маршрут:</span><span>{waybill.route_text}</span></div>
        <div class="row"><span class="label">Начало:</span><span>{waybill.start_time}</span></div>
        <div class="row"><span class="label">Окончание:</span><span>{waybill.end_time or ''}</span></div>
        <div class="row"><span class="label">Одометр старт:</span><span>{waybill.start_odometer}</span></div>
        <div class="row"><span class="label">Одометр конец:</span><span>{waybill.end_odometer or ''}</span></div>
        <div class="row"><span class="label">Заметки:</span><span>{waybill.notes or ''}</span></div>
      </div>
      <div class="section">
        <div class="signature">
          <div><strong>Подпись при отбытии:</strong></div>
          <div style="margin-top:24px;border-top:1px solid #000;width:240px;"></div>
        </div>
        <div class="signature">
          <div><strong>Подпись при прибытии:</strong></div>
          <div style="margin-top:24px;border-top:1px solid #000;width:240px;"></div>
        </div>
      </div>
      <script>window.print && window.print();</script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)


@router.get("/example", response_class=HTMLResponse)
def example_waybill(_: models.User = Depends(get_current_user)):
    html = """
    <!doctype html>
    <html lang="ru">
    <head>
      <meta charset="utf-8"/>
      <title>Пример путевого листа</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
        h1 { font-size: 20px; margin: 0 0 12px; text-align: center; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .block { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 6px; gap: 16px; }
        .label { color: #64748b; width: 180px; flex-shrink: 0; }
        .value { flex: 1; }
        .sign { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #94a3b8; height: 72px; }
        .footer { margin-top: 16px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <h1>Путевой лист (пример)</h1>
      <div class="meta">
        <div>Организация: Apar Logistics</div>
        <div>№ 000245 от 22.12.2025</div>
      </div>
      <div class="block">
        <div class="row"><span class="label">Транспорт:</span><span class="value">KZ-001 · Mercedes Sprinter</span></div>
        <div class="row"><span class="label">Водитель:</span><span class="value">Али Болат</span></div>
        <div class="row"><span class="label">Цель:</span><span class="value">Доставка грузов по маршруту</span></div>
        <div class="row"><span class="label">Маршрут:</span><span class="value">Склад → Абая → Достык → Склад</span></div>
        <div class="row"><span class="label">Начало:</span><span class="value">22.12.2025 08:30</span></div>
        <div class="row"><span class="label">Окончание:</span><span class="value">22.12.2025 13:10</span></div>
        <div class="row"><span class="label">Одометр старт:</span><span class="value">120 000 км</span></div>
        <div class="row"><span class="label">Одометр конец:</span><span class="value">120 260 км</span></div>
        <div class="row"><span class="label">Примечание:</span><span class="value">Без замечаний</span></div>
      </div>
      <div class="block">
        <div class="sign">
          <strong>Подпись при отбытии:</strong>
          <div style="margin-top:24px;border-top:1px solid #000;width:240px;"></div>
        </div>
        <div class="sign">
          <strong>Подпись при прибытии:</strong>
          <div style="margin-top:24px;border-top:1px solid #000;width:240px;"></div>
        </div>
      </div>
      <div class="footer">Данный документ является демонстрационным примером.</div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)
