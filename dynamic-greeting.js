/**
 * 首页视觉优化 - 动态欢迎语系统
 * Homepage Visual Enhancement - Dynamic Greeting System
 */

class DynamicGreeting {
  constructor() {
    this.greetingEl = document.getElementById('greeting');
    this.clockEl = document.getElementById('clock');
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    if (!this.greetingEl || !this.clockEl) return;

    this.updateGreeting();
    this.updateClock();

    // 每分钟更新一次
    setInterval(() => {
      this.updateGreeting();
      this.updateClock();
    }, 60000);
  }

  /**
   * 获取时段
   */
  getTimePeriod() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 8) return 'earlyMorning';
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * 获取季节
   */
  getSeason() {
    const month = new Date().getMonth() + 1;

    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * 获取星期
   */
  getWeekday() {
    const day = new Date().getDay();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return weekdays[day];
  }

  /**
   * 获取欢迎语
   */
  getGreetingText() {
    const period = this.getTimePeriod();
    const season = this.getSeason();
    const weekday = this.getWeekday();
    const isWeekend = weekday === 'saturday' || weekday === 'sunday';

    // 根据时段的基础问候
    const greetings = {
      earlyMorning: [
        '早安',
        '清晨好',
        '新的一天'
      ],
      morning: [
        '上午好',
        '早上好',
        '美好的早晨'
      ],
      noon: [
        '中午好',
        '午安',
        '该休息了'
      ],
      afternoon: [
        '下午好',
        '午后好',
        '下午时光'
      ],
      evening: [
        '晚上好',
        '傍晚好',
        '夜幕降临'
      ],
      night: [
        '夜深了',
        '深夜好',
        '夜晚好'
      ]
    };

    // 特殊情况的问候
    const specialGreetings = {
      // 周末
      weekend: {
        morning: ['周末愉快', '悠闲的早晨', '美好的周末'],
        afternoon: ['享受周末', '惬意的午后', '放松时光'],
        evening: ['周末夜晚', '轻松的夜晚', '美好的夜晚']
      },
      // 季节特色
      season: {
        spring: ['春日好', '春天来了', '春光明媚'],
        summer: ['夏日好', '炎炎夏日', '夏日时光'],
        autumn: ['秋日好', '秋高气爽', '秋天的风'],
        winter: ['冬日好', '寒冷的冬天', '冬日暖阳']
      }
    };

    // 随机选择策略
    const random = Math.random();

    // 30% 概率使用周末问候（如果是周末）
    if (isWeekend && random < 0.3) {
      const weekendPeriod = period.includes('morning') ? 'morning' :
                           period.includes('afternoon') || period === 'noon' ? 'afternoon' :
                           'evening';
      const weekendGreetings = specialGreetings.weekend[weekendPeriod];
      return weekendGreetings[Math.floor(Math.random() * weekendGreetings.length)];
    }

    // 20% 概率使用季节问候
    if (random >= 0.3 && random < 0.5) {
      const seasonGreetings = specialGreetings.season[season];
      return seasonGreetings[Math.floor(Math.random() * seasonGreetings.length)];
    }

    // 其他情况使用基础问候
    const periodGreetings = greetings[period];
    return periodGreetings[Math.floor(Math.random() * periodGreetings.length)];
  }

  /**
   * 更新欢迎语
   */
  updateGreeting() {
    const greeting = this.getGreetingText();

    // 添加淡入效果
    this.greetingEl.style.opacity = '0';

    setTimeout(() => {
      this.greetingEl.textContent = greeting;
      this.greetingEl.style.opacity = '1';
    }, 200);
  }

  /**
   * 格式化时钟显示
   */
  updateClock() {
    const now = new Date();

    // 格式：星期五 · 4月29日 · 14:30
    const weekday = now.toLocaleDateString('zh-CN', { weekday: 'long' });
    const date = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

    const clockText = `${weekday} · ${date} · ${time}`;

    this.clockEl.textContent = clockText;
  }

  /**
   * 获取时段描述（用于其他地方）
   */
  getPeriodDescription() {
    const period = this.getTimePeriod();
    const descriptions = {
      earlyMorning: '清晨时分，新的一天开始了',
      morning: '上午时光，适合专注工作',
      noon: '午间休息，补充能量',
      afternoon: '下午时光，继续创作',
      evening: '傍晚时分，一天即将结束',
      night: '夜深人静，适合思考'
    };
    return descriptions[period];
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicGreeting;
}
