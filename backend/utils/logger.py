import logging
import sys
import json

from .config import settings


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # include extras like request_id if present
        for key in ("request_id",):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        return json.dumps(payload)


def setup_logger() -> logging.Logger:
	logger = logging.getLogger(settings.app_name)
	level = getattr(logging, settings.log_level.upper(), logging.INFO)
	logger.setLevel(level)

	if not logger.handlers:
		handler = logging.StreamHandler(sys.stdout)
		formatter = JsonFormatter()
		handler.setFormatter(formatter)
		logger.addHandler(handler)

	logger.propagate = False
	return logger


logger = setup_logger()
