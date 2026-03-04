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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-zinc-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !profile || !bazi || !dayun || !shenqiang || !liunian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error || '档案不存在'}</p>
          <button
            onClick={() => router.push('/profiles')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            返回档案列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <button
          onClick={() => router.push('/profiles')}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {profile.name} - 命理分析
        </h1>
        <div className="w-6" /> {/* Spacer */}
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 grid grid-cols-[380px_1fr] overflow-hidden">
        {/* Left: Profile Report */}
        <div className="border-r border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
          <ProfileReport
            profile={profile}
            bazi={bazi}
            dayun={dayun}
            shenqiang={shenqiang}
            liunian={liunian}
          />
        </div>

        {/* Right: Chat Panel */}
        <div className="overflow-hidden">
          <ChatPanel
            profileId={profile.id}
            profileName={profile.name}
          />
        </div>
      </div>
    </div>
  );
}
