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
  const jieQi = [];
  const jieQiTable = [
    '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
    '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
    '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
  ];

  // 获取当年的节气
  for (const jq of jieQiTable) {
    const jieQiDate = Lunar.getJieQi(year, lunar.getMonth(), jq);
    if (jieQiDate) {
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
  // 得令：月支是否生助日主
  deLing: boolean;
  // 得地：地支是否有根
  deDi: boolean;
  // 得助：天干是否有比劫
  deZhu: boolean;
  // 得生：天干是否有印星
  deSheng: boolean;
  // 综合评分（0-100）
  score: number;
  // 结论：身强/身弱/中和
  conclusion: '身强' | '身弱' | '中和';
  // 用神五行
  yongShen: string[];
  // 忌神五行
  jiShen: string[];
  // 详细分析
  analysis: {
    lingScore: number; // 得令分
    diScore: number; // 得地分
    zhuScore: number; // 得助分
    shengScore: number; // 得生分
  };
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
 * 分析身强身弱
 * @param result 八字排盘结果
 * @returns 身强身弱分析结果
 */
export function analyzeShenqiang(result: BaziResult): ShenqiangResult {
  const riGan = result.riZhu.gan;
  const riGanWuXing = TIAN_GAN_WU_XING[riGan];

  // 月支五行
  const yueZhiWuXing = DI_ZHI_WU_XING[result.yueZhu.zhi];

  // 1. 得令判断：月支是否生助日主
  const { shengWo, tongDang } = getSupportElements(riGanWuXing);
  const deLing = yueZhiWuXing === shengWo || yueZhiWuXing === tongDang;

  // 2. 得地判断：地支是否有日主的根（同五行或印星五行）
  const zhiList = [result.nianZhu.zhi, result.yueZhu.zhi, result.riZhu.zhi, result.shiZhu.zhi];
  const deDiCount = zhiList.filter(zhi => {
    const wx = DI_ZHI_WU_XING[zhi];
    return wx === riGanWuXing || wx === shengWo;
  }).length;
  const deDi = deDiCount > 0;

  // 3. 得助判断：天干是否有比劫
  const ganList = [result.nianZhu.gan, result.yueZhu.gan, result.shiZhu.gan];
  const deZhuCount = ganList.filter(gan => TIAN_GAN_WU_XING[gan] === riGanWuXing).length;
  const deZhu = deZhuCount > 0;

  // 4. 得生判断：天干是否有印星
  const deShengCount = ganList.filter(gan => TIAN_GAN_WU_XING[gan] === shengWo).length;
  const deSheng = deShengCount > 0;

  // 综合评分计算
  // 得令最重要（40 分），得地次之（30 分），得助得生各（15 分）
  const lingScore = deLing ? 40 : 0;
  const diScore = Math.min(30, deDiCount * 10);
  const zhuScore = Math.min(15, deZhuCount * 5);
  const shengScore = Math.min(15, deShengCount * 5);

  const score = lingScore + diScore + zhuScore + shengScore;

  // 判断结论
  let conclusion: '身强' | '身弱' | '中和';
  if (score >= 60) {
    conclusion = '身强';
  } else if (score <= 40) {
    conclusion = '身弱';
  } else {
    conclusion = '中和';
  }

  // 用神忌神分析
  const yongShen: string[] = [];
  const jiShen: string[] = [];

  if (conclusion === '身弱') {
    // 身弱用生助：印星、比劫为用神
    if (shengWo) yongShen.push(shengWo);
    yongShen.push(tongDang);
    // 克泄耗为忌神
    const keWo = WU_XING_KE[riGanWuXing] || '';
    const woKe = WU_XING_KE[keWo] || ''; // 我克者为财
    const woSheng = WU_XING_SHENG[riGanWuXing] || ''; // 我生者为食伤
    if (keWo) jiShen.push(keWo);
    if (woKe) jiShen.push(woKe);
    if (woSheng) jiShen.push(woSheng);
  } else if (conclusion === '身强') {
    // 身强用克泄：财星、官杀、食伤为用神
    const keWo = WU_XING_KE[riGanWuXing] || '';
    const woKe = WU_XING_KE[keWo] || '';
    const woSheng = WU_XING_SHENG[riGanWuXing] || '';
    if (keWo) yongShen.push(keWo);
    if (woKe) yongShen.push(woKe);
    if (woSheng) yongShen.push(woSheng);
    // 生助为忌神
    if (shengWo) jiShen.push(shengWo);
    jiShen.push(tongDang);
  } else {
    // 中和：五行平衡，根据具体情况取用
    yongShen.push('金', '木', '水', '火', '土');
    jiShen.push('无明显忌神');
  }

  return {
    deLing,
    deDi,
    deZhu,
    deSheng,
    score,
    conclusion,
    yongShen: [...new Set(yongShen)],
    jiShen: [...new Set(jiShen)],
    analysis: {
      lingScore,
      diScore,
      zhuScore,
      shengScore
    }
  };
}
