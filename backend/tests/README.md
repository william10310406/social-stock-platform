# 後端測試

這個目錄包含 Stock Insight Platform 後端的各種測試文件。

## Socket.IO 測試

### test_socketio.py
- **用途**：驗證 Flask-SocketIO 配置是否正確
- **運行**：`python tests/test_socketio.py`
- **檢查項目**：
  - Flask 應用創建
  - SocketIO 初始化
  - Eventlet 可用性
  - 應用上下文

## 運行測試

```bash
# 在容器內運行
docker-compose exec backend python tests/test_socketio.py

# 或者直接在本地運行（如果環境配置正確）
cd backend
python tests/test_socketio.py
```

## 測試結構

```
backend/tests/
├── README.md              # 本文檔
├── test_socketio.py       # Socket.IO 配置測試
└── (future tests)         # 未來的其他測試
```

## 注意事項

- 測試文件會在 entrypoint.sh 啟動時自動運行
- 確保所有測試通過後才會啟動實際服務
- 測試失敗會阻止容器啟動，這是預期行為 
