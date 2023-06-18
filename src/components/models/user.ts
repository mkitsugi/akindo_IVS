import { UserType } from "@/types/user/userType";
import axios from "axios";

export function mapToUserType(userData: any): UserType {
  return {
      id: userData.id,
      pfp: userData.imgSrc,
      userName: userData.name,
      age: userData.age,
      job: userData.job,
      gender: userData.gender,
      createdAt: userData.createdAt,
  };
}

export async function getUser(id: string): Promise<UserType> {
  const response = await axios.get("/api/getOtherUserInfo", { params: { id } });
  return mapToUserType(response.data);
}
