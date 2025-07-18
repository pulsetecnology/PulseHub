import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    type: "fornecedor" | "revendedor";
  }

  interface Session {
    user: {
      id: string;
      type: "fornecedor" | "revendedor";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    type: "fornecedor" | "revendedor";
  }
}