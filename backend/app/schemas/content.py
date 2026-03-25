from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class GuideSectionBase(SchemaBase):
    sectionSlug: str
    title: str
    summary: Optional[str] = None
    phaseCode: Optional[str] = None
    estimatedReadMinutes: int

class GuideSectionDetail(GuideSectionBase):
    bodyMarkdown: str
    headings: List[dict]
    relatedChecklistGroupCodes: List[str]
    prevSection: Optional[dict] = None
    nextSection: Optional[dict] = None

class DocumentBase(SchemaBase):
    documentSlug: str
    title: str
    contentVersion: str
    updatedAt: datetime
