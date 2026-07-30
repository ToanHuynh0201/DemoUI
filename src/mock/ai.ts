/**
 * Lớp giả lập AI.
 *
 * Bản demo không gọi mô hình thật: kết quả được viết sẵn trong `data/ai.json`,
 * tra theo cặp (loại tác vụ, mã đối tượng). Độ trễ ngẫu nhiên 900–1800 ms để
 * giao diện thể hiện đúng trạng thái "đang xử lý" như khi gọi mô hình thật.
 */
import type { Tone } from '@/lib/enums'
import canned from './data/ai.json'

export type AiTaskKind =
  | 'summarize'
  | 'suggest_title'
  | 'suggest_qa'
  | 'classify_question'
  | 'detect_duplicate'
  | 'draft_answer'
  | 'check_sensitive'
  | 'tag_asset'
  | 'extract_text'
  | 'semantic_search'
  | 'sentiment'
  | 'trend'
  | 'fake_news'
  | 'forecast'

export interface AiResultItem {
  label: string
  detail?: string
  confidence?: number
  tone?: Tone
}

export interface AiResult {
  headline?: string
  body?: string
  items?: AiResultItem[]
  confidence: number
}

export const AI_TASK_LABELS: Record<AiTaskKind, string> = {
  summarize: 'AI tóm tắt văn bản',
  suggest_title: 'AI gợi ý tiêu đề',
  suggest_qa: 'AI gợi ý bộ hỏi — đáp',
  classify_question: 'AI phân loại và gợi ý cơ quan xử lý',
  detect_duplicate: 'AI kiểm tra câu hỏi trùng lặp',
  draft_answer: 'AI gợi ý bản nháp trả lời',
  check_sensitive: 'AI kiểm tra nội dung nhạy cảm',
  tag_asset: 'AI gắn nhãn tài nguyên',
  extract_text: 'AI trích xuất văn bản',
  semantic_search: 'AI tìm kiếm theo ngữ nghĩa',
  sentiment: 'AI phân tích sắc thái',
  trend: 'AI phân tích xu hướng',
  fake_news: 'AI phát hiện tin giả',
  forecast: 'AI dự báo rủi ro dư luận',
}

type CannedTable = Record<string, Record<string, AiResult>>

export function runAiTask(kind: AiTaskKind, inputId?: string): Promise<AiResult> {
  const table = canned as unknown as CannedTable
  const bucket = table[kind] ?? {}
  const result = (inputId && bucket[inputId]) || bucket._default
  const delay = 900 + Math.random() * 900
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), delay)
  })
}
