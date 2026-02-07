from abc import ABC, abstractmethod
from typing import Any, Dict
import asyncio

from utils.logger import logger


class ConversableAgent(ABC):
	name: str = "ConversableAgent"
	description: str = "Base agent"

	def __init__(self) -> None:
		self.is_busy: bool = False

	async def _simulate_latency(self, min_ms: int = 150, max_ms: int = 400) -> None:
		await asyncio.sleep((min_ms + max_ms) / 2000.0)

	@abstractmethod
	async def run(self, **kwargs: Any) -> Dict[str, Any]:
		...

	def safe_note(self, message: str) -> None:
		logger.info(f"[{self.name}] {message}")
