import asyncio
import os
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine
from app.models.content import Document, DocumentType, DocumentSection, OutlineSection
from app.models.checklist import ChecklistGroup, ChecklistItem

async def seed():
    print("Starting database seeding process...")
    async with AsyncSessionLocal() as session:
        # 1. Provide mock logic for documents table
        # In a real scenario you would parse content/study.md etc
        # Here we just insert a dummy document to prove it works
        
        doc = Document(
            document_slug='guide',
            document_type=DocumentType.guide,
            title='網站開發流程學習指南',
            subtitle='從 MVP 到規模化，AI 時代版',
            source_path='content/study.md',
            source_checksum='mock_checksum',
            content_version='2026-03-24'
        )
        session.add(doc)
        await session.commit()
        await session.refresh(doc)
        
        # Example: Guide Section
        sec = DocumentSection(
            document_id=doc.id,
            section_slug='mindset',
            title='先建立正確觀念',
            summary='建立產品、設計、工程、營運四條線的整體觀。',
            phase_code='phase-0',
            sort_order=1,
            body_markdown='## 1. 先建立正確觀念 \n\n 這是測試標題...',
            body_plaintext='先建立正確觀念，這是測試標題...',
        )
        session.add(sec)
        await session.commit()
        
        print("Database seeded successfully with dummy data.")
        
if __name__ == "__main__":
    asyncio.run(seed())
