import { AIType } from "@/types/AI/aiType";


export function getAI(id: string): AIType {
  // Todo idを元にユーザーを取得する
  return {
    id,
    userName: "初音みゆ",
    pfp: "images/8.png",
    isAI: true,
  };
}
