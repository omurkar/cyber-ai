from __future__ import annotations
from typing import Any, Dict, Optional
import httpx
import socket
import ssl
from utils.config import settings
from utils.logger import logger

DEFAULT_TIMEOUT = 8.0


async def vt_lookup_url(url: str) -> Dict[str, Any]:
	if not settings.virus_total_api_key:
		return {"available": False, "reason": "missing_key"}
	headers = {"x-apikey": settings.virus_total_api_key}
	try:
		async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
			# VT v3: https://developers.virustotal.com/reference/urls
			resp = await client.get(f"https://www.virustotal.com/api/v3/urls/{url}", headers=headers)
			if resp.status_code == 200:
				data = resp.json()
				return {"available": True, "data": data}
			return {"available": False, "status": resp.status_code}
	except Exception as exc:
		logger.warning(f"VT URL lookup failed: {exc}")
		return {"available": False, "error": str(exc)}


async def vt_lookup_hash(sha256: str) -> Dict[str, Any]:
	if not settings.virus_total_api_key:
		return {"available": False, "reason": "missing_key"}
	headers = {"x-apikey": settings.virus_total_api_key}
	try:
		async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
			resp = await client.get(f"https://www.virustotal.com/api/v3/files/{sha256}", headers=headers)
			if resp.status_code == 200:
				return {"available": True, "data": resp.json()}
			return {"available": False, "status": resp.status_code}
	except Exception as exc:
		logger.warning(f"VT hash lookup failed: {exc}")
		return {"available": False, "error": str(exc)}


async def abuseipdb_check(ip: str) -> Dict[str, Any]:
	if not settings.abuseipdb_api_key:
		return {"available": False, "reason": "missing_key"}
	try:
		async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
			resp = await client.get(
				"https://api.abuseipdb.com/api/v2/check",
				params={"ipAddress": ip, "maxAgeInDays": 90},
				headers={"Key": settings.abuseipdb_api_key, "Accept": "application/json"},
			)
			if resp.status_code == 200:
				return {"available": True, "data": resp.json()}
			return {"available": False, "status": resp.status_code}
	except Exception as exc:
		logger.warning(f"AbuseIPDB check failed: {exc}")
		return {"available": False, "error": str(exc)}


async def osv_search(keyword: str) -> Dict[str, Any]:
	"""Query OSV search endpoint for a keyword. Safe fallback on errors."""
	try:
		async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
			resp = await client.get("https://api.osv.dev/v1/search", params={"query": keyword, "limit": 10})
			if resp.status_code == 200:
				return {"available": True, "data": resp.json()}
			return {"available": False, "status": resp.status_code}
	except Exception as exc:
		logger.warning(f"OSV search failed: {exc}")
		return {"available": False, "error": str(exc)}


def dns_reputation(domain: str) -> Dict[str, Any]:
	try:
		ips = socket.getaddrinfo(domain, None)
		unique_ips = sorted({x[4][0] for x in ips})
		return {"ips": unique_ips, "count": len(unique_ips)}
	except Exception as exc:
		return {"error": str(exc)}


def ssl_certificate_info(host: str, port: int = 443) -> Dict[str, Any]:
	try:
		ctx = ssl.create_default_context()
		with socket.create_connection((host, port), timeout=DEFAULT_TIMEOUT) as sock:
			with ctx.wrap_socket(sock, server_hostname=host) as ssock:
				cert = ssock.getpeercert()
				return {"subject": cert.get('subject'), "issuer": cert.get('issuer'), "notAfter": cert.get('notAfter')}
	except Exception as exc:
		return {"error": str(exc)}
