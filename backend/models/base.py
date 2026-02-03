from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, JSON, Index, func


class Base(DeclarativeBase):
	pass


class ScanResult(Base):
	__tablename__ = "scan_results"
	__table_args__ = (
		Index("ix_scan_results_category", "category"),
		Index("ix_scan_results_threat_level", "threat_level"),
		Index("ix_scan_results_created_at", "created_at"),
	)

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	agent: Mapped[str] = mapped_column(String(64), nullable=False)
	category: Mapped[str] = mapped_column(String(64), nullable=False)
	threat_level: Mapped[str] = mapped_column(String(16), nullable=False)
	# 'metadata' is reserved in SQLAlchemy Declarative; use 'details' instead
	details: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class ThreatEvent(Base):
	__tablename__ = "threat_events"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	title: Mapped[str] = mapped_column(String(128), nullable=False)
	description: Mapped[Optional[str]] = mapped_column(String(512))
	severity: Mapped[str] = mapped_column(String(16), nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
