from typing import Dict, Any
from urllib.parse import urlparse

from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress
from utils.threat_intel import vt_lookup_url, dns_reputation, ssl_certificate_info


class URLThreatAnalyzer(ConversableAgent):
	name = "URLThreatAnalyzer"
	description = "Scans URLs for malicious content and reputation"

	async def analyze_url(self, url: str) -> Dict[str, Any]:
		await self._simulate_latency()
		await ws_manager.broadcast(ws_progress(self.name, "start", 0, {"url": url}))

		parsed = urlparse(url)
		domain = parsed.hostname or ""

		# Heuristic patterns
		patterns = ["login-verify", "free-gift", "reset-password", ".ru/", "@"]
		pattern_hits = [p for p in patterns if p in url.lower()]
		await ws_manager.broadcast(ws_progress(self.name, "heuristics", 15, {"hits": len(pattern_hits)}))

		# DNS reputation
		dns_info = dns_reputation(domain) if domain else {"error": "no_domain"}
		await ws_manager.broadcast(ws_progress(self.name, "dns", 35, dns_info))

		# SSL certificate (if https)
		ssl_info = ssl_certificate_info(domain) if parsed.scheme == 'https' and domain else {"skipped": True}
		await ws_manager.broadcast(ws_progress(self.name, "ssl", 55, ssl_info))

		# VirusTotal (optional)
		vt = await vt_lookup_url(url)
		await ws_manager.broadcast(ws_progress(self.name, "virustotal", 80, {"available": vt.get("available", False)}))

		# Score
		score = 0
		score += 5 * len(pattern_hits)
		if isinstance(dns_info, dict) and dns_info.get("count", 0) > 5:
			score += 3
		if isinstance(ssl_info, dict) and "error" in ssl_info:
			score += 2
		if vt.get("available"):
			# Naively weight by malicious verdicts if present
			vtdata = vt.get("data") or {}
			mal = str(vtdata).lower().count("malicious")
			score += min(10, mal)

		threat = "high" if score >= 12 else ("medium" if score >= 6 else "low")
		result = {
			"url": url,
			"domain": domain,
			"pattern_hits": pattern_hits,
			"dns": dns_info,
			"ssl": ssl_info,
			"virustotal": {"available": vt.get("available", False)},
			"score": score,
			"threat_level": threat,
		}

		await ws_manager.broadcast({"type": "url_scan", "data": result})
		await ws_manager.broadcast(ws_progress(self.name, "done", 100, {"threat_level": threat}))
		return result

	async def run(self, **kwargs: Any) -> Dict[str, Any]:
		url = kwargs.get("url", "")
		return await self.analyze_url(url)
