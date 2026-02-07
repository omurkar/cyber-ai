import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models.base import Base, ScanResult
from utils.config import settings
from datetime import datetime, timedelta

# Data from your screenshot (reconstructed)
# IDs 1-36, strictly matching the image pattern
data_rows = [
    (1, "URLThreatAnalyzer", "url", "low", "12:15:57"),
    (2, "DeviceSecurityScanner", "device", "medium", "12:16:13"),
    (3, "NetworkTrafficMonitor", "network", "low", "12:16:20"),
    (4, "FileThreatDetector", "file", "high", "12:16:38"),
    (5, "FileThreatDetector", "file", "high", "12:16:51"),
    (6, "FileThreatDetector", "file", "high", "12:17:20"),
    (7, "FileThreatDetector", "file", "high", "12:17:41"),
    (8, "FileThreatDetector", "file", "high", "12:17:50"),
    (9, "FileThreatDetector", "file", "low", "12:25:40"),
    (10, "FileThreatDetector", "file", "high", "12:25:57"),
    (11, "URLThreatAnalyzer", "url", "low", "13:29:45"),
    (12, "DeviceSecurityScanner", "device", "medium", "13:29:54"),
    (13, "NetworkTrafficMonitor", "network", "low", "13:30:00"),
    (14, "FileThreatDetector", "file", "low", "13:30:13"),
    (15, "URLThreatAnalyzer", "url", "low", "14:19:11"),
    (16, "URLThreatAnalyzer", "url", "low", "14:19:39"),
    (17, "URLThreatAnalyzer", "url", "low", "14:41:13"),
    (18, "URLThreatAnalyzer", "url", "low", "14:41:13"),
    (19, "URLThreatAnalyzer", "url", "low", "14:41:13"),
    (20, "URLThreatAnalyzer", "url", "low", "14:42:11"),
    (21, "DeviceSecurityScanner", "device", "medium", "14:42:23"),
    (22, "NetworkTrafficMonitor", "network", "low", "14:42:31"),
    (23, "FileThreatDetector", "file", "high", "14:42:47"),
    (24, "URLThreatAnalyzer", "url", "low", "15:04:15"),
    (25, "URLThreatAnalyzer", "url", "low", "15:08:05"),
    (26, "URLThreatAnalyzer", "url", "low", "15:23:11"),
    (27, "URLThreatAnalyzer", "url", "low", "15:23:41"),
    (28, "URLThreatAnalyzer", "url", "low", "15:26:59"),
    (29, "URLThreatAnalyzer", "url", "low", "15:28:50"),
    (30, "URLThreatAnalyzer", "url", "low", "15:29:06"),
    (31, "URLThreatAnalyzer", "url", "low", "16:04:56"),
    (32, "FileThreatDetector", "file", "low", "16:41:17"),
    (33, "URLThreatAnalyzer", "url", "low", "16:53:34"),
    (34, "FileThreatDetector", "file", "low", "17:19:16"),
    (35, "FileThreatDetector", "file", "low", "17:20:37"),
    (36, "FileThreatDetector", "file", "low", "17:22:27"),
]

async def seed():
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        async with session.begin():
            # Create base date as 2026-02-07
            base_date = datetime(2026, 2, 7)
            
            for row in data_rows:
                # Parse time string to get hour/min/sec
                t = datetime.strptime(row[4], "%H:%M:%S").time()
                full_dt = datetime.combine(base_date, t)
                
                scan = ScanResult(
                    agent=row[1],
                    category=row[2],
                    threat_level=row[3],
                    created_at=full_dt,
                    details={"manual_seed": True}
                )
                session.add(scan)
            
            await session.commit()
    print("Database populated successfully!")

if __name__ == "__main__":
    asyncio.run(seed())