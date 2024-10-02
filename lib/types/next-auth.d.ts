// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";


declare module "next-auth" {
  /**
   * 扩展 Session 接口，添加自定义的用户属性
   */
  interface Session {
    user: {
      id: string;
      username?: string | null;
      hasPassword?: boolean | null;
      isAdmin?: boolean | null;
    } & DefaultSession["user"];
  }

  /**
   * 扩展 User 接口，添加自定义属性
   * 注意：保持属性可选，以与 AdapterUser 兼容
   */
  interface User extends DefaultUser {
    id: string;
    username?: string;
    gh_username?: string;
    password?: string;
    isAdmin?: boolean;
    allowToLogin?: boolean;
  }

}

declare module "next-auth/jwt" {
  /**
   * 扩展 JWT 接口，添加自定义的用户属性
   */
  interface JWT {
    user?: {
      id: string;
      username?: string | null;
      gh_username?: string | null;
      password?: string | null;
      isAdmin?: boolean | null;
    };
  }
}
