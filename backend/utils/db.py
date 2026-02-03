from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event
import os

from .config import settings
from utils.logger import logger
from models.base import Base


def _make_async_url(sync_url: str) -> str:
	# Convert sqlite:///./foo.db to sqlite+aiosqlite:///./foo.db
	if sync_url.startswith("sqlite:///"):
		return sync_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
	return sync_url


# Ensure SQLite directory exists if using a local file path
if settings.database_url.startswith("sqlite:///"):
    db_path = settings.database_url.replace("sqlite:///", "", 1)
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

ASYNC_DATABASE_URL = _make_async_url(settings.database_url)
if ASYNC_DATABASE_URL.startswith("sqlite+aiosqlite:///"):
    # SQLite uses a special pool; don't pass pool sizing args
    engine = create_async_engine(
        ASYNC_DATABASE_URL,
        echo=False,
        future=True,
    )
else:
    engine = create_async_engine(
        ASYNC_DATABASE_URL,
        echo=False,
        future=True,
        pool_size=5,
        max_overflow=10,
    )
SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
	bind=engine,
	expire_on_commit=False,
	autoflush=False,
	autocommit=False,
)


async def init_db() -> None:
	async with engine.begin() as conn:
		await conn.run_sync(Base.metadata.create_all)
	logger.info("Database initialized")


async def dispose_engine() -> None:
    await engine.dispose()
    logger.info("Database engine disposed")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
	async with SessionLocal() as session:
		yield session
