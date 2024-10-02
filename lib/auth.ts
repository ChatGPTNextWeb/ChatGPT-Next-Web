import {getServerSession, type NextAuthOptions, Theme} from "next-auth";
import Github from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google"
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { isEmail, isName } from "@/lib/auth_list";
import {createTransport} from "nodemailer";
import { comparePassword } from "@/lib/utils";
import { randomBytes } from "crypto";
import { type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";

const SECURE_COOKIES:boolean = !!process.env.SECURE_COOKIES;

let verificationTokens = new Map();


export const authOptions: NextAuthOptions = {
    // debug: true,
    debug: !SECURE_COOKIES,
    useSecureCookies: SECURE_COOKIES,
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Github({
            clientId: process.env.AUTH_GITHUB_ID ?? "",
            clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    gh_username: profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                };
            },
            httpOptions: {
                timeout: 50000,
            },
            allowDangerousEmailAccountLinking: true,
        }),
        Email({
          server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT ?? "0"),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          },
          from: process.env.EMAIL_FROM,
          maxAge: 5 * 60,
          async generateVerificationToken() {
              return randomBytes(4).toString("hex").substring(0, 4);
          },
          async sendVerificationRequest({
                                    identifier: email,
                                    url,
                                    token,
                                    provider: { server, from, name },
                                    theme,
                                  }) {

              // const token = randomInt(1000, 10000);

              verificationTokens.set(email, token);
              /* your function */
              const { host  } = new URL(url)
              // console.log('send mail,-----', email, host, token )

              const transport = createTransport(server)
              const result = await transport.sendMail({
                  to: email,
                  from: from,
                  subject: `Your sign-in code for ${host}`,
                  text: email_text({url, token, host}),
                  html: email_html({ url, token, host, theme }),
              })
            const failed = result.rejected.concat(result.pending).filter(Boolean)
            console.log('[result],', result)
            if (failed.length) {
              throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
            }
          },
        }),
        Credentials({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Username", type: "text", placeholder: "输入姓名或邮箱" },
                password: { label: "Password", type: "password", placeholder: "密码验证，测试阶段" }
            },
            // @ts-ignore
            async authorize(credential, req) {
                const username = cleanUpString(`${credential?.username}`);
                const password = cleanPassword(`${credential?.password}`);
                // 验证用户名
                // console.log(credential, 'p', password, '==============3')
                // 判断姓名格式是否符合要求，不符合则拒绝
                if (username && isName(username)) {
                    // Any object returned will be saved in `user` property of the JWT
                    let user: Partial<User> = {}
                    if (isEmail(username)) {
                        user['email'] = username;
                    } else {
                        user['name'] = username;
                    }
                    // 目前用户不存在，则会创建新用户。
                    let existingUser = await existUser(user);
                    if (!existingUser) {
                      user['allowToLogin'] = !!await getSetting("allowNewUser");
                      existingUser = await insertUser(user);
                    }
                    // 有密码就校验密码，没有就直接返回用户
                    (password || existingUser.password) && validatePassword(password, existingUser.password);
                    return existingUser;
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    // return null
                    throw new Error("用户名或密码不正确")
                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    pages: {
        signIn: `/login`,
        // verifyRequest: `/login`,
        error: "/login", // Error code passed in query string as ?error=
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt", maxAge: 3 * 24 * 60 * 60 },
    // cookies: {
    //     sessionToken: {
    //         name: `${SECURE_COOKIES ? "__Secure-" : ""}next-auth.session-token`,
    //         options: {
    //             httpOnly: true,
    //             sameSite: "lax",
    //             path: "/",
    //             // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
    //             // domain: VERCEL_DEPLOYMENT
    //             //     ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    //             //     : undefined,
    //             secure: SECURE_COOKIES,
    //         },
    //     },
    // },
    callbacks: {
        jwt: async ({ token, user }) => {
            // const current_time =  Math.floor(Date.now() / 1000);
            // console.log('=============', token, user,)
            if (user) {
                token.user = user;
            } else {
              const updateUser: User | null = await prisma.user.findUnique({ where: { id: token.sub }});
              if (!updateUser || !updateUser.allowToLogin) {
                throw new Error('无法刷新令牌，用户状态不正确');
              }
              token.user = updateUser as User;
            }
            return token;
        },
        session: async ({ session, token }: {
          session: Session,
          token: JWT
        }) => {
            session.user = {
                ...session.user,
                id: token?.sub ?? "",
                username: token?.user?.username || token?.user?.gh_username,
                hasPassword: !!token?.user?.password,
                isAdmin: token?.user?.isAdmin,
            };
            // console.log('555555555,', session, token)
            return session;
        },
        // 过滤不存在的用户
        async signIn({ user, account, profile, email, credentials }) {
            let existingUser = await existUser(user as User);
            if (!existingUser) {
                user['allowToLogin'] = !!await getSetting("allowNewUser");
                existingUser = await insertUser(user)
            }
            // console.log('---', user, 'account', account, 'email', email, 'exist', existingUser)
            // 顺便过滤掉不允许登录的用户
            return existingUser.allowToLogin;
        },
        // 重定向
        async redirect({ url, baseUrl }) {
            console.log('---------', url, new URL(url), baseUrl)
            return baseUrl;
        }
    },
};

export function getSession() {
    // console.log('in........',)
    return getServerSession(authOptions) as Promise<{
        user: {
            id: string;
            name: string;
            username: string;
            email: string;
            image: string;
        };
    } | null>;
}

export async function getSessionName() {
    const session = await getSession();
    // console.log('in........', session)
    return {
        name: session?.user?.email || session?.user?.name,
        session
    }
}

export function validatePassword(password: string, hashPassword: string | null | undefined ): boolean | void {
  if (!hashPassword) {
    throw new Error("未设置密码");
  }

  if (!comparePassword(password, hashPassword)) {
    throw new Error("用户名或密码不正确")
  } else {
    return true;
  }
}

async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({
    where: {
      key: key
    }
  })
  // console.log('setting,------', setting)
  if (!setting) {
    return null;
  }
  // 根据类型字段转换值
  switch (setting.type) {
    case 'boolean':
      return setting.value === 'true';
    case 'number':
      return Number(setting.value);
    case 'string':
    default:
      return setting.value;
  }
}

async function existUser(user: Partial<User> ) {
  const conditions = [];
  if (user?.name) {
    conditions.push({ name: user.name });
  }
  if (user?.email) {
    conditions.push({ email: user.email });
  }
  return conditions.length ? await prisma.user.findFirst({
    where: {
      AND: conditions,
    },
  }) : null
}

export async function insertUser(user: Partial<User> ) {
    // console.log('------------', user)
    try {
        return await prisma.user.create({
          data: user
        })
        // const existingUser = await existUser(user);
        // // console.log('[LOG]', existingUser, user, '=======')
        // if (!existingUser) {
        //
        // } else {
        //     // console.log('user==========', existingUser)
        //     return existingUser;
        // }
    } catch (e) {
        throw new Error("用户创建失败");
        // return false;
    }
}


function cleanUpString(input: string): string {
    try {
        // 去除前后空格
        let cleanedString = input.trim();
        // 去除非中文、英文、@和.字符
        cleanedString = cleanedString.replace(/[^\u4e00-\u9fa5a-zA-Z@.]/g, '');
        return cleanedString;
    }
    catch {
        return '';
    }
}

function cleanPassword(input: string): string {
  try {
    // 去除前后空格
    return input.trim()
  }
  catch {
    return '';
  }
}




/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function email_text(params: { url: string, token: number|string, host: string}) {
    const { url, token, host } = params;
    return `Sign in to ${host}\n\nYour sign-in code is: ${token}\n\nOr click on this link to sign in:\n${url}\n\n`;
}


function email_html(params: { url: string, token: number|string, host: string, theme: Theme }) {
  const { url, token, host, theme } = params

  const escapedHost = host.replace(/\./g, "&#8203;.")
  const escapedUrl = url.replace(/\./g, "&#8203;.")

  // const brandColor = theme.brandColor || "#346df1"
  // const color = {
  //   background: "#f9f9f9",
  //   text: "#444",
  //   mainBackground: "#fff",
  //   buttonBackground: brandColor,
  //   buttonBorder: brandColor,
  //   buttonText: theme.buttonText || "#fff",
  // }

    return `<p>Sign in to <strong>${escapedHost}</strong></p>
          <p>Your sign-in code is: <strong>${token}</strong></p>
          <p>Or click on this link to sign in:</p>
          <p><a href="${url}">${escapedUrl}</a></p>
          <p>If you did not request this email, you can safely ignore it.</p>`;
}
