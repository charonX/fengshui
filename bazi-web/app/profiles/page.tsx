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
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <Link
          href="/"
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">档案管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700"
        >
          新建
        </button>
      </header>

      {/* Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">加载中...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-zinc-500 mb-4">暂无档案</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-amber-600 hover:text-amber-700"
            >
              创建第一个档案
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{profile.name}</h3>
                  <p className="text-sm text-zinc-500">
                    {profile.birthDate} {profile.birthTime} · {profile.gender === 'male' ? '男' : '女'}
                  </p>
                  {profile.birthPlace && (
                    <p className="text-xs text-zinc-400 mt-1">
                      {profile.birthPlace}
                      {profile.longitude != null && `（东经${profile.longitude.toFixed(1)}°）`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(profile.id)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    编辑
                  </button>
                  <Link
                    href={`/profiles/${profile.id}`}
                    className="text-amber-600 hover:text-amber-700 text-sm"
                  >
                    查看
                  </Link>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
              {editingId ? '编辑档案' : '新建档案'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">姓名</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">出生日期</label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">出生时间</label>
                <input
                  type="time"
                  required
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">性别</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">出生省份/地区</label>
                <select
                  value={formData.province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                >
                  <option value="">请选择省份</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              {formData.province && (
                <div>
                  <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    出生城市
                    <span className="text-xs text-zinc-500 ml-2">（用于真太阳时校正）</span>
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
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">请选择城市</option>
                    {currentProvinceCities.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}（东经{city.longitude.toFixed(1)}°）
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', birthDate: '', birthTime: '', gender: 'male', birthPlace: '', province: '', longitude: undefined });
                  }}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {editingId ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
