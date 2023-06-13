import { UserType } from "@/types/user/userType";

export function createUser(user: Omit<UserType, "createdAt">): UserType {
  // Todo userを作成する. azureに保存する
  return {
    ...user,
    createdAt: Date.now().toString(),
  };
}

export function getUser(id: string): UserType {
  // Todo idを元にユーザーを取得する
  return {
    id,
    userName: "西野カナ",
    age: 20,
    pfp: "/images/pfp/1.jpg",
    job: "学生",
    createdAt: "1686582000000",
  };
}
