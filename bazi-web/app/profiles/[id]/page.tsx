'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileReport from '@/components/ProfileReport';
import ChatPanel from '@/components/ChatPanel';
import {
  calculateBazi,
  calculateDayun,
  analyzeShenqiang,
  calculateLiunian,
  BaziResult,
  DayunInfo,
  ShenqiangResult,
  LiunianInfo
} from '@/lib/services/bazi';
import { UserProfile } from '@/lib/services/profile-store';

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bazi, setBazi] = useState<BaziResult | null>(null);
  const [dayun, setDayun] = useState<DayunInfo | null>(null);
  const [shenqiang, setShenqiang] = useState<ShenqiangResult | null>(null);
  const [liunian, setLiunian] = useState<LiunianInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/profiles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      const data = await response.json();
      setProfile(data);

      // 计算排盘数据
      const baziResult = calculateBazi(
        data.birthDate,
        data.birthTime,
        data.longitude,
        data.gender
      );
      setBazi(baziResult);

      // 计算大运
      const dayunResult = calculateDayun(
        data.birthDate,
        data.birthTime,
        data.gender,
        baziResult.nianZhu.gan,
        baziResult.yueZhu
      );
      setDayun(dayunResult);

      // 分析身强身弱
      const shenqiangResult = analyzeShenqiang(baziResult);
      setShenqiang(shenqiangResult);

      // 计算流年
      const currentYear = new Date().getFullYear();
      const liunianResult = calculateLiunian(currentYear, baziResult.riZhu.gan, [
        baziResult.nianZhu.zhi,
        baziResult.yueZhu.zhi,
        baziResult.riZhu.zhi,
        baziResult.shiZhu.zhi
      ]);
      setLiunian(liunianResult);

      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 animate-pulse tracking-widest font-light">推演命盘中...</p>
        </div>
      </div>
    );
  }

  if (error || !profile || !bazi || !dayun || !shenqiang || !liunian) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-md">
          <div className="text-5xl mb-6 opacity-50 grayscale">⚠️</div>
          <p className="text-zinc-300 mb-6 text-lg">{error || '档案不存在或权限不足'}</p>
          <button
            onClick={() => router.push('/profiles')}
            className="px-6 py-2.5 bg-zinc-100 text-black rounded-full hover:bg-white transition-colors font-medium"
          >
            返回档案列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full gap-4">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl mb-2 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/profiles')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-medium tracking-widest text-zinc-200">
              {profile.name} <span className="text-zinc-400 font-light mx-2">|</span> 命理全息解析
            </h1>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 tracking-widest">
          {profile.birthDate} {profile.birthTime}
        </div>
      </header>

      {/* Main Content - Floating Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 min-h-0">
        {/* Left: Profile Report */}
        <div className="rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl">
          <ProfileReport
            profile={profile}
            bazi={bazi}
            dayun={dayun}
            shenqiang={shenqiang}
            liunian={liunian}
          />
        </div>

        {/* Right: Chat Panel */}
        <div className="rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl">
          <ChatPanel
            profileId={profile.id}
            profileName={profile.name}
          />
        </div>
      </div>
    </div>
  );
}
