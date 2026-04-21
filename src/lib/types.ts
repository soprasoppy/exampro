/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}

export interface ExcelQuestion {
  code_question?: string;
  categorie?: string;
  niveau?: string;
  type_question?: string;
  question: string;
  choix_A?: string;
  choix_B?: string;
  choix_C?: string;
  choix_D?: string;
  bonne_reponse: string;
  explication?: string;
  difficulte?: string;
}

export interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}
