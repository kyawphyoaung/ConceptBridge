export type EssaySeed = {
  subject_slug: 'english'
  paper_code: string | null
  title: string
  content_en: string
  display_order: number
  lines: Array<{ line_en: string; line_mm: string }>
  terms: Array<{
    term: string
    definition_en: string
    definition_mm: string
  }>
}

export const englishEssays: EssaySeed[] = [
  {
    subject_slug: 'english',
    paper_code: null,
    title: 'Actions speak louder than words',
    content_en:
      'The well-known proverb "Actions speak louder than words" emphasizes that what people do is far more important than what they say. While promises and verbal statements are easy to make, genuine character and real intentions are ultimately demonstrated through concrete actions.\n\nFirst, making promises is effortless, but fulfilling them requires effort and honesty. Many people make big commitments or give spoken assurances, yet fail to follow through when difficulties arise. For example, a friend may frequently say they will help you, but their loyalty is only proven when they actually show up during a hard time. Therefore, deeds build genuine trust, whereas empty words often lead to disappointment.\n\nSecond, consistent behavior reflects true intentions better than speech. In personal relationships, workplaces, and leadership roles, people are judged by their results rather than their explanations. A leader who works hard and treats others with respect inspires far more confidence than one who only makes grand speeches without taking meaningful action.\n\nIn conclusion, words can express good intentions, but only actions provide real proof of sincerity. To build strong relationships and maintain respect, we must always ensure that our deeds align with the promises we make.',
    display_order: 1,
    lines: [
      {
        line_en: 'The well-known proverb "Actions speak louder than words" emphasizes that what people do is far more important than what they say.',
        line_mm: '"လုပ်ရပ်များသည် စကားလုံးများထက် ပိုမိုကျယ်လောင်သည်" ဟူသော လူသိများသည့် ဆိုစကားသည် လူတို့ပြောဆိုသည့်စကားထက် လူတို့၏လုပ်ရပ်များက ပိုမိုအရေးကြီးကြောင်း အလေးပေးဖော်ပြသည်။',
      },
      {
        line_en: 'While promises and verbal statements are easy to make, genuine character and real intentions are ultimately demonstrated through concrete actions.',
        line_mm: 'ကတိများနှင့် နှုတ်ဖြင့်ပြောဆိုမှုများသည် ပြုလုပ်ရန် လွယ်ကူသော်လည်း စစ်မှန်သောစရိုက်နှင့် ရည်ရွယ်ချက်အမှန်များကို ခိုင်မာသောလုပ်ရပ်များဖြင့်သာ နောက်ဆုံးတွင် ပြသသည်။',
      },
      {
        line_en: 'First, making promises is effortless, but fulfilling them requires effort and honesty.',
        line_mm: 'ပထမအချက်အနေဖြင့် ကတိပေးခြင်းသည် လွယ်ကူသော်လည်း ထိုကတိများကို အကောင်အထည်ဖော်ရန်မှာ ကြိုးစားအားထုတ်မှုနှင့် ရိုးသားမှု လိုအပ်သည်။',
      },
      {
        line_en: 'Many people make big commitments or give spoken assurances, yet fail to follow through when difficulties arise.',
        line_mm: 'လူအများသည် ကြီးမားသောကတိများ ပေးခြင်း သို့မဟုတ် နှုတ်ဖြင့် အာမခံချက်များပေးခြင်းကို ပြုလုပ်သော်လည်း အခက်အခဲများ ပေါ်ပေါက်လာချိန်တွင် လိုက်လျောညီထွေ ဆောင်ရွက်ရန် ပျက်ကွက်တတ်သည်။',
      },
      {
        line_en: 'For example, a friend may frequently say they will help you, but their loyalty is only proven when they actually show up during a hard time.',
        line_mm: 'ဥပမာအားဖြင့် သူငယ်ချင်းတစ်ဦးသည် သင့်ကို ကူညီမည်ဟု မကြာခဏ ပြောဆိုနိုင်သော်လည်း ခက်ခဲသောအချိန်တွင် အမှန်တကယ် ရောက်လာမှသာ သူ၏ သစ္စာရှိမှုကို သက်သေပြသည်။',
      },
      {
        line_en: 'Therefore, deeds build genuine trust, whereas empty words often lead to disappointment.',
        line_mm: 'ထို့ကြောင့် လုပ်ရပ်များသည် စစ်မှန်သော ယုံကြည်မှုကို တည်ဆောက်ပေးပြီး အလွတ်စကားများသည် များသောအားဖြင့် စိတ်ပျက်မှုကို ဖြစ်ပေါ်စေသည်။',
      },
      {
        line_en: 'Second, consistent behavior reflects true intentions better than speech.',
        line_mm: 'ဒုတိယအချက်အနေဖြင့် တသမတ်တည်း ပြုမူဆောင်ရွက်မှုသည် စကားပြောခြင်းထက် ရည်ရွယ်ချက်အမှန်ကို ပိုမိုကောင်းမွန်စွာ ထင်ဟပ်စေသည်။',
      },
      {
        line_en: 'In personal relationships, workplaces, and leadership roles, people are judged by their results rather than their explanations.',
        line_mm: 'ကိုယ်ပိုင်ဆက်ဆံရေးများ၊ အလုပ်ခွင်များနှင့် ခေါင်းဆောင်မှုအခန်းကဏ္ဍများတွင် လူများကို ၎င်းတို့၏ ရှင်းလင်းချက်များထက် ၎င်းတို့၏ ရလဒ်များဖြင့် အကဲဖြတ်ကြသည်။',
      },
      {
        line_en: 'A leader who works hard and treats others with respect inspires far more confidence than one who only makes grand speeches without taking meaningful action.',
        line_mm: 'အလုပ်ကြိုးစားပြီး အခြားသူများကို လေးစားစွာ ဆက်ဆံသော ခေါင်းဆောင်သည် အဓိပ္ပာယ်ရှိသော လုပ်ရပ်များ မလုပ်ဘဲ ကြီးကျယ်သော မိန့်ခွန်းများသာ ပြောဆိုသူထက် များစွာသော ယုံကြည်မှုကို လှုံ့ဆော်ပေးသည်။',
      },
      {
        line_en: 'In conclusion, words can express good intentions, but only actions provide real proof of sincerity.',
        line_mm: 'နိဂုံးချုပ်အားဖြင့် စကားလုံးများသည် ကောင်းသောရည်ရွယ်ချက်များကို ဖော်ပြနိုင်သော်လည်း လုပ်ရပ်များသာ စစ်မှန်သော ရိုးသားမှုကို အထောက်အထား ပေးသည်။',
      },
      {
        line_en: 'To build strong relationships and maintain respect, we must always ensure that our deeds align with the promises we make.',
        line_mm: 'ခိုင်မာသော ဆက်ဆံရေးများကို တည်ဆောက်ရန်နှင့် လေးစားမှုကို ထိန်းသိမ်းရန်အတွက် ကျွန်ုပ်တို့၏ လုပ်ရပ်များသည် ကျွန်ုပ်တို့ပေးသော ကတိများနှင့် အမြဲတမ်း ကိုက်ညီနေကြောင်း သေချာစေရမည်။',
      },
    ],
    terms: [
      {
        term: 'proverb',
        definition_en: 'A short, well-known pithy saying, stating a general truth or piece of advice.',
        definition_mm: 'ဆိုစကား၊ စကားပုံ',
      },
      {
        term: 'genuine',
        definition_en: 'Truly what something is said to be; authentic and sincere.',
        definition_mm: 'စစ်မှန်သော၊ ရိုးသားသော',
      },
      {
        term: 'effortless',
        definition_en: 'Requiring no physical or mental exertion; easy.',
        definition_mm: 'လွယ်ကူသော၊ အားမစိုက်ရသော',
      },
      {
        term: 'loyalty',
        definition_en: 'A strong feeling of support or allegiance to someone or something.',
        definition_mm: 'သစ္စာရှိမှု၊ သစ္စာစောင့်သိမှု',
      },
      {
        term: 'sincerity',
        definition_en: 'The quality of being free from pretense, deceit, or hypocrisy.',
        definition_mm: 'ရိုးသားမှု၊ စိတ်ရင်းမှန်ဖြင့် ပြုမူမှု',
      },
      {
        term: 'align',
        definition_en: 'To give support to or come together in a line or formation.',
        definition_mm: 'ကိုက်ညီသည်၊ လိုက်လျောညီထွေဖြစ်သည်',
      },
    ],
  },
  {
    subject_slug: 'english',
    paper_code: null,
    title: 'The pen is mightier than the sword',
    content_en:
      'The famous proverb "The pen is mightier than the sword" suggests that written words and ideas have a far greater impact on society than physical violence. While a sword can force physical obedience through fear, written ideas possess the enduring power to transform minds, inspire movements, and shape human history.\n\nFirst, physical force only achieves temporary control, whereas words create lasting change. Weapons can win battles, conquer lands, or destroy cities, but they cannot win hearts or change minds. In contrast, books, speeches, and articles can expose injustice and inspire people to unite for freedom. Throughout history, many political revolutions and social reforms began not with weapons, but with powerful writings that challenged corrupt rulers.\n\nSecond, the power of written words outlasts physical power. A sword can only harm a few individuals at a specific time and place. However, written ideas can travel across borders, survive through centuries, and continue to educate future generations long after the author has died.\n\nIn conclusion, violence can destroy life, but literature and ideas build civilization. Therefore, peaceful expression through writing remains humanity\'s most effective tool for progress and positive change.',
    display_order: 2,
    lines: [
      {
        line_en: 'The famous proverb "The pen is mightier than the sword" suggests that written words and ideas have a far greater impact on society than physical violence.',
        line_mm: '"ဘောပင်သည် ဓားထက် ပိုမိုအားကောင်းသည်" ဟူသော ကျော်ကြားသည့် ဆိုစကားသည် ရေးသားထားသော စကားလုံးများနှင့် အတွေးအခေါ်များသည် ရုပ်ပိုင်းဆိုင်ရာ အကြမ်းဖက်မှုထက် လူ့အဖွဲ့အစည်းအပေါ် များစွာသော သက်ရောက်မှုရှိကြောင်း ညွှန်ပြသည်။',
      },
      {
        line_en: 'While a sword can force physical obedience through fear, written ideas possess the enduring power to transform minds, inspire movements, and shape human history.',
        line_mm: 'ဓားတစ်လက်သည် ကြောက်ရွံ့မှုဖြင့် ရုပ်ပိုင်းဆိုင်ရာ လိုက်နာမှုကို အတင်းအကြပ် ဖြစ်စေနိုင်သော်လည်း ရေးသားထားသော အတွေးအခေါ်များသည် စိတ်များကို ပြောင်းလဲရန်၊ လှုပ်ရှားမှုများကို လှုံ့ဆော်ရန်နှင့် လူ့သမိုင်းကို ပုံဖော်ရန် တည်မြဲသော စွမ်းအားကို ပိုင်ဆိုင်ထားသည်။',
      },
      {
        line_en: 'First, physical force only achieves temporary control, whereas words create lasting change.',
        line_mm: 'ပထမအချက်အနေဖြင့် ရုပ်ပိုင်းဆိုင်ရာ အင်အားသည် ယာယီထိန်းချုပ်မှုကိုသာ ရရှိစေပြီး စကားလုံးများသည် တည်မြဲသော ပြောင်းလဲမှုကို ဖန်တီးပေးသည်။',
      },
      {
        line_en: 'Weapons can win battles, conquer lands, or destroy cities, but they cannot win hearts or change minds.',
        line_mm: 'လက်နက်များသည် တိုက်ပွဲများကို အောင်နိုင်နိုင်၊ နယ်မြေများကို သိမ်းပိုက်နိုင် သို့မဟုတ် မြို့များကို ဖျက်ဆီးနိုင်သော်လည်း နှလုံးသားများကို အောင်နိုင်ခြင်း သို့မဟုတ် စိတ်များကို ပြောင်းလဲခြင်း မပြုနိုင်ပါ။',
      },
      {
        line_en: 'In contrast, books, speeches, and articles can expose injustice and inspire people to unite for freedom.',
        line_mm: 'ဆန့်ကျင်ဘက်အားဖြင့် စာအုပ်များ၊ မိန့်ခွန်းများနှင့် ဆောင်းပါးများသည် မတရားမှုကို ဖော်ထုတ်နိုင်ပြီး လွတ်လပ်မှုအတွက် လူများကို စုစည်းရန် လှုံ့ဆော်ပေးနိုင်သည်။',
      },
      {
        line_en: 'Throughout history, many political revolutions and social reforms began not with weapons, but with powerful writings that challenged corrupt rulers.',
        line_mm: 'သမိုင်းတစ်လျှောက်တွင် နိုင်ငံရေး တော်လှန်ရေးများနှင့် လူမှုရေး ပြုပြင်ပြောင်းလဲမှုများစွာသည် လက်နက်များဖြင့် မဟုတ်ဘဲ အကျင့်ပျက်ခြစားသော အုပ်စိုးရှင်များကို စိန်ခေါ်သည့် စွမ်းအားကြီးသော ရေးသားချက်များဖြင့် စတင်ခဲ့သည်။',
      },
      {
        line_en: 'Second, the power of written words outlasts physical power.',
        line_mm: 'ဒုတိယအချက်အနေဖြင့် ရေးသားထားသော စကားလုံးများ၏ စွမ်းအားသည် ရုပ်ပိုင်းဆိုင်ရာ စွမ်းအားထက် ပိုမိုကြာရှည်ခံသည်။',
      },
      {
        line_en: 'A sword can only harm a few individuals at a specific time and place.',
        line_mm: 'ဓားတစ်လက်သည် သတ်မှတ်ထားသော အချိန်နှင့် နေရာတစ်ခုတွင် လူအနည်းငယ်ကိုသာ ထိခိုက်နိုင်သည်။',
      },
      {
        line_en: 'However, written ideas can travel across borders, survive through centuries, and continue to educate future generations long after the author has died.',
        line_mm: 'သို့သော် ရေးသားထားသော အတွေးအခေါ်များသည် နယ်စပ်များကို ဖြတ်ကျော်နိုင်၊ ရာစုနှစ်များစွာ တည်ရှိနိုင်ပြီး စာရေးသူ ကွယ်လွန်ပြီးနောက် နှစ်ပေါင်းများစွာကြာသည့်တိုင် အနာဂတ်မျိုးဆက်သစ်များကို ပညာပေးနိုင်စေရန် ဆက်လက်တည်ရှိနေမည်ဖြစ်သည်။',
      },
      {
        line_en: 'In conclusion, violence can destroy life, but literature and ideas build civilization.',
        line_mm: 'နိဂုံးချုပ်အားဖြင့် အကြမ်းဖက်မှုသည် အသက်ကို ဖျက်ဆီးနိုင်သော်လည်း စာပေနှင့် အတွေးအခေါ်များသည် လူ့ယဉ်ကျေးမှုကို တည်ဆောက်သည်။',
      },
      {
        line_en: 'Therefore, peaceful expression through writing remains humanity\'s most effective tool for progress and positive change.',
        line_mm: 'ထို့ကြောင့် စာရေးခြင်းဖြင့် ငြိမ်းချမ်းစွာ ဖော်ပြခြင်းသည် တိုးတက်မှုနှင့် အပြုသဘောဆောင်သော ပြောင်းလဲမှုအတွက် လူသားမျိုးနွယ်၏ အထိရောက်ဆုံး ကိရိယာအဖြစ် ဆက်လက်တည်ရှိနေမည် ဖြစ်သည်။',
      },
    ],
    terms: [
      {
        term: 'mightier',
        definition_en: 'Having or showing great power, strength, or force.',
        definition_mm: 'ပိုမိုအားကောင်းသော၊ ပိုမိုစွမ်းအားကြီးသော',
      },
      {
        term: 'obedience',
        definition_en: 'Compliance with an order, request, or law, or submission to another\'s authority.',
        definition_mm: 'လိုက်နာမှု၊ နာခံမှု',
      },
      {
        term: 'enduring',
        definition_en: 'Lasting over a long period of time; durable.',
        definition_mm: 'တည်မြဲသော၊ ကြာရှည်ခံသော',
      },
      {
        term: 'injustice',
        definition_en: 'Lack of fairness or justice; violation of someone\'s rights.',
        definition_mm: 'မတရားမှု၊ တရားမမျှတမှု',
      },
      {
        term: 'outlasts',
        definition_en: 'To live or last longer than something or someone else.',
        definition_mm: 'ပိုမိုကြာရှည်ခံသည်၊ အသက်ရှည်သည်',
      },
      {
        term: 'civilization',
        definition_en: 'The stage of human social and cultural development and organization that is considered most advanced.',
        definition_mm: 'ယဉ်ကျေးမှု၊ လူ့အဖွဲ့အစည်း၏ ဖွံ့ဖြိုးတိုးတက်မှုအဆင့်',
      },
    ],
  },
]