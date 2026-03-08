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
    <div className="h-full overflow-y-auto p-2 sm:p-4 space-y-6 custom-scrollbar">
      {/* 基本信息 */}
      <div className="pb-8 border-b border-zinc-800 border-dashed">
        <h2 className="text-sm font-mono tracking-widest text-zinc-400 mb-4 uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 基本信息
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
            <span className="text-zinc-400">姓名</span>
            <span className="text-zinc-200 font-medium tracking-wide">{profile.name}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
            <span className="text-zinc-400">性别</span>
            <span className="text-zinc-300">
              {profile.gender === 'male' ? '男' : '女'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
            <span className="text-zinc-400">生日</span>
            <span className="text-zinc-300 font-mono tracking-wider">{profile.birthDate}</span>
          </div>
          <div className="flex justify-between items-start border-b border-white/[0.02] pb-2">
            <span className="text-zinc-400 mt-1">出生时间</span>
            <div className="text-right">
              <span className="text-zinc-300 font-mono tracking-wider">{profile.birthTime}</span>
              {profile.longitude != null && (
                <div className="text-xs text-zinc-400 mt-1">
                  真太阳时: {formatTrueSolarTime(profile.birthTime, profile.longitude).trueSolarTime}
                </div>
              )}
            </div>
          </div>
          {profile.birthPlace && (
            <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
              <span className="text-zinc-400">出生地</span>
              <span className="text-zinc-300">{profile.birthPlace}</span>
            </div>
          )}
          {profile.longitude != null && (
            <div className="flex justify-between items-start pt-1">
              <span className="text-zinc-400">经度</span>
              <div className="text-right text-zinc-300 font-mono text-xs">
                东经 {profile.longitude.toFixed(1)}°
                <div className="text-zinc-400 mt-1 lowercase">
                  ({formatTrueSolarTime(profile.birthTime, profile.longitude).description})
                </div>
              </div>
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
    <div className="pb-8 border-b border-zinc-800 border-dashed relative overflow-hidden">
      <div className="absolute -right-4 -top-4 text-7xl opacity-[0.02] select-none pointer-events-none font-serif">命</div>
      <h2 className="text-sm font-mono tracking-widest text-zinc-400 mb-6 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 八字原局
      </h2>
      <div className="grid grid-cols-4 gap-3 relative z-10 pt-4">
        {/* 年柱 */}
        <div className="text-center font-serif">
          <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-2">年柱</div>
          <div className="text-2xl font-bold tracking-widest text-zinc-400">
            {bazi.nianZhu.gan}<br />{bazi.nianZhu.zhi}
          </div>
        </div>
        {/* 月柱 */}
        <div className="text-center font-serif">
          <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-2">月柱</div>
          <div className="text-2xl font-bold tracking-widest text-zinc-400">
            {bazi.yueZhu.gan}<br />{bazi.yueZhu.zhi}
          </div>
        </div>
        {/* 日柱 */}
        <div className="text-center font-serif">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white mb-2 relative z-10">命主</div>
          <div className="text-2xl font-bold tracking-widest text-white relative z-10">
            {bazi.riZhu.gan}<br />{bazi.riZhu.zhi}
          </div>
        </div>
        {/* 时柱 */}
        <div className="text-center font-serif">
          <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-2">时柱</div>
          <div className="text-2xl font-bold tracking-widest text-zinc-400">
            {bazi.shiZhu.gan}<br />{bazi.shiZhu.zhi}
          </div>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-white/[0.05] text-xs font-mono text-zinc-400 flex justify-between px-2">
        <span>日主：<span className="text-white">{bazi.riZhu.gan}</span></span>
        <span>生肖：<span className="text-white">{bazi.zodiac}</span></span>
      </div>
    </div>
  );
}

/**
 * 五行统计面板
 */
function WuxingPanel({ wuXing }: { wuXing: BaziResult['wuXing'] }) {
  const total = Object.values(wuXing).reduce((a, b) => a + b, 0);

  const wuXingData = [
    { name: '金', value: wuXing.jin },
    { name: '木', value: wuXing.mu },
    { name: '水', value: wuXing.shui },
    { name: '火', value: wuXing.huo },
    { name: '土', value: wuXing.tu }
  ];

  return (
    <div className="pb-8 border-b border-zinc-800 border-dashed">
      <h2 className="text-sm font-mono tracking-widest text-zinc-400 mb-5 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 五行分布
      </h2>
      <div className="space-y-4">
        {wuXingData.map((item) => (
          <div key={item.name} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm text-zinc-400">
              {item.name}
            </div>
            <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 transition-all duration-700 ease-out"
                style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-mono text-zinc-400 w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-white/[0.05] text-xs font-mono text-zinc-400 text-center">
        总数：{total}
      </div>
    </div>
  );
}

/**
 * 大运走势面板
 */
function DayunPanel({ dayun }: { dayun: DayunInfo }) {
  return (
    <div className="pb-8 border-b border-zinc-800 border-dashed relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.02] select-none pointer-events-none font-serif">运</div>
      <h2 className="text-sm font-mono tracking-widest text-zinc-400 mb-2 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 大运十年
      </h2>
      <div className="text-xs font-mono text-zinc-400 mb-5 text-right">
        {dayun.qiYunAge} 岁交运
      </div>
      <div className="grid grid-cols-4 gap-2 relative z-10">
        {dayun.dayunList.slice(0, 8).map((step, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 transition-colors hover:bg-zinc-800">
            <div className="text-lg tracking-widest font-medium text-zinc-300 mb-1">
              {step.gan}{step.zhi}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono tracking-tighter">
              {step.startAge}-{step.endAge}岁
            </div>
            <div className="text-[10px] text-zinc-400 font-mono opacity-50">
              {step.startYear}
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
    <div className="pb-8 border-b border-zinc-800 border-dashed relative overflow-hidden">
      <h2 className="text-sm font-mono tracking-widest text-zinc-400 mb-5 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 日主强弱
      </h2>

      {/* 综合结论 */}
      <div className="mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-2xl font-medium tracking-widest text-white">
            {shenqiang.conclusion}
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            定性：{shenqiang.dingXingLevel}
          </div>
        </div>
        <div className="text-xs text-zinc-400 mb-3 flex justify-between font-mono">
          <span>定量：{shenqiang.dingLiangLevel}</span>
          <span>同方 {shenqiang.tongFangScore} / 异方 {shenqiang.yiFangScore}</span>
        </div>
        <div className="text-xs text-zinc-400 mb-4 flex items-center gap-3">
          <span>综合占比：{shenqiang.totalScore}%</span>
          {shenqiang.isZhuanWang && <span className="px-2 py-0.5 border border-zinc-700 bg-zinc-800 text-white rounded font-mono">专旺格</span>}
          {shenqiang.isCongWang && <span className="px-2 py-0.5 border border-zinc-700 bg-zinc-800 text-white rounded font-mono">从旺格</span>}
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-400"
            style={{ width: `${shenqiang.score}%` }}
          />
        </div>
      </div>

      {/* 三大核心指标 */}
      <div className="space-y-3 text-sm mb-6 pb-6 border-b border-white/[0.05]">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">得令 (月令)</span>
          <span className={shenqiang.deLing ? 'text-zinc-200' : 'text-zinc-400'}>
            {shenqiang.deLing ? '✓ 当令' : '× 失令'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">得地 (根基)</span>
          <span className={shenqiang.deDi ? 'text-zinc-200' : 'text-zinc-400'}>
            {shenqiang.deDi ? `✓ 有根 (${shenqiang.analysis.diZhuTongFang})` : '× 无根'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">得助 (帮扶)</span>
          <span className={shenqiang.deZhu ? 'text-zinc-200' : 'text-zinc-400'}>
            {shenqiang.deZhu ? `✓ 有助 (${shenqiang.analysis.tianGanTongFang})` : '× 无助'}
          </span>
        </div>
      </div>

      {/* 喜忌 */}
      <div className="space-y-4 text-sm font-mono bg-zinc-900/30 p-4 rounded-xl border border-white/[0.02]">
        <div className="flex items-start gap-4">
          <span className="text-zinc-400 w-12 shrink-0 pt-0.5 uppercase text-xs">Favored</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">用神</span>
              <span className="text-zinc-200">{shenqiang.yongShen.join(' · ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">喜神</span>
              <span className="text-zinc-300">{shenqiang.xiShen.join(' · ')}</span>
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-white/[0.05]" />
        <div className="flex items-start gap-4">
          <span className="text-zinc-400 w-12 shrink-0 pt-0.5 uppercase text-xs">Avoid</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">忌神</span>
              <span className="text-zinc-400">{shenqiang.jiShen.join(' · ')}</span>
            </div>
            {shenqiang.xianShen && shenqiang.xianShen.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">闲神</span>
                <span className="text-zinc-400">{shenqiang.xianShen.join(' · ')}</span>
              </div>
            )}
          </div>
        </div>
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
    <div className="pb-8 relative overflow-hidden">
      <div className="absolute -right-2 -top-6 text-8xl opacity-[0.02] select-none pointer-events-none font-serif">年</div>
      <h2 className="text-sm font-mono tracking-widest text-zinc-400 mb-6 uppercase flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 流年运势
        </div>
        <span className="text-zinc-400 border border-white/10 px-2 py-0.5 rounded text-xs">{currentYear}</span>
      </h2>

      <div className="flex items-center gap-6 mb-6">
        <div className="text-4xl font-light tracking-widest border-r border-white/10 pr-6 text-white">
          {liunian.gan}{liunian.zhi}
        </div>
        <div className="flex flex-col gap-1 text-sm text-zinc-400">
          <div className="flex gap-4">
            <span>天干</span>
            <span className="text-zinc-300">{liunian.shiShen.tianGan}</span>
          </div>
          <div className="flex gap-4">
            <span>地支</span>
            <span className="text-zinc-300">{liunian.shiShen.diZhi.join(' · ')}</span>
          </div>
        </div>
      </div>

      {liunian.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.05]">
          {liunian.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 text-zinc-300 text-xs rounded-lg uppercase tracking-wider font-mono"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
