/**
 * 準提咒修行輔助 - AI 專注度監察模組
 * 適用環境：手提電腦內置鏡頭 + 瀏覽器前端運行 (無需後端)
 */

class FocusMonitor {
  constructor(config = {}) {
    // 預設參數設定
    this.config = {
      maxDistractTime: config.maxDistractTime || 4000, // 判定為分心的超時時間 (毫秒)，持咒建議設 4-5 秒
      checkInterval: config.checkInterval || 100,     // 每隔多少毫秒分析一次畫面
      eyeClosedThreshold: config.eyeClosedThreshold || 0.015, // 閉眼閾值
      headTurnThreshold: config.headTurnThreshold || 0.15,   // 轉頭閾值
      onDistracted: config.onDistracted || (() => {}), // 分心時的觸發事件
      onRecovered: config.onRecovered || (() => {}),   // 恢復專注時的觸發事件
    };

    this.videoElement = null;
    this.faceMesh = null;
    this.camera = null;
    this.distractTimer = null;
    this.isDistracted = false;
  }

  // 初始化環境與鏡頭
  async init(videoElementId) {
    this.videoElement = document.getElementById(videoElementId);
    if (!this.videoElement) {
      console.error("找不到 Video 標籤");
      return;
    }

    // 1. 初始化 MediaPipe FaceMesh
    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // 必須開啟以精準定位瞳孔
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.faceMesh.onResults((results) => this.analyzeFrame(results));

    // 2. 啟動手提電腦鏡頭
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.faceMesh.send({ image: this.videoElement });
      },
      width: 640,
      height: 480
    });

    return this.camera.start();
  }

  // 核心 AI 畫面分析邏輯
  analyzeFrame(results) {
    // 狀況 A：鏡頭前沒有人（離開座位）
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      this.triggerDistraction("人臉離開鏡頭");
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];

    // 狀況 B：檢查是否低頭或大幅度轉頭 (Head Pose)
    const nose = landmarks[1];
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];
    const headTurn = Math.abs((nose.x - leftEar.x) / (rightEar.x - leftEar.x) - 0.5);

    // 狀況 C：檢查是否閉眼 (EAR)
    const leftEyeTop = landmarks[159];
    const leftEyeBottom = landmarks[145];
    const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);

    const isHeadTurned = headTurn > this.config.headTurnThreshold;
    const isEyeClosed = eyeDistance < this.config.eyeClosedThreshold;

    // 綜合判定
    if (isHeadTurned || isEyeClosed) {
      let reason = isHeadTurned ? "移開視線/看手機" : "閉眼過久/打瞌睡";
      this.triggerDistraction(reason);
    } else {
      this.clearDistraction();
    }
  }

  // 處理分心計時
  triggerDistraction(reason) {
    if (!this.isDistracted) {
      this.isDistracted = true;
      console.log(`[警示預備] 偵測到走神原因: ${reason}`);
      
      // 在 VS Code 中設定計時器，連續走神超過設定時間才真正觸發
      this.distractTimer = setTimeout(() => {
        this.config.onDistracted(reason);
      }, this.config.maxDistractTime);
    }
  }

  // 恢復專注，清除計時
  clearDistraction() {
    if (this.isDistracted) {
      this.isDistracted = false;
      clearTimeout(this.distractTimer);
      this.config.onRecovered();
      console.log("[狀態恢復] 重新回到專注持咒狀態");
    }
  }
}
