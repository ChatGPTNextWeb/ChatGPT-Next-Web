
export const DENY_LIST: string[] = [
  "suibian", "某某", "张三", "李四", "啊实打实", "官方回复电话", "笑死"
]
export const ADMIN_LIST: string[] = [
  "司金辉", "sijinhui", "sijinhui@qq.com"
]


export function isEmail(input: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(input);
}
export function isHanZi(input: string): boolean {
  // 汉字的正则表达式
  const regChinese = /^[\p{Unified_Ideograph}]+$/u;
  return regChinese.test(input)
}
/**
 * 判断输入的一个字符串是不是拼音
 * @param input 需要测试的字符串
 * @returns {boolean}
 */
export function isPinYin(input: string): boolean {

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
