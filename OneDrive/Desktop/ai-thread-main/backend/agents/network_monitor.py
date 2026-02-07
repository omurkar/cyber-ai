import psutil
import traceback
from typing import Dict, Any, List
from .base import ConversableAgent
from api.websocket import ws_manager, ws_progress
from utils.logger import logger

class NetworkTrafficMonitor(ConversableAgent):
    name = "NetworkTrafficMonitor"
    description = "Monitors active network connections for anomalies."

    async def inspect_network(self) -> Dict[str, Any]:
        try:
            await ws_manager.broadcast(ws_progress(self.name, "start", 0, {}))

            connections = []
            suspicious_connections = []
            
            try:
                # 'inet' gets IPv4/IPv6. This often requires permissions.
                # If it fails, we catch it.
                net_conns = psutil.net_connections(kind='inet')
                
                for conn in net_conns:
                    if conn.status == 'ESTABLISHED' and conn.raddr:
                        remote_ip = conn.raddr.ip
                        remote_port = conn.raddr.port
                        
                        conn_info = {
                            "local_ip": conn.laddr.ip,
                            "local_port": conn.laddr.port,
                            "remote_ip": remote_ip,
                            "remote_port": remote_port,
                            "pid": conn.pid,
                            "protocol": "tcp" if conn.type == 1 else "udp"
                        }
                        
                        connections.append(conn_info)

                        # Simple heuristic: Remote ports > 10000 often indicate P2P or non-standard services
                        if remote_port > 10000 and remote_ip != "127.0.0.1":
                            suspicious_connections.append(conn_info)

            except psutil.AccessDenied:
                logger.warning("Network scan: Access Denied (Run as Admin for full results)")
                # Continue with empty lists so we don't crash
            except Exception as e:
                logger.error(f"Network scan loop error: {e}")

            await ws_manager.broadcast(ws_progress(self.name, "scan", 80, {"total": len(connections)}))

            threat_level = "low"
            if len(suspicious_connections) > 5:
                threat_level = "medium"
            if len(suspicious_connections) > 20:
                threat_level = "high"

            result = {
                "threat_level": threat_level,
                "active_connections_count": len(connections),
                "suspicious_connections": suspicious_connections[:50],
                "details": "Scanned active TCP/UDP connections"
            }

            await ws_manager.broadcast({"type": "network_scan", "data": result})
            await ws_manager.broadcast(ws_progress(self.name, "done", 100, {"threat_level": threat_level}))
            return result
            
        except Exception as e:
            logger.error(f"Network Monitor Crashed: {traceback.format_exc()}")
            return {
                "threat_level": "unknown", 
                "error": str(e),
                "active_connections_count": 0,
                "suspicious_connections": []
            }