from typing import Dict, Any
import hashlib
import math

from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress
from utils.threat_intel import vt_lookup_hash

try:
	import yara  # type: ignore
except Exception:  # pragma: no cover
	yara = None

try:
	import pefile  # type: ignore
except Exception:  # pragma: no cover
	pefile = None


def _shannon_entropy(data: bytes) -> float:
	if not data:
		return 0.0
	occurrences = [0] * 256
	for b in data:
		occurrences[b] += 1
	entropy = 0.0
	length = len(data)
	for count in occurrences:
		if count == 0:
			continue
		p_x = count / length
		entropy -= p_x * math.log2(p_x)
	return entropy


class FileThreatDetector(ConversableAgent):
	name = "FileThreatDetector"
	description = "Scans files for malware signatures"

	async def scan_bytes(self, content: bytes, filename: str | None = None) -> Dict[str, Any]:
		await ws_manager.broadcast(ws_progress(self.name, "start", 0, {"filename": filename}))
		sha256 = hashlib.sha256(content).hexdigest()
		await ws_manager.broadcast(ws_progress(self.name, "hash", 10, {"sha256": sha256}))

		# Chunk progress simulation
		chunks = max(1, len(content) // (256 * 1024))
		for i in range(min(chunks, 5)):
			await self._simulate_latency(100, 200)
			await ws_manager.broadcast(ws_progress(self.name, "chunk", 10 + int((i + 1) / max(chunks, 5) * 30), {"i": i}))

		# YARA
		yara_hits = []
		if yara is not None:
			try:
				# Minimal demo: compile empty rules if none provided
				yrules = None
				try:
					yrules = yara.compile(filepath=None, sources={"demo": "rule always_false { condition: false }"})
				except Exception:
					pass
				if yrules:
					for m in yrules.match(data=content):
						yara_hits.append(str(m))
			except Exception:
				pass
		await ws_manager.broadcast(ws_progress(self.name, "yara", 50, {"hits": len(yara_hits)}))

		# Entropy
		entropy = _shannon_entropy(content[:2 * 1024 * 1024])
		await ws_manager.broadcast(ws_progress(self.name, "entropy", 65, {"entropy": entropy}))

		# PE header (Windows executables)
		pe_info: Dict[str, Any] | None = None
		if pefile is not None and filename and filename.lower().endswith((".exe", ".dll")):
			try:
				pe = pefile.PE(data=content)
				pe_info = {
					"machine": hex(pe.FILE_HEADER.Machine),
					"num_sections": pe.FILE_HEADER.NumberOfSections,
				}
			except Exception:
				pe_info = {"error": "invalid_pe"}
		await ws_manager.broadcast(ws_progress(self.name, "pe", 80, {"has_pe": pe_info is not None}))

		# VirusTotal hash lookup (optional)
		vt = await vt_lookup_hash(sha256)
		await ws_manager.broadcast(ws_progress(self.name, "virustotal", 90, {"available": vt.get("available", False)}))

		is_malicious = (entropy > 7.0) or bool(yara_hits)
		threat = "high" if is_malicious else "low"
		result = {
			"filename": filename,
			"sha256": sha256,
			"yara_hits": yara_hits,
			"entropy": entropy,
			"pe": pe_info,
			"virustotal": {"available": vt.get("available", False)},
			"detected": is_malicious,
			"threat_level": threat,
		}
		await ws_manager.broadcast({"type": "file_scan", "data": result})
		await ws_manager.broadcast(ws_progress(self.name, "done", 100, {"threat_level": threat}))
		return result

	async def run(self, **kwargs: Any) -> Dict[str, Any]:
		return await self.scan_bytes(kwargs.get("content", b""), kwargs.get("filename"))
