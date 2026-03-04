/**
 * 聊天 API Handler
 * 处理与 AI 模型的对话请求
 */

import Anthropic from '@anthropic-ai/sdk';
import { getAllTools, executeCalculateBazi, executeGetDayun, executeGetLiunian, executeAnalyzeShenqiang, executeSearchKnowledge, executeGetProfile, executeSaveProfile, executeListProfiles } from './agent-tools';
import { calculateBazi, calculateDayun, analyzeShenqiang, calculateLiunian } from './bazi';

// 初始化 Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined
});

/**
 * 根据档案信息计算完整的命理数据
 */
async function buildProfileContext(profileInfo: any) {
  try {
    // 计算八字
    const bazi = calculateBazi(
      profileInfo.birthDate,
      profileInfo.birthTime,
      profileInfo.longitude,
      profileInfo.gender
    );

    // 计算大运
    const dayun = calculateDayun(
      profileInfo.birthDate,
      profileInfo.birthTime,
      profileInfo.gender,
      bazi.nianZhu.gan,
      bazi.yueZhu
    );

    // 分析身强身弱
    const shenqiang = analyzeShenqiang(bazi);

    // 计算当前流年
    const currentYear = new Date().getFullYear();
    const liunian = calculateLiunian(
      currentYear,
      bazi.riZhu.gan,
      [bazi.nianZhu.zhi, bazi.yueZhu.zhi, bazi.riZhu.zhi, bazi.shiZhu.zhi]
    );

    return {
      bazi,
      dayun,
      shenqiang,
      liunian,
      currentYear
    };
  } catch (error) {
    console.error('Failed to build profile context:', error);
    return null;
  }
}

// Agent System Prompt 模板
function buildSystemPrompt(profileContext?: {
  profile: any;
  baziData: any;
}) {
  const basePrompt = `你是一位亲切友好的八字命理师，像朋友一样帮助用户解读他们的命理。

你的特点：
1. 使用通俗易懂的语言，避免过多专业术语
2. 对初学者耐心解释基本概念
3. 对进阶学习者可以提供更深入的分析
4. 保持客观、理性的态度，不制造恐慌或过度承诺
5. 优先使用已提供的命理数据进行分析，避免重复计算

当用户询问八字相关问题时：
1. 如果已提供用户档案和排盘信息，直接使用已有信息
2. 如果没有档案信息，使用 calculate_bazi 工具获取用户的八字信息
3. 根据用户的问题，可能需要调用：
   - get_dayun：分析大运走势
   - get_liunian：分析流年运势
   - analyze_shenqiang：分析身强身弱和用神忌神
   - search_knowledge：检索专业命理知识
4. 结合工具返回的结果，用朋友式的语气给出解读

当用户询问运势时：
1. 先查看已提供的上下文信息
2. 如果需要更多细节，再调用 get_dayun 或 get_liunian
3. 综合解读运势走向

当用户问题模糊时：
- 主动询问澄清问题
- 引导用户提供更多背景信息

记住：你是来帮助用户了解他们自己，而不是制造焦虑。用温暖、鼓励的语气进行交流。`;

  if (profileContext) {
    const { profile, baziData } = profileContext;
    return `${basePrompt}

【当前用户档案信息】
- 姓名：${profile.name}
- 性别：${profile.gender === 'male' ? '男' : '女'}
- 出生日期：${profile.birthDate}
- 出生时间：${profile.birthTime}${profile.birthPlace ? `
- 出生地点：${profile.birthPlace}` : ''}${profile.longitude != null ? `
- 经度：东经${profile.longitude.toFixed(1)}°（用于真太阳时校正）` : ''}

【用户八字排盘结果】
四柱：
  年柱：${baziData.bazi.nianZhu.gan}${baziData.bazi.nianZhu.zhi}
  月柱：${baziData.bazi.yueZhu.gan}${baziData.bazi.yueZhu.zhi}
  日柱：${baziData.bazi.riZhu.gan}${baziData.bazi.riZhu.zhi}（日主：${baziData.bazi.riZhu.gan}）
  时柱：${baziData.bazi.shiZhu.gan}${baziData.bazi.shiZhu.zhi}

五行统计：
  金：${baziData.bazi.wuXing.jin}个
  木：${baziData.bazi.wuXing.mu}个
  水：${baziData.bazi.wuXing.shui}个
  火：${baziData.bazi.wuXing.huo}个
  土：${baziData.bazi.wuXing.tu}个
${baziData.bazi.wuXing.jin === 0 || baziData.bazi.wuXing.mu === 0 || baziData.bazi.wuXing.shui === 0 || baziData.bazi.wuXing.huo === 0 || baziData.bazi.wuXing.tu === 0 ? `
⚠️ 五行缺失：${baziData.bazi.wuXing.jin === 0 ? '金 ' : ''}${baziData.bazi.wuXing.mu === 0 ? '木 ' : ''}${baziData.bazi.wuXing.shui === 0 ? '水 ' : ''}${baziData.bazi.wuXing.huo === 0 ? '火 ' : ''}${baziData.bazi.wuXing.tu === 0 ? '土 ' : ''}` : ''}

十神关系（以日主${baziData.bazi.riZhu.gan}为基准）：
  年干：${baziData.bazi.shiShen.nianGan}
  月干：${baziData.bazi.shiShen.yueGan}
  时干：${baziData.bazi.shiShen.shiGan}

【身强身弱分析】
定性评估：${baziData.shenqiang.dingXingLevel}（${baziData.shenqiang.conclusion}）
定量等级：${baziData.shenqiang.dingLiangLevel}
同方得分：${baziData.shenqiang.tongFangScore} | 异方得分：${baziData.shenqiang.yiFangScore}
综合占比：${baziData.shenqiang.totalScore}%
特殊格局：${baziData.shenqiang.isZhuanWang ? '专旺格' : baziData.shenqiang.isCongWang ? '从旺格' : '普通格局'}
用神：${baziData.shenqiang.yongShen.join('、')}
喜神：${baziData.shenqiang.xiShen.join('、')}
忌神：${baziData.shenqiang.jiShen.join('、')}${baziData.shenqiang.xianShen && baziData.shenqiang.xianShen.length > 0 ? `
闲神：${baziData.shenqiang.xianShen.join('、')}` : ''}
三大指标：
  - 得令（月令）：${baziData.shenqiang.deLing ? '是' : '否'}
  - 得地（根基）：${baziData.shenqiang.deDi ? '是' : '否'}（地支${baziData.shenqiang.analysis.diZhuTongFang}个同方）
  - 得助（帮扶）：${baziData.shenqiang.deZhu ? '是' : '否'}（天干${baziData.shenqiang.analysis.tianGanTongFang}个同方）
数量统计：
  - 天干：同方${baziData.shenqiang.analysis.tianGanTongFang}个 | 异方${baziData.shenqiang.analysis.tianGanYiFang}个
  - 地支主气：同方${baziData.shenqiang.analysis.diZhuTongFang}个 | 异方${baziData.shenqiang.analysis.diZhuYiFang}个
  - 藏干：同方${baziData.shenqiang.analysis.cangGanTongFang}个 | 异方${baziData.shenqiang.analysis.cangGanYiFang}个
  - 基础总分：同方${baziData.shenqiang.analysis.jiChuTongFang} | 异方${baziData.shenqiang.analysis.jiChuYiFang}
  - 加权得分：同方${baziData.shenqiang.analysis.weightTongFang} | 异方${baziData.shenqiang.analysis.weightYiFang}

【大运信息】
起运年龄：${baziData.dayun.qiYunAge}岁
大运序列：
${baziData.dayun.dayunList.slice(0, 6).map((step: any, i: number) => `  ${i + 1}. ${step.gan}${step.zhi}（${step.startAge}-${step.endAge}岁，${step.startYear}-${step.endYear}年）`).join('\n')}

【${baziData.currentYear}年流年运势】
流年：${baziData.liunian.gan}${baziData.liunian.zhi}
生肖：${baziData.liunian.zodiac}
天干十神：${baziData.liunian.shiShen.tianGan}
关键词：${baziData.liunian.keywords.join('、')}

你已经掌握了这个用户的完整命理信息，可以直接基于这些信息进行深入分析，不需要再调用工具获取基本信息。`}

  return basePrompt;
}

/**
 * 处理工具调用
 */
async function handleToolUse(name: string, input: any): Promise<any> {
  switch (name) {
    case 'calculate_bazi':
      return await executeCalculateBazi(input);
    case 'get_dayun':
      return await executeGetDayun(input);
    case 'get_liunian':
      return await executeGetLiunian(input);
    case 'analyze_shenqiang':
      return await executeAnalyzeShenqiang(input);
    case 'search_knowledge':
      return await executeSearchKnowledge(input);
    case 'get_profile':
      return await executeGetProfile(input);
    case 'save_profile':
      return await executeSaveProfile(input);
    case 'list_profiles':
      return await executeListProfiles();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * 消息类型
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * 聊天请求
 */
export interface ChatRequest {
  messages: ChatMessage[];
  profileId?: string;
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  content: string;
  toolCalls?: { name: string; input: any; id: string }[];
}

/**
 * 处理聊天请求
 */
export async function handleChat(request: ChatRequest): Promise<ChatResponse> {
  const tools = getAllTools();

  // 如果有 profileId，获取档案信息并计算完整上下文
  let profileInfo: any = undefined;
  let profileContext: any = undefined;

  if (request.profileId) {
    try {
      profileInfo = await executeGetProfile({ id: request.profileId });
      if (profileInfo) {
        // 计算完整的命理上下文
        profileContext = await buildProfileContext(profileInfo);
      }
    } catch (error) {
      console.error('Failed to get profile:', error);
    }
  }

  // 构建系统提示
  const systemPrompt = buildSystemPrompt(profileContext ? {
    profile: profileInfo,
    baziData: profileContext
  } : undefined);

  // 构建消息历史
  const messages: Anthropic.Messages.MessageParam[] = request.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  // 调用 API
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'qwen3.5-plus',
    max_tokens: 4096,
    system: systemPrompt,
    tools,
    messages
  });

  // 处理响应
  const contentBlocks = response.content;
  let textContent = '';
  const toolCalls: { name: string; input: any; id: string }[] = [];

  for (const block of contentBlocks) {
    if (block.type === 'text') {
      textContent += block.text;
    } else if (block.type === 'tool_use') {
      toolCalls.push({
        id: block.id,
        name: block.name,
        input: block.input as any
      });
    }
  }

  // 如果有工具调用，执行它们
  if (toolCalls.length > 0) {
    const toolResults: any[] = [];

    for (const toolCall of toolCalls) {
      try {
        const result = await handleToolUse(toolCall.name, toolCall.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(result)
        });
      } catch (error) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: `Error: ${error}`
        });
      }
    }

    // 发送工具结果回给模型
    const toolResponse = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'qwen3.5-plus',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: [
            { type: 'text', text: textContent },
            ...toolCalls.map(tc => ({
              type: 'tool_use' as const,
              id: tc.id,
              name: tc.name,
              input: tc.input
            }))
          ]
        },
        {
          role: 'user',
          content: toolResults
        }
      ]
    });

    // 提取最终文本响应
    textContent = '';
    for (const block of toolResponse.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }
  }

  return {
    content: textContent,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined
  };
}
