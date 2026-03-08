/**
 * 八字排盘引擎核心服务
 * 基于 lunar-javascript 实现
 */

import { Solar, Lunar, EightChar } from 'lunar-javascript';

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行
const WU_XING = ['金', '木', '水', '火', '土'];

// 天干五行
const TIAN_GAN_WU_XING: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行
const DI_ZHI_WU_XING: Record<string, string> = {
  '子': '水',
  '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火',
  '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 十神
const SHI_SHEN = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

/**
 * 计算十神关系
 * @param riGan 日主天干
 * @param otherGan 其他天干
 * @returns 十神名称
 */
function calculateShiShen(riGan: string, otherGan: string): string {
  const riGanIndex = TIAN_GAN.indexOf(riGan);
  const otherGanIndex = TIAN_GAN.indexOf(otherGan);

  // 计算天干距离
  let distance = (otherGanIndex - riGanIndex + 10) % 10;

  // 根据距离确定十神
  const shiShenMap: Record<number, string> = {
    0: '比肩',
    1: '劫财',
    2: '食神',
    3: '伤官',
    4: '偏财',
    5: '正财',
    6: '七杀',
    7: '正官',
    8: '偏印',
    9: '正印'
  };

  return shiShenMap[distance] || '未知';
}

/**
 * 地支藏干
 */
const DI_ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

/**
 * 八字排盘结果
 */
export interface BaziResult {
  // 四柱
  nianZhu: { gan: string; zhi: string };
  yueZhu: { gan: string; zhi: string };
  riZhu: { gan: string; zhi: string };
  shiZhu: { gan: string; zhi: string };

  // 五行统计
  wuXing: {
    jin: number;
    mu: number;
    shui: number;
    huo: number;
    tu: number;
  };

  // 十神关系（以日主为基准）
  shiShen: {
    nianGan: string;
    yueGan: string;
    shiGan: string;
    nianZhi: string[];
    yueZhi: string[];
    riZhi: string[];
    shiZhi: string[];
  };

  // 生肖
  zodiac: string;

  // 节气信息
  jieQi: string[];
}

/**
 * 真太阳时校正
 * @param date 原始日期时间
 * @param longitude 出生地经度（默认 120 度，东八区标准）
 * @returns 校正后的日期时间
 */
export function adjustForTrueSolarTime(date: Date, longitude: number = 120): Date {
  // 经度每差 1 度，时间差 4 分钟
  const timeDifferenceMinutes = (longitude - 120) * 4;

  // 创建新日期对象，加上时间差
  const adjustedDate = new Date(date.getTime() + timeDifferenceMinutes * 60 * 1000);

  return adjustedDate;
}

/**
 * 计算真太阳时时间差（分钟）
 * @param longitude 出生地经度
 * @returns 时间差（分钟），正数表示比标准时间晚，负数表示比标准时间早
 */
export function calculateTrueSolarTimeDiff(longitude: number): number {
  return (longitude - 120) * 4;
}

/**
 * 格式化真太阳时
 * @param birthTime 原始出生时间（HH:mm 格式）
 * @param longitude 出生地经度
 * @returns 格式化后的真太阳时时间（HH:mm 格式）和说明
 */
export function formatTrueSolarTime(birthTime: string, longitude: number): {
  trueSolarTime: string;
  timeDiff: number;
  description: string;
} {
  const [hour, minute] = birthTime.split(':').map(Number);
  const timeDiff = calculateTrueSolarTimeDiff(longitude);

  // 计算真太阳时
  const totalMinutes = hour * 60 + minute + timeDiff;

  // 处理跨天情况
  let adjustedMinutes = totalMinutes;
  let dayChange = 0;
  if (adjustedMinutes < 0) {
    adjustedMinutes += 1440; // 加 24 小时
    dayChange = -1;
  } else if (adjustedMinutes >= 1440) {
    adjustedMinutes -= 1440; // 减 24 小时
    dayChange = 1;
  }

  const newHour = Math.floor(adjustedMinutes / 60);
  const newMinute = adjustedMinutes % 60;
  const trueSolarTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

  // 生成说明
  let description = '';
  if (timeDiff > 0) {
    description = `比北京时间快${timeDiff}分钟`;
  } else if (timeDiff < 0) {
    description = `比北京时间慢${Math.abs(timeDiff)}分钟`;
  } else {
    description = '与北京时间一致';
  }

  if (dayChange !== 0) {
    description += `（跨${dayChange < 0 ? '前' : '后'}一天）`;
  }

  return {
    trueSolarTime,
    timeDiff,
    description
  };
}

/**
 * 八字排盘主函数
 * @param birthDate 出生日期（公历）
 * @param birthTime 出生时间（HH:mm 格式）
 * @param longitude 出生地经度（可选，用于真太阳时校正）
 * @param gender 性别（'male' | 'female'）
 * @returns 八字排盘结果
 */
export function calculateBazi(
  birthDate: string,
  birthTime: string,
  longitude?: number,
  gender?: 'male' | 'female'
): BaziResult {
  // 解析出生日期和时间
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  // 创建日期对象
  let birthDateTime = new Date(year, month - 1, day, hour, minute);

  // 真太阳时校正
  if (longitude !== undefined) {
    birthDateTime = adjustForTrueSolarTime(birthDateTime, longitude);
  }

  // 使用 lunar-javascript 转换
  const solar = Solar.fromDate(birthDateTime);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 获取四柱
  const nianGan = eightChar.getYearGan();
  const nianZhi = eightChar.getYearZhi();
  const yueGan = eightChar.getMonthGan();
  const yueZhi = eightChar.getMonthZhi();
  const riGan = eightChar.getDayGan();
  const riZhi = eightChar.getDayZhi();
  const shiGan = eightChar.getTimeGan();
  const shiZhi = eightChar.getTimeZhi();

  // 统计五行
  const wuXing = {
    jin: 0,
    mu: 0,
    shui: 0,
    huo: 0,
    tu: 0
  };

  // 统计天干五行
  [nianGan, yueGan, riGan, shiGan].forEach((gan) => {
    const wx = TIAN_GAN_WU_XING[gan];
    if (wx === '金') wuXing.jin++;
    else if (wx === '木') wuXing.mu++;
    else if (wx === '水') wuXing.shui++;
    else if (wx === '火') wuXing.huo++;
    else if (wx === '土') wuXing.tu++;
  });

  // 统计地支五行
  [nianZhi, yueZhi, riZhi, shiZhi].forEach((zhi) => {
    const wx = DI_ZHI_WU_XING[zhi];
    if (wx === '金') wuXing.jin++;
    else if (wx === '木') wuXing.mu++;
    else if (wx === '水') wuXing.shui++;
    else if (wx === '火') wuXing.huo++;
    else if (wx === '土') wuXing.tu++;
  });

  // 计算十神关系（以日主为基准）
  const shiShen = {
    nianGan: calculateShiShen(riGan, nianGan),
    yueGan: calculateShiShen(riGan, yueGan),
    shiGan: calculateShiShen(riGan, shiGan),
    nianZhi: DI_ZHI_CANG_GAN[nianZhi].map(gan => calculateShiShen(riGan, gan)),
    yueZhi: DI_ZHI_CANG_GAN[yueZhi].map(gan => calculateShiShen(riGan, gan)),
    riZhi: DI_ZHI_CANG_GAN[riZhi].map(gan => calculateShiShen(riGan, gan)),
    shiZhi: DI_ZHI_CANG_GAN[shiZhi].map(gan => calculateShiShen(riGan, gan))
  };

  // 获取生肖
  const zodiac = eightChar.getYearZhi(); // 年支为生肖

  // 获取节气信息
  const jieQi: string[] = [];
  const jieQiTable = [
    '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
    '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
    '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
  ];

  // 获取当年的节气 - 使用 getJieQiTable() 方法获取节气表
  const jieQiObj = lunar.getJieQiTable();
  for (const jq of jieQiTable) {
    if (jieQiObj[jq]) {
      jieQi.push(jq);
    }
  }

  return {
    nianZhu: { gan: nianGan, zhi: nianZhi },
    yueZhu: { gan: yueGan, zhi: yueZhi },
    riZhu: { gan: riGan, zhi: riZhi },
    shiZhu: { gan: shiGan, zhi: shiZhi },
    wuXing,
    shiShen,
    zodiac,
    jieQi
  };
}

/**
 * 格式化八字结果
 * @param result 八字排盘结果
 * @returns 格式化后的字符串
 */
export function formatBazi(result: BaziResult): string {
  return `${result.nianZhu.gan}${result.nianZhu.zhi} ${result.yueZhu.gan}${result.yueZhu.zhi} ${result.riZhu.gan}${result.riZhu.zhi} ${result.shiZhu.gan}${result.shiZhu.zhi}`;
}

/**
 * 大运信息
 */
export interface DayunInfo {
  // 起运年龄
  qiYunAge: number;
  // 起运日期（公历）
  qiYunDate: Date;
  // 大运序列
  dayunList: DayunStep[];
}

/**
 * 单步大运
 */
export interface DayunStep {
  // 大运天干
  gan: string;
  // 大运地支
  zhi: string;
  // 开始年龄
  startAge: number;
  // 结束年龄
  endAge: number;
  // 开始年份
  startYear: number;
  // 结束年份
  endYear: number;
}

/**
 * 判断年干阴阳
 * @param gan 天干
 * @returns true 为阳，false 为阴
 */
function isYangGan(gan: string): boolean {
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  return yangGan.includes(gan);
}

/**
 * 计算大运
 * @param birthDate 出生日期
 * @param birthTime 出生时间
 * @param gender 性别
 * @param nianGan 年干
 * @param yueZhu 月柱
 * @returns 大运信息
 */
export function calculateDayun(
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female',
  nianGan: string,
  yueZhu: { gan: string; zhi: string }
): DayunInfo {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  const birthDateTime = new Date(year, month - 1, day, hour, minute);

  // 判断顺逆
  const isYangYear = isYangGan(nianGan);
  const isMale = gender === 'male';
  // 阳男阴女顺行，阴男阳女逆行
  const isShunXing = (isYangYear && isMale) || (!isYangYear && !isMale);

  // 计算起运时间：数到节气
  let qiYunDays = 0;

  if (isShunXing) {
    // 顺行：数到下一节气
    // 简化计算：假设每月 30 天，大约 3 天 1 岁
    qiYunDays = estimateDaysToNextJieQi(birthDateTime, yueZhu.zhi);
  } else {
    // 逆行：数到上一节气
    qiYunDays = estimateDaysToPrevJieQi(birthDateTime, yueZhu.zhi);
  }

  // 3 天为 1 岁，1 天为 4 个月，1 时辰为 10 天
  const qiYunAge = Math.floor(qiYunDays / 3);

  // 计算起运日期
  const qiYunDate = new Date(birthDateTime.getTime() + qiYunDays * 24 * 60 * 60 * 1000);

  // 生成大运序列（8 步大运）
  const dayunList: DayunStep[] = [];
  let currentAge = qiYunAge;
  let currentGan = yueZhu.gan;
  let currentZhi = yueZhu.zhi;

  for (let i = 0; i < 8; i++) {
    // 前进或后退一位
    if (isShunXing) {
      currentGan = TIAN_GAN[(TIAN_GAN.indexOf(currentGan) + 1) % 10];
      currentZhi = DI_ZHI[(DI_ZHI.indexOf(currentZhi) + 1) % 12];
    } else {
      currentGan = TIAN_GAN[(TIAN_GAN.indexOf(currentGan) + 9) % 10];
      currentZhi = DI_ZHI[(DI_ZHI.indexOf(currentZhi) + 11) % 12];
    }

    const startYear = year + currentAge;
    const endYear = startYear + 9;

    dayunList.push({
      gan: currentGan,
      zhi: currentZhi,
      startAge: currentAge,
      endAge: currentAge + 9,
      startYear,
      endYear
    });

    currentAge += 10;
  }

  return {
    qiYunAge,
    qiYunDate,
    dayunList
  };
}

/**
 * 估算到下一节气的天数
 */
function estimateDaysToNextJieQi(date: Date, yueZhi: string): number {
  // 简化计算：每个节气约 15 天
  // 根据月支估算距离下一节气的天数
  const jieQiOrder: Record<string, number> = {
    '寅': 0, '卯': 1, '辰': 2, '巳': 3, '午': 4, '未': 5,
    '申': 6, '酉': 7, '戌': 8, '亥': 9, '子': 10, '丑': 11
  };

  const monthIndex = jieQiOrder[yueZhi] || 0;
  // 假设每节气 15 天，随机偏移
  return 15 - (date.getDate() % 15);
}

/**
 * 估算到上一节气的天数
 */
function estimateDaysToPrevJieQi(date: Date, yueZhi: string): number {
  return date.getDate() + 1;
}

/**
 * 流年信息
 */
export interface LiunianInfo {
  // 流年天干
  gan: string;
  // 流年地支
  zhi: string;
  // 生肖
  zodiac: string;
  // 相对于日主的十神
  shiShen: {
    tianGan: string;
    diZhi: string[];
  };
  // 与原局地支的关系
  relations: {
    chong: string[]; // 冲
    hai: string[]; // 害
    xing: string[]; // 刑
    he: string[]; // 合
  };
  // 运势关键词
  keywords: string[];
}

/**
 * 计算流年
 * @param year 公历年份
 * @param riGan 日主天干
 * @param baziZhi 八字地支（用于计算关系）
 * @returns 流年信息
 */
export function calculateLiunian(
  year: number,
  riGan: string,
  baziZhi: string[] = []
): LiunianInfo {
  // 使用 lunar-javascript 计算流年干支
  const lunar = Lunar.fromDate(new Date(year, 0, 1));
  const liunianGan = lunar.getYearGan();
  const liunianZhi = lunar.getYearZhi();

  // 生肖
  const zodiac = liunianZhi;

  // 十神关系
  const shiShen = {
    tianGan: calculateShiShen(riGan, liunianGan),
    diZhi: DI_ZHI_CANG_GAN[liunianZhi]?.map(gan => calculateShiShen(riGan, gan)) || []
  };

  // 地支关系
  const relations = calculateDiZhiRelations(liunianZhi, baziZhi);

  // 运势关键词
  const keywords = getLiunianKeywords(shiShen, relations);

  return {
    gan: liunianGan,
    zhi: liunianZhi,
    zodiac,
    shiShen,
    relations,
    keywords
  };
}

/**
 * 计算地支关系（刑冲合害）
 */
function calculateDiZhiRelations(liunianZhi: string, baziZhi: string[]) {
  const relations = {
    chong: [] as string[],
    hai: [] as string[],
    xing: [] as string[],
    he: [] as string[]
  };

  // 六冲
  const chongMap: Record<string, string> = {
    '子': '午', '丑': '未', '寅': '申', '卯': '酉',
    '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
    '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
  };

  // 六害
  const haiMap: Record<string, string> = {
    '子': '未', '丑': '午', '寅': '巳', '卯': '辰',
    '申': '亥', '酉': '戌', '午': '丑', '未': '子',
    '巳': '寅', '辰': '卯', '亥': '申', '戌': '酉'
  };

  // 六刑
  const xingMap: Record<string, string[]> = {
    '子': ['卯'], '丑': ['戌', '未'], '寅': ['巳', '申'],
    '卯': ['子'], '辰': ['辰', '午', '酉', '亥'], '巳': ['寅', '申'],
    '午': ['午'], '未': ['丑', '戌'], '申': ['寅', '巳'],
    '酉': ['酉'], '戌': ['丑', '未'], '亥': ['亥']
  };

  // 六合
  const heMap: Record<string, string> = {
    '子': '丑', '丑': '子', '寅': '亥', '卯': '戌',
    '辰': '酉', '巳': '申', '午': '未', '未': '午',
    '申': '巳', '酉': '辰', '戌': '卯', '亥': '寅'
  };

  for (const zhi of baziZhi) {
    if (chongMap[liunianZhi] === zhi) relations.chong.push(zhi);
    if (haiMap[liunianZhi] === zhi) relations.hai.push(zhi);
    if (xingMap[liunianZhi]?.includes(zhi)) relations.xing.push(zhi);
    if (heMap[liunianZhi] === zhi) relations.he.push(zhi);
  }

  return relations;
}

/**
 * 获取流年关键词
 */
function getLiunianKeywords(shiShen: { tianGan: string; diZhi: string[] }, relations: any): string[] {
  const keywords: string[] = [];

  const shiShenMap: Record<string, string> = {
    '比肩': '合作年',
    '劫财': '竞争年',
    '食神': '享受年',
    '伤官': '变动年',
    '偏财': '偏财运',
    '正财': '正财运',
    '七杀': '压力年',
    '正官': '事业年',
    '偏印': '学习年',
    '正印': '贵人年'
  };

  keywords.push(shiShenMap[shiShen.tianGan] || '平稳年');

  // 根据地支关系添加关键词
  if (relations.chong.length > 0) keywords.push('冲太岁');
  if (relations.hai.length > 0) keywords.push('害太岁');
  if (relations.xing.length > 0) keywords.push('刑太岁');
  if (relations.he.length > 0) keywords.push('合太岁');

  return keywords;
}

/**
 * 身强身弱分析结果
 */
export interface ShenqiangResult {
  // 定性评估
  deLing: boolean; // 得令：月支是否生助日主
  deDi: boolean; // 得地：地支是否有根
  deZhu: boolean; // 得助：天干是否有比劫
  deSheng: boolean; // 得生：天干是否有印星

  // 定量评估
  tongFangScore: number; // 同方（我方）加权得分
  yiFangScore: number; // 异方（敌方）加权得分
  totalScore: number; // 综合得分（同方占比，0-100）

  // 综合评分（0-100）
  score: number;
  // 结论：身强/身弱/中和
  conclusion: '身强' | '身弱' | '中和';
  // 定性层级（6 级）
  dingXingLevel: '最强' | '中强' | '次强' | '次弱' | '中弱' | '最弱';
  // 定量等级（9 级）
  dingLiangLevel: '极强' | '很强' | '强' | '稍强' | '中和' | '稍弱' | '弱' | '很弱' | '极弱';
  // 特殊格局
  isZhuanWang: boolean; // 专旺格（极强）
  isCongWang: boolean; // 从势格（极弱）
  patternName: string; // 格局具体名称，如"真·曲直格"、"假·从势格"、"普通格局"
  // 用神五行（治病的药，平衡命局的关键）
  yongShen: string[];
  // 喜神五行（用神的盟友，生助用神）
  xiShen: string[];
  // 忌神五行（用神的敌人，克制用神）
  jiShen: string[];
  // 闲神五行（中性，既有利也有弊）
  xianShen: string[];
  // 详细分析
  analysis: {
    lingScore: number; // 得令分
    diScore: number; // 得地分
    zhuScore: number; // 得助分
    shengScore: number; // 得生分
    // 定量分析详情
    tianGanTongFang: number; // 天干同方数量
    tianGanYiFang: number; // 天干异方数量
    diZhuTongFang: number; // 地支主气同方数量
    diZhuYiFang: number; // 地支主气异方数量
    cangGanTongFang: number; // 藏干同方数量
    cangGanYiFang: number; // 藏干异方数量
    jiChuTongFang: number; // 基础同方总分
    jiChuYiFang: number; // 基础异方总分
    weightTongFang: number; // 加权后同方得分
    weightYiFang: number; // 加权后异方得分
  };
  // 综合判定日志
  analysisLogs?: string[];
}

/**
 * 五行生克关系
 */
const WU_XING_SHENG: Record<string, string> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木'
};

const WU_XING_KE: Record<string, string> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木'
};

/**
 * 五行四时用事权重（旺相休囚死）
 * 按月份（地支）划分，每个五行在当月的状态
 * 权重：旺=2.0, 相=1.5, 休=1.0, 囚=0.7, 死=0.5
 */
const WU_XING_SI_SHI: Record<string, Record<string, number>> = {
  // 寅卯月（春）：木旺、火相、水休、金囚、土死
  '寅': { '木': 2.0, '火': 1.5, '水': 1.0, '金': 0.7, '土': 0.5 },
  '卯': { '木': 2.0, '火': 1.5, '水': 1.0, '金': 0.7, '土': 0.5 },
  // 巳午月（夏）：火旺、土相、木休、水囚、金死
  '巳': { '火': 2.0, '土': 1.5, '木': 1.0, '水': 0.7, '金': 0.5 },
  '午': { '火': 2.0, '土': 1.5, '木': 1.0, '水': 0.7, '金': 0.5 },
  // 申酉月（秋）：金旺、水相、土休、火囚、木死
  '申': { '金': 2.0, '水': 1.5, '土': 1.0, '火': 0.7, '木': 0.5 },
  '酉': { '金': 2.0, '水': 1.5, '土': 1.0, '火': 0.7, '木': 0.5 },
  // 亥子月（冬）：水旺、木相、金休、土囚、火死
  '亥': { '水': 2.0, '木': 1.5, '金': 1.0, '土': 0.7, '火': 0.5 },
  '子': { '水': 2.0, '木': 1.5, '金': 1.0, '土': 0.7, '火': 0.5 },
  // 辰戌丑未月（四季月）：土旺、金相、火休、木囚、水死
  '辰': { '土': 2.0, '金': 1.5, '火': 1.0, '木': 0.7, '水': 0.5 },
  '戌': { '土': 2.0, '金': 1.5, '火': 1.0, '木': 0.7, '水': 0.5 },
  '丑': { '土': 2.0, '金': 1.5, '火': 1.0, '木': 0.7, '水': 0.5 },
  '未': { '土': 2.0, '金': 1.5, '火': 1.0, '木': 0.7, '水': 0.5 }
};

/**
 * 获取某五行的生我者和同党
 */
function getSupportElements(riGanWuXing: string): { shengWo: string; tongDang: string } {
  // 生我者：印星
  const shengWo = Object.keys(WU_XING_SHENG).find(wx => WU_XING_SHENG[wx] === riGanWuXing) || '';
  // 同党者：比劫
  const tongDang = riGanWuXing;
  return { shengWo, tongDang };
}

/**
 * 获取某五行的克我者、我克者、我生者
 */
function getOpposeElements(riGanWuXing: string): { keWo: string; woKe: string; woSheng: string } {
  const keWo = WU_XING_KE[riGanWuXing] || '';  // 克我者：官杀
  const woKe = WU_XING_KE[keWo] || '';  // 我克者：财星
  const woSheng = WU_XING_SHENG[riGanWuXing] || '';  // 我生者：食伤
  return { keWo, woKe, woSheng };
}

/**
 * 分析身强身弱
 * @param result 八字排盘结果
 * @returns 身强身弱分析结果
 *
 * 计算逻辑：
 * 1. 定性评估：三大核心指标（得令、得地、得助）
 *    - 输出 6 个层级：最强、中强、次强、次弱、中弱、最弱
 *
 * 2. 定量计算：强弱图解分析法
 *    - 划分两大阵营（同方/异方）
 *    - 统计基础数量（天干 + 地支主气 + 藏干）
 *    - 代入五行四时用事权重
 *    - 输出 9 大等级：极强、很强、强、稍强、中和、稍弱、弱、很弱、极弱
 *
 * 3. 逻辑修正：特殊陷阱处理
 *    - 印星不能替代根基
 *    - 母慈灭子现象
 *    - 专旺格/从旺格判定
 */
export function analyzeShenqiang(result: BaziResult): ShenqiangResult {
  const riGan = result.riZhu.gan;
  const riGanWuXing = TIAN_GAN_WU_XING[riGan];
  const yueZhi = result.yueZhu.zhi;
  const yueZhiWuXing = DI_ZHI_WU_XING[yueZhi];

  // 获取五行关系
  const { shengWo, tongDang } = getSupportElements(riGanWuXing);
  const { keWo, woKe, woSheng } = getOpposeElements(riGanWuXing);

  // 同方五行（印星 + 比劫）
  const tongFangWuXing = [shengWo, tongDang].filter(w => w);
  // 异方五行（官杀 + 财星 + 食伤）
  const yiFangWuXing = [keWo, woKe, woSheng].filter(w => w);

  // ========== 一、定性评估：三大核心指标 ==========

  // 1. 得令：月支是否生助日主
  const deLing = yueZhiWuXing === shengWo || yueZhiWuXing === tongDang;

  // 2. 得地：地支是否有日主的根（禄刃或库）
  // 甲木禄在寅，刃在卯，库在未
  const luRenKu: Record<string, string[]> = {
    '甲': ['寅', '卯', '未'], '乙': ['卯', '寅', '未'],
    '丙': ['巳', '午', '戌'], '丁': ['午', '巳', '戌'],
    '戊': ['巳', '午', '戌'], '己': ['午', '巳', '戌'],
    '庚': ['申', '酉', '丑'], '辛': ['酉', '申', '丑'],
    '壬': ['亥', '子', '辰'], '癸': ['子', '亥', '辰']
  };
  const riGanGen = luRenKu[riGan] || [];
  const zhiList = [result.nianZhu.zhi, result.yueZhu.zhi, result.shiZhu.zhi];
  const deDiCount = zhiList.filter(zhi => riGanGen.includes(zhi)).length;
  // 日支也算根
  const riZhiIsGen = riGanGen.includes(result.riZhu.zhi) ? 1 : 0;
  const totalDeDi = deDiCount + riZhiIsGen;
  const deDi = totalDeDi > 0;

  // 3. 得助：天干是否有比劫
  const tianGanList = [result.nianZhu.gan, result.yueZhu.gan, result.shiZhu.gan];
  const deZhuCount = tianGanList.filter(gan => gan === riGan).length;
  const deZhu = deZhuCount > 0;

  // 4. 得生：天干是否有印星
  const deShengCount = tianGanList.filter(gan => TIAN_GAN_WU_XING[gan] === shengWo).length;
  const deSheng = deShengCount > 0;

  // 定性层级判定（6 级）
  let dingXingLevel: '最强' | '中强' | '次强' | '次弱' | '中弱' | '最弱';
  const bangFuCount = deZhuCount + deShengCount + totalDeDi; // 帮扶总数

  if (deLing && bangFuCount >= 4) {
    dingXingLevel = '最强';
  } else if (!deLing && bangFuCount >= 4) {
    dingXingLevel = '中强';
  } else if (deDi && !deLing && bangFuCount >= 2) {
    dingXingLevel = '次强';
  } else if (deLing && totalDeDi === 0 && bangFuCount <= 1) {
    dingXingLevel = '次弱';
  } else if (deLing && bangFuCount <= 1) {
    dingXingLevel = '中弱';
  } else if (!deLing && bangFuCount <= 1) {
    dingXingLevel = '最弱';
  } else {
    dingXingLevel = '次弱'; // 默认
  }

  // ========== 二、定量计算：强弱图解分析 ==========

  // 统计基础数量
  let tianGanTongFang = 0;
  let tianGanYiFang = 0;
  let diZhuTongFang = 0;
  let diZhuYiFang = 0;
  let cangGanTongFang = 0;
  let cangGanYiFang = 0;

  // 天干统计
  const allGan = [result.nianZhu.gan, result.yueZhu.gan, result.riZhu.gan, result.shiZhu.gan];
  allGan.forEach(gan => {
    const wx = TIAN_GAN_WU_XING[gan];
    if (tongFangWuXing.includes(wx)) {
      tianGanTongFang++;
    } else if (yiFangWuXing.includes(wx)) {
      tianGanYiFang++;
    }
  });

  // 地支主气统计
  const allZhu = [result.nianZhu.zhi, result.yueZhu.zhi, result.riZhu.zhi, result.shiZhu.zhi];
  allZhu.forEach(zhi => {
    const wx = DI_ZHI_WU_XING[zhi];
    if (tongFangWuXing.includes(wx)) {
      diZhuTongFang++;
    } else if (yiFangWuXing.includes(wx)) {
      diZhuYiFang++;
    }
  });

  // 地支藏干统计
  const allCangGan = allZhu.flatMap(zhi => DI_ZHI_CANG_GAN[zhi] || []);
  allCangGan.forEach(gan => {
    const wx = TIAN_GAN_WU_XING[gan];
    if (tongFangWuXing.includes(wx)) {
      cangGanTongFang++;
    } else if (yiFangWuXing.includes(wx)) {
      cangGanYiFang++;
    }
  });

  // 基础总分
  const jiChuTongFang = tianGanTongFang + diZhuTongFang + cangGanTongFang;
  const jiChuYiFang = tianGanYiFang + diZhuYiFang + cangGanYiFang;

  // 加权计算（代入五行四季旺相休囚死权重）
  let weightTongFang = 0;
  let weightYiFang = 0;

  // 天干加权 (基础数量1 * 季节权重)
  allGan.forEach(gan => {
    const wx = TIAN_GAN_WU_XING[gan];
    const multiplier = WU_XING_SI_SHI[yueZhi][wx] || 1.0;
    if (tongFangWuXing.includes(wx)) {
      weightTongFang += multiplier;
    } else if (yiFangWuXing.includes(wx)) {
      weightYiFang += multiplier;
    }
  });

  // 地支主气加权 (基础数量1 * 季节权重)
  allZhu.forEach(zhi => {
    const wx = DI_ZHI_WU_XING[zhi];
    const multiplier = WU_XING_SI_SHI[yueZhi][wx] || 1.0;
    if (tongFangWuXing.includes(wx)) {
      weightTongFang += multiplier;
    } else if (yiFangWuXing.includes(wx)) {
      weightYiFang += multiplier;
    }
  });

  // 藏干加权 (基础数量0.5 * 季节权重)
  allCangGan.forEach(gan => {
    const wx = TIAN_GAN_WU_XING[gan];
    const multiplier = (WU_XING_SI_SHI[yueZhi][wx] || 1.0) * 0.5;
    if (tongFangWuXing.includes(wx)) {
      weightTongFang += multiplier;
    } else if (yiFangWuXing.includes(wx)) {
      weightYiFang += multiplier;
    }
  });

  // 阵营力量比例 (我方 / 敌方)
  const ratio = weightYiFang === 0 ? 999 : (weightTongFang / weightYiFang);

  // 计算综合百分比得分（同方占比，满分100，用于UI保留显示）
  const totalWeight = weightTongFang + weightYiFang;
  const totalScore = totalWeight > 0 ? (weightTongFang / totalWeight) * 100 : 50;

  // 定量等级判定（陆致极《八字命理学》9级图解分析法）
  let dingLiangLevel: '极强' | '很强' | '强' | '稍强' | '中和' | '稍弱' | '弱' | '很弱' | '极弱';
  if (ratio >= 2.5) {
    dingLiangLevel = '极强';
  } else if (ratio >= 1.8) {
    dingLiangLevel = '很强';
  } else if (ratio >= 1.3) {
    dingLiangLevel = '强';
  } else if (ratio >= 1.1) {
    dingLiangLevel = '稍强';
  } else if (ratio >= 0.9) {
    dingLiangLevel = '中和';
  } else if (ratio >= 0.7) {
    dingLiangLevel = '稍弱';
  } else if (ratio >= 0.5) {
    dingLiangLevel = '弱';
  } else if (ratio >= 0.3) {
    dingLiangLevel = '很弱';
  } else {
    dingLiangLevel = '极弱';
  }

  // ========== 三、逻辑修正：特殊陷阱与格局处理 ==========

  // 检查是否有根（无根则即使有印也无法真正得地）
  const hasRoot = deDi;

  // 母慈灭子检查：印星过旺而日主无根
  const isMuCiMieZi = !hasRoot && deShengCount >= 2 && !deZhu;

  let isZhuanWang = false;
  let isCongWang = false;
  let patternName = '普通格局';

  // 1. 专旺格名称映射字典
  const zhuanWangNames: Record<string, string> = {
    '木': '曲直格',
    '火': '炎上格',
    '土': '稼穑格',
    '金': '从革格',
    '水': '润下格'
  };

  // 2. 统计逆势五行数量（专旺格的逆势/敌对势力：官杀克我，财星破印）
  const zhuanWangEnemyElements = [keWo, woKe].filter(Boolean);
  const zhuanWangEnemyCount =
    allGan.filter(g => zhuanWangEnemyElements.includes(TIAN_GAN_WU_XING[g])).length +
    allZhu.filter(z => zhuanWangEnemyElements.includes(DI_ZHI_WU_XING[z])).length;

  // 3. 拦截条件执行：校验专旺格
  if ((dingLiangLevel === '极强' || dingLiangLevel === '很强') && hasRoot) {
    // 必须当令（该五行在出生的月份状态必须为“旺”，对应权重 2.0）
    const isDangLing = WU_XING_SI_SHI[yueZhi][riGanWuXing] === 2.0;

    if (isDangLing) {
      if (zhuanWangEnemyCount === 0) {
        isZhuanWang = true;
        patternName = `真·${zhuanWangNames[riGanWuXing]}`;
      } else if (zhuanWangEnemyCount === 1) {
        isZhuanWang = true;
        // 假专旺，假定通过虚浮或合化校验
        patternName = `假·${zhuanWangNames[riGanWuXing]}`;
      }
    }
  }

  // 4. 拦截条件执行：校验从势格（极弱端）
  if (!isZhuanWang && (dingLiangLevel === '极弱' || dingLiangLevel === '很弱') && !hasRoot) {
    // 判定同盟势力（印星/比劫）数量
    const allyElementsCount =
      allGan.filter(g => tongFangWuXing.includes(TIAN_GAN_WU_XING[g])).length +
      allZhu.filter(z => tongFangWuXing.includes(DI_ZHI_WU_XING[z])).length;

    if (allyElementsCount === 0) {
      isCongWang = true;
      patternName = '真·从势格';
    } else if (allyElementsCount === 1) {
      isCongWang = true;
      patternName = '假·从势格';
    }
  }

  // ========== 四、综合评分和结论 ==========

  // 综合评分（基于百分比定量得分保留）
  const score = Math.round(totalScore);

  // 结论判定（基于比值）
  let conclusion: '身强' | '身弱' | '中和';
  if (ratio >= 1.1) {
    conclusion = '身强';
  } else if (ratio < 0.9) {
    conclusion = '身弱';
  } else {
    conclusion = '中和';
  }

  // 特殊格局修正
  if (isZhuanWang) {
    conclusion = '身强';
  } else if (isCongWang) {
    conclusion = '身弱';
  }

  // ========== 五、用神、忌神计算（基于陆致极多视角分析模型） ==========

  const yongShenCandidates: string[] = [];
  const jiShenCandidates: string[] = [];
  const analysisLogs: string[] = [];

  const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'];
  const getRelation = (dmElement: string, targetElement: string) => {
    const dmIdx = FIVE_ELEMENTS.indexOf(dmElement);
    const targetIdx = FIVE_ELEMENTS.indexOf(targetElement);
    const diff = (targetIdx - dmIdx + 5) % 5;
    const relations: Record<number, string> = {
      0: '比劫 (同我)',
      1: '食伤 (我生)',
      2: '财星 (我克)',
      3: '官杀 (克我)',
      4: '印星 (生我)'
    };
    return relations[diff];
  };

  // 维度一：特殊格局拦截 (形象视角)
  if (isZhuanWang) {
    analysisLogs.push("【形象视角】：触发『专旺格』。全局同类气势极强，顺势而为。");
    yongShenCandidates.push("印星/比劫 (顺应强势)");
    yongShenCandidates.push("食伤 (顺泄旺气)");
    jiShenCandidates.push("官杀 (犯旺大凶)");
    jiShenCandidates.push("财星 (群劫争财)");
  } else if (isCongWang) {
    analysisLogs.push("【形象视角】：触发『从旺格/从势格』。日主极弱无根，弃命从势。");
    yongShenCandidates.push("财星/官杀/食伤 (全局最强旺的敌方势力)");
    jiShenCandidates.push("印星/比劫 (逆全局旺势，妄图生扶日主大凶)");
  } else {
    // 维度二：调候视角 (温度与湿度优先)
    // 根据月支判断
    const isHot = ['巳', '午', '未'].includes(yueZhi);
    const isCold = ['亥', '子', '丑'].includes(yueZhi);

    if (isHot) {
      analysisLogs.push("【调候视角】：生于夏月，火炎土燥，『调候为急』。急需【水】来润局。");
      yongShenCandidates.push(`水 (${getRelation(riGanWuXing, '水')})`);
      jiShenCandidates.push(`火/燥土 (${getRelation(riGanWuXing, '火')})`);
    } else if (isCold) {
      analysisLogs.push("【调候视角】：生于冬月，天寒地冻，『调候为急』。急需【火】来照暖。");
      yongShenCandidates.push(`火 (${getRelation(riGanWuXing, '火')})`);
      jiShenCandidates.push(`水/寒金 (${getRelation(riGanWuXing, '水')})`);
    }

    // 维度三：强弱扶抑视角 (基础平衡)
    analysisLogs.push(`【扶抑视角】：当前日主状态为『${dingLiangLevel}』。`);

    if (['极强', '很强', '强', '稍强'].includes(dingLiangLevel)) {
      analysisLogs.push(" -> 判定：旺者宜克、宜泄、宜耗。用神需从『日主异方』选取。");
      const guanShaWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 3) % 5];
      const shiShangWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 1) % 5];
      const caiXingWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 2) % 5];
      yongShenCandidates.push(`官杀 [${guanShaWx}] (制身)`);
      yongShenCandidates.push(`食伤 [${shiShangWx}] (泄秀)`);
      yongShenCandidates.push(`财星 [${caiXingWx}] (耗身)`);

      const yinXingWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 4) % 5];
      jiShenCandidates.push(`印星 [${yinXingWx}] (生身过旺)`);
      jiShenCandidates.push(`比劫 [${riGanWuXing}] (帮身过旺)`);
    } else if (['极弱', '很弱', '弱', '稍弱'].includes(dingLiangLevel)) {
      analysisLogs.push(" -> 判定：弱者宜助、宜帮。用神需从『日主同方』选取。");
      const yinXingWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 4) % 5];
      yongShenCandidates.push(`印星 [${yinXingWx}] (生助日主)`);
      yongShenCandidates.push(`比劫 [${riGanWuXing}] (帮扶日主)`);

      const guanShaWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 3) % 5];
      const shiShangWx = FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(riGanWuXing) + 1) % 5];
      jiShenCandidates.push(`官杀 [${guanShaWx}] (克伐过重)`);
      jiShenCandidates.push(`食伤 [${shiShangWx}] (泄身过重)`);
    } else {
      analysisLogs.push(" -> 判定：处于中和状态。");
    }
  }

  const finalYongShen = [...new Set(yongShenCandidates.filter(Boolean))];
  const finalJiShen = [...new Set(jiShenCandidates.filter(Boolean))];
  // 保持向前兼容
  const finalXiShen: string[] = [];
  const finalXianShen: string[] = [];

  // 计算简化评分（用于显示）
  const lingScore = deLing ? 40 : 0;
  const diScore = Math.min(30, totalDeDi * 10);
  const zhuScore = Math.min(15, deZhuCount * 5);
  const shengScore = Math.min(15, deShengCount * 5);

  return {
    deLing,
    deDi,
    deZhu,
    deSheng,
    score,
    conclusion,
    dingXingLevel,
    dingLiangLevel,
    isZhuanWang,
    isCongWang,
    patternName,
    tongFangScore: Math.round(weightTongFang * 10) / 10,
    yiFangScore: Math.round(weightYiFang * 10) / 10,
    totalScore: Math.round(totalScore),
    yongShen: finalYongShen,
    xiShen: finalXiShen,
    jiShen: finalJiShen,
    xianShen: finalXianShen,
    analysisLogs,
    analysis: {
      lingScore,
      diScore,
      zhuScore,
      shengScore,
      tianGanTongFang,
      tianGanYiFang,
      diZhuTongFang,
      diZhuYiFang,
      cangGanTongFang,
      cangGanYiFang,
      jiChuTongFang,
      jiChuYiFang,
      weightTongFang: Math.round(weightTongFang * 10) / 10,
      weightYiFang: Math.round(weightYiFang * 10) / 10
    }
  };
}
