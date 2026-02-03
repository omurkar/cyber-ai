import os
from dataclasses import dataclass
from typing import List, Tuple

from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()


def _get_list(var_name: str, default: str = "") -> Tuple[str, ...]:
	value = os.getenv(var_name, default)
	return tuple(v.strip() for v in value.split(",") if v.strip())


@dataclass(frozen=True)
class Settings:
	app_name: str = os.getenv("APP_NAME", "AI Threat Detector")
	env: str = os.getenv("ENV", "development")
	log_level: str = os.getenv("LOG_LEVEL", "INFO")

	backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
	backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))

	# Include common localhost variants by default for dev
	cors_origins: Tuple[str, ...] = _get_list("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

	database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/threat_detector.db")

	websocket_path: str = os.getenv("WEBSOCKET_PATH", "/ws/threats")

	# Keys (use human-readable env var names) - DO NOT hardcode secrets
	virus_total_api_key: str = os.getenv("VIRUSTOTAL_API_KEY", "")
	abuseipdb_api_key: str = os.getenv("ABUSEIPDB_API_KEY", "")
	nvd_api_key: str = os.getenv("NVD_API_KEY", "")

	# Feeds
	phishtank_url: str = os.getenv("PHISHTANK_URL", "")
	openphish_url: str = os.getenv("OPENPHISH_URL", "")

	model_name: str = os.getenv("MODEL_NAME", "gpt-simulated")
	model_temperature: float = float(os.getenv("MODEL_TEMPERATURE", "0.0"))

	yara_rules_path: str = os.getenv("YARA_RULES_PATH", "./data/yara")

	# Auto scan interval (minutes); 0 disables by default
	auto_scan_interval_minutes: int = int(os.getenv("AUTO_SCAN_INTERVAL_MINUTES", "0"))


settings = Settings()
