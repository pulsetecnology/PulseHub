import "next-auth";
import { UserType } from "@/contexts/AuthContextWithNextAuth";

declare module "next-auth" {
  /**
   * Estendendo o tipo User do NextAuth
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    type: UserType;
  }

  /**
   * Estendendo o tipo Session do NextAuth
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      type: UserType;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Estendendo o tipo JWT do NextAuth
   */
  interface JWT {
    type: UserType;
  }
}