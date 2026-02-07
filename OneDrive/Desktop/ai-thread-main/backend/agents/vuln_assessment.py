from typing import Dict, Any, List
from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress
from utils.threat_intel import osv_search


class VulnerabilityAssessmentAgent(ConversableAgent):
	name = "VulnerabilityAssessmentAgent"
	description = "Checks for CVEs using OSV search"

	async def check_vulnerabilities(self, product: str | None = None) -> Dict[str, Any]:
		await ws_manager.broadcast(ws_progress(self.name, "start", 0, {"product": product}))
		keyword = product or "demo"
		resp = await osv_search(keyword)
		items: List[Dict[str, Any]] = []
		if resp.get("available"):
			results = resp.get("data", {}).get("vulns", []) or resp.get("data", {}).get("results", [])
			for v in results[:10]:
				items.append({
					"id": v.get("id"),
					"severity": (v.get("severity") or [{}])[0].get("type", "UNKNOWN") if v.get("severity") else "UNKNOWN",
					"summary": v.get("summary"),
				})
		await ws_manager.broadcast(ws_progress(self.name, "osv", 80, {"found": len(items)}))
		result = {"count": len(items), "items": items, "threat_level": "medium" if items else "low"}
		await ws_manager.broadcast({"type": "vuln_scan", "data": result})
		await ws_manager.broadcast(ws_progress(self.name, "done", 100, {"threat_level": result["threat_level"]}))
		return result

	async def run(self, **kwargs: Any) -> Dict[str, Any]:
		return await self.check_vulnerabilities(kwargs.get("product"))
