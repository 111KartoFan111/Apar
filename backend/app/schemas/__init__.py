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
from .fines import FineCreate, FineOut, FineUpdate
from .tires import (
    TireCreate,
    TireOut,
    TireUpdate,
    TireAssignmentCreate,
    TireAssignmentOut,
    TireServiceCreate,
    TireServiceOut,
)
from .reports import ReportTemplateCreate, ReportTemplateOut, ReportRunRequest, ReportRunResult
