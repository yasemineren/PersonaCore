from fastapi import APIRouter
from app.api.v1 import channels, dashboard

router = APIRouter()
router.include_router(channels.router, prefix="/v1", tags=["channels"])
router.include_router(dashboard.router, prefix="/v1", tags=["dashboard"])
