/**
 * 知识库检索服务
 * 支持关键词检索、分类过滤、相关性排序
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 知识条目
 */
export interface KnowledgeItem {
  // 文件路径
  filePath: string;
  // 分类
  category: string;
  // 标题
  title: string;
  // 标签
  tags: string[];
  // 难度
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  // 内容
  content: string;
  // 摘要
  excerpt?: string;
}

/**
 * 检索结果
 */
export interface SearchResult extends KnowledgeItem {
  // 相关性评分
  relevanceScore: number;
  // 匹配的高亮片段
  matchedSnippet?: string;
}

/**
 * 知识库目录
 */
const KNOWLEDGE_CATEGORIES = ['basics', 'shishen', 'yunshi', 'cases'] as const;

/**
 * 加载单个知识文件
 */
function loadKnowledgeFile(filePath: string, category: string): KnowledgeItem | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      filePath,
      category,
      title: data.title || path.basename(filePath, '.md'),
      tags: data.tags || [],
      difficulty: data.difficulty || 'beginner',
      content,
      excerpt: data.excerpt || content.slice(0, 200) + '...'
    };
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return null;
  }
}

/**
 * 加载指定分类下的所有知识
 */
function loadCategory(knowledgeDir: string, category: string): KnowledgeItem[] {
  const categoryDir = path.join(knowledgeDir, category);
  const items: KnowledgeItem[] = [];

  if (!fs.existsSync(categoryDir)) {
    return items;
  }

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(categoryDir, file);
    const item = loadKnowledgeFile(filePath, category);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * 加载所有知识库内容
 */
export function loadAllKnowledge(knowledgeDir: string): KnowledgeItem[] {
  const allItems: KnowledgeItem[] = [];

  for (const category of KNOWLEDGE_CATEGORIES) {
    const items = loadCategory(knowledgeDir, category);
    allItems.push(...items);
  }

  return allItems;
}

/**
 * 计算搜索词与文本的相关性分数
 */
function calculateRelevance(query: string, item: KnowledgeItem): number {
  const queryLower = query.toLowerCase();
  const titleLower = item.title.toLowerCase();
  const contentLower = item.content.toLowerCase();
  const tagsLower = item.tags.map(t => t.toLowerCase());

  let score = 0;

  // 标题完全匹配：100 分
  if (titleLower.includes(queryLower)) {
    score += 100;
  }

  // 标题部分匹配：50 分 * 匹配词数
  const queryWords = queryLower.split(/\s+/);
  for (const word of queryWords) {
    if (word.length > 1 && titleLower.includes(word)) {
      score += 50;
    }
  }

  // 标签匹配：30 分 * 匹配数
  for (const tag of tagsLower) {
    if (tag.includes(queryLower) || queryLower.includes(tag)) {
      score += 30;
    }
  }

  // 内容匹配：10 分 * 出现次数（最多 50 分）
  const contentMatches = contentLower.split(queryLower).length - 1;
  score += Math.min(50, contentMatches * 10);

  return score;
}

/**
 * 提取匹配片段
 */
function extractMatchedSnippet(content: string, query: string, length: number = 100): string {
  const index = content.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return content.slice(0, length) + '...';
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + length);

  return (start > 0 ? '...' : '') +
    content.slice(start, end).replace(/\n/g, ' ') +
    (end < content.length ? '...' : '');
}

/**
 * 知识库检索主函数
 * @param knowledgeDir 知识库目录
 * @param query 搜索关键词
 * @param category 指定分类（可选）
 * @param topN 返回结果数量（默认 5）
 * @returns 检索结果
 */
export function searchKnowledge(
  knowledgeDir: string,
  query: string,
  category?: string,
  topN: number = 5
): SearchResult[] {
  // 加载知识
  let allItems: KnowledgeItem[];

  if (category) {
    allItems = loadCategory(knowledgeDir, category);
  } else {
    allItems = loadAllKnowledge(knowledgeDir);
  }

  // 计算相关性
  const results: SearchResult[] = [];

  for (const item of allItems) {
    const score = calculateRelevance(query, item);

    if (score > 0) {
      results.push({
        ...item,
        relevanceScore: score,
        matchedSnippet: extractMatchedSnippet(item.content, query)
      });
    }
  }

  // 按相关性排序
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 返回 Top N
  return results.slice(0, topN);
}

/**
 * 按分类过滤知识
 */
export function filterByCategory(items: KnowledgeItem[], categories: string[]): KnowledgeItem[] {
  return items.filter(item => categories.includes(item.category));
}

/**
 * 按难度过滤知识
 */
export function filterByDifficulty(items: KnowledgeItem[], difficulty: string): KnowledgeItem[] {
  return items.filter(item => item.difficulty === difficulty);
}

/**
 * 按标签过滤知识
 */
export function filterByTags(items: KnowledgeItem[], tags: string[]): KnowledgeItem[] {
  return items.filter(item =>
    tags.some(tag => item.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
  );
}
