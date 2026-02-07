from __future__ import annotations
from typing import Any, Dict
import httpx
import socket
import ssl
from utils.config import settings
from utils.logger import logger

DEFAULT_TIMEOUT = 5.0

# --- VirusTotal ---
async def vt_lookup_url(url: str) -> Dict[str, Any]:
    if not settings.virus_total_api_key:
        return {"available": False, "reason": "missing_key"}
    headers = {"x-apikey": settings.virus_total_api_key}
    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(
                "https://www.virustotal.com/api/v3/urls",
                headers=headers,
                data={"url": url}
            )
            if resp.status_code == 200:
                analysis_id = resp.json()['data']['id']
                report_resp = await client.get(
                    f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
                    headers=headers
                )
                if report_resp.status_code == 200:
                    return {"available": True, "data": report_resp.json().get('data', {})}
            return {"available": False, "status": resp.status_code}
    except Exception as exc:
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
        return {"available": False, "error": str(exc)}

# --- Real Blocking Functions (Called via Thread) ---

def dns_reputation(domain: str) -> Dict[str, Any]:
    """Blocking DNS lookup"""
    try:
        # getaddrinfo is blocking
        ips = socket.getaddrinfo(domain, None)
        unique_ips = sorted({x[4][0] for x in ips})
        return {"ips": unique_ips, "count": len(unique_ips), "status": "Resolved"}
    except Exception as exc:
        return {"error": str(exc)}

def ssl_certificate_info(host: str, port: int = 443) -> Dict[str, Any]:
    """Blocking SSL check"""
    try:
        ctx = ssl.create_default_context()
        # set timeout to avoid hanging threads too long
        with socket.create_connection((host, port), timeout=3.0) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
                return {
                    "subject": dict(x[0] for x in cert.get('subject', [])),
                    "issuer": dict(x[0] for x in cert.get('issuer', [])),
                    "valid": True
                }
    except Exception as exc:
        return {"error": str(exc), "valid": False}

# --- Vulnerability ---
async def osv_search(keyword: str) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(
                "https://api.osv.dev/v1/querybatch", 
                json={"queries": [{"package": {"name": keyword}}]}
            )
            if resp.status_code == 200:
                return {"available": True, "data": resp.json()}
            return {"available": False, "status": resp.status_code}
    except Exception as exc:
        return {"available": False, "error": str(exc)}