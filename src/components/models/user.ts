import { UserType } from "@/types/user/userType";
import axios from "axios";

function mapToUserType(userData: any): UserType {
  return {
      id: userData.id,
      pfp: userData.imgSrc,
      userName: userData.name,
      age: userData.age,
      job: userData.jobm,
      createdAt: userData.createdAt,
  };
}

export async function getUser(id: string): Promise<UserType> {
  const response = await axios.get("/api/getOtherUserInfo", { params: { id } });
  console.log("getUser", response.data);
  return mapToUserType(response.data);
}
