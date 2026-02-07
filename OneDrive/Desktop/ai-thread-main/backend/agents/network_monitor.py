from typing import Dict, Any, List
from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress
from utils.threat_intel import abuseipdb_check

try:
	import psutil  # type: ignore
except Exception:  # pragma: no cover
	psutil = None


class NetworkTrafficMonitor(ConversableAgent):
	name = "NetworkTrafficMonitor"
	description = "Examines network connections"

	async def inspect_network(self) -> Dict[str, Any]:
		await ws_manager.broadcast(ws_progress(self.name, "start", 0, {}))
		suspicious: List[Dict[str, Any]] = []
		checked = 0
		if psutil is not None:
			try:
				conns = psutil.net_connections(kind='inet')
				await ws_manager.broadcast(ws_progress(self.name, "collect", 25, {"connections": len(conns)}))
				for c in conns[:20]:
					if not c.raddr:
						continue
					ip = c.raddr.ip
					checked += 1
					if checked % 5 == 0:
						await ws_manager.broadcast(ws_progress(self.name, "reputation", min(80, 25 + checked), {"checked": checked}))
					ai = await abuseipdb_check(ip)
					if ai.get("available"):
						rep = ai.get("data", {}).get("data", {}).get("abuseConfidenceScore", 0)
						if rep and rep >= 50:
							suspicious.append({"remote": f"{ip}:{getattr(c.raddr, 'port', '?')}", "confidence": rep})
			except Exception:
				pass

		result = {
			"connections_checked": checked,
			"suspicious": suspicious,
			"threat_level": "medium" if suspicious else "low",
		}
		await ws_manager.broadcast({"type": "network_scan", "data": result})
		await ws_manager.broadcast(ws_progress(self.name, "done", 100, {"threat_level": result["threat_level"]}))
		return result

	async def run(self, **kwargs: Any) -> Dict[str, Any]:
		return await self.inspect_network()
