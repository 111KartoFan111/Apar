from .auth import Token, TokenData, UserCreate, UserOut
from .vehicles import VehicleCreate, VehicleUpdate, VehicleOut, FuelEntryCreate, FuelEntryOut
from .maintenance import (
    MaintenanceScheduleCreate,
    MaintenanceScheduleOut,
    WorkOrderCreate,
    WorkOrderOut,
    WorkOrderPartAdd,
)
from .waybills import WaybillCreate, WaybillOut
from .inspections import InspectionTemplateCreate, InspectionTemplateOut, InspectionResultCreate
from .warehouses import (
    WarehouseCreate,
    WarehouseOut,
    PartCreate,
    PartOut,
    PartStockOut,
    StockMovementOut,
    PartImportResult,
)
from .orders import PartOrderCreate, PartOrderOut
from .fines import FineCreate, FineOut
from .tires import TireCreate, TireOut, TireAssignmentCreate, TireAssignmentOut
from .reports import ReportTemplateCreate, ReportTemplateOut, ReportRunRequest, ReportRunResult
