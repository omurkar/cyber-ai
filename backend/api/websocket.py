from typing import Set, Any, Dict
from fastapi import WebSocket
from utils.logger import logger


class ThreatWebSocketManager:
	def __init__(self) -> None:
		self.active_connections: Set[WebSocket] = set()
		self.max_connections: int = 100

	async def connect(self, websocket: WebSocket) -> None:
		if len(self.active_connections) >= self.max_connections:
			await websocket.close()
			return
		await websocket.accept()
		self.active_connections.add(websocket)
		logger.info("WS connected; total=%s", len(self.active_connections))

	def disconnect(self, websocket: WebSocket) -> None:
		self.active_connections.discard(websocket)
		logger.info("WS disconnected; total=%s", len(self.active_connections))

	async def broadcast(self, message: Dict[str, Any]) -> None:
		dead: Set[WebSocket] = set()
		for connection in list(self.active_connections):
			try:
				await connection.send_json(message)
			except Exception as exc:
				logger.warning(f"WebSocket send failed: {exc}")
				dead.add(connection)
		for d in dead:
			self.disconnect(d)

	async def heartbeat(self) -> None:
		dead: Set[WebSocket] = set()
		for connection in list(self.active_connections):
			try:
				await connection.send_json({"type": "heartbeat", "ts": __import__("time").time()})
			except Exception:
				dead.add(connection)
		for d in dead:
			self.disconnect(d)


ws_manager = ThreatWebSocketManager()


def ws_progress(agent: str, phase: str, percent: int, detail: Dict[str, Any] | None = None) -> Dict[str, Any]:
	return {
		"type": "progress",
		"agent": agent,
		"phase": phase,
		"percent": max(0, min(100, int(percent))),
		"detail": detail or {},
	}
