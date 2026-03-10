'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CITIES, getCitiesByProvince, findCityByName } from '@/lib/data/cities';

interface Profile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  birthPlace?: string;
  longitude?: number;
  createdAt: string;
}

interface FormData {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  birthPlace: string;
  province: string;
  longitude?: number;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: 'male',
    birthPlace: '',
    province: '',
    longitude: undefined
  });

  // 按省份分组的城市
  const citiesByProvince = useMemo(() => getCitiesByProvince(), []);
  const provinces = Object.keys(citiesByProvince);

  // 当前选中省份的城市列表
  const currentProvinceCities = formData.province ? citiesByProvince[formData.province] : [];

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 构建提交数据
    const submitData = {
      name: formData.name,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      gender: formData.gender,
      birthPlace: formData.province || formData.birthPlace,
      longitude: formData.longitude
    };

    try {
      let response;
      if (editingId) {
        // 编辑模式
        response = await fetch(`/api/profiles/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      } else {
        // 新建模式
        response = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      }

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', birthDate: '', birthTime: '', gender: 'male', birthPlace: '', province: '', longitude: undefined });
        loadProfiles();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/profiles/${id}`);
      if (response.ok) {
        const profile = await response.json();

        // 查找对应的城市信息
        let province = '';
        if (profile.birthPlace) {
          // 尝试从 birthPlace 中提取省份
          const city = CITIES.find(c => profile.birthPlace.includes(c.name));
          if (city) {
            province = city.province;
          }
        }

        setFormData({
          name: profile.name,
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          gender: profile.gender,
          birthPlace: profile.birthPlace || '',
          province,
          longitude: profile.longitude
        });
        setEditingId(id);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Failed to load profile for editing:', error);
    }
  };

  const handleProvinceChange = (province: string) => {
    setFormData({
      ...formData,
      province,
      birthPlace: province,
      longitude: undefined // 重置经度，等待选择城市
    });
  };

  const handleCityChange = (cityName: string) => {
    const city = findCityByName(cityName);
    setFormData({
      ...formData,
      province: formData.province, // 保留省份
      birthPlace: city ? `${city.province}${city.name}` : cityName,
      longitude: city?.longitude
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个档案吗？')) return;
    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      loadProfiles();
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 border-b border-stone-800 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">我的命理档案</h1>
          <p className="text-stone-400 text-sm font-mono uppercase tracking-widest">Profile Management System</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="group relative px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-lg leading-none">+</span> 新建档案
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-stone-400 animate-pulse tracking-widest font-light">正在推演天机...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-3xl bg-white/[0.01] border border-white/[0.05] backdrop-blur-md">
            <div className="text-6xl mb-4 opacity-30 grayscale filter">📜</div>
            <p className="text-stone-400 mb-6 font-light">暂无命理档案记录</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-stone-300 hover:text-white font-medium px-4 py-2 border border-stone-700 rounded-full hover:bg-white/5 transition-colors"
            >
              创建第一个档案
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="group py-6 border-b border-stone-800 hover:border-stone-700 transition-colors flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      {profile.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 border border-stone-800 text-stone-400 uppercase tracking-widest">
                      {profile.gender === 'male' ? '乾造' : '坤造'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-stone-400 mt-2">
                    <span>
                      {profile.birthDate} {profile.birthTime}
                    </span>
                    {profile.birthPlace && (
                      <span className="flex items-center before:content-[''] before:w-1 before:h-1 before:bg-stone-800 before:rounded-full before:mr-4">
                        {profile.birthPlace} {profile.longitude != null && `(E${profile.longitude.toFixed(1)}°)`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(profile.id)}
                    className="text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-white transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-red-500 transition-colors"
                  >
                    删除
                  </button>
                  <Link
                    href={`/profiles/${profile.id}`}
                    className="ml-4 px-4 py-2 border border-stone-800 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    查看分析 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-stone-800 p-8 sm:p-12 w-full max-w-2xl relative overflow-hidden">
            <h2 className="text-2xl font-extrabold mb-8 text-white tracking-widest uppercase">
              {editingId ? '编辑档案信息 / Edit Profile' : '创建新档案 / Initialize Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono tracking-widest text-stone-400 mb-2 uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-b border-stone-800 focus:border-white bg-transparent text-white placeholder-stone-700 transition-colors outline-none"
                  placeholder="输入姓名或化名"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono tracking-widest text-stone-400 mb-2 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2.5 border-b border-stone-800 focus:border-white bg-transparent text-white css-invert-calendar-icon outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest text-stone-400 mb-2 uppercase">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full px-4 py-2.5 border-b border-stone-800 focus:border-white bg-transparent text-white outline-none transition-colors css-invert-calendar-icon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono tracking-widest text-stone-400 mb-2 uppercase">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2.5 border-b border-stone-800 focus:border-white bg-transparent text-white outline-none transition-colors"
                  >
                    <option value="male" className="bg-stone-900 border-0">男 (乾造)</option>
                    <option value="female" className="bg-stone-900 border-0">女 (坤造)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest text-stone-400 mb-2 uppercase">Location (Province)</label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-4 py-2.5 border-b border-stone-800 focus:border-white bg-transparent text-white outline-none transition-colors"
                  >
                    <option value="" className="bg-stone-900 text-stone-400">(可选) 地区</option>
                    {provinces.map(province => (
                      <option key={province} value={province} className="bg-stone-900">{province}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.province && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                  <label className="block text-xs font-mono tracking-widest text-stone-400 mb-2 uppercase flex items-center justify-between">
                    <span>City <span className="text-stone-400 lowercase opacity-70 ml-1">*for solar time correction</span></span>
                  </label>
                  <select
                    value={currentProvinceCities.find(c => c.longitude === formData.longitude)?.name || ''}
                    onChange={(e) => {
                      const cityName = e.target.value;
                      const city = currentProvinceCities.find(c => c.name === cityName);
                      if (city) {
                        handleCityChange(cityName);
                      }
                    }}
                    className="w-full px-4 py-2.5 border-b border-stone-800 focus:border-white bg-transparent text-white outline-none transition-colors"
                  >
                    <option value="" className="bg-stone-900 text-stone-400">选择具体城市</option>
                    {currentProvinceCities.map(city => (
                      <option key={city.name} value={city.name} className="bg-stone-900">
                        {city.name} (E{city.longitude.toFixed(1)}°)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-10 mt-4 border-t border-stone-800 border-dashed">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', birthDate: '', birthTime: '', gender: 'male', birthPlace: '', province: '', longitude: undefined });
                  }}
                  className="flex-1 px-4 py-4 border border-stone-800 hover:bg-stone-900 text-stone-400 font-bold tracking-widest uppercase text-xs transition-colors"
                >
                  取消 Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-white hover:bg-stone-300 text-black font-bold tracking-widest uppercase text-xs transition-colors"
                >
                  {editingId ? '保存 Save Changes' : '推演 Execute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
