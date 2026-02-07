from typing import Dict, Any
from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress

try:
	import psutil  # type: ignore
except Exception:  # pragma: no cover
	psutil = None


class DeviceSecurityScanner(ConversableAgent):
	name = "DeviceSecurityScanner"
	description = "Analyzes system processes and configurations"

	async def assess_device(self) -> Dict[str, Any]:
		await ws_manager.broadcast(ws_progress(self.name, "start", 0, {}))
		process_count = 0
		services = []
		open_ports = []

		if psutil is not None:
			# Processes snapshot
			try:
				procs = list(psutil.process_iter(attrs=["pid", "name"]))
				process_count = len(procs)
				await ws_manager.broadcast(ws_progress(self.name, "processes", 25, {"count": process_count}))
			except Exception:
				await ws_manager.broadcast(ws_progress(self.name, "processes", 25, {"error": True}))

			# Connections snapshot
			try:
				conns = psutil.net_connections(kind='inet')
				open_ports = sorted({c.laddr.port for c in conns if c.laddr})[:20]
				await ws_manager.broadcast(ws_progress(self.name, "network", 55, {"open_ports": len(open_ports)}))
			except Exception:
				await ws_manager.broadcast(ws_progress(self.name, "network", 55, {"error": True}))

			# Services (limited portable view)
			try:
				services = [p.info for p in procs[:10]] if 'procs' in locals() else []
				await ws_manager.broadcast(ws_progress(self.name, "services", 75, {"listed": len(services)}))
			except Exception:
				await ws_manager.broadcast(ws_progress(self.name, "services", 75, {"error": True}))

		result = {
			"process_count": process_count,
			"services_sample": services,
			"open_ports_sample": open_ports,
			"threat_level": "medium" if len(open_ports) > 0 else "low",
		}
		await ws_manager.broadcast({"type": "device_scan", "data": result})
		await ws_manager.broadcast(ws_progress(self.name, "done", 100, {"threat_level": result["threat_level"]}))
		return result

	async def run(self, **kwargs: Any) -> Dict[str, Any]:
		return await self.assess_device()
