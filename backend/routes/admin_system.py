from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import FileResponse
from typing import List, Dict
from datetime import datetime
from pathlib import Path
import shutil
import os

from auth import get_current_user, get_database

router = APIRouter(prefix="/api/admin/system", tags=["Admin System"])

BACKUPS_DIR = Path("uploads/backups")
BACKUPS_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/logs/login")
async def get_login_logs(limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Return recent login attempts from admin_logs."""
    db = get_database()
    cursor = db.admin_logs.find({"action": "login_attempt"}).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    # Normalize ObjectId etc.
    for l in logs:
        l["id"] = str(l.get("_id"))
        l.pop("_id", None)
    return {"logs": logs}


@router.get("/backups")
async def list_backups(current_user: dict = Depends(get_current_user)):
    items = []
    for p in BACKUPS_DIR.glob("*.zip"):
        stat = p.stat()
        items.append({
            "filename": p.name,
            "path": f"/uploads/backups/{p.name}",
            "size": stat.st_size,
            "size_mb": round(stat.st_size/(1024*1024), 2),
            "created_at": datetime.fromtimestamp(stat.st_ctime)
        })
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return {"backups": items}


@router.post("/backups/create")
async def create_backup(current_user: dict = Depends(get_current_user)):
    """Create a zip backup of the frontend directory."""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    base_name = BACKUPS_DIR / f"frontend_{timestamp}"
    src_dir = Path("frontend")
    if not src_dir.exists():
        raise HTTPException(status_code=404, detail="Frontend directory not found")
    try:
        archive_path = shutil.make_archive(str(base_name), "zip", root_dir=str(src_dir))
        fname = Path(archive_path).name
        return {"message": "Backup created", "filename": fname}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating backup: {str(e)}")


@router.post("/backups/restore")
async def restore_backup(filename: str, current_user: dict = Depends(get_current_user)):
    """Restore the frontend directory from a backup zip."""
    zip_path = BACKUPS_DIR / filename
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Backup not found")
    dest = Path("frontend")
    try:
        # optional: create safety copy
        safety_dir = BACKUPS_DIR / f"safety_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        if dest.exists():
            shutil.copytree(dest, safety_dir / "frontend")
        # remove current and unpack
        if dest.exists():
            shutil.rmtree(dest)
        shutil.unpack_archive(str(zip_path), extract_dir=str(dest.parent))
        return {"message": "Restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error restoring backup: {str(e)}")


@router.delete("/backups/{filename}")
async def delete_backup(filename: str, current_user: dict = Depends(get_current_user)):
    p = BACKUPS_DIR / filename
    if not p.exists():
        raise HTTPException(status_code=404, detail="Backup not found")
    try:
        p.unlink()
        return {"message": "Backup deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting backup: {str(e)}")


