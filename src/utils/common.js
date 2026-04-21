function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      // 这里定义什么算作“空”：null, undefined, 或 空字符串
      return value !== null && value !== undefined && value !== ''
    })
  )
}


// 全局配置
const settings = {
  // 目标状态选项
  goalStatusOptions: [],
  // todo重要性选项
  todoImportanceOptions: [
    {}
  ]
}

/**
 * 将 Hex 颜色转换为 RGBA 字符串
 * @param {string} hex - 颜色代码，如 '#00f3ff'
 * @param {number} opacity - 透明度 0-1
 */
function hexToRgba(hex, opacity) {
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
}


/**
 * 递归提取 focusTime 并累加
 * @param {Object|Array} data - 需要遍历的数据对象或数组
 * @returns {Number} - 累加的总时间
 */
function sumFocusTime(data) {
  let total = 0;

  // 如果传入的是数组，遍历数组每一项
  if (Array.isArray(data)) {
    data.forEach(item => {
      total += sumFocusTime(item);
    });
  }
  // 如果传入的是对象
  else if (typeof data === 'object' && data !== null) {
    // 1. 优先检查当前对象是否有 focusTime 属性
    if ('focusTime' in data) {
      // 确保是数字类型再累加，防止数据异常
      const time = Number(data.focusTime) || 0;
      total += time;
    }

    // 2. 继续遍历对象的其他属性（深入下一层）
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        total += sumFocusTime(data[key]);
      }
    }
  }

  return total;
}


export default { cleanObject, settings,sumFocusTime }
