<template>
  <div class="cyber-container">
    <!-- 背景网格与装饰 -->
    <div class="cyber-grid"></div>
    <div class="scan-line"></div>

    <div class="content-wrapper">
      <!-- 故障效果的 404 标题 -->
      <h1 class="glitch-text" data-text="404">404</h1>

      <!-- 副标题 -->
      <h2 class="cyber-subtitle">
        <span class="neon-text">SYSTEM_ERROR</span>: PAGE_NOT_FOUND
      </h2>

      <!-- 描述信息 -->
      <p class="cyber-description">
        警告：您访问的节点不存在或已被移除。<br>
        数据流已中断，请检查您的导航路径。
      </p>

      <!-- 操作按钮 -->
      <div class="action-group">
        <button @click="goHome" class="cyber-btn">
          <span class="btn-content">返回主节点</span>
          <span class="btn-glitch"></span>
        </button>
        <button @click="goBack" class="cyber-btn secondary">
          <span class="btn-content">回溯上一级</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
/* 定义赛博朋克配色变量 */
:root {
  --neon-blue: #00f3ff;
  --neon-pink: #bc13fe;
  --neon-green: #0aff0a;
  --bg-dark: #050505;
  --grid-color: rgba(0, 243, 255, 0.1);
}

.cyber-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-color: #050505;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace; /* 使用等宽字体增强科技感 */
  color: #fff;
}

/* 背景网格 */
.cyber-grid {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image:
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
  animation: grid-move 20s linear infinite;
  z-index: 0;
  opacity: 0.6;
}

@keyframes grid-move {
  0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
  100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); }
}

/* 扫描线效果 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: rgba(0, 243, 255, 0.3);
  box-shadow: 0 0 10px var(--neon-blue);
  animation: scan 3s linear infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes scan {
  0% { top: -10%; opacity: 0; }
  50% { opacity: 1; }
  100% { top: 110%; opacity: 0; }
}

.content-wrapper {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 2rem;
  border: 1px solid rgba(0, 243, 255, 0.3);
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(5px);
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.1);
  max-width: 600px;
  width: 90%;
}

/* 故障文字效果 (Glitch) */
.glitch-text {
  font-size: 8rem;
  font-weight: bold;
  position: relative;
  color: #fff;
  letter-spacing: 0.1em;
  margin: 0;
  text-shadow: 2px 2px var(--neon-pink), -2px -2px var(--neon-blue);
  animation: glitch-skew 1s infinite linear alternate-reverse;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #050505;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -1px 0 var(--neon-green);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -1px 0 var(--neon-pink);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% { clip: rect(12px, 9999px, 32px, 0); }
  20% { clip: rect(65px, 9999px, 89px, 0); }
  40% { clip: rect(22px, 9999px, 6px, 0); }
  60% { clip: rect(88px, 9999px, 15px, 0); }
  80% { clip: rect(3px, 9999px, 55px, 0); }
  100% { clip: rect(44px, 9999px, 22px, 0); }
}

@keyframes glitch-anim2 {
  0% { clip: rect(65px, 9999px, 100px, 0); }
  20% { clip: rect(2px, 9999px, 67px, 0); }
  40% { clip: rect(22px, 9999px, 5px, 0); }
  60% { clip: rect(88px, 9999px, 99px, 0); }
  80% { clip: rect(10px, 9999px, 35px, 0); }
  100% { clip: rect(54px, 9999px, 12px, 0); }
}

@keyframes glitch-skew {
  0% { transform: skew(0deg); }
  20% { transform: skew(-2deg); }
  40% { transform: skew(2deg); }
  60% { transform: skew(-1deg); }
  80% { transform: skew(1deg); }
  100% { transform: skew(0deg); }
}

.cyber-subtitle {
  font-size: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: #ccc;
}

.neon-text {
  color: var(--neon-blue);
  text-shadow: 0 0 5px var(--neon-blue), 0 0 10px var(--neon-blue);
}

.cyber-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #aaa;
  margin-bottom: 2.5rem;
  border-left: 3px solid var(--neon-pink);
  padding-left: 1rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
}

.action-group {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 赛博朋克按钮 */
.cyber-btn {
  position: relative;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  color: var(--neon-blue);
  background: transparent;
  border: 2px solid var(--neon-blue);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  overflow: hidden;
  font-family: inherit;
}

.cyber-btn:hover {
  background: var(--neon-blue);
  color: #000;
  box-shadow: 0 0 20px var(--neon-blue);
}

.cyber-btn.secondary {
  color: var(--neon-pink);
  border-color: var(--neon-pink);
}

.cyber-btn.secondary:hover {
  background: var(--neon-pink);
  color: #fff;
  box-shadow: 0 0 20px var(--neon-pink);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .glitch-text {
    font-size: 5rem;
  }
  .cyber-subtitle {
    font-size: 1.2rem;
  }
  .action-group {
    flex-direction: column;
    gap: 1rem;
  }
  .cyber-btn {
    width: 100%;
  }
}
</style>
