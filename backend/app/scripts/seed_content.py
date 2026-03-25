"""
seed_content.py — 讀取 content/ 目錄下的三份 Markdown，解析後寫入 PostgreSQL，
並重建 search_documents 索引。

用法：
    cd backend
    python -m app.scripts.seed_content
"""

import asyncio
import hashlib
import re
import os
import sys
from pathlib import Path

from sqlalchemy import select, delete
from app.database import AsyncSessionLocal, engine
from app.models.base import Base
from app.models.content import Document, DocumentSection, OutlineSection, DocumentType
from app.models.checklist import ChecklistGroup, ChecklistItem
from app.models.search import SearchDocument, SearchSourceType

# ── Slug Maps（與前端 parser.ts 完全一致）──────────────────────────
GUIDE_SLUG_MAP: dict[str, str] = {
    "1. 先建立正確觀念": "mindset",
    "2. 網站開發的標準流程總覽": "workflow-overview",
    "3. 第 0 階段：問題定義與需求發現": "problem-definition",
    "4. 第 1 階段：MVP 切分與範圍控制": "mvp-scope",
    "5. 第 2 階段：資訊架構、內容與 UX/UI": "ux-ui-architecture",
    "6. 第 3 階段：技術策略與架構設計": "tech-strategy-architecture",
    "7. 第 4 階段：AI 時代的實作流程": "ai-implementation",
    "8. 第 5 階段：測試、驗收與品質保證": "testing-qa",
    "9. 第 6 階段：安全、隱私、權限與風險控制": "security-privacy",
    "10. 第 7 階段：效能、可及性、SEO 與觀測性": "performance-seo",
    "11. 第 8 階段：CI/CD、部署與營運": "ci-cd-ops",
    "12. 從 MVP 走向規模化": "scaling",
    "13. 網站類型與技術取向速查": "tech-stack-cheat-sheet",
    "14. 學習路線建議：從入門到業界可用": "learning-path",
    "15. 常見失誤與反模式": "anti-patterns",
    "16. 交付物、清單與模板": "deliverables-templates",
    "17. 參考資源與延伸閱讀": "reference-resources",
}

OUTLINE_SLUG_MAP: dict[str, str] = {
    "1. 先建立正確觀念": "mindset",
    "2. 標準流程總覽": "workflow-overview",
    "3. 問題定義": "problem-definition",
    "4. MVP 切分": "mvp-scope",
    "5. 資訊架構與 UX/UI": "ux-ui-architecture",
    "6. 技術策略與架構設計": "tech-strategy-architecture",
    "7. AI 時代的實作流程": "ai-implementation",
    "8. 測試與品質保證": "testing-qa",
    "9. 安全、隱私與權限": "security-privacy",
    "10. 效能、可及性、 SEO、觀測性": "performance-seo",
    "11. CI/CD、部署與營運": "ci-cd-ops",
    "12. 從 MVP 到規模化": "scaling",
    "13. 最值得記住的十句話": "top-ten-quotes",
    "14. 建議怎麼用這份速讀版": "how-to-use",
}

CHECKLIST_GROUP_MAP: dict[str, str] = {
    "A": "problem-definition",
    "B": "mvp-scope",
    "C": "ux-ui-architecture",
    "D": "tech-strategy-architecture",
    "E": "ai-implementation",
    "F": "ai-implementation",
    "G": "tech-strategy-architecture",
    "H": "testing-qa",
    "I": "security-privacy",
    "J": "performance-seo",
    "K": "performance-seo",
    "L": "performance-seo",
    "M": "performance-seo",
    "N": "ci-cd-ops",
    "O": "testing-qa",
    "P": "testing-qa",
    "Q": "scaling",
    "R": "mindset",
}


def _content_dir() -> Path:
    """Resolve content directory. Try multiple locations."""
    candidates = [
        Path(__file__).resolve().parent.parent.parent.parent / "content",
        Path("/content"),  # Docker mount
    ]
    for c in candidates:
        if c.is_dir():
            return c
    raise FileNotFoundError(f"Cannot find content/ directory. Tried: {candidates}")


def _read_file(name: str) -> str:
    return (_content_dir() / name).read_text(encoding="utf-8")


def _checksum(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def _count_cjk(text: str) -> int:
    return len(re.findall(r"[\u4e00-\u9fa5]", text))


def _estimate_minutes(text: str, wpm: int = 400) -> int:
    return max(1, round(_count_cjk(text) / wpm))


# ── Parsers ──────────────────────────────────────────────────────

def _split_by_h2(raw: str) -> list[tuple[str, str]]:
    """
    Split Markdown by ## headings.
    Returns list of (heading_text, body_text) tuples.
    """
    pattern = re.compile(r"^## (.+)$", re.MULTILINE)
    positions = [(m.start(), m.group(1)) for m in pattern.finditer(raw)]
    sections: list[tuple[str, str]] = []
    for i, (pos, title) in enumerate(positions):
        start = pos + len(f"## {title}")
        end = positions[i + 1][0] if i + 1 < len(positions) else len(raw)
        body = raw[start:end].strip()
        sections.append((title.strip(), body))
    return sections


def parse_guide(raw: str):
    """Parse study.md → list of section dicts (numbered H2 only)."""
    h2s = _split_by_h2(raw)
    sections = []
    sort_order = 1
    for title, body in h2s:
        if not re.match(r"^\d+\.", title):
            continue  # skip non-numbered like 目錄, 這份指南的定位…
        slug = GUIDE_SLUG_MAP.get(title, f"section-{sort_order}")
        phase_match = re.search(r"第 (\d+) 階段", title)
        phase_code = int(phase_match.group(1)) if phase_match else -1
        clean_title = re.sub(r"^\d+\.\s*", "", title)

        # Extract H3 headings for TOC
        headings = []
        for m in re.finditer(r"^### (.+)$", body, re.MULTILINE):
            h3_text = m.group(1).strip()
            h3_id = re.sub(r"\s+", "-", h3_text.lower())
            headings.append({"id": h3_id, "level": 3, "text": h3_text})

        # Summary = first paragraph
        first_para = ""
        for line in body.split("\n"):
            line = line.strip()
            if line and not line.startswith("#") and not line.startswith("-") and not line.startswith(">"):
                first_para = line
                break

        # Plaintext (strip md markers for search)
        plaintext = re.sub(r"[#*`>\[\]\(\)!]", "", body)

        sections.append({
            "slug": slug,
            "title": clean_title,
            "summary": first_para[:200] if first_para else clean_title,
            "phase_code": f"phase-{phase_code}" if phase_code >= 0 else None,
            "sort_order": sort_order,
            "estimated_read_minutes": _estimate_minutes(body),
            "body_markdown": body,
            "body_plaintext": plaintext,
            "headings_json": headings,
            "related_checklist_group_codes": [],
        })
        sort_order += 1

    # Link prev/next
    for i, s in enumerate(sections):
        s["prev_section_slug"] = sections[i - 1]["slug"] if i > 0 else None
        s["next_section_slug"] = sections[i + 1]["slug"] if i < len(sections) - 1 else None

    # Populate related_checklist_group_codes
    slug_to_groups: dict[str, list[str]] = {}
    for code, slug in CHECKLIST_GROUP_MAP.items():
        slug_to_groups.setdefault(slug, []).append(code)
    for s in sections:
        s["related_checklist_group_codes"] = sorted(slug_to_groups.get(s["slug"], []))

    return sections


def parse_outline(raw: str):
    """Parse study-quick-outline.md → list of outline section dicts."""
    h2s = _split_by_h2(raw)
    results = []
    sort_order = 1
    for title, body in h2s:
        if not re.match(r"^\d+\.", title):
            continue
        slug = OUTLINE_SLUG_MAP.get(title, f"outline-{sort_order}")
        clean_title = re.sub(r"^\d+\.\s*", "", title)

        # First paragraph = summary
        summary = ""
        highlights: list[str] = []
        for line in body.split("\n"):
            stripped = line.strip()
            if stripped.startswith("- ") or stripped.startswith("* "):
                highlights.append(stripped.lstrip("-* ").strip())
            elif not summary and stripped and not stripped.startswith("#"):
                summary = stripped

        results.append({
            "slug": slug,
            "title": clean_title,
            "summary": summary[:300] if summary else clean_title,
            "highlights_json": highlights,
            "related_guide_section_slugs": [slug],
            "sort_order": sort_order,
        })
        sort_order += 1
    return results


def parse_checklist(raw: str):
    """Parse study-implementation-checklist.md → list of group dicts with items."""
    h2s = _split_by_h2(raw)
    groups = []
    for title, body in h2s:
        match = re.match(r"^([A-Z])\.\s*(.+)", title)
        if not match:
            continue
        group_code = match.group(1)
        group_title = match.group(2)

        # extract description (first non-list paragraph)
        description = ""
        items: list[dict] = []
        item_counter = 1

        for line in body.split("\n"):
            stripped = line.strip()
            # Checklist item: starts with - [ ] or - [x]
            ck_match = re.match(r"^- \[[ x]\] (.+)", stripped)
            if ck_match:
                label = ck_match.group(1).strip()
                items.append({
                    "item_code": f"{group_code}-{item_counter}",
                    "label": label,
                    "related_section_slug": CHECKLIST_GROUP_MAP.get(group_code),
                    "sort_order": item_counter,
                })
                item_counter += 1
            elif not description and stripped and not stripped.startswith("#") and not stripped.startswith("-"):
                description = stripped

        groups.append({
            "group_code": group_code,
            "title": group_title,
            "description": description,
            "items": items,
            "sort_order": ord(group_code) - ord("A") + 1,
            "related_guide_section_slugs": [CHECKLIST_GROUP_MAP.get(group_code, "")],
        })
    return groups


# ── Database Seeding ─────────────────────────────────────────────

async def seed():
    print("=" * 60)
    print("🌱 Starting content seeding …")
    print("=" * 60)

    content_dir = _content_dir()
    print(f"   Content directory: {content_dir}")

    # Read source files
    study_raw = _read_file("study.md")
    outline_raw = _read_file("study-quick-outline.md")
    checklist_raw = _read_file("study-implementation-checklist.md")

    # Parse
    guide_sections = parse_guide(study_raw)
    outline_sections = parse_outline(outline_raw)
    checklist_groups = parse_checklist(checklist_raw)

    print(f"   Parsed: {len(guide_sections)} guide sections, "
          f"{len(outline_sections)} outline sections, "
          f"{len(checklist_groups)} checklist groups "
          f"({sum(len(g['items']) for g in checklist_groups)} items total)")

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ── 1) Clear old data ────────────────────────────────────
        await session.execute(delete(SearchDocument))
        await session.execute(delete(ChecklistItem))
        await session.execute(delete(ChecklistGroup))
        await session.execute(delete(OutlineSection))
        await session.execute(delete(DocumentSection))
        await session.execute(delete(Document))
        await session.commit()
        print("   Old data cleared.")

        # ── 2) Insert documents ──────────────────────────────────
        guide_doc = Document(
            document_slug="guide",
            document_type=DocumentType.guide,
            title="標準且符合業界實務的網站開發流程學習指南",
            subtitle="從 MVP 到規模化，AI 時代版",
            source_path="content/study.md",
            source_checksum=_checksum(study_raw),
            content_version="2026-03-24",
        )
        outline_doc = Document(
            document_slug="outline",
            document_type=DocumentType.outline,
            title="網站開發流程學習指南：速讀版大綱",
            source_path="content/study-quick-outline.md",
            source_checksum=_checksum(outline_raw),
            content_version="2026-03-24",
        )
        checklist_doc = Document(
            document_slug="checklist",
            document_type=DocumentType.checklist,
            title="網站開發流程學習指南：實作檢查清單版",
            source_path="content/study-implementation-checklist.md",
            source_checksum=_checksum(checklist_raw),
            content_version="2026-03-24",
        )
        session.add_all([guide_doc, outline_doc, checklist_doc])
        await session.flush()
        print("   Documents inserted.")

        # ── 3) Guide sections ────────────────────────────────────
        search_docs: list[SearchDocument] = []
        for gs in guide_sections:
            sec = DocumentSection(
                document_id=guide_doc.id,
                section_slug=gs["slug"],
                title=gs["title"],
                summary=gs["summary"],
                phase_code=gs["phase_code"],
                sort_order=gs["sort_order"],
                estimated_read_minutes=gs["estimated_read_minutes"],
                body_markdown=gs["body_markdown"],
                body_plaintext=gs["body_plaintext"],
                headings_json=gs["headings_json"],
                related_checklist_group_codes=gs["related_checklist_group_codes"],
                prev_section_slug=gs["prev_section_slug"],
                next_section_slug=gs["next_section_slug"],
            )
            session.add(sec)
            # Search document
            search_docs.append(SearchDocument(
                source_type=SearchSourceType.guide_section,
                source_key=f"guide:{gs['slug']}",
                document_slug="guide",
                section_slug=gs["slug"],
                title=gs["title"],
                body_text=gs["body_plaintext"][:5000],
            ))
        print(f"   {len(guide_sections)} guide sections inserted.")

        # ── 4) Outline sections ──────────────────────────────────
        for os_ in outline_sections:
            sec = OutlineSection(
                document_id=outline_doc.id,
                section_slug=os_["slug"],
                title=os_["title"],
                summary=os_["summary"],
                highlights_json=os_["highlights_json"],
                related_guide_section_slugs=os_["related_guide_section_slugs"],
                sort_order=os_["sort_order"],
            )
            session.add(sec)
            search_docs.append(SearchDocument(
                source_type=SearchSourceType.outline_section,
                source_key=f"outline:{os_['slug']}",
                document_slug="outline",
                section_slug=os_["slug"],
                title=os_["title"],
                body_text=os_["summary"],
            ))
        print(f"   {len(outline_sections)} outline sections inserted.")

        # ── 5) Checklist groups + items ──────────────────────────
        total_items = 0
        for cg in checklist_groups:
            group = ChecklistGroup(
                document_id=checklist_doc.id,
                group_code=cg["group_code"],
                title=cg["title"],
                description=cg["description"],
                sort_order=cg["sort_order"],
                related_guide_section_slugs=cg["related_guide_section_slugs"],
            )
            session.add(group)
            await session.flush()  # Get group.id

            for item_data in cg["items"]:
                item = ChecklistItem(
                    group_id=group.id,
                    item_code=item_data["item_code"],
                    label=item_data["label"],
                    related_section_slug=item_data.get("related_section_slug"),
                    sort_order=item_data["sort_order"],
                )
                session.add(item)
                search_docs.append(SearchDocument(
                    source_type=SearchSourceType.checklist_item,
                    source_key=f"checklist:{item_data['item_code']}",
                    document_slug="checklist",
                    group_code=cg["group_code"],
                    item_code=item_data["item_code"],
                    title=item_data["label"],
                    body_text=item_data["label"],
                ))
                total_items += 1
        print(f"   {len(checklist_groups)} checklist groups ({total_items} items) inserted.")

        # ── 6) Search documents ──────────────────────────────────
        session.add_all(search_docs)
        print(f"   {len(search_docs)} search index documents created.")

        await session.commit()

    print("=" * 60)
    print("✅ Seeding complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed())
