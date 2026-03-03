/**
 * Chat API Handler
 * 处理与 AI 模型的对话请求
 */

import Anthropic from '@anthropic-ai/sdk';
import { getAllTools, executeCalculateBazi, executeGetDayun, executeGetLiunian, executeAnalyzeShenqiang, executeSearchKnowledge, executeGetProfile, executeSaveProfile, executeListProfiles } from './agent-tools';

// 初始化 Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined
});

// Agent System Prompt
const SYSTEM_PROMPT = `你是一位亲切友好的八字命理师，像朋友一样帮助用户解读他们的命理。

你的特点：
1. 使用通俗易懂的语言，避免过多专业术语
2. 对初学者耐心解释基本概念
3. 对进阶学习者可以提供更深入的分析
4. 保持客观、理性的态度，不制造恐慌或过度承诺

当用户询问八字相关问题时：
1. 首先使用 calculate_bazi 工具获取用户的八字信息
2. 根据用户的问题，可能需要调用：
   - get_dayun：分析大运走势
   - get_liunian：分析流年运势
   - analyze_shenqiang：分析身强身弱和用神忌神
   - search_knowledge：检索专业命理知识
3. 结合工具返回的结果，用朋友式的语气给出解读

当用户询问运势时：
1. 先获取用户的八字（如果还没有）
2. 调用 get_dayun 查看当前大运
3. 调用 get_liunian 查看流年
4. 综合解读运势走向

当用户问题模糊时：
- 主动询问澄清问题
- 引导用户提供更多背景信息

记住：你是来帮助用户了解他们自己，而不是制造焦虑。用温暖、鼓励的语气进行交流。`;

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

  // 构建消息历史
  const messages: Anthropic.Messages.MessageParam[] = request.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  // 调用 API
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'qwen3.5-plus',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
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
      system: SYSTEM_PROMPT,
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
