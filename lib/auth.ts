import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";


const SECURE_COOKIES:boolean = !!process.env.SECURE_COOKIES;

export const DENY_LIST: string[] = [
    "suibian", "某某", "张三", "李四", "啊实打实", "官方回复电话"
]
export const ADMIN_LIST: string[] = [
    "司金辉", "sijinhui", "sijinhui@qq.com"
]

export const authOptions: NextAuthOptions = {
    // debug: !VERCEL_DEPLOYMENT,
    debug: SECURE_COOKIES,
    useSecureCookies: SECURE_COOKIES,
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    gh_username: profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                };
            },
        }),
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Username", type: "text", placeholder: "输入姓名或邮箱" },
                // password: { label: "Password", type: "password" }
            },
            // @ts-ignore
            async authorize(credential, req) {
                const username = cleanUpString(`${credential?.username}`);
                // 验证用户名
                console.log(credential, username, '==============3')
                // 判断姓名格式是否符合要求，不符合则拒绝
                if (username && isName(username)) {
                    // Any object returned will be saved in `user` property of the JWT
                    let user:{[key: string]: string} = {
                        name: username,
                        // email: null
                    }
                    if (isEmail(username)) {
                        user['email'] =  username;
                    }
                    await insertUser(user);
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    // return null
                    throw new Error("用户名校验失败")
                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        })
    ],
    pages: {
        signIn: `/login`,
        verifyRequest: `/login`,
        error: "/login", // Error code passed in query string as ?error=
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
    cookies: {
        sessionToken: {
            name: `${SECURE_COOKIES ? "__Secure-" : ""}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
                // domain: VERCEL_DEPLOYMENT
                //     ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                //     : undefined,
                secure: SECURE_COOKIES,
            },
        },
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            // const current_time =  Math.floor(Date.now() / 1000);
            // console.log('=============', token, user, current_time)
            if (user) {
                token.user = user;
            }
            return token;
        },
        session: async ({ session, token }) => {
            session.user = {
                ...session.user,
                // @ts-expect-error
                id: token.sub,
                // @ts-expect-error
                username: token?.user?.username || token?.user?.gh_username,
            };
            return session;
        },
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

// export function withSiteAuth(action: any) {
//     return async (
//         formData: FormData | null,
//         siteId: string,
//         key: string | null,
//     ) => {
//         const session = await getSession();
//         if (!session) {
//             return {
//                 error: "Not authenticated",
//             };
//         }
//         const site = await prisma.site.findUnique({
//             where: {
//                 id: siteId,
//             },
//         });
//         if (!site || site.userId !== session.user.id) {
//             return {
//                 error: "Not authorized",
//             };
//         }
//
//         return action(formData, site, key);
//     };
// }
//
// export function withPostAuth(action: any) {
//     return async (
//         formData: FormData | null,
//         postId: string,
//         key: string | null,
//     ) => {
//         const session = await getSession();
//         if (!session?.user.id) {
//             return {
//                 error: "Not authenticated",
//             };
//         }
//         const post = await prisma.post.findUnique({
//             where: {
//                 id: postId,
//             },
//             include: {
//                 site: true,
//             },
//         });
//         if (!post || post.userId !== session.user.id) {
//             return {
//                 error: "Post not found",
//             };
//         }
//
//         return action(formData, post, key);
//     };
// }


function isEmail(input: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input);
}
function isHanZi(input: string): boolean {
    // 汉字的正则表达式
    const regChinese = /^[\p{Unified_Ideograph}]+$/u;
    return regChinese.test(input)
}
/**
 * 判断输入的一个字符串是不是拼音
 * @param input 需要测试的字符串
 * @returns {boolean}
 */
function isPinYin(input: string): boolean {

    var list = ['a', 'ai', 'an', 'ang', 'ao', 'ba', 'bai', 'ban', 'bang', 'bao', 'bei', 'ben',
        'beng', 'bi', 'bian', 'biao', 'bie', 'bin', 'bing', 'bo', 'bu', 'ca', 'cai', 'can', 'cang',
        'cao', 'ce', 'cen', 'ceng', 'cha', 'chai', 'chan', 'chang', 'chao', 'che', 'chen', 'cheng', 'chi',
        'chong', 'chou', 'chu', 'chua', 'chuai', 'chuan', 'chuang', 'chui', 'chun', 'chuo', 'ci', 'cong',
        'cou', 'cu', 'cuan', 'cui', 'cun', 'cuo', 'da', 'dai', 'dan', 'dang', 'dao', 'de', 'dei', 'den',
        'deng', 'di', 'dia', 'dian', 'diao', 'die', 'ding', 'diu', 'dong', 'dou', 'du', 'duan', 'dui', 'dun',
        'duo', 'e', 'en', 'eng', 'er', 'fa', 'fan', 'fang', 'fei', 'fen', 'feng', 'fiao', 'fo', 'fou', 'fu',
        'ga', 'gai', 'gan', 'gang', 'gao', 'ge', 'gei', 'gen', 'geng', 'gong', 'gou', 'gu', 'gua', 'guai', 'guan',
        'guang', 'gui', 'gun', 'guo', 'ha', 'hai', 'han', 'hang', 'hao', 'he', 'hei', 'hen', 'heng', 'hong', 'hou',
        'hu', 'hua', 'huai', 'huan', 'huang', 'hui', 'hun', 'huo', 'ji', 'jia', 'jian', 'jiang', 'jiao', 'jie',
        'jin', 'jing', 'jiong', 'jiu', 'ju', 'juan', 'jue', 'ka', 'kai', 'kan', 'kang', 'kao', 'ke', 'ken',
        'keng', 'kong', 'kou', 'ku', 'kua', 'kuai', 'kuan', 'kuang', 'kui', 'kun', 'kuo', 'la', 'lai', 'lan',
        'lang', 'lao', 'le', 'lei', 'leng', 'li', 'lia', 'lian', 'liang', 'liao', 'lie', 'lin', 'ling', 'liu',
        'lo', 'long', 'lou', 'lu', 'luan', 'lun', 'luo', 'lv', 'lve', 'ma', 'mai', 'man', 'mang', 'mao', 'me',
        'mei', 'men', 'meng', 'mi', 'mian', 'miao', 'mie', 'min', 'ming', 'miu', 'mo', 'mou', 'mu', 'na', 'nai',
        'nan', 'nang', 'nao', 'ne', 'nei', 'nen', 'neng', 'ni', 'nian', 'niang', 'niao', 'nie', 'nin', 'ning',
        'niu', 'nong', 'nou', 'nu', 'nuan', 'nun', 'nuo', 'nv', 'nve', 'o', 'ou', 'pa', 'pai', 'pan', 'pang', 'pao',
        'pei', 'pen', 'peng', 'pi', 'pian', 'piao', 'pie', 'pin', 'ping', 'po', 'pou', 'pu', 'qi', 'qia', 'qian',
        'qiang', 'qiao', 'qie', 'qin', 'qing', 'qiong', 'qiu', 'qu', 'quan', 'que', 'qun', 'ran', 'rang', 'rao',
        're', 'ren', 'reng', 'ri', 'rong', 'rou', 'ru', 'rua', 'ruan', 'rui', 'run', 'ruo', 'sa', 'sai', 'san',
        'sang', 'sao', 'se', 'sen', 'seng', 'sha', 'shai', 'shan', 'shang', 'shao', 'she', 'shei', 'shen', 'sheng',
        'shi', 'shou', 'shu', 'shua', 'shuai', 'shuan', 'shuang', 'shui', 'shun', 'shuo', 'si', 'song', 'sou',
        'su', 'suan', 'sui', 'sun', 'suo', 'ta', 'tai', 'tan', 'tang', 'tao', 'te', 'tei', 'teng', 'ti', 'tian',
        'tiao', 'tie', 'ting', 'tong', 'tou', 'tu', 'tuan', 'tui', 'tun', 'tuo', 'wa', 'wai', 'wan', 'wang',
        'wei', 'wen', 'weng', 'wo', 'wu', 'xi', 'xia', 'xian', 'xiang', 'xiao', 'xie', 'xin', 'xing', 'xiong',
        'xiu', 'xu', 'xuan', 'xue', 'xun', 'ya', 'yan', 'yang', 'yao', 'ye', 'yi', 'yin', 'ying', 'yo', 'yong',
        'you', 'yu', 'yuan', 'yue', 'yun', 'za', 'zai', 'zan', 'zang', 'zao', 'ze', 'zei', 'zen', 'zeng', 'zha',
        'zhai', 'zhan', 'zhang', 'zhao', 'zhe', 'zhei', 'zhen', 'zheng', 'zhi', 'zhong', 'zhou', 'zhu', 'zhua',
        'zhuai', 'zhuan', 'zhuang', 'zhui', 'zhun', 'zhuo', 'zi', 'zong', 'zou', 'zu', 'zuan', 'zui', 'zun', 'zuo'];
    var lowerString = input.toLowerCase();
    var length = lowerString.length;
    var index = -1;

    for (var i=0; i<length; i++) {
        var name = lowerString.substring(0, i+1);
        index = list.lastIndexOf(name) > index ? list.lastIndexOf(name) : index;
    }

    // 判断当前 lowerString 是不是拼音(lowerString 在 list 中就是;不在就不是)
    if (index >= 0) {
        var item = list[index];
        lowerString = lowerString.substring(item.length);
        if (lowerString.length == 0) {
            return true;
        } else {
            return isPinYin(lowerString);
            // return arguments.callee(lowerString);
        }
    } else {
        return false;
    }
}


export function isName(input: string): boolean {
    if (DENY_LIST.includes(input)) {
        return false;
    }
    return isEmail(input) || isHanZi(input) || isPinYin(input);
}

export async function insertUser(user: {[key: string]: string}) {
    try {
        const conditions = [];
        if (user?.name) {
            conditions.push({ name: user.name });
        }
        if (user?.email) {
            conditions.push({ email: user.email });
        }
        const existingUser = conditions.length? await prisma.user.findFirst({
            where: {
                OR: conditions,
            },
        }) : null;
        // console.log('[LOG]', existingUser, user, '=======')
        if (!existingUser) {
            const newUser = await prisma.user.create({
                data: user
            })
            // console.log('[LOG]', user, '=======')
        }
    } catch (e) {
        console.log('[Prisma Error]', e);
        return false;
    }
    return true;
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
