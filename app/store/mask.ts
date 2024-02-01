import { BUILTIN_MASKS } from "../masks";
import { getLang, Lang } from "../locales";
import { DEFAULT_TOPIC, ChatMessage } from "./chat";
import { ModelConfig, useAppConfig } from "./config";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";

export type Mask = {
  id: string;
  createdAt: number;
  avatar: string;
  name: string;
  hideContext?: boolean;
  context: ChatMessage[];
  syncGlobalConfig?: boolean;
  modelConfig: ModelConfig;
  lang: Lang;
  builtin: boolean;
};

export const DEFAULT_MASK_STATE = {
  masks: {} as Record<string, Mask>,
};

export type MaskState = typeof DEFAULT_MASK_STATE;

export const DEFAULT_MASK_AVATAR = "gpt-bot";

  {/*  {id: nanoid(),
    avatar: "1fae1",
    name: "小标",
    context: [
      {
        id: "1text-to-pic-0",
        role: "user",
        content:
          "从现在你将开始扮演gbpi公司的内部智能ai，你的名字叫小标，公司名称叫广州标际包装设备有限公司。\n记住以下信息，在我提问相关问题时，给予正确的回答 ：\n关于标际\nGBPI标际，全球包装产业技术创新领导者。\n我们以使命为傲，旨在帮助全球客户拥有更先进、更精准、更稳定的检测仪器、智能装备、检测认证服务与管理解决方案，致力于为客户控制运营成本、提升产品质量，并确保产品包装符合国际及所属国标准！\n我们始终贯彻全球化承诺，20多年来一直为：检验机构、科研院校、食品、制药、日化、烟包、包装等企业，为新材料、新能源、薄膜产业等客户提供卓越的产品、创新的技术、便捷的采购和全方位的服务。\nGBPI标际，以持续创新为全球客户带来无与伦比的价值体验。我们是国家级专精特新小巨人企业，广东省高新科技企业，已荣获国家标准物质证书、CNAS实验室认证。GBPI标际与国内外众多知名高校及科研机构保持长期合作，凭借不断增强的创新能力、日趋完善的交付能力赢得全球客户的信赖。\nGBPI标际以中国为全球战略总部，在印度设立分公司，在广州设立研发中心，并于中国武汉、南京、杭州、西安、成都、郑州设立分支机构，让产品与服务精准高效触达全球各地。\n国家标准物质研制单位与CNAS实验室检测中心\nGBPI标际是亚太地区首家薄膜“三透”标准物质研制单位。\n国内包装检验检测仪器的标准物质市场长期处于缺失状态，GBPI标际通过不断的研发创新与技术突破，研制出薄膜透气性、透氧性、透湿性标准物质，有效填补了这一国内产业空白，为食品和药品包装的“三透”校正、校准和检定提供了更为完善便捷的解决方案。\nGBPI标际拥有国内包装检测行业首家CNAS实验室检测中心。\nGBPI标际CNAS检测中心，具有雄厚的技术力量和完善的管理体系，我们出具的检验报告已获得国家、地区、机构间的相互认可。\n经过十多年的发展，GBPI标际CNAS实验室检测中心形成了以“塑料薄膜阻隔性检测”为主业，其他检测业务并行的规模大、设备全、技术强的综合性检测中心。为国内食品、药品等包装行业客户提供了大量专业测试与数据支持。\n企业使命\n旨在帮助全球客户拥有更先进、更精准、更稳定的检测仪器、智能装备、检测认证服务与管理解决方案，致力于为客户控制运营成本、提升产品质量，并确保产品包装符合国际及所属国标准！\n企业价值观\n客户至上 持续创新 精进品质 贴心服务\n质量方针\n以严苛品质、完善服务、准时交付，超越客户期待\n企业愿景\n成为全球客户值得信赖的包装产业解决方案提供商\n气调保鲜箱在使用上的注意事项及维护保养\n栏目：常见问题解答发布时间：2022-08-06\nGQ-160气调保鲜箱主要用于市场上各种水果、蔬菜、花卉、苗木等贮藏保鲜试验，通过微电子技术自动控制箱内氧气、氮气、二氧化碳、乙烯的浓度，以及控制温、湿度条件达到保鲜效果，是微生物、环保、食品生产以及教育科研单位不可缺少的理想设备。\n\n\n气调保鲜的原理：\n\n气调保鲜原理，是根据农产品的生理特性，通过对贮藏环境中温度、湿度和气体成分进行控制，使库内保持极低的氧气含量，相对较高的二氧化碳含量，从而实现最佳的保鲜效果。\n\n1、对代谢的影响\n\n高二氧化碳浓度和低氧气浓度会抑制呼吸作用和其它的代谢作用，延缓果蔬成熟和衰老，保持品质。不同的果蔬所适宜的气体组成各不相同，应由实验来确定。\n\n2、气体环境对乙烯生物合成的影响\n\n高二氧化碳浓度和低氧气浓度会减轻果蔬对乙烯的敏感性，减弱乙烯的生物作用。\n\n3、对微生物生长的影响\n\n高二氧化碳浓度能降低多种腐败性细菌的活性。同时提高二氧化碳浓度和降低氧气浓度能抑制成熟和衰老，因而也提高了果蔬的抗病能力。\n\n4、气体调节环境对其它一些物质代谢的影响\n\n乙醛和乙醇的含量较低，有机酸的变化没规律，不饱和脂肪酸的合成受到抑制，淀粉向糖的转化也受到抑制，果蔬的褐变减轻等。\n\n使用上注意事项：\n1、工作电压要求为：220V、50Hz，使用前必须注意所有电源电压是否相符，并将电源按规定进行有效接地。\n2、在通电使用过程中，切忌用手触及箱顶电器箱内的电器部分、用湿布擦抹及用水冲洗，检修时应将电源切断。\n3、设备尽可能安装于空气干净，温差变化小的室内。安放在干燥阴凉的地方，避免阳光直晒，并保持箱体与周围环境通风良好，与墙壁距离10cm以上。\n4、搬运时必须小心，不得平放或倒立放置。\n5、在通电恒温状态下开启内门，将会不同程度地造成温度波动现象（视设定温度和环境温度之差比）。建议用户尽可能减少开门次数。\n6、电源线不可缠绕在金属物品上，防止塑料老化以至漏电不可放置在高温或潮湿的地方。\n7、仪器长期不使用时请把仪器内的水排放干净。\n\n使用后维护保养：\n\n仪器罩壳由高级材料制成，如果未被及时清除实验过程中滞留的致腐物质会腐蚀仪器内部结构，从而影响实验结果的准确性。\n\n1、仪器外部机身可用清洁剂或者干净的抹布进行日常清洁；\n\n2、实验结束后，必须将仪器内部残渣清洗干净，用干净抹布擦干擦净；\n\n3、每次使用完毕后，应将电源全部切断；\n\n4、经常保持箱内外清洁；\n\n5、忌用刷子用力洗刷，以免造成内部破损而导致实验室溶液渗出腐蚀仪器内部；\n\n6、产品外表不准用酸、碱及其他腐蚀性物品来擦洗，免损美观，箱内用干布定期擦净。\n塑料薄膜摩擦系数测定方面的重要意义\n栏目：常见问题解答发布时间：2022-08-06\n\n    塑料包装薄膜广泛地应用于食品包装、医药包装、文化用品包装及农产品采后包装等方面，与此同时，越来越多的质量问题也凸显出来，使用单位关于包装膜拉断、打滑、包装生产线断流等的投诉问题不断增多。许多塑料软包装材料厂、印刷厂因此而造成了巨大损失，在实际应用中，往往出现这种情况，首先我们要从摩擦系数上来查找问题，薄膜摩擦系数检测通常执行的标准有GB/T10006-1988、ISO 8295-2004这两种标准。\n\n  摩擦系数是考察塑料包装薄膜的一项重要指标。也是塑料软包装材质生产效率是否高效的重要体现。摩擦系数对复合膜软包装材质的开口性能、爽滑性能以及材料的均匀度等物理性能有着非常重要的衡量标准和质量控制影响。\n\n  因为在包装过程中的摩擦力常常既是动力又是阻力，因而其大小应控制在适当的范围内。薄膜的内外表面摩擦系数一般要求在0.2-0.4之间，且外/外摩擦系数>内/内摩擦系数。薄膜或片材试样在其本身或在另一种物质上滑动时，也可以测量其摩擦性能。\n\n    01、开口性能是指两层复合膜包装袋外表面没有粘合剂的情况下简单吸附粘合在一起后，被剥离开的难易程度表示。\n\n    02、爽滑性能主要是指包装所用的复合膜包装袋在复合、固化、切割、热封成袋等多个连续不断的生产工序流程中的物理性能。如果复合膜材料的摩擦系数太低，复合、固化、切割、热封等参数在生产操作中容易造成跑边等问题，易操作不匀称或者有严重失误等情况出现，从而造成降低生产率；如果摩擦系数太高，容易造成成袋和切割等操作速率低，从而影响到产量。\n\n    03、均匀度主要是指加入爽滑剂后，复合材料的表面均匀度。由于爽滑性在复合薄膜中的分布均匀，并且可变动性，造成爽滑剂不能很好的分布均匀在复合薄膜上，容易造成复合包装薄膜容易拉断、打滑、复合包装生产线段流等生产性问题的出现 \n\n     为了防止以上各项问题的出现，广州标际GBPI自主研发生产了摩擦系数测定仪GM-4，来保证生产合格率，从而降低生产所耗。该摩擦系数测定仪主要适用于测试塑料薄膜、薄片、纸张（或其它类似材料）滑动时的静摩擦系数和动摩擦系数。通过测定塑料薄膜摩擦系数，可以控制调节包装袋的开口性、包装机的包装速度等生产质量工艺指标，并进一步加强对薄膜特别是对包装用薄膜的滑爽性的测定。\n\n      符合GB/T10006-1988、ASTM D1894-2014、ISO 8295-2004、TAPPI 816国家标准。\n\n  相信看到这里，我们都会认识到这个项目的必要性,因为检查的是开口性。有时候买来塑料袋后,没有办法或是很难搓开,是因为薄膜之间都粘一起了,如果开口性好的话一搓就开了,这就是检测的意义。\n",
        date: "",
      },

    ],
    modelConfig: {
      model: "gpt-3.5-turbo-1106",
      temperature: 1,
      max_tokens: 4000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 4,
      compressMessageLengthThreshold: 1000,
      enableInjectSystemPrompts:true,
      template:"{{input}}"
    },
    lang: "cn",
    builtin: false,
    createdAt: Date.now(),
    hideContext:true,
  }  ) as Mask;
 */}

export const createEmptyMask = () =>

  (({
    id: nanoid(),
    avatar: DEFAULT_MASK_AVATAR,
    name: DEFAULT_TOPIC,
    context: [],
    syncGlobalConfig: true, // use global config as default
    modelConfig: { ...useAppConfig.getState().modelConfig },
    lang: getLang(),
    builtin: false,
    createdAt: Date.now(),
  })as Mask;
  

export const useMaskStore = createPersistStore(
  { ...DEFAULT_MASK_STATE },

  (set, get) => ({
    create(mask?: Partial<Mask>) {
      const masks = get().masks;
      const id = nanoid();
      masks[id] = {
        ...createEmptyMask(),
        ...mask,
        id,
        builtin: false,
      };

      set(() => ({ masks }));
      get().markUpdate();

      return masks[id];
    },
    updateMask(id: string, updater: (mask: Mask) => void) {
      const masks = get().masks;
      const mask = masks[id];
      if (!mask) return;
      const updateMask = { ...mask };
      updater(updateMask);
      masks[id] = updateMask;
      set(() => ({ masks }));
      get().markUpdate();
    },
    delete(id: string) {
      const masks = get().masks;
      delete masks[id];
      set(() => ({ masks }));
      get().markUpdate();
    },

    get(id?: string) {
      return get().masks[id ?? 1145141919810];
    },
    getAll() {
      const userMasks = Object.values(get().masks).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const config = useAppConfig.getState();
      if (config.hideBuiltinMasks) return userMasks;
      const buildinMasks = BUILTIN_MASKS.map(
        (m) =>
          ({
            ...m,
            modelConfig: {
              ...config.modelConfig,
              ...m.modelConfig,
            },
          }) as Mask,
      );
      return userMasks.concat(buildinMasks);
    },
    search(text: string) {
      return Object.values(get().masks);
    },
  }),
  {
    name: StoreKey.Mask,
    version: 3.1,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as MaskState;

      // migrate mask id to nanoid
      if (version < 3) {
        Object.values(newState.masks).forEach((m) => (m.id = nanoid()));
      }

      if (version < 3.1) {
        const updatedMasks: Record<string, Mask> = {};
        Object.values(newState.masks).forEach((m) => {
          updatedMasks[m.id] = m;
        });
        newState.masks = updatedMasks;
      }

      return newState as any;
    },
  },
);
