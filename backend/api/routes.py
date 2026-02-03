from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel, HttpUrl
from typing import Any, Dict, List
from sqlalchemy import select
from fastapi.responses import StreamingResponse
import csv
import io
from sqlalchemy.ext.asyncio import AsyncSession

from utils.logger import logger
from utils.config import settings
from agents.url_analyzer import URLThreatAnalyzer
from agents.device_scanner import DeviceSecurityScanner
from agents.network_monitor import NetworkTrafficMonitor
from agents.file_detector import FileThreatDetector
from agents.vuln_assessment import VulnerabilityAssessmentAgent
from models.base import ScanResult
from utils.db import get_db
from utils.cache import cache
from api.websocket import ws_manager

api_router = APIRouter()


class URLScanRequest(BaseModel):
	url: HttpUrl


class ScanResponse(BaseModel):
	agent: str
	result: Dict[str, Any]


async def _save_result(db: AsyncSession, agent: str, category: str, threat_level: str, metadata: dict) -> None:
	obj = ScanResult(agent=agent, category=category, threat_level=threat_level, details=metadata)
	db.add(obj)
	await db.commit()


@api_router.post("/scan/url", response_model=ScanResponse)
async def scan_url(payload: URLScanRequest, db: AsyncSession = Depends(get_db)) -> ScanResponse:
	logger.info(f"Scanning URL: {payload.url}")
	cached = cache.get(f"url:{payload.url}")
	if cached:
		return {"agent": "URLThreatAnalyzer", "result": cached}
	agent = URLThreatAnalyzer()
	result = await agent.analyze_url(str(payload.url))
	await _save_result(db, agent.name, "url", result.get("threat_level", "low"), result)
	cache.set(f"url:{payload.url}", result, ttl=60)
	await ws_manager.broadcast({"type": "url_scan", "data": result})
	return {"agent": agent.name, "result": result}


@api_router.post("/scan/device", response_model=ScanResponse)
async def scan_device(db: AsyncSession = Depends(get_db)) -> ScanResponse:
	agent = DeviceSecurityScanner()
	result = await agent.assess_device()
	await _save_result(db, agent.name, "device", result.get("threat_level", "low"), result)
	await ws_manager.broadcast({"type": "device_scan", "data": result})
	return {"agent": agent.name, "result": result}


@api_router.post("/scan/network", response_model=ScanResponse)
async def scan_network(db: AsyncSession = Depends(get_db)) -> ScanResponse:
	agent = NetworkTrafficMonitor()
	result = await agent.inspect_network()
	await _save_result(db, agent.name, "network", result.get("threat_level", "low"), result)
	await ws_manager.broadcast({"type": "network_scan", "data": result})
	return {"agent": agent.name, "result": result}


class FileScanResponse(ScanResponse):
	pass


@api_router.post("/scan/file", response_model=FileScanResponse)
async def scan_file(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)) -> FileScanResponse:
	content = await file.read()
	agent = FileThreatDetector()
	result = await agent.scan_bytes(content, filename=file.filename)
	await _save_result(db, agent.name, "file", result.get("threat_level", "low"), result)
	await ws_manager.broadcast({"type": "file_scan", "data": result})
	return {"agent": agent.name, "result": result}


class VulnerabilityScanRequest(BaseModel):
	product: str | None = None


@api_router.post("/scan/vulnerability", response_model=ScanResponse)
async def scan_vulnerability(payload: VulnerabilityScanRequest, db: AsyncSession = Depends(get_db)) -> ScanResponse:
	logger.info(f"Scanning vulnerabilities for product: {payload.product}")
	agent = VulnerabilityAssessmentAgent()
	result = await agent.check_vulnerabilities(payload.product)
	await _save_result(db, agent.name, "vulnerability", result.get("threat_level", "low"), result)
	await ws_manager.broadcast({"type": "vuln_scan", "data": result})
	return {"agent": agent.name, "result": result}


class AgentStatusItem(BaseModel):
	name: str
	status: str


class AgentsStatusResponse(BaseModel):
	agents: list[AgentStatusItem]


@api_router.get("/agents/status", response_model=AgentsStatusResponse)
async def agents_status() -> AgentsStatusResponse:
	return {
		"agents": [
			{"name": "URLThreatAnalyzer", "status": "ready"},
			{"name": "DeviceSecurityScanner", "status": "ready"},
			{"name": "NetworkTrafficMonitor", "status": "ready"},
			{"name": "FileThreatDetector", "status": "ready"},
			{"name": "VulnerabilityAssessmentAgent", "status": "ready"},
		]
	}


@api_router.post("/ws/test")
async def ws_test_broadcast(payload: Dict[str, Any]) -> Dict[str, Any]:
	# Test endpoint to send arbitrary WS messages for debugging
	await ws_manager.broadcast({"type": "test", "data": payload})
	return {"sent": True}


class AutoScanConfig(BaseModel):
	interval_minutes: int


@api_router.get("/autoscan", response_model=AutoScanConfig)
async def get_autoscan() -> AutoScanConfig:
	return AutoScanConfig(interval_minutes=settings.auto_scan_interval_minutes)


@api_router.post("/autoscan", response_model=AutoScanConfig)
async def set_autoscan(cfg: AutoScanConfig) -> AutoScanConfig:
	# For demo purposes, update in-memory settings only
	object.__setattr__(settings, 'auto_scan_interval_minutes', max(0, int(cfg.interval_minutes)))
	return AutoScanConfig(interval_minutes=settings.auto_scan_interval_minutes)


# ---------------- Retrieval Models & Endpoints ----------------

class ScanResultItem(BaseModel):
	id: int
	agent: str
	category: str
	threat_level: str
	created_at: str
	details: Dict[str, Any] | None = None

	class Config:
		from_attributes = True


class PaginatedResults(BaseModel):
	items: List[ScanResultItem]
	page: int
	page_size: int
	has_next: bool


@api_router.get("/scan/results", response_model=PaginatedResults)
async def list_scan_results(page: int = 1, page_size: int = 20, db: AsyncSession = Depends(get_db)) -> PaginatedResults:
	page = max(1, page)
	page_size = max(1, min(100, page_size))
	offset = (page - 1) * page_size
	q = select(ScanResult).order_by(ScanResult.created_at.desc()).offset(offset).limit(page_size)
	res = (await db.execute(q)).scalars().all()
	items = [
		ScanResultItem(
			id=r.id,
			agent=r.agent,
			category=r.category,
			threat_level=r.threat_level,
			created_at=r.created_at.isoformat(),
			details=getattr(r, "details", None),
		)
		for r in res
	]
	# infer has_next by fetching one more row
	next_q = select(ScanResult.id).order_by(ScanResult.created_at.desc()).offset(offset + page_size).limit(1)
	has_next = (await db.execute(next_q)).first() is not None
	return PaginatedResults(items=items, page=page, page_size=page_size, has_next=has_next)


@api_router.get("/scan/results/{scan_id}", response_model=ScanResultItem)
async def get_scan_result(scan_id: int, db: AsyncSession = Depends(get_db)) -> ScanResultItem:
	q = select(ScanResult).where(ScanResult.id == scan_id)
	obj = (await db.execute(q)).scalars().first()
	if not obj:
		return ScanResultItem(id=0, agent="", category="", threat_level="", created_at="", details=None)  # FastAPI will still return 200; adjust to 404 if desired
	return ScanResultItem(
		id=obj.id,
		agent=obj.agent,
		category=obj.category,
		threat_level=obj.threat_level,
		created_at=obj.created_at.isoformat(),
		details=getattr(obj, "details", None),
	)


@api_router.get("/scan/history/{agent_type}", response_model=PaginatedResults)
async def scan_history(agent_type: str, page: int = 1, page_size: int = 20, db: AsyncSession = Depends(get_db)) -> PaginatedResults:
	page = max(1, page)
	page_size = max(1, min(100, page_size))
	offset = (page - 1) * page_size
	q = (
		select(ScanResult)
		.where(ScanResult.agent == agent_type)
		.order_by(ScanResult.created_at.desc())
		.offset(offset)
		.limit(page_size)
	)
	res = (await db.execute(q)).scalars().all()
	items = [
		ScanResultItem(
			id=r.id,
			agent=r.agent,
			category=r.category,
			threat_level=r.threat_level,
			created_at=r.created_at.isoformat(),
			details=getattr(r, "details", None),
		)
		for r in res
	]
	next_q = (
		select(ScanResult.id)
		.where(ScanResult.agent == agent_type)
		.order_by(ScanResult.created_at.desc())
		.offset(offset + page_size)
		.limit(1)
	)
	has_next = (await db.execute(next_q)).first() is not None
	return PaginatedResults(items=items, page=page, page_size=page_size, has_next=has_next)


@api_router.get("/scan/results.csv")
async def export_scan_results_csv(db: AsyncSession = Depends(get_db)):
	q = select(ScanResult).order_by(ScanResult.created_at.desc()).limit(1000)
	rows = (await db.execute(q)).scalars().all()
	buf = io.StringIO()
	w = csv.writer(buf)
	w.writerow(["id", "agent", "category", "threat_level", "created_at"])  # keep it simple
	for r in rows:
		w.writerow([r.id, r.agent, r.category, r.threat_level, r.created_at.isoformat()])
	buf.seek(0)
	return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={
		"Content-Disposition": "attachment; filename=scan_results.csv"
	})
