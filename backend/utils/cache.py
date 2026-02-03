from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict
import time


@dataclass
class CacheItem:
    value: Any
    expires_at: float


class TTLCache:
    def __init__(self, default_ttl_seconds: int = 60) -> None:
        self.store: Dict[str, CacheItem] = {}
        self.default_ttl = max(1, int(default_ttl_seconds))

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        ttl_seconds = self.default_ttl if ttl is None else max(1, int(ttl))
        self.store[key] = CacheItem(value=value, expires_at=time.time() + ttl_seconds)

    def get(self, key: str) -> Any | None:
        item = self.store.get(key)
        if not item:
            return None
        if item.expires_at < time.time():
            self.delete(key)
            return None
        return item.value

    def delete(self, key: str) -> None:
        self.store.pop(key, None)

    def clear(self) -> None:
        self.store.clear()


cache = TTLCache()

