from .content import router as content_router
from .system import router as system_router
from . import content, system

__all__ = ["content_router", "system_router", "content", "system"]
