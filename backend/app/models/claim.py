from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

class Claim(BaseModel):
    claimant_name: str = Field(..., example="Ramesh Gond")
    state: str = Field(..., example="Madhya Pradesh")
    district: str = Field(..., example="Balaghat")
    village: str = Field(..., example="Kanha")

    claim_type: Literal["individual", "community"] = Field(default="individual")
    area: float = Field(..., example=2.5)  # hectares or acres

    submission_date: datetime = Field(default_factory=datetime.now)
    status: Literal["approved", "pending"] = Field(default="pending")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }