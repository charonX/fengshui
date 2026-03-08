'use client';

import React from 'react';
import Link from 'next/link';

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

interface ProfileCardProps {
  profile: Profile;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ProfileCard({ profile, onView, onDelete }: ProfileCardProps) {
  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onView) {
      onView(profile.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      onDelete(profile.id);
    }
  };

  return (
    <Link
      href={`/profiles/${profile.id}`}
      className="block p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{profile.name}</h3>
          <p className="text-sm text-zinc-400">
            {profile.birthDate} {profile.birthTime} · {profile.gender === 'male' ? '男' : '女'}
          </p>
          {profile.birthPlace && (
            <p className="text-xs text-zinc-400 mt-1">
              {profile.birthPlace}
              {profile.longitude != null && `（东经${profile.longitude.toFixed(1)}°）`}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleView}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            查看详情
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            删除
          </button>
        </div>
      </div>
    </Link>
  );
}
