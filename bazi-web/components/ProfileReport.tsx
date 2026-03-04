'use client';

import React from 'react';
import { BaziResult, DayunInfo, ShenqiangResult, LiunianInfo, formatTrueSolarTime } from '@/lib/services/bazi';
import { UserProfile } from '@/lib/services/profile-store';

interface ProfileReportProps {
  profile: UserProfile;
  bazi: BaziResult;
  dayun: DayunInfo;
  shenqiang: ShenqiangResult;
  liunian: LiunianInfo;
}

export default function ProfileReport({
  profile,
  bazi,
  dayun,
  shenqiang,
  liunian
}: ProfileReportProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 基本信息 */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
          基本信息
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">姓名</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{profile.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">性别</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              {profile.gender === 'male' ? '男' : '女'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">生日</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{profile.birthDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">出生时间</span>
            <div className="text-right">
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">{profile.birthTime}</span>
              {profile.longitude != null && (
                <div className="text-xs text-zinc-500">
                  真太阳时：{formatTrueSolarTime(profile.birthTime, profile.longitude).trueSolarTime}
                </div>
              )}
            </div>
          </div>
          {profile.birthPlace && (
            <div className="flex justify-between">
              <span className="text-zinc-500">出生地</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">{profile.birthPlace}</span>
            </div>
          )}
          {profile.longitude != null && (
            <div className="flex justify-between">
              <span className="text-zinc-500">经度</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                东经{profile.longitude.toFixed(1)}°
                <span className="text-xs text-zinc-500 ml-2">
                  ({formatTrueSolarTime(profile.birthTime, profile.longitude).description})
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 八字排盘 */}
      <BaziPanel bazi={bazi} />

      {/* 五行统计 */}
      <WuxingPanel wuXing={bazi.wuXing} />

      {/* 大运走势 */}
      <DayunPanel dayun={dayun} />

      {/* 身强身弱 */}
      <ShenqiangPanel shenqiang={shenqiang} />

      {/* 流年运势 */}
      <LiunianPanel liunian={liunian} />
    </div>
  );
}

/**
 * 八字排盘面板
 */
function BaziPanel({ bazi }: { bazi: BaziResult }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
        八字排盘
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {/* 年柱 */}
        <div className="text-center">
          <div className="text-xs text-zinc-500 mb-1">年柱</div>
          <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {bazi.nianZhu.gan}{bazi.nianZhu.zhi}
          </div>
        </div>
        {/* 月柱 */}
        <div className="text-center">
          <div className="text-xs text-zinc-500 mb-1">月柱</div>
          <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {bazi.yueZhu.gan}{bazi.yueZhu.zhi}
          </div>
        </div>
        {/* 日柱 */}
        <div className="text-center">
          <div className="text-xs text-zinc-500 mb-1">日柱</div>
          <div className="text-xl font-bold text-amber-600">
            {bazi.riZhu.gan}{bazi.riZhu.zhi}
          </div>
        </div>
        {/* 时柱 */}
        <div className="text-center">
          <div className="text-xs text-zinc-500 mb-1">时柱</div>
          <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {bazi.shiZhu.gan}{bazi.shiZhu.zhi}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-zinc-500 text-center">
        日主：{bazi.riZhu.gan} · 生肖：{bazi.zodiac}
      </div>
    </div>
  );
}

/**
 * 五行统计面板
 */
function WuxingPanel({ wuXing }: { wuXing: BaziResult['wuXing'] }) {
  const maxCount = Math.max(...Object.values(wuXing));
  const total = Object.values(wuXing).reduce((a, b) => a + b, 0);

  const wuXingData = [
    { name: '金', value: wuXing.jin, color: 'bg-amber-400' },
    { name: '木', value: wuXing.mu, color: 'bg-green-500' },
    { name: '水', value: wuXing.shui, color: 'bg-blue-500' },
    { name: '火', value: wuXing.huo, color: 'bg-red-500' },
    { name: '土', value: wuXing.tu, color: 'bg-yellow-600' }
  ];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
        五行统计
      </h2>
      <div className="space-y-2">
        {wuXingData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 w-6">{item.name}</span>
            <div className="flex-1 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-300`}
                style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 w-6 text-right">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-zinc-500 text-center">
        总数：{total} 个
      </div>
    </div>
  );
}

/**
 * 大运走势面板
 */
function DayunPanel({ dayun }: { dayun: DayunInfo }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
        大运走势
      </h2>
      <div className="text-sm text-zinc-500 mb-3">
        {dayun.qiYunAge} 岁起运
      </div>
      <div className="grid grid-cols-4 gap-2">
        {dayun.dayunList.slice(0, 8).map((step, index) => (
          <div key={index} className="text-center p-2 bg-white dark:bg-zinc-700 rounded-lg">
            <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              {step.gan}{step.zhi}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {step.startAge}-{step.endAge}岁
            </div>
            <div className="text-xs text-zinc-400">
              {step.startYear}-{step.endYear}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 身强身弱面板
 */
function ShenqiangPanel({ shenqiang }: { shenqiang: ShenqiangResult }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
        身强身弱分析
      </h2>

      {/* 综合结论 */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <div className={`text-2xl font-bold ${
            shenqiang.conclusion === '身强' ? 'text-red-500' :
            shenqiang.conclusion === '身弱' ? 'text-blue-500' :
            'text-green-500'
          }`}>
            {shenqiang.conclusion}
          </div>
          <div className="text-sm text-zinc-500">
            定性：{shenqiang.dingXingLevel}
          </div>
        </div>
        <div className="text-sm text-zinc-500 mb-2">
          定量：{shenqiang.dingLiangLevel} | 同方{shenqiang.tongFangScore} / 异方{shenqiang.yiFangScore}
        </div>
        <div className="text-sm text-zinc-500 mb-2">
          综合占比：{shenqiang.totalScore}%
          {shenqiang.isZhuanWang && <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded">专旺格</span>}
          {shenqiang.isCongWang && <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">从旺格</span>}
        </div>
        <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              shenqiang.conclusion === '身强' ? 'bg-red-500' :
              shenqiang.conclusion === '身弱' ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${shenqiang.score}%` }}
          />
        </div>
      </div>

      {/* 三大核心指标 */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500">得令（月令）</span>
          <span className={shenqiang.deLing ? 'text-green-500 font-medium' : 'text-red-500'}>
            {shenqiang.deLing ? '✓ 当令' : '× 失令'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-500">得地（根基）</span>
          <span className={shenqiang.deDi ? 'text-green-500 font-medium' : 'text-red-500'}>
            {shenqiang.deDi ? `✓ 有根 (${shenqiang.analysis.diZhuTongFang}个)` : '× 无根'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-500">得助（帮扶）</span>
          <span className={shenqiang.deZhu ? 'text-green-500 font-medium' : 'text-red-500'}>
            {shenqiang.deZhu ? `✓ 有助 (${shenqiang.analysis.tianGanTongFang}个)` : '× 无助'}
          </span>
        </div>
      </div>

      {/* 数量统计 */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mb-3">
        <div className="text-xs text-zinc-500 mb-2">五行数量统计</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">天干</span>
            <span className="text-zinc-700 dark:text-zinc-300">
              同方{shenqiang.analysis.tianGanTongFang} / 异方{shenqiang.analysis.tianGanYiFang}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">地支主气</span>
            <span className="text-zinc-700 dark:text-zinc-300">
              同方{shenqiang.analysis.diZhuTongFang} / 异方{shenqiang.analysis.diZhuYiFang}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">藏干</span>
            <span className="text-zinc-700 dark:text-zinc-300">
              同方{shenqiang.analysis.cangGanTongFang} / 异方{shenqiang.analysis.cangGanYiFang}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">加权得分</span>
            <span className="text-zinc-700 dark:text-zinc-300">
              同方{shenqiang.analysis.weightTongFang} / 异方{shenqiang.analysis.weightYiFang}
            </span>
          </div>
        </div>
      </div>

      {/* 用神喜神忌神 */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 w-12">用神：</span>
          <span className="text-green-500 font-medium">{shenqiang.yongShen.join('、')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 w-12">喜神：</span>
          <span className="text-green-500 font-medium">{shenqiang.xiShen.join('、')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 w-12">忌神：</span>
          <span className="text-red-500 font-medium">{shenqiang.jiShen.join('、')}</span>
        </div>
        {shenqiang.xianShen && shenqiang.xianShen.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 w-12">闲神：</span>
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">{shenqiang.xianShen.join('、')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 流年运势面板
 */
function LiunianPanel({ liunian }: { liunian: LiunianInfo }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
        {currentYear} 年流年运势
      </h2>
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">
          {liunian.gan}{liunian.zhi}
        </div>
        <div className="text-sm text-zinc-500">
          生肖：{liunian.zodiac}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">天干</span>
          <span className="text-zinc-800 dark:text-zinc-200">{liunian.shiShen.tianGan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">地支</span>
          <span className="text-zinc-800 dark:text-zinc-200">{liunian.shiShen.diZhi.join('、')}</span>
        </div>
      </div>

      {liunian.keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {liunian.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
