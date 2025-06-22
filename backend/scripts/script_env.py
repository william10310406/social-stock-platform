#!/usr/bin/env python3
"""
後端腳本環境配置模組
提供統一的 Docker 環境檢測和配置管理
"""

import os
import sys
from pathlib import Path
from typing import Any, Dict, Tuple


class ScriptEnvironment:
    """腳本環境配置管理器"""

    def __init__(self):
        self.project_root = self._find_project_root()
        self.docker_config = self._detect_docker_environment()
        self.env_config = self._load_environment_config()

    def _find_project_root(self) -> Path:
        """尋找項目根目錄"""
        current_dir = Path.cwd()

        while current_dir != current_dir.parent:
            if (
                (current_dir / "requirements.txt").exists()
                or (current_dir / "docker-compose.yml").exists()
                or (current_dir / "manage.py").exists()
            ):
                return current_dir
            current_dir = current_dir.parent

        return Path.cwd()

    def _detect_docker_environment(self) -> Dict[str, Any]:
        """檢測 Docker 環境"""
        checks = {
            # 檔案存在檢查
            "docker_file": Path("/.dockerenv").exists(),
            # 環境變數檢查
            "node_env": os.environ.get("NODE_ENV") == "docker",
            "docker_env": os.environ.get("DOCKER_ENV") == "true",
            # 容器名稱檢查
            "frontend_container": "://frontend:" in os.environ.get("FRONTEND_URL", ""),
            "backend_container": "://backend:" in os.environ.get("BACKEND_URL", ""),
            # 主機名檢查
            "hostname": os.environ.get("HOSTNAME", "").startswith("stock-insight-"),
            # Docker Compose 服務檢查
            "docker_compose": (self.project_root / "docker-compose.yml").exists(),
        }

        is_docker = any(checks.values())
        confidence = sum(checks.values()) / len(checks)

        return {"is_docker": is_docker, "checks": checks, "confidence": confidence}

    def _load_environment_config(self) -> Dict[str, Any]:
        """載入環境配置"""
        is_docker = self.docker_config["is_docker"]

        # 基礎配置
        base_config = {
            # 前端配置
            "frontend": {
                "host": "frontend" if is_docker else "localhost",
                "port": int(os.environ.get("FRONTEND_PORT", "5173")),
                "protocol": "http",
            },
            # 後端配置
            "backend": {
                "host": "0.0.0.0" if is_docker else "localhost",
                "port": int(os.environ.get("BACKEND_PORT", "5000")),
                "protocol": "http",
            },
            # 資料庫配置
            "database": {
                "host": "db" if is_docker else "localhost",
                "port": int(os.environ.get("DB_PORT", "1433")),  # MSSQL 預設端口
                "name": os.environ.get("MSSQL_DATABASE", "StockInsight"),
                "user": os.environ.get("MSSQL_USER", "sa"),
                "password": os.environ.get("MSSQL_SA_PASSWORD", "YourStrong!Password123"),
                "driver": "ODBC+Driver+18+for+SQL+Server",
            },
            # Redis 配置
            "redis": {
                "host": "redis" if is_docker else "localhost",
                "port": int(os.environ.get("REDIS_PORT", "6379")),
            },
            # 通用配置
            "timeout": int(os.environ.get("REQUEST_TIMEOUT", "10")),
            "retries": int(os.environ.get("MAX_RETRIES", "3")),
            "debug": os.environ.get("DEBUG", "False").lower() == "true",
        }

        # URL 構建
        urls = {
            "frontend": os.environ.get("FRONTEND_URL")
            or f"{base_config['frontend']['protocol']}://{base_config['frontend']['host']}:{base_config['frontend']['port']}",
            "backend": os.environ.get("BACKEND_URL")
            or f"{base_config['backend']['protocol']}://{base_config['backend']['host']}:{base_config['backend']['port']}",
            "database": os.environ.get("DATABASE_URL")
            or (
                f"mssql+pyodbc://{base_config['database']['user']}:{base_config['database']['password']}@{base_config['database']['host']}:{base_config['database']['port']}/{base_config['database']['name']}?driver={base_config['database']['driver']}&TrustServerCertificate=yes"
                if is_docker
                else "sqlite:///app.db"
            ),
            "redis": os.environ.get("REDIS_URL")
            or f"redis://{base_config['redis']['host']}:{base_config['redis']['port']}/0",
        }

        return {
            **base_config,
            "urls": urls,
            "is_docker": is_docker,
            "environment": os.environ.get("NODE_ENV", "docker" if is_docker else "development"),
        }

    def get_environment_info(self) -> Dict[str, Any]:
        """獲取完整環境信息"""
        return {
            "project_root": str(self.project_root),
            "docker": self.docker_config,
            "config": self.env_config,
        }

    def print_environment_info(self):
        """打印環境信息"""
        docker = self.docker_config
        config = self.env_config

        print("🔍 腳本環境檢測結果:")
        print("=" * 40)
        print(f"📍 項目根目錄: {self.project_root}")
        print(
            f'🐳 Docker 環境: {"是" if docker["is_docker"] else "否"} (信心度: {docker["confidence"] * 100:.1f}%)'
        )
        print(f'🌍 執行環境: {config["environment"]}')
        print(f"⚙️  設定:")
        print(f'   - 前端: {config["urls"]["frontend"]}')
        print(f'   - 後端: {config["urls"]["backend"]}')
        print(f'   - 資料庫: {config["urls"]["database"]}')
        print(f'   - Redis: {config["urls"]["redis"]}')
        print(f'   - 超時: {config["timeout"]}s')

        if config["debug"]:
            print("\n🔍 詳細檢測結果:")
            for key, value in docker["checks"].items():
                print(f'   - {key}: {"✅" if value else "❌"}')

        print("=" * 40)

    @staticmethod
    def get_config() -> Dict[str, Any]:
        """靜態方法：快速獲取環境配置"""
        env = ScriptEnvironment()
        return env.get_environment_info()

    @staticmethod
    def is_docker() -> bool:
        """靜態方法：快速檢查是否為 Docker 環境"""
        env = ScriptEnvironment()
        return env.docker_config["is_docker"]

    @staticmethod
    def get_app_config() -> Tuple[str, int, bool]:
        """獲取應用配置 (host, port, debug) - 向後兼容"""
        env = ScriptEnvironment()
        config = env.env_config
        return (config["backend"]["host"], config["backend"]["port"], config["debug"])


# 向後兼容的便利函數
def is_docker_environment():
    """檢測是否在 Docker 環境中運行 - 向後兼容"""
    return ScriptEnvironment.is_docker()


def get_app_config():
    """根據環境獲取應用配置 - 向後兼容"""
    return ScriptEnvironment.get_app_config()


if __name__ == "__main__":
    # 測試腳本
    env = ScriptEnvironment()
    env.print_environment_info()
