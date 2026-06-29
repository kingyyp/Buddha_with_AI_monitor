# 準提神咒 — 精進修持助手

本專案是一個瀏覽器前端的修持輔助頁面，集成本地錄音、循環播放、與基於 MediaPipe 的鏡頭專注度監察功能。

**重要檔案**
- [index.html](index.html) — 主頁面，包含 UI 與大部分邏輯。
- [js/focus-monitor.js](js/focus-monitor.js) — 專注度監察模組（內嵌於 `index.html`）。

**功能概要**
- 現場錄製與儲存法音（本地 localStorage）。
- 自動/手動持誦計數與終身累計記錄（localStorage）。
- MediaPipe FaceMesh 驅動的專注度監察（偵測離開鏡頭、閉眼、轉頭）。
- 可選提示鈴聲，上傳自訂音檔。
- 鏡頭畫面預設隱藏，使用者按鈕顯示／隱藏。

**執行環境與注意事項**
- 為了讓瀏覽器允許存取相機，請務必以本機 HTTP server 或 HTTPS 開啟頁面（不要用 `file://`）。
- 建議使用 Chrome/Edge 最新版本以獲得較佳的 MediaPipe 支援。

**在本機啟動（簡易方式）**
於專案資料夾執行其中一項：

Python 3:
```bash
python -m http.server 8000
```
或（Windows）:
```bash
py -3 -m http.server 8000
```
Node.js (若有安裝)：
```bash
npx http-server -p 8000
```

然後在瀏覽器開啟：

http://localhost:8000/index.html


**使用說明（快速）**
1. 開啟頁面後，先按「📷 啟用鏡頭監察」來啟動 AI 監察（頁面會要求授權相機）。
2. 鏡頭畫面預設不顯示，若要查看畫面請按「👁️ 顯示鏡頭畫面」。
3. 若偵測到分心，預設會播放載入的提示音（或回退至內建音效），並暫時把頁面背景淡紅示警。
4. 若要上傳自訂提示鈴聲，按「🔔 啟用提示鈴聲」並選擇音檔。


**調整與除錯**
- 若發現 `FocusMonitor is not defined` 或 404，請確認頁面是否以 http(s) 開啟，且 `js/focus-monitor.js` 在 `js/` 資料夾內可存取。
- 可在開發者工具（F12）查看 Console 與 Network，找出錯誤訊息。


**隱私與安全**
- 本專案所有資料（錄音、計數、日曆紀錄）儲存在使用者本機的 localStorage，未上傳至任何伺服器。
- 使用相機/麥克風時，瀏覽器會提示授權；請於信任的環境與裝置下使用。


**下一步建議**
- 若要部署給其他人使用，請使用 HTTPS 並檢查相機授權流程。
- 可將 `js/focus-monitor.js` 保持為獨立檔案或選擇內嵌（兩者皆已支援）。

---
若需要我把 README 補成更詳盡的使用手冊、或把 `js/focus-monitor.js` 恢復成獨立外掛、或加入常見問題（FAQ），告訴我你想要的內容即可。
