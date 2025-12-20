import os
from typing import Any, Dict

from app.config import settings


class AIService:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or settings.gemini_api_key or ""

    def has_real_key(self) -> bool:
        return bool(self.api_key)

    def build_report_template(self, prompt: str, constraints: Dict[str, Any] | None = None) -> Dict[str, Any]:
        if not self.has_real_key():
            # Deterministic mock
            return {
                "type": "custom",
                "filters": constraints or {"text": prompt},
                "groupBy": "vehicle",
                "metrics": ["fuel_cost", "distance"],
            }
        # Placeholder for real integration call
        return {
            "type": "custom",
            "filters": constraints or {},
            "groupBy": "vehicle",
            "metrics": ["fuel_cost", "distance"],
            "llm": "gemini",
        }

    def waybill_normalize(self, purpose: str, route_text: str) -> Dict[str, str]:
        if not self.has_real_key():
            summary = route_text[:120]
            return {
                "purpose": purpose.strip().capitalize(),
                "route_summary": f"Key points: {summary}",
            }
        return {"purpose": purpose, "route_summary": route_text[:120]}

    def maintenance_advice(self, vehicle_summary: str) -> Dict[str, Any]:
        if not self.has_real_key():
            return {
                "advice": [
                    "Schedule oil change within 500km.",
                    "Check tire pressure weekly.",
                    "Investigate recent fuel anomalies.",
                ],
            }
        return {"advice": [vehicle_summary]}


ai_service = AIService()
