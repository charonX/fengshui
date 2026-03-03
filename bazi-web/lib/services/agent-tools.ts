/**
 * Agent Tools 定义
 * 为 Claude Agent 提供 Function Calling 工具
 */

import { Tool } from '@anthropic-ai/sdk/resources/messages';
import { calculateBazi, calculateDayun, calculateLiunian, analyzeShenqiang, BaziResult } from './bazi';
import { searchKnowledge } from './knowledge-search';
import { ProfileStore, UserProfile } from './profile-store';

// 存储实例（通过依赖注入）
let profileStoreInstance: ProfileStore | null = null;
let knowledgeDir: string | null = null;

/**
 * 初始化 Agent Tools
 */
export function initAgentTools(store: ProfileStore, knowledgeDirectory: string) {
  profileStoreInstance = store;
  knowledgeDir = knowledgeDirectory;
}

/**
 * 获取 profile store 实例
 */
function getProfileStore(): ProfileStore {
  if (!profileStoreInstance) {
    throw new Error('ProfileStore not initialized. Call initAgentTools first.');
  }
  return profileStoreInstance;
}

/**
 * 获取知识库目录
 */
function getKnowledgeDir(): string {
  if (!knowledgeDir) {
    throw new Error('Knowledge directory not configured.');
  }
  return knowledgeDir;
}

// ========== Tool Definitions ==========

/**
 * 1. calculate_bazi 工具
 */
export const calculateBaziTool: Tool = {
  name: 'calculate_bazi',
  description: '根据用户的出生日期和时间，计算八字排盘（四柱八字）。需要提供公历出生日期、时间和性别。',
  input_schema: {
    type: 'object',
    properties: {
      birthDate: {
        type: 'string',
        description: '公历出生日期，格式 YYYY-MM-DD'
      },
      birthTime: {
        type: 'string',
        description: '出生时间，格式 HH:mm'
      },
      birthPlace: {
        type: 'string',
        description: '出生地点（可选）'
      },
      longitude: {
        type: 'number',
        description: '出生地经度（可选），用于真太阳时校正'
      },
      gender: {
        type: 'string',
        enum: ['male', 'female'],
        description: '性别'
      }
    },
    required: ['birthDate', 'birthTime', 'gender']
  }
};

export async function executeCalculateBazi(args: {
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  longitude?: number;
  gender: 'male' | 'female';
}): Promise<BaziResult> {
  return calculateBazi(args.birthDate, args.birthTime, args.longitude, args.gender);
}

/**
 * 2. get_dayun 工具
 */
export const getDayunTool: Tool = {
  name: 'get_dayun',
  description: '根据八字排盘结果，计算大运信息。需要提供年干、月柱、性别和出生日期。',
  input_schema: {
    type: 'object',
    properties: {
      birthDate: {
        type: 'string',
        description: '公历出生日期，格式 YYYY-MM-DD'
      },
      birthTime: {
        type: 'string',
        description: '出生时间，格式 HH:mm'
      },
      nianGan: {
        type: 'string',
        description: '年干（甲、乙、丙、丁、戊、己、庚、辛、壬、癸）'
      },
      yueGan: {
        type: 'string',
        description: '月干'
      },
      yueZhi: {
        type: 'string',
        description: '月支'
      },
      gender: {
        type: 'string',
        enum: ['male', 'female'],
        description: '性别'
      }
    },
    required: ['birthDate', 'birthTime', 'nianGan', 'yueGan', 'yueZhi', 'gender']
  }
};

export async function executeGetDayun(args: {
  birthDate: string;
  birthTime: string;
  nianGan: string;
  yueGan: string;
  yueZhi: string;
  gender: 'male' | 'female';
}) {
  const { calculateDayun } = await import('./bazi');
  return calculateDayun(
    args.birthDate,
    args.birthTime,
    args.gender,
    args.nianGan,
    { gan: args.yueGan, zhi: args.yueZhi }
  );
}

/**
 * 3. get_liunian 工具
 */
export const getLiunianTool: Tool = {
  name: 'get_liunian',
  description: '计算指定年份的流年信息，包括干支、生肖、十神关系和运势关键词。',
  input_schema: {
    type: 'object',
    properties: {
      year: {
        type: 'number',
        description: '公历年份（如 2026）'
      },
      riGan: {
        type: 'string',
        description: '日主天干'
      },
      baziZhi: {
        type: 'array',
        items: { type: 'string' },
        description: '八字地支列表（用于计算刑冲合害）'
      }
    },
    required: ['year', 'riGan']
  }
};

export async function executeGetLiunian(args: {
  year: number;
  riGan: string;
  baziZhi?: string[];
}) {
  return calculateLiunian(args.year, args.riGan, args.baziZhi);
}

/**
 * 4. analyze_shenqiang 工具
 */
export const analyzeShenqiangTool: Tool = {
  name: 'analyze_shenqiang',
  description: '分析八字的身强身弱状态，并给出用神和忌神建议。需要提供完整的八字排盘结果。',
  input_schema: {
    type: 'object',
    properties: {
      nianGan: { type: 'string', description: '年干' },
      nianZhi: { type: 'string', description: '年支' },
      yueGan: { type: 'string', description: '月干' },
      yueZhi: { type: 'string', description: '月支' },
      riGan: { type: 'string', description: '日干' },
      riZhi: { type: 'string', description: '日支' },
      shiGan: { type: 'string', description: '时干' },
      shiZhi: { type: 'string', description: '时支' }
    },
    required: ['nianGan', 'nianZhi', 'yueGan', 'yueZhi', 'riGan', 'riZhi', 'shiGan', 'shiZhi']
  }
};

export async function executeAnalyzeShenqiang(args: {
  nianGan: string;
  nianZhi: string;
  yueGan: string;
  yueZhi: string;
  riGan: string;
  riZhi: string;
  shiGan: string;
  shiZhi: string;
}) {
  const result: BaziResult = {
    nianZhu: { gan: args.nianGan, zhi: args.nianZhi },
    yueZhu: { gan: args.yueGan, zhi: args.yueZhi },
    riZhu: { gan: args.riGan, zhi: args.riZhi },
    shiZhu: { gan: args.shiGan, zhi: args.shiZhi },
    wuXing: { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 },
    shiShen: {
      nianGan: '',
      yueGan: '',
      shiGan: '',
      nianZhi: [],
      yueZhi: [],
      riZhi: [],
      shiZhi: []
    },
    zodiac: args.nianZhi,
    jieQi: []
  };
  return analyzeShenqiang(result);
}

/**
 * 5. search_knowledge 工具
 */
export const searchKnowledgeTool: Tool = {
  name: 'search_knowledge',
  description: '在知识库中检索八字命理相关的内容。支持关键词搜索，可指定分类和返回数量。',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '搜索关键词'
      },
      category: {
        type: 'string',
        enum: ['basics', 'shishen', 'yunshi', 'cases'],
        description: '指定分类（可选）'
      },
      topN: {
        type: 'number',
        description: '返回结果数量（默认 5）'
      }
    },
    required: ['query']
  }
};

export async function executeSearchKnowledge(args: {
  query: string;
  category?: string;
  topN?: number;
}) {
  return searchKnowledge(getKnowledgeDir(), args.query, args.category, args.topN || 5);
}

/**
 * 6. get_profile 工具
 */
export const getProfileTool: Tool = {
  name: 'get_profile',
  description: '根据档案 ID 获取用户档案信息，包括基本资料和排盘结果。',
  input_schema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '档案 ID'
      }
    },
    required: ['id']
  }
};

export async function executeGetProfile(args: { id: string }): Promise<UserProfile | null> {
  return getProfileStore().getProfile(args.id);
}

/**
 * 7. save_profile 工具
 */
export const saveProfileTool: Tool = {
  name: 'save_profile',
  description: '保存用户档案，包括姓名、出生日期时间、地点、性别等信息。保存时会自动计算排盘结果。',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '姓名' },
      birthDate: { type: 'string', description: '出生日期 YYYY-MM-DD' },
      birthTime: { type: 'string', description: '出生时间 HH:mm' },
      birthPlace: { type: 'string', description: '出生地点（可选）' },
      longitude: { type: 'number', description: '出生地经度（可选）' },
      gender: { type: 'string', enum: ['male', 'female'], description: '性别' }
    },
    required: ['name', 'birthDate', 'birthTime', 'gender']
  }
};

export async function executeSaveProfile(args: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  longitude?: number;
  gender: 'male' | 'female';
}): Promise<UserProfile> {
  return getProfileStore().saveProfile(args);
}

/**
 * 8. list_profiles 工具
 */
export const listProfilesTool: Tool = {
  name: 'list_profiles',
  description: '列出所有用户档案的摘要信息。',
  input_schema: {
    type: 'object',
    properties: {}
  }
};

export async function executeListProfiles(): Promise<UserProfile[]> {
  return getProfileStore().listProfiles();
}

/**
 * 获取所有工具定义
 */
export function getAllTools(): Tool[] {
  return [
    calculateBaziTool,
    getDayunTool,
    getLiunianTool,
    analyzeShenqiangTool,
    searchKnowledgeTool,
    getProfileTool,
    saveProfileTool,
    listProfilesTool
  ];
}
