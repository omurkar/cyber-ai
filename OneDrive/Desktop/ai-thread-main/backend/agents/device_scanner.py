import psutil
import socket
import asyncio
import traceback
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor
from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress
from utils.logger import logger

# Safe thread pool
executor = ThreadPoolExecutor(max_workers=2)

def safe_port_scan():
    """Run in background thread"""
    open_ports = []
    # Reduced port list to speed up scan and reduce crash risk
    ports_to_check = [21, 22, 80, 443, 3389]
    for port in ports_to_check:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.1)
            if s.connect_ex(('127.0.0.1', port)) == 0:
                open_ports.append(port)
            s.close()
        except:
            pass
    return open_ports

class DeviceSecurityScanner(ConversableAgent):
    name = "DeviceSecurityScanner"
    description = "Scans local system for suspicious processes and open ports."

    async def assess_device(self) -> Dict[str, Any]:
        # 1. Start WebSocket Update (Ignore errors here)
        try:
            await ws_manager.broadcast(ws_progress(self.name, "start", 0, {}))
        except:
            pass

        loop = asyncio.get_running_loop()
        suspicious = []
        
        # 2. Process Scan
        try:
            # Simple check for just a few known bad process names
            target_names = ["xmrig", "keylogger", "nc.exe"]
            for proc in psutil.process_iter(['name']):
                try:
                    if proc.info['name'] and any(t in proc.info['name'].lower() for t in target_names):
                        suspicious.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
        except Exception as e:
            logger.error(f"Psutil error: {e}")
            # Do not crash, just continue
        
        # 3. Port Scan (Threaded)
        open_ports = []
        try:
            open_ports = await loop.run_in_executor(executor, safe_port_scan)
        except Exception as e:
            logger.error(f"Socket error: {e}")

        # 4. Construct Result
        score = len(suspicious) * 20
        if 3389 in open_ports: score += 10
        
        result = {
            "threat_level": "high" if score > 20 else "low",
            "score": score,
            "suspicious_processes": suspicious,
            "open_ports": open_ports,
            "system": {"os": "Windows/Linux", "status": "Online"}
        }

        # 5. Finish
        try:
            await ws_manager.broadcast({"type": "device_scan", "data": result})
            await ws_manager.broadcast(ws_progress(self.name, "done", 100, {}))
        except:
            pass
            
        return result