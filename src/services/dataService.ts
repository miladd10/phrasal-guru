import { GoogleGenAI, Type, Modality } from "@google/genai";

const getApiKey = () => {
  return (process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "");
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export type Category = 'phrasal' | 'idiom';

export interface PhrasalVerb {
  id?: string;
  verb: string;
  definition: string;
  example: string;
  phonetic: string;
  translation: string;
  category: Category;
}

const RAW_PHRASAL_VERBS_DATA = [
  {
    verb: "add up",
    definition: "to combine to produce a particular result or effect",
    example: "The numbers don't add up, so I checked them again.",
    phonetic: "/ˌæd ˈʌp/",
    translation: "به نتیجه منطقی رسیدن",
    category: "phrasal"
  },
  {
    verb: "answer back",
    definition: "reply rudely to someone who has more authority",
    example: "Don't answer back when your teacher is speaking.",
    phonetic: "/ˌɑːnsə ˈbæk/",
    translation: "جواب پس دادن (با گستاخی)",
    category: "phrasal"
  },
  {
    verb: "ask out",
    definition: "invite someone to go with you to start a romantic relationship",
    example: "He asked her out for dinner, but she said no.",
    phonetic: "/ˌɑːsk ˈaʊt/",
    translation: "قرار گذاشتن / دعوت به بیرون"
  },
  {
    verb: "back down",
    definition: "stop asking for something because people oppose you",
    example: "I won't back down until the problem is fixed.",
    phonetic: "/ˌback ˈdaʊn/",
    translation: "عقب‌نشینی کردن"
  },
  {
    verb: "back up",
    definition: "give support by telling others you agree with them",
    example: "Can you back me up in the meeting?",
    phonetic: "/ˌbæk ˈʌp/",
    translation: "حمایت کردن"
  },
  {
    verb: "black out",
    definition: "suddenly become unconscious",
    example: "She felt dizzy and blacked out for a few seconds.",
    phonetic: "/ˌblæk ˈaʊt/",
    translation: "بیهوش شدن"
  },
  {
    verb: "blend in",
    definition: "be similar to surrounding things and not be noticed",
    example: "His black jacket helped him blend in with the crowd.",
    phonetic: "/ˌblend ˈɪn/",
    translation: "همرنگ جماعت شدن"
  },
  {
    verb: "blurt out",
    definition: "say something suddenly and without thinking",
    example: "I accidentally blurted out the surprise.",
    phonetic: "/ˌblɜːrt ˈaʊt/",
    translation: "پراندن (حرف)"
  },
  {
    verb: "board up",
    definition: "cover a window or door with wooden boards",
    example: "They boarded up the windows before the storm.",
    phonetic: "/ˌbɔːrd ˈʌp/",
    translation: "تخته‌کوب کردن"
  },
  {
    verb: "break down",
    definition: "divide something into separate parts",
    example: "Can you break down the cost for me?",
    phonetic: "/ˌbreɪk ˈdaʊn/",
    translation: "تجزیه کردن"
  },
  {
    verb: "break up",
    definition: "end a relationship or separate into pieces",
    example: "They broke up after three years together.",
    phonetic: "/ˌbreɪk ˈʌp/",
    translation: "به هم زدن"
  },
  {
    verb: "brighten up",
    definition: "start looking or feeling happier",
    example: "She brightened up when she saw the cake.",
    phonetic: "/ˌbraɪtn ˈʌp/",
    translation: "شاد شدن"
  },
  {
    verb: "bring about",
    definition: "make something happen, especially cause changes",
    example: "The new rule brought about many changes.",
    phonetic: "/ˌbrɪŋ əˈbaʊt/",
    translation: "باعث شدن"
  },
  {
    verb: "bring out",
    definition: "produce a new product or show a quality",
    example: "Apple brought out a new phone last year.",
    phonetic: "/ˌbrɪŋ ˈaʊt/",
    translation: "بیرون دادن (محصول)"
  },
  {
    verb: "bring together",
    definition: "create a situation in which people meet and do something",
    example: "The festival brought the whole town together.",
    phonetic: "/ˌbrɪŋ təˈɡeðə/",
    translation: "متحد کردن / گرد هم آوردن"
  },
  {
    verb: "brush up (on)",
    definition: "practise and improve your skills or knowledge",
    example: "I need to brush up on my English before the test.",
    phonetic: "/ˌbrʌʃ ˈʌp/",
    translation: "مرور کردن / تقویت مهارت"
  },
  {
    verb: "build up",
    definition: "gradually develop, increase, or move at the same speed",
    example: "He built up his confidence by practising every day.",
    phonetic: "/ˌbɪld ˈʌp/",
    translation: "تقویت کردن / ایجاد کردن"
  },
  {
    verb: "bump into",
    definition: "meet someone unexpectedly",
    example: "I bumped into my old teacher at the mall.",
    phonetic: "/ˌbʌmp ˈɪntuː/",
    translation: "اتفاقی دیدن"
  },
  {
    verb: "buy off",
    definition: "give money so they do not act against you",
    example: "They tried to buy off the guard with money.",
    phonetic: "/ˌbaɪ ˈɒf/",
    translation: "خریدن (رشوه دادن)"
  },
  {
    verb: "buy out",
    definition: "pay money to control all of a business",
    example: "A bigger company bought out the small shop.",
    phonetic: "/ˌbaɪ ˈaʊt/",
    translation: "خریدن سهم شریک"
  },
  {
    verb: "buy up",
    definition: "buy large amounts of something in one go",
    example: "People bought up all the bread before the storm.",
    phonetic: "/ˌbaɪ ˈʌp/",
    translation: "همه را خریدن"
  },
  {
    verb: "cancel out",
    definition: "stop something from having any effect",
    example: "The discount cancels out the delivery fee.",
    phonetic: "/ˌkænsl ˈaʊt/",
    translation: "خنثی کردن"
  },
  {
    verb: "carry over",
    definition: "take something from one period into the next",
    example: "Unused vacation days can carry over to next year.",
    phonetic: "/ˌkæri ˈəʊvə/",
    translation: "انتقال دادن (به دوره بعد)"
  },
  {
    verb: "catch on",
    definition: "become popular or finally understand",
    example: "The new dance caught on quickly at school.",
    phonetic: "/ˌkætʃ ˈɒn/",
    translation: "رواج یافتن / فهمیدن"
  },
  {
    verb: "centre around",
    definition: "have someone or something as the main subject",
    example: "The movie centres around a lost dog.",
    phonetic: "/ˈsentə əˌraʊnd/",
    translation: "محور بودن"
  },
  {
    verb: "chance upon",
    definition: "find or see someone unexpectedly",
    example: "We chanced upon a quiet café near the station.",
    phonetic: "/ˌtʃɑːns əˈpɒn/",
    translation: "تصادفی دیدن"
  },
  {
    verb: "change around",
    definition: "move things so they are in different places",
    example: "I changed the chairs around to make more space.",
    phonetic: "/ˌtʃeɪndʒ əˈraʊnd/",
    translation: "جابجا کردن"
  },
  {
    verb: "change into",
    definition: "stop being in one state and start in another",
    example: "The rain changed into snow overnight.",
    phonetic: "/ˌtʃeɪndʒ ˈɪntə/",
    translation: "تبدیل شدن به"
  },
  {
    verb: "change out of",
    definition: "take off clothes and put on different ones",
    example: "Change out of your wet clothes before you get cold.",
    phonetic: "/ˌtʃeɪndʒ ˈaʊt əv/",
    translation: "تعویض لباس"
  },
  {
    verb: "check out",
    definition: "examine in order to be certain of truth",
    example: "I'll check out the website tonight.",
    phonetic: "/ˌtʃek ˈaʊt/",
    translation: "بررسی کردن"
  },
  {
    verb: "clock up",
    definition: "reach a particular number or amount",
    example: "She clocked up 10,000 steps today.",
    phonetic: "/ˌklɒk ˈʌp/",
    translation: "به ثبت رساندن"
  },
  {
    verb: "close up",
    definition: "lock the doors of a building or business",
    example: "The shop closes up at nine.",
    phonetic: "/ˌkləʊz ˈʌp/",
    translation: "تعطیل کردن (موقتی)"
  },
  {
    verb: "club together",
    definition: "people giving money for a shared outcome",
    example: "We all clubbed together to buy a gift.",
    phonetic: "/ˌklʌb təˈɡeðə/",
    translation: "دنگی پول گذاشتن"
  },
  {
    verb: "come across",
    definition: "meet someone or find something by chance",
    example: "I came across an old photo on my phone.",
    phonetic: "/ˌkʌm əˈkrɒs/",
    translation: "اتفاقی پیدا کردن"
  },
  {
    verb: "come around to",
    definition: "change your opinion because of persuasion",
    example: "He finally came around to my idea.",
    phonetic: "/ˌkʌm əˈraʊnd tuː/",
    translation: "مجاب شدن / تغییر عقیده"
  },
  {
    verb: "come between",
    definition: "cause a disagreement between people",
    example: "Don't let money come between friends.",
    phonetic: "/ˌkʌm bɪˈtwiːn/",
    translation: "فاصله انداختن"
  },
  {
    verb: "come out",
    definition: "be removing by washing or become available",
    example: "This stain won't come out in the wash.",
    phonetic: "/ˌkʌm ˈaʊt/",
    translation: "بیرون آمدن / پاک شدن"
  },
  {
    verb: "come out in",
    definition: "become covered in spots or a rash",
    example: "I come out in a rash when I eat strawberries.",
    phonetic: "/ˌkʌm ˈaʊt ɪn/",
    translation: "دانه زدن / جوش زدن (بدن)"
  },
  {
    verb: "come out with",
    definition: "say something suddenly that surprises people",
    example: "He came out with a funny comment in class.",
    phonetic: "/ˌkʌm ˈaʊt wɪð/",
    translation: "یک دفعه حرفی زدن"
  },
  {
    verb: "come round",
    definition: "become conscious again or visit someone's house",
    example: "She came round after a few minutes.",
    phonetic: "/ˌkʌm ˈraʊnd/",
    translation: "به هوش آمدن / سر زدن"
  },
  {
    verb: "come up with",
    definition: "think of something such as an idea or plan",
    example: "We need to come up with a better plan.",
    phonetic: "/ˌkʌm ˈʌp wɪð/",
    translation: "ارائه دادن (طرح و ایده)"
  },
  {
    verb: "cool down",
    definition: "become cooler or less angry",
    example: "Go for a walk and cool down first.",
    phonetic: "/ˌkuːl ˈdaʊn/",
    translation: "خنک شدن / آرام شدن"
  },
  {
    verb: "cordon off",
    definition: "stop people entering an area using rope/tape",
    example: "Police cordoned off the street after the accident.",
    phonetic: "/ˌkɔːrdn ˈɒf/",
    translation: "منطقه را محصور کردن"
  },
  {
    verb: "cotton on",
    definition: "begin to realise or understand something",
    example: "I finally cottoned on to the joke.",
    phonetic: "/ˌkɒtn ˈɒn/",
    translation: "دوزاری افتادن / متوجه شدن"
  },
  {
    verb: "crack down on",
    definition: "start dealing with something more strictly",
    example: "The school is cracking down on late homework.",
    phonetic: "/ˌkræk ˈdaʊn ɒn/",
    translation: "سخت‌گیری کردن"
  },
  {
    verb: "crease up",
    definition: "laugh a lot or make someone laugh",
    example: "That joke made everyone crease up.",
    phonetic: "/ˌkriːs ˈʌp/",
    translation: "از خنده روده بر شدن"
  },
  {
    verb: "creep up on",
    definition: "move towards someone quietly to surprise them",
    example: "The cat crept up on the bird quietly.",
    phonetic: "/ˌkriːp ˈʌp ɒn/",
    translation: "دزدکی نزدیک شدن"
  },
  {
    verb: "crop up",
    definition: "appear or happen suddenly or unexpectedly",
    example: "Something came up at work, so I was late.",
    phonetic: "/ˌkrɒp ˈʌp/",
    translation: "پیش آمدن (ناگهانی)"
  },
  {
    verb: "crowd around",
    definition: "move to a place at the same time as many others",
    example: "Fans crowded around the singer for photos.",
    phonetic: "/ˌkraʊd əˈraʊnd/",
    translation: "هجوم آوردن دور کسی"
  },
  {
    verb: "cut back on",
    definition: "reduce the amount of something, especially money",
    example: "I'm trying to cut back on sugar.",
    phonetic: "/ˌkʌt ˈbæk ɒn/",
    translation: "صرفه‌جویی کردن"
  },
  {
    verb: "cut out",
    definition: "stop eating something especially for health",
    example: "I cut out soda to feel healthier.",
    phonetic: "/ˌkʌt ˈaʊt/",
    translation: "حذف کردن (رژیم)"
  },
  {
    verb: "die out",
    definition: "become weaker and then disappear completely",
    example: "Some old traditions die out over time.",
    phonetic: "/ˌdaɪ ˈaʊt/",
    translation: "منقرض شدن"
  },
  {
    verb: "dig up",
    definition: "find information or remove from ground",
    example: "She dug up an old email from last year.",
    phonetic: "/ˌdɪɡ ˈʌp/",
    translation: "از زیر خاک درآوردن / کنکاش"
  },
  {
    verb: "dive in",
    definition: "start doing something enthusiastically",
    example: "Don't overthink it; just dive in and start.",
    phonetic: "/ˌdaɪv ˈɪn/",
    translation: "شیرجه زدن در کار"
  },
  {
    verb: "do away with",
    definition: "get rid of something",
    example: "The company did away with paper forms.",
    phonetic: "/ˌduː əˈweɪ wɪð/",
    translation: "برانداختن / لغو کردن"
  },
  {
    verb: "do up",
    definition: "fasten clothing or repair/decorate something",
    example: "I need to do up my jacket; it's cold.",
    phonetic: "/ˌduː ˈʌp/",
    translation: "بستن (دکمه) / بازسازی"
  },
  {
    verb: "drum up",
    definition: "try to make people support you or buy from you",
    example: "We made posters to drum up support.",
    phonetic: "/ˌdrʌm ˈʌp/",
    translation: "جلب کردن / راه انداختن"
  },
  {
    verb: "dry up",
    definition: "water comes out or stop being available",
    example: "The lake dried up during the hot summer.",
    phonetic: "/ˌdraɪ ˈʌp/",
    translation: "خشک شدن / ته کشیدن"
  },
  {
    verb: "end up",
    definition: "be in a particular state after something",
    example: "If you don't study, you may end up failing.",
    phonetic: "/ˌend ˈʌp/",
    translation: "منتهی شدن"
  },
  {
    verb: "face up to",
    definition: "accept something and try to deal with it",
    example: "It's time to face up to the truth.",
    phonetic: "/ˌfeɪs ˈʌp tuː/",
    translation: "روبرو شدن با واقعیت"
  },
  {
    verb: "fade away",
    definition: "disappear slowly",
    example: "The music faded away at the end.",
    phonetic: "/ˌfeɪd əˈweɪ/",
    translation: "محو شدن"
  },
  {
    verb: "fall behind",
    definition: "make less progress than others",
    example: "I fell behind in math after missing a week.",
    phonetic: "/ˌfɔːl bɪˈhaɪnd/",
    translation: "عقب افتادن"
  },
  {
    verb: "figure out",
    definition: "understand or solve a problem",
    example: "I can't figure out why this app keeps crashing.",
    phonetic: "/ˌfɪɡər ˈaʊt/",
    translation: "سر درآوردن"
  },
  {
    verb: "fix up",
    definition: "clean, repair or decorate something",
    example: "He fixed up his old bike and sold it.",
    phonetic: "/ˌfɪks ˈʌp/",
    translation: "تعمیر و نوسازی"
  },
  {
    verb: "follow up",
    definition: "find out more or check effectiveness",
    example: "I'll follow up with them tomorrow.",
    phonetic: "/ˌfɒləʊ ˈʌp/",
    translation: "پیگیری کردن"
  },
  {
    verb: "get across",
    definition: "make people understand something",
    example: "She used pictures to get her idea across.",
    phonetic: "/ˌɡet əˈkrɒs/",
    translation: "فهماندن"
  },
  {
    verb: "get around",
    definition: "if news gets around, people hear it",
    example: "The news got around the office fast.",
    phonetic: "/ˌɡet əˈraʊnd/",
    translation: "پخش شدن (خبر)"
  },
  {
    verb: "get down",
    definition: "make someone feel sad",
    example: "Rainy weather really gets me down.",
    phonetic: "/ˌɡet ˈdaʊn/",
    translation: "افسرده کردن"
  },
  {
    verb: "get in",
    definition: "be elected for a political job",
    example: "If she gets in, she wants to improve schools.",
    phonetic: "/ˌɡet ˈɪn/",
    translation: "منتخب شدن"
  },
  {
    verb: "get into",
    definition: "become involved or start enjoying",
    example: "I got into chess during the summer.",
    phonetic: "/ˌɡet ˈɪntə/",
    translation: "وارد شدن / علاقه‌مند شدن"
  },
  {
    verb: "get off",
    definition: "holiday or not be punished severely",
    example: "I got Friday off from work.",
    phonetic: "/ˌɡet ˈɒf/",
    translation: "مرخصی گرفتن / قسر در رفتن"
  },
  {
    verb: "get over",
    definition: "solve a problem or feel well after illness",
    example: "It took me a week to get over the flu.",
    phonetic: "/ˌɡet ˈəʊvə/",
    translation: "بهبودی یافتن / چیره شدن"
  },
  {
    verb: "get through",
    definition: "finish work or stay alive until end of difficulty",
    example: "I have a lot of emails to get through.",
    phonetic: "/ˌɡet ˈθruː/",
    translation: "به پایان رساندن"
  },
  {
    verb: "get through to",
    definition: "be connected by phone or make someone understand",
    example: "I couldn't get through to customer service.",
    phonetic: "/ˌɡet ˈθruː tuː/",
    translation: "فهماندن به / وصل شدن به"
  },
  {
    verb: "give in",
    definition: "stop competing and accept defeat",
    example: "I argued for a while, but finally gave in.",
    phonetic: "/ˌɡɪv ˈɪn/",
    translation: "تسلیم شدن"
  },
  {
    verb: "go astray",
    definition: "become lost or go to wrong place",
    example: "We took the wrong road and went astray.",
    phonetic: "/ˌɡəʊ əˈstreɪ/",
    translation: "به بیراهه رفتن"
  },
  {
    verb: "go down with",
    definition: "to start to suffer from an infectious disease",
    example: "He went down with the flu last week.",
    phonetic: "/ˈɡəʊ daʊn wɪð/",
    translation: "مریض شدن"
  },
  {
    verb: "go in for",
    definition: "choose a career or enjoy an activity",
    example: "She decided to go in for nursing.",
    phonetic: "/ˌɡəʊ ˈɪn fə/",
    translation: "انتخاب کردن / علاقه داشتن"
  },
  {
    verb: "go off",
    definition: "explode, be fired, or food not fresh",
    example: "The alarm went off at six.",
    phonetic: "/ˌɡəʊ ˈɒf/",
    translation: "منفجر شدن / فاسد شدن"
  },
  {
    verb: "go together",
    definition: "frequently exist together or look good together",
    example: "That shirt and jacket go together well.",
    phonetic: "/ˌɡəʊ təˈɡeðə/",
    translation: "با هم آمدن / جور بودن"
  },
  {
    verb: "grow on",
    definition: "start to like someone/something more",
    example: "I didn't like the song at first, but it grew on me.",
    phonetic: "/ˌɡrəʊ ˈɒn/",
    translation: "به دل نشستن"
  },
  {
    verb: "hang out",
    definition: "lean out of a window or spend time in a place",
    example: "We usually hang out at the park after school.",
    phonetic: "/ˌhæŋ ˈaʊt/",
    translation: "وقت‌گذرانی کردن"
  },
  {
    verb: "head off",
    definition: "prevent someone going somewhere/something happening",
    example: "Good planning can head off many problems.",
    phonetic: "/ˌhed ˈɒf/",
    translation: "جلوگیری کردن"
  },
  {
    verb: "heat up",
    definition: "make something hot or become hot",
    example: "Heat up the soup before you eat it.",
    phonetic: "/ˌhiːt ˈʌp/",
    translation: "گرم کردن"
  },
  {
    verb: "hit back",
    definition: "criticise someone who criticised you",
    example: "She hit back after people criticized her work.",
    phonetic: "/ˌhɪt ˈbæk/",
    translation: "تلافی کردن / پاسخ دادن"
  },
  {
    verb: "hit upon",
    definition: "suddenly have an idea or discover something",
    example: "I hit upon a good idea in the shower.",
    phonetic: "/ˌhɪt əˈpɒn/",
    translation: "یک دفعه به فکر رسیدن"
  },
  {
    verb: "hold back",
    definition: "stop someone moving forwards",
    example: "Security held back the crowd.",
    phonetic: "/ˌhəʊld ˈbæk/",
    translation: "عقب نگه داشتن"
  },
  {
    verb: "keep up",
    definition: "continue or move at same speed",
    example: "Slow down; I can't keep up with you.",
    phonetic: "/ˌkiːp ˈʌp/",
    translation: "ادامه دادن / همپای کسی رفتن"
  },
  {
    verb: "key in",
    definition: "put info into computer using keyboard",
    example: "Please key in your password.",
    phonetic: "/ˌkiː ˈɪn/",
    translation: "تایپ کردن / وارد کردن داده"
  },
  {
    verb: "kick off with",
    definition: "begin or start something with",
    example: "Let's kick off with a quick update.",
    phonetic: "/ˌkɪk ˈɒf wɪð/",
    translation: "شروع کردن با"
  },
  {
    verb: "kill off",
    definition: "destroy living things so all are dead",
    example: "The cold weather killed off my plants.",
    phonetic: "/ˌkɪl ˈɒf/",
    translation: "از بین بردن"
  },
  {
    verb: "knock off",
    definition: "stop working",
    example: "Let's knock off at five today.",
    phonetic: "/ˌnɒk ˈɒf/",
    translation: "دست از کار کشیدن"
  },
  {
    verb: "knock down",
    definition: "destroy a building or wall or hit someone with vehicle",
    example: "They knocked down the old garage.",
    phonetic: "/ˌnɒk ˈdaʊn/",
    translation: "تخریب کردن / زیر گرفتن"
  },
  {
    verb: "knuckle down",
    definition: "start working hard",
    example: "I need to knuckle down and finish this report.",
    phonetic: "/ˌnʌkl ˈdaʊn/",
    translation: "سخت مشغول کار شدن"
  },
  {
    verb: "lash out",
    definition: "speak angrily or attack suddenly",
    example: "He lashed out because he was stressed.",
    phonetic: "/ˌlæʃ ˈaʊt/",
    translation: "پرخاش کردن / حمله کردن"
  },
  {
    verb: "lay off",
    definition: "end employment or stop using for short time",
    example: "The company had to lay off ten workers.",
    phonetic: "/ˌleɪ ˈɒf/",
    translation: "تعدیل نیرو / دست کشیدن"
  },
  {
    verb: "laze around",
    definition: "relax and enjoy yourself doing no work",
    example: "I just want to laze around this weekend.",
    phonetic: "/ˌleɪz əˈraʊnd/",
    translation: "ول گشتن / تنبلی کردن"
  },
  {
    verb: "let on",
    definition: "talk about secret",
    example: "Don't let on that we planned a surprise.",
    phonetic: "/ˌlet ˈɒn/",
    translation: "بروز دادن (راز)"
  },
  {
    verb: "lie ahead",
    definition: "happening to you in the future",
    example: "A lot of work lies ahead.",
    phonetic: "/ˌlaɪ əˈhed/",
    translation: "در پیش بودن"
  },
  {
    verb: "liven up",
    definition: "make more interesting or exciting",
    example: "Some music will liven up the party.",
    phonetic: "/ˌlaɪvn ˈʌp/",
    translation: "روح بخشیدن / باطراوت کردن"
  },
  {
    verb: "lock up",
    definition: "lock doors or put in prison",
    example: "Don't forget to lock up before you leave.",
    phonetic: "/ˌlɒk ˈʌp/",
    translation: "زندانی کردن / قفل کردن"
  },
  {
    verb: "make into",
    definition: "change someone/something so they become something else",
    example: "They made the garage into a small office.",
    phonetic: "/ˌmeɪk ˈɪntə/",
    translation: "تبدیل کردن به"
  },
  {
    verb: "make out",
    definition: "see/hear with difficulty or suggest",
    example: "I can't make out the sign from here.",
    phonetic: "/ˌmeɪk ˈaʊt/",
    translation: "تشخیص دادن / وانمود کردن"
  },
  {
    verb: "make over",
    definition: "change or improve appearance",
    example: "They made over the old room with new paint.",
    phonetic: "/ˌmeɪk ˈəʊvə/",
    translation: "تغییر ظاهر دادن"
  },
  {
    verb: "make up",
    definition: "work at different times or invent story",
    example: "I made up an excuse for being late.",
    phonetic: "/ˌmeɪk ˈʌp/",
    translation: "جبران کردن / سر هم کردن"
  },
  {
    verb: "meet up",
    definition: "come together with someone",
    example: "Let's meet up after work.",
    phonetic: "/ˌmiːt ˈʌp/",
    translation: "ملاقات کردن"
  },
  {
    verb: "mess about/around",
    definition: "behave sillily or spend time relaxing",
    example: "Stop messing around and finish your homework.",
    phonetic: "/ˌmes əˈbaʊt/",
    translation: "مسخره‌بازی درآوردن / وقت تلف کردن"
  },
  {
    verb: "mess up",
    definition: "make mistake or cause physical problems",
    example: "I messed up the password and got locked out.",
    phonetic: "/ˌmes ˈʌp/",
    translation: "خراب کردن"
  },
  {
    verb: "mix up",
    definition: "put things together without order",
    example: "I mixed up the two addresses.",
    phonetic: "/ˌmɪks ˈʌp/",
    translation: "قاطی کردن / اشتباه گرفتن"
  },
  {
    verb: "mount up",
    definition: "get much larger",
    example: "The bills are starting to mount up.",
    phonetic: "/ˌmaʊnt ˈʌp/",
    translation: "بالا رفتن (مقدار)"
  },
  {
    verb: "move in with",
    definition: "start living in a different flat/house with",
    example: "She moved in with her sister last month.",
    phonetic: "/ˌmuːv ˈɪn wɪð/",
    translation: "هم‌خانه شدن"
  },
  {
    verb: "move on",
    definition: "leave one place or stop discussing topic",
    example: "Let's move on to the next question.",
    phonetic: "/ˌmuːv ˈɒn/",
    translation: "ادامه دادن / نقل مکان کردن"
  },
  {
    verb: "move out",
    definition: "permanently leave house/flat",
    example: "He moved out of his apartment in June.",
    phonetic: "/ˌmuːv ˈaʊt/",
    translation: "اسباب‌کشی کردن (رفتن)"
  },
  {
    verb: "move over",
    definition: "change position to make space",
    example: "Could you move over a little?",
    phonetic: "/ˌmuːv ˈəʊvə/",
    translation: "کمی آن‌طرف‌تر رفتن"
  },
  {
    verb: "mull over",
    definition: "think carefully about something over period of time",
    example: "I need time to mull over the offer.",
    phonetic: "/ˌmʌl ˈəʊvə/",
    translation: "تأمل کردن"
  },
  {
    verb: "open up",
    definition: "make traveling easier or talk about feelings",
    example: "He finally opened up about his worries.",
    phonetic: "/ˌəʊpən ˈʌp/",
    translation: "درددل کردن / باز شدن"
  },
  {
    verb: "opt out of",
    definition: "decide not to take part in something",
    example: "I opted out of the optional trip.",
    phonetic: "/ˌɒpt ˈaʊt əv/",
    translation: "انصراف دادن"
  },
  {
    verb: "paper over",
    definition: "hide problem rather than solve it",
    example: "They tried to paper over the real problem.",
    phonetic: "/ˌpeɪpə ˈəʊvə/",
    translation: "ماست‌مالی کردن"
  },
  {
    verb: "pass away",
    definition: "polite way to say die",
    example: "My grandfather passed away last year.",
    phonetic: "/ˌpɑːs əˈweɪ/",
    translation: "درگذشتن"
  },
  {
    verb: "pass on",
    definition: "give someone something meant for them",
    example: "Can you pass this message on to Sara?",
    phonetic: "/ˌpɑːs ˈɒn/",
    translation: "انتقال دادن (پیام)"
  },
  {
    verb: "patch up",
    definition: "become friends again or give basic treatment",
    example: "They patched up their friendship after the argument.",
    phonetic: "/ˌpætʃ ˈʌp/",
    translation: "دوستانه حل کردن / مداوا کردن"
  },
  {
    verb: "pay back",
    definition: "give same amount of money borrowed",
    example: "I'll pay you back on Friday.",
    phonetic: "/ˌpeɪ ˈbæk/",
    translation: "پس دادن پول"
  },
  {
    verb: "pay out",
    definition: "provide money or spend a lot",
    example: "The insurance company paid out quickly.",
    phonetic: "/ˌpeɪ ˈaʊt/",
    translation: "پرداخت کردن (زیاد)"
  },
  {
    verb: "phase out",
    definition: "gradually stop using something",
    example: "They are phasing out old plastic bags.",
    phonetic: "/ˌfeɪz ˈaʊt/",
    translation: "تدریجاً کنار گذاشتن"
  },
  {
    verb: "pick on",
    definition: "keep treating someone badly/unfairly",
    example: "Don't pick on your little brother.",
    phonetic: "/ˌpɪk ˈɒn/",
    translation: "اذیت کردن / پیله کردن"
  },
  {
    verb: "pick up",
    definition: "meet arranged vehicle or learn new skill",
    example: "I'll pick you up at seven.",
    phonetic: "/ˌpɪk ˈʌp/",
    translation: "سوار کردن / یاد گرفتن"
  },
  {
    verb: "piece together",
    definition: "learn truth by considering separate bits",
    example: "Police pieced together what happened from the videos.",
    phonetic: "/ˌpiːs təˈɡeðə/",
    translation: "سرهم کردن (اطلاعات)"
  },
  {
    verb: "pile up",
    definition: "amount increases a lot",
    example: "The dishes are starting to pile up.",
    phonetic: "/ˌpaɪl ˈʌp/",
    translation: "کومه‌شدن / روی هم انباشتن"
  },
  {
    verb: "play up",
    definition: "cause difficulties or behave badly",
    example: "My laptop is playing up again.",
    phonetic: "/ˌpleɪ ˈʌp/",
    translation: "بد قلقلی کردن"
  },
  {
    verb: "press ahead/on with",
    definition: "continue in determined way despite difficulty",
    example: "They pressed ahead with the plan.",
    phonetic: "/ˌpres əˈhed wɪð/",
    translation: "با پشتکار ادامه دادن"
  },
  {
    verb: "prop up",
    definition: "help system continue to exist or stop sth falling",
    example: "I used a box to prop up the table.",
    phonetic: "/ˌprɒp ˈʌp/",
    translation: "نگه‌داری کردن / تکیه‌گاه دادن"
  },
  {
    verb: "pull over",
    definition: "stop by side of road in vehicle",
    example: "Pull over here; I need to check the map.",
    phonetic: "/ˌpʊl ˈəʊvə/",
    translation: "بغل زدن (رانندگی)"
  },
  {
    verb: "pull through",
    definition: "stay alive after illness or succeed in difficulty",
    example: "She was very sick, but she pulled through.",
    phonetic: "/ˌpʊl ˈθruː/",
    translation: "جان سالم به در بردن"
  },
  {
    verb: "push around",
    definition: "keep telling someone what to do unfairly",
    example: "Don't let anyone push you around.",
    phonetic: "/ˌpʊʃ əˈraʊnd/",
    translation: "زورگویی کردن"
  },
  {
    verb: "put across/over",
    definition: "explain idea in easy way to understand",
    example: "He put the idea across clearly.",
    phonetic: "/ˌpʊt əˈkrɒs/",
    translation: "فهماندن / بیان کردن"
  },
  {
    verb: "put down to",
    definition: "think it happened for a particular reason",
    example: "I put my headache down to stress.",
    phonetic: "/ˌpʊt ˈdaʊn tuː/",
    translation: "نسبت دادن به"
  },
  {
    verb: "put in",
    definition: "fix equipment or spend amount of time",
    example: "She put in a lot of effort.",
    phonetic: "/ˌpʊt ˈɪn/",
    translation: "قرار دادن / وقت گذاشتن"
  },
  {
    verb: "put together",
    definition: "choose people/things to form group or join parts",
    example: "I put together a list of questions.",
    phonetic: "/ˌpʊt təˈɡeðə/",
    translation: "گردآوری کردن / سرهم کردن"
  },
  {
    verb: "put up",
    definition: "build structure or let someone stay in house",
    example: "We can put you up for the weekend.",
    phonetic: "/ˌpʊt ˈʌp/",
    translation: "بنا کردن / اسکان دادن"
  },
  {
    verb: "puzzle out",
    definition: "solve complicated problem by thinking carefully",
    example: "I finally puzzled out the answer.",
    phonetic: "/ˌpʌzl ˈaʊt/",
    translation: "حل کردن (معما)"
  },
  {
    verb: "read up (on/about)",
    definition: "get info on subject by reading a lot",
    example: "I read up on the company before the interview.",
    phonetic: "/ˌriːd ˈʌp/",
    translation: "مطالعه کردن (درباره)"
  },
  {
    verb: "run down",
    definition: "organisation size is reduced (run-down)",
    example: "The old building has run down over the years.",
    phonetic: "/ˌrʌn ˈdaʊn/",
    translation: "روبه‌زوال رفتن"
  },
  {
    verb: "scrape through",
    definition: "succeed but not in impressive way",
    example: "I scraped through the exam with a low pass.",
    phonetic: "/ˌskreɪp ˈθruː/",
    translation: "پلکانی گذشتن / به سختی موفق شدن"
  },
  {
    verb: "seek out",
    definition: "find someone/something by looking determinedly",
    example: "She sought out the best doctor in town.",
    phonetic: "/ˌsiːk ˈaʊt/",
    translation: "جستجو و یافتن"
  },
  {
    verb: "set down",
    definition: "state officially how it should be done or write on paper",
    example: "The rules are set down in the guide.",
    phonetic: "/ˌset ˈdaʊn/",
    translation: "تعیین کردن / نوشتن"
  },
  {
    verb: "set out",
    definition: "start working to achieve aim",
    example: "He set out to learn English in one year.",
    phonetic: "/ˌset ˈaʊt/",
    translation: "قصد کردن / شروع کردن"
  },
  {
    verb: "set up",
    definition: "build structure or make equipment ready",
    example: "I set up my new laptop last night.",
    phonetic: "/ˌset ˈʌp/",
    translation: "برپا کردن / تنظیم کردن"
  },
  {
    verb: "shout down",
    definition: "make it difficult to hear what someone says by shouting",
    example: "The speaker was shouted down by the crowd.",
    phonetic: "/ˌʃaʊt ˈdaʊn/",
    translation: "با فریاد مانع حرف کسی شدن"
  },
  {
    verb: "shrivel up",
    definition: "become smaller/thinner or weaker",
    example: "The flowers shrivelled up in the heat.",
    phonetic: "/ˌʃrɪvl ˈʌp/",
    translation: "چروکیده شدن / تحلیل رفتن"
  },
  {
    verb: "single out",
    definition: "choose one person from group for special attention",
    example: "The teacher singled me out for praise.",
    phonetic: "/ˌsɪnɡl ˈaʊt/",
    translation: "گلچین کردن"
  },
  {
    verb: "size up",
    definition: "think carefully and form opinion about person",
    example: "I sized up the room before the meeting.",
    phonetic: "/ˌsaɪz ˈʌp/",
    translation: "برانداز کردن"
  },
  {
    verb: "slip away",
    definition: "leave secretly",
    example: "He slipped away before anyone noticed.",
    phonetic: "/ˌslɪp əˈweɪ/",
    translation: "جیم شدن"
  },
  {
    verb: "slip up",
    definition: "make careless mistake",
    example: "I slipped up and sent the email too early.",
    phonetic: "/ˌslɪp ˈʌp/",
    translation: "سهل‌انگاری کردن"
  },
  {
    verb: "smarten up",
    definition: "make look tidy and clean",
    example: "I smartened up before the interview.",
    phonetic: "/ˌsmɑːrtn ˈʌp/",
    translation: "آراسته کردن"
  },
  {
    verb: "snow under",
    definition: "too much of something to deal with",
    example: "I'm snowed under with homework this week.",
    phonetic: "/ˌsnəʊ ˈʌndə/",
    translation: "غرق در کار بودن"
  },
  {
    verb: "sound out",
    definition: "find out opinions by talking to them",
    example: "We sounded out a few customers first.",
    phonetic: "/ˌsaʊnd ˈaʊt/",
    translation: "سنجیدن نظر"
  },
  {
    verb: "speak out",
    definition: "state opinion firmly and publicly",
    example: "She spoke out against the unfair rule.",
    phonetic: "/ˌspiːk ˈaʊt/",
    translation: "علنی صحبت کردن"
  },
  {
    verb: "spread out",
    definition: "move away from one another to cover large area",
    example: "Spread out so everyone has room.",
    phonetic: "/ˌspred ˈaʊt/",
    translation: "پهن شدن"
  },
  {
    verb: "spring up",
    definition: "appear or be produced suddenly",
    example: "New cafés have sprung up on this street.",
    phonetic: "/ˌsprɪŋ ˈʌp/",
    translation: "قارچ‌گونه روییدن / پدیدار شدن"
  },
  {
    verb: "stand out",
    definition: "easy to see or much more impressive",
    example: "Her red coat really stands out.",
    phonetic: "/ˌstænd ˈaʊt/",
    translation: "برجسته بودن"
  },
  {
    verb: "stand up to",
    definition: "not allow yourself to be treated badly",
    example: "You should stand up to people who bully you.",
    phonetic: "/ˌstænd ˈʌp tuː/",
    translation: "ایستادگی کردن"
  },
  {
    verb: "step aside",
    definition: "leave job so someone else takes over or move so sb pass",
    example: "Please step aside so I can pass.",
    phonetic: "/ˌstep əˈsaɪd/",
    translation: "کنار رفتن"
  },
  {
    verb: "stop off",
    definition: "visit somewhere before continuing to another place",
    example: "We stopped off for coffee on the way home.",
    phonetic: "/ˌstɒp ˈɒf/",
    translation: "توقف کوتاه در مسیر"
  },
  {
    verb: "store up",
    definition: "cause future problems or keep a lot for later",
    example: "Don't store up problems; talk about them early.",
    phonetic: "/ˌstɔːr ˈʌp/",
    translation: "ذخیره کردن / فراهم کردن (مشکل)"
  },
  {
    verb: "summon up",
    definition: "manage to produce quality helping deal with difficulty",
    example: "She summoned up the courage to speak.",
    phonetic: "/ˌsʌmən ˈʌp/",
    translation: "گردآوری کردن (نیرو)"
  },
  {
    verb: "switch on/off",
    definition: "start/stop machine or light",
    example: "Switch off the lights before you leave.",
    phonetic: "/ˌswɪtʃ ˈɒn/",
    translation: "کشی/خاموش کردن"
  },
  {
    verb: "swot up (on)",
    definition: "study something very hard for an exam",
    example: "I need to swot up on history tonight.",
    phonetic: "/ˌswɒt ˈʌp/",
    translation: "سخت مطالعه کردن"
  },
  {
    verb: "take after",
    definition: "look or behave like an older relative",
    example: "He takes after his father.",
    phonetic: "/ˌteɪk ˈɑːftə/",
    translation: "به کسی رفتن (ظاهر/اخلاق)"
  },
  {
    verb: "take apart",
    definition: "separate an object into pieces",
    example: "I took apart the chair to move it.",
    phonetic: "/ˌteɪk əˈpɑːt/",
    translation: "از هم باز کردن"
  },
  {
    verb: "take away",
    definition: "remove one number from another",
    example: "Take two away from ten.",
    phonetic: "/ˌteɪk əˈweɪ/",
    translation: "کم کردن / بیرون‌بر"
  },
  {
    verb: "take down",
    definition: "separate structures or write down information",
    example: "Can you take down my phone number?",
    phonetic: "/ˌteɪk ˈdaʊn/",
    translation: "پیاده کردن / یادداشت کردن"
  },
  {
    verb: "take in",
    definition: "accept as real or understand/remember",
    example: "The view was beautiful, so we stopped to take it in.",
    phonetic: "/ˌteɪk ˈɪn/",
    translation: "فهمیدن / فریب خوردن / گنجاندن"
  },
  {
    verb: "take off",
    definition: "become successful fast or away from work",
    example: "Her small business took off quickly.",
    phonetic: "/ˌteɪk ˈɒf/",
    translation: "بلند شدن / موفق شدن"
  },
  {
    verb: "take on",
    definition: "accept work/responsibility or employ someone",
    example: "I can't take on more work this week.",
    phonetic: "/ˌteɪk ˈɒn/",
    translation: "پذیرفتن / استخدام کردن"
  },
  {
    verb: "take out",
    definition: "take someone to cinema/restaurant and pay",
    example: "I'll take you out for lunch tomorrow.",
    phonetic: "/ˌteɪk ˈaʊt/",
    translation: "بیرون بردن"
  },
  {
    verb: "take over",
    definition: "begin to do what someone else was doing/control",
    example: "She took over the project last month.",
    phonetic: "/ˌteɪk ˈəʊvə/",
    translation: "به عهده گرفتن / کنترل کردن"
  },
  {
    verb: "take to",
    definition: "begin to like someone/something or start habit",
    example: "I took to running every morning.",
    phonetic: "/ˌteɪk ˈtuː/",
    translation: "علاقه‌مند شدن / عادت کردن"
  },
  {
    verb: "talk down to",
    definition: "talk as if they are not clever or important",
    example: "Don't talk down to me.",
    phonetic: "/ˌtɔːk ˈdaʊn tuː/",
    translation: "با تحقیر حرف زدن"
  },
  {
    verb: "talk over",
    definition: "discuss a problem or plan",
    example: "Let's talk over the plan before we decide.",
    phonetic: "/ˌtɔːk ˈəʊvə/",
    translation: "بحث و گفتگو کردن"
  },
  {
    verb: "talk round",
    definition: "discuss in general way or persuade",
    example: "He talked me round after a long discussion.",
    phonetic: "/ˌtɔːk ˈraʊnd/",
    translation: "کلی‌گویی / متقاعد کردن"
  },
  {
    verb: "test out",
    definition: "try using machine to find whether it works correctly",
    example: "I tested out the new app yesterday.",
    phonetic: "/ˌtest ˈaʊt/",
    translation: "آزمایش کردن"
  },
  {
    verb: "think over",
    definition: "consider problem or decision carefully",
    example: "Think over the offer before you answer.",
    phonetic: "/ˌθɪŋk ˈəʊvə/",
    translation: "سنجیدن / فکر کردن"
  },
  {
    verb: "think through",
    definition: "consider facts in organised way",
    example: "Let's think through the risks first.",
    phonetic: "/ˌθɪŋk ˈθruː/",
    translation: "همه جوانب را در نظر گرفتن"
  },
  {
    verb: "think up",
    definition: "invent or imagine something",
    example: "We need to think up a better name.",
    phonetic: "/ˌθɪŋk ˈʌp/",
    translation: "سر هم کردن / اختراع کردن"
  },
  {
    verb: "throw out",
    definition: "force someone leave or get rid of something",
    example: "I threw out the broken chair.",
    phonetic: "/ˌθrəʊ ˈaʊt/",
    translation: "بیرون انداختن / دور ریختن"
  },
  {
    verb: "throw up",
    definition: "cause dust/water rise or produce new problem",
    example: "The roadworks threw up a lot of dust.",
    phonetic: "/ˌθrəʊ ˈʌp/",
    translation: "ایجاد کردن / استفراغ"
  },
  {
    verb: "tide over",
    definition: "help someone get to end of difficult period",
    example: "This loan will tide me over until payday.",
    phonetic: "/ˌtaɪd ˈəʊvə/",
    translation: "از پس (مشکل مالی) برآمدن"
  },
  {
    verb: "tip up",
    definition: "have one end move upwards or turn container down",
    example: "The cup tipped up and spilled water.",
    phonetic: "/ˌtɪp ˈʌp/",
    translation: "واژگون شدن"
  },
  {
    verb: "touch up",
    definition: "make surface look better with small improvements",
    example: "I touched up the paint on the door.",
    phonetic: "/ˌtʌtʃ ˈʌp/",
    translation: "اصلاح و لکه گیری"
  },
  {
    verb: "turn into",
    definition: "change or develop into something different",
    example: "The old factory turned into apartments.",
    phonetic: "/ˌtɜːn ˈɪntə/",
    translation: "تبدیل شدن به"
  },
  {
    verb: "use up",
    definition: "use all of a supply of something",
    example: "We used up all the milk.",
    phonetic: "/ˌjuːz ˈʌp/",
    translation: "مصرف کردن و تمام کردن"
  },
  {
    verb: "walk out",
    definition: "leave meeting or suddenly leave relationship",
    example: "He walked out of the meeting angrily.",
    phonetic: "/ˌwɔːk ˈaʊt/",
    translation: "ترک کردن (قهر)"
  },
  {
    verb: "ward off",
    definition: "prevent someone/something harming you",
    example: "A warm jacket helps ward off the cold.",
    phonetic: "/ˌwɔːrd ˈɒf/",
    translation: "دفع کردن"
  },
  {
    verb: "warm up",
    definition: "prepare for sport by doing gentle exercises",
    example: "Warm up before you start running.",
    phonetic: "/ˌwɔːrm ˈʌp/",
    translation: "گرم کردن (ورزش)"
  },
  {
    verb: "waste away",
    definition: "gradually become thinner and weaker",
    example: "The plant wasted away without water.",
    phonetic: "/ˌweɪst əˈweɪ/",
    translation: "تحلیل رفتن (جسمی)"
  },
  {
    verb: "water down",
    definition: "add water to liquid or make statement less powerful",
    example: "Don't water down your main point.",
    phonetic: "/ˌwɔːtə ˈdaʊn/",
    translation: "رقیق کردن / از تاب و توان انداختن"
  },
  {
    verb: "wear down",
    definition: "make someone lose energy or wear thin by rubbing",
    example: "Long workdays can wear you down.",
    phonetic: "/ˌweə ˈdaʊn/",
    translation: "فرسوده کردن / از پا درآوردن"
  },
  {
    verb: "wear out",
    definition: "use something a lot so no longer works",
    example: "These shoes wore out after one year.",
    phonetic: "/ˌweər ˈaʊt/",
    translation: "فرسوده کردن / کهنه کردن"
  },
  {
    verb: "weigh down",
    definition: "cause problems or make heavy/unable to move",
    example: "Heavy bags weighed me down.",
    phonetic: "/ˌweɪ ˈdaʊn/",
    translation: "سنگینی کردن / نگران کردن"
  },
  {
    verb: "while away",
    definition: "spend time in relaxed way when nothing else to do",
    example: "We whiled away the afternoon watching movies.",
    phonetic: "/ˌwaɪl əˈweɪ/",
    translation: "گذراندن وقت"
  },
  {
    verb: "wind down",
    definition: "finish gradually or relax after excitement",
    example: "I like to wind down with music at night.",
    phonetic: "/ˌwaɪnd ˈdaʊn/",
    translation: "کاستن / ریلکس کردن"
  },
  {
    verb: "write off",
    definition: "damage vehicle badly or decide someone won't succeed",
    example: "The car was written off after the crash.",
    phonetic: "/ˌraɪt ˈɒf/",
    translation: "اسقاط کردن / نادیده گرفتن"
  },
  {
    verb: "blow up",
    definition: "explode or cause to explode",
    example: "The balloon blew up with a loud bang.",
    phonetic: "/ˌbləʊ ˈʌp/",
    translation: "منفجر شدن"
  },
  {
    verb: "bring up",
    definition: "mention a topic or raise a child",
    example: "She brought up the issue in the meeting.",
    phonetic: "/ˌbrɪŋ ˈʌp/",
    translation: "مطرح کردن / بزرگ کردن (کودک)"
  },
  {
    verb: "call off",
    definition: "cancel something",
    example: "They called off the game because of rain.",
    phonetic: "/ˌkɔːl ˈɒf/",
    translation: "لغو کردن"
  },
  {
    verb: "carry on",
    definition: "continue doing something",
    example: "Please carry on; I'm listening.",
    phonetic: "/ˌkæri ˈɒn/",
    translation: "ادامه دادن"
  },
  {
    verb: "do over",
    definition: "do something again",
    example: "I made a mistake, so I did the form over.",
    phonetic: "/ˌduː ˈəʊvə/",
    translation: "دوباره انجام دادن"
  },
  {
    verb: "eat out",
    definition: "eat in a restaurant",
    example: "We ate out because nobody wanted to cook.",
    phonetic: "/ˌiːt ˈaʊt/",
    translation: "بیرون غذا خوردن"
  },
  {
    verb: "fall apart",
    definition: "break into pieces",
    example: "My old backpack is falling apart.",
    phonetic: "/ˌfɔːl əˈpɑːt/",
    translation: "از هم پاشیدن"
  },
  {
    verb: "fill out",
    definition: "complete a form",
    example: "Please fill out this form.",
    phonetic: "/ˌfɪl ˈaʊt/",
    translation: "پر کردن (فرم)"
  },
  {
    verb: "find out",
    definition: "discover information",
    example: "I need to find out when the store closes.",
    phonetic: "/ˌfaɪnd ˈaʊt/",
    translation: "فهمیدن / مطلع شدن"
  },
  {
    verb: "get along",
    definition: "have a good relationship",
    example: "I get along well with my neighbours.",
    phonetic: "/ˌɡet əˈlɒŋ/",
    translation: "با هم کنار آمدن"
  },
  {
    verb: "give up",
    definition: "stop trying or stop a habit",
    example: "Don't give up after one mistake.",
    phonetic: "/ˌɡɪv ˈʌp/",
    translation: "تسلیم شدن / ترک کردن"
  },
  {
    verb: "go on",
    definition: "continue or happen",
    example: "What's going on here?",
    phonetic: "/ˌɡəʊ ˈɒn/",
    translation: "ادامه دادن / اتفاق افتادن"
  },
  {
    verb: "grow up",
    definition: "become an adult",
    example: "I grew up in a small city.",
    phonetic: "/ˌɡrəʊ ˈʌp/",
    translation: "بزرگ شدن"
  },
  {
    verb: "hold on",
    definition: "wait for a short time",
    example: "Hold on; I'll check it now.",
    phonetic: "/ˌhəʊld ˈɒn/",
    translation: "صبر کردن / منتظر ماندن"
  },
  {
    verb: "keep on",
    definition: "continue doing something",
    example: "She kept on talking during the movie.",
    phonetic: "/ˌkiːp ˈɒn/",
    translation: "ادامه دادن"
  },
  {
    verb: "look for",
    definition: "try to find something",
    example: "I'm looking for my keys.",
    phonetic: "/ˌlʊk ˈfɔː/",
    translation: "دنبال چیزی گشتن"
  },
  {
    verb: "look up",
    definition: "search for information in a book or online",
    example: "Look up the word in a dictionary.",
    phonetic: "/ˌlʊk ˈʌp/",
    translation: "جستجو کردن (در کتاب/نت)"
  },
  {
    verb: "pass out",
    definition: "faint or lose consciousness",
    example: "He passed out because the room was too hot.",
    phonetic: "/ˌpɑːs ˈaʊt/",
    translation: "از حال رفتن"
  },
  {
    verb: "put off",
    definition: "postpone something",
    example: "We put off the trip until next week.",
    phonetic: "/ˌpʊt ˈɒf/",
    translation: "به تعویق انداختن"
  },
  {
    verb: "run out",
    definition: "have none left",
    example: "We ran out of bread this morning.",
    phonetic: "/ˌrʌn ˈaʊt/",
    translation: "تمام کردن"
  },
  {
    verb: "show up",
    definition: "arrive or appear",
    example: "She showed up ten minutes late.",
    phonetic: "/ˌʃəʊ ˈʌp/",
    translation: "حاضر شدن"
  },
  {
    verb: "turn down",
    definition: "refuse an offer or request",
    example: "I turned down the job offer.",
    phonetic: "/ˌtɜːn ˈdaʊn/",
    translation: "رد کردن"
  },
  {
    verb: "wake up",
    definition: "stop sleeping",
    example: "I wake up at seven every day.",
    phonetic: "/ˌweɪk ˈʌp/",
    translation: "بیدار شدن"
  },
  {
    verb: "work out",
    definition: "exercise or find a solution",
    example: "I work out three times a week.",
    phonetic: "/ˌwɜːk ˈaʊt/",
    translation: "ورزش کردن / حل شدن"
  },
  {
    verb: "check in",
    definition: "arrive and register at a hotel or airport",
    example: "We checked in at the hotel at two.",
    phonetic: "/ˌtʃek ˈɪn/",
    translation: "پذیرش شدن"
  },
  {
    verb: "dress up",
    definition: "wear formal or special clothes",
    example: "You don't need to dress up for dinner.",
    phonetic: "/ˌdres ˈʌp/",
    translation: "شیک پوشیدن"
  },
  {
    verb: "get up",
    definition: "get out of bed",
    example: "I usually get up at seven.",
    phonetic: "/ˌɡet ˈʌp/",
    translation: "بلند شدن (از خواب)"
  },
  {
    verb: "give away",
    definition: "give something for free or reveal a secret",
    example: "She gave away her old books.",
    phonetic: "/ˌɡɪv əˈweɪ/",
    translation: "بخشیدن / لو دادن"
  },
  {
    verb: "let down",
    definition: "disappoint someone",
    example: "I'm sorry I let you down.",
    phonetic: "/ˌlet ˈdaʊn/",
    translation: "ناامید کردن"
  },
  {
    verb: "look after",
    definition: "take care of someone or something",
    example: "Can you look after my cat this weekend?",
    phonetic: "/ˌlʊk ˈɑːftə/",
    translation: "مراقبت کردن"
  },
  {
    verb: "run into",
    definition: "meet someone by chance",
    example: "I ran into an old friend at Costco.",
    phonetic: "/ˌrʌn ˈɪntuː/",
    translation: "اتفاقی دیدن"
  },
  {
    verb: "set off",
    definition: "start a journey",
    example: "We set off early to avoid traffic.",
    phonetic: "/ˌset ˈɒf/",
    translation: "راهی شدن / حرکت کردن"
  },
  {
    verb: "try on",
    definition: "put on clothes to see if they fit",
    example: "Can I try on this jacket?",
    phonetic: "/ˌtraɪ ˈɒn/",
    translation: "پرو کردن"
  },
  {
    verb: "watch out",
    definition: "be careful",
    example: "Watch out; the floor is wet.",
    phonetic: "/ˌwɒtʃ ˈaʊt/",
    translation: "مراقب بودن"
  },
  {
    verb: "write down",
    definition: "write something on paper",
    example: "Write down the address before you forget.",
    phonetic: "/ˌraɪt ˈdaʊn/",
    translation: "یادداشت کردن"
  },
  {
    verb: "break out",
    definition: "start suddenly (like a war or fire)",
    example: "A fire broke out in the kitchen.",
    phonetic: "/ˌbreɪk ˈaʊt/",
    translation: "شروع شدن (ناگهانی)"
  },
  {
    verb: "catch up",
    definition: "reach the same level or stage as someone",
    example: "I need to catch up on my emails.",
    phonetic: "/ˌkætʃ ˈʌp/",
    translation: "رسیدن به / جبران کردن"
  },
  {
    verb: "drink up",
    definition: "finish your drink completely",
    example: "Drink up; we have to leave soon.",
    phonetic: "/ˌdrɪŋk ˈʌp/",
    translation: "تا ته نوشیدن"
  },
  {
    verb: "follow through",
    definition: "complete an action or task",
    example: "He promised to help and followed through.",
    phonetic: "/ˌfɒləʊ ˈθruː/",
    translation: "تا آخر پیگیری کردن"
  },
  {
    verb: "hand out",
    definition: "distribute things to people",
    example: "The teacher handed out the papers.",
    phonetic: "/ˌhænd ˈaʊt/",
    translation: "توزیع کردن"
  },
  {
    verb: "hurry up",
    definition: "do something more quickly",
    example: "Hurry up, or we'll miss the bus.",
    phonetic: "/ˌhʌri ˈʌp/",
    translation: "عجله کردن"
  },
  {
    verb: "look forward to",
    definition: "wait for something with pleasure",
    example: "I'm looking forward to the weekend.",
    phonetic: "/ˌlʊk ˈfɔːwəd tuː/",
    translation: "چشم انتظار بودن"
  },
  {
    verb: "point out",
    definition: "draw attention to something",
    example: "She pointed out a mistake in my report.",
    phonetic: "/ˌpɔɪnt ˈaʊt/",
    translation: "اشاره کردن / متذکر شدن"
  },
  {
    verb: "put on",
    definition: "wear clothes or turn on equipment",
    example: "Put on a jacket; it's cold outside.",
    phonetic: "/ˌpʊt ˈɒn/",
    translation: "پوشیدن"
  },
  {
    verb: "run away",
    definition: "escape from a place or situation",
    example: "The dog ran away from the yard.",
    phonetic: "/ˌrʌn əˈweɪ/",
    translation: "فرار کردن"
  },
  {
    verb: "shut down",
    definition: "stop operating (like a factory or computer)",
    example: "Shut down your computer before you leave.",
    phonetic: "/ˌʃʌt ˈdaʊn/",
    translation: "تعطیل کردن"
  },
  {
    verb: "sit down",
    definition: "take a seat",
    example: "Please sit down and relax.",
    phonetic: "/ˌsɪt ˈdaʊn/",
    translation: "نشستن"
  },
  {
    verb: "stand up",
    definition: "rise to a vertical position",
    example: "Everyone stood up when the music started.",
    phonetic: "/ˌstænd ˈʌp/",
    translation: "ایستادن"
  },
  {
    verb: "stay in",
    definition: "stay at home instead of going out",
    example: "I stayed in and watched a movie.",
    phonetic: "/ˌsteɪ ˈɪn/",
    translation: "در خانه ماندن"
  },
  {
    verb: "take back",
    definition: "return something or withdraw a statement",
    example: "I take back what I said.",
    phonetic: "/ˌteɪk ˈbæk/",
    translation: "پس گرفتن / حرف خود را پس گرفتن"
  },
  {
    verb: "throw away",
    definition: "get rid of something unwanted",
    example: "Don't throw away that receipt.",
    phonetic: "/ˌθrəʊ əˈweɪ/",
    translation: "دور انداختن"
  },
  {
    verb: "try out",
    definition: "test something to see if it works",
    example: "I'm trying out a new recipe tonight.",
    phonetic: "/ˌtraɪ ˈaʊt/",
    translation: "آزمایش کردن"
  },
  {
    verb: "turn off",
    definition: "stop a machine or light",
    example: "Turn off the TV before bed.",
    phonetic: "/ˌtɜːn ˈɒf/",
    translation: "خاموش کردن"
  },
  {
    verb: "turn on",
    definition: "start a machine or light",
    example: "Can you turn on the heater?",
    phonetic: "/ˌtɜːn ˈɒn/",
    translation: "روشن کردن"
  },
  {
    verb: "wait up",
    definition: "not go to bed until someone arrives",
    example: "Don't wait up for me tonight.",
    phonetic: "/ˌweɪt ˈʌp/",
    translation: "بیدار ماندن منتظر کسی"
  },
  {
    verb: "work on",
    definition: "spend time improving or repair something",
    example: "I'm working on a new project.",
    phonetic: "/ˌwɜːk ˈɒn/",
    translation: "کار کردن روی"
  },
  {
    verb: "zip up",
    definition: "fasten with a zipper",
    example: "Zip up your jacket; it's windy.",
    phonetic: "/ˌzɪp ˈʌp/",
    translation: "زیپ را بستن"
  },
  {
    verb: "call back",
    definition: "phone someone again",
    example: "I'll call you back in ten minutes.",
    phonetic: "/ˌkɔːl ˈbæk/",
    translation: "دوباره زنگ زدن"
  },
  {
    verb: "carry out",
    definition: "perform a task or research",
    example: "The team carried out the plan.",
    phonetic: "/ˌkæri ˈaʊt/",
    translation: "انجام دادن"
  },
  {
    verb: "clean up",
    definition: "make a place tidy and clean",
    example: "Clean up your desk before you go.",
    phonetic: "/ˌkliːn ˈʌp/",
    translation: "تمیز کردن"
  },
  {
    verb: "close down",
    definition: "stop operating permanently",
    example: "The restaurant closed down last year.",
    phonetic: "/ˌkləʊz ˈdaʊn/",
    translation: "برای همیشه تعطیل کردن"
  },
  {
    verb: "come back",
    definition: "return to a place",
    example: "She came back from vacation yesterday.",
    phonetic: "/ˌkʌm ˈbæk/",
    translation: "برگشتن"
  },
  {
    verb: "cut off",
    definition: "disconnect or interrupt",
    example: "The call was cut off suddenly.",
    phonetic: "/ˌkʌt ˈɒf/",
    translation: "قطع کردن"
  },
  {
    verb: "die down",
    definition: "become less strong or loud",
    example: "The noise died down after midnight.",
    phonetic: "/ˌdaɪ ˈdaʊn/",
    translation: "فروکش کردن"
  },
  {
    verb: "drop out",
    definition: "leave school or a competition",
    example: "He dropped out of the course.",
    phonetic: "/ˌdrɒp ˈaʊt/",
    translation: "ترک تحصیل کردن"
  },
  {
    verb: "fall out",
    definition: "have an argument and stop being friends",
    example: "They fell out over a small mistake.",
    phonetic: "/ˌfɔːl ˈaʊt/",
    translation: "قهر کردن"
  },
  {
    verb: "get by",
    definition: "manage to survive with little money",
    example: "I can get by with basic French.",
    phonetic: "/ˌɡet ˈbaɪ/",
    translation: "گذران زندگی کردن"
  },
  {
    verb: "go through",
    definition: "experience a difficult situation",
    example: "She went through a difficult time.",
    phonetic: "/ˌɡəʊ ˈθruː/",
    translation: "تجربه کردن (سختی)"
  },
  {
    verb: "grow out of",
    definition: "become too big for clothes",
    example: "He grew out of his old shoes.",
    phonetic: "/ˌɡrəʊ ˈaʊt əv/",
    translation: "بزرگتر شدن از (لباس)"
  },
  {
    verb: "hold up",
    definition: "delay or rob using a weapon",
    example: "Sorry I'm late; traffic held me up.",
    phonetic: "/ˌhəʊld ˈʌp/",
    translation: "به تاخیر انداختن / راهزنی"
  },
  {
    verb: "knock out",
    definition: "make unconscious or eliminate from competition",
    example: "The medicine knocked me out for hours.",
    phonetic: "/ˌnɒk ˈaʊt/",
    translation: "بیهوش کردن"
  },
  {
    verb: "leave out",
    definition: "not include someone or something",
    example: "You left out an important detail.",
    phonetic: "/ˌliːv ˈaʊt/",
    translation: "جا انداختن / نادیده گرفتن"
  },
  {
    verb: "let in",
    definition: "allow someone to enter",
    example: "Let me in; it's cold outside.",
    phonetic: "/ˌlet ˈɪn/",
    translation: "راه دادن"
  },
  {
    verb: "live on",
    definition: "have money for basic needs",
    example: "Many students live on noodles and soup.",
    phonetic: "/ˌlɪv ˈɒn/",
    translation: "با مبلغی زندگی کردن"
  },
  {
    verb: "look down on",
    definition: "think you are better than someone",
    example: "Don't look down on people who need help.",
    phonetic: "/ˌlʊk ˈdaʊn ɒn/",
    translation: "تحقیر کردن"
  },
  {
    verb: "pay off",
    definition: "finish paying a debt or result in success",
    example: "All that practice finally paid off.",
    phonetic: "/ˌpeɪ ˈɒf/",
    translation: "تسویه کردن / به ثمر نشستن"
  },
  {
    verb: "put away",
    definition: "put something in its correct place",
    example: "Put away your phone during class.",
    phonetic: "/ˌpʊt əˈweɪ/",
    translation: "سر جای خود گذاشتن"
  },
  {
    verb: "put out",
    definition: "extinguish a fire or cigarette",
    example: "Firefighters put out the fire quickly.",
    phonetic: "/ˌpʊt ˈaʊt/",
    translation: "خاموش کردن (آتش)"
  },
  {
    verb: "read over",
    definition: "read something carefully to check it",
    example: "Read over your message before sending it.",
    phonetic: "/ˌriːd ˈəʊvə/",
    translation: "بازخوانی کردن"
  },
  {
    verb: "rip off",
    definition: "charge someone too much money",
    example: "That shop ripped me off.",
    phonetic: "/ˌrɪp ˈɒf/",
    translation: "تیغ زدن / گران فروختن"
  },
  {
    verb: "run over",
    definition: "hit with a vehicle",
    example: "I ran over the time limit.",
    phonetic: "/ˌrʌn ˈəʊvə/",
    translation: "زیر گرفتن"
  },
  {
    verb: "send back",
    definition: "return something because it is unsuitable",
    example: "I sent back the shoes because they were too small.",
    phonetic: "/ˌsend ˈbæk/",
    translation: "پس فرستادن"
  },
  {
    verb: "settle down",
    definition: "become calm or start living a quiet life",
    example: "She settled down after moving to Toronto.",
    phonetic: "/ˌsetl ˈdaʊn/",
    translation: "آرام گرفتن / سر و سامان گرفتن"
  },
  {
    verb: "shop around",
    definition: "compare prices before buying",
    example: "Shop around before you buy a laptop.",
    phonetic: "/ˌʃɒp əˈraʊnd/",
    translation: "قیمت گرفتن"
  },
  {
    verb: "show off",
    definition: "try to impress others with your abilities",
    example: "He shows off whenever his friends are around.",
    phonetic: "/ˌʃəʊ ˈɒf/",
    translation: "پز دادن"
  },
  {
    verb: "sort out",
    definition: "organise something or solve a problem",
    example: "I need to sort out my schedule.",
    phonetic: "/ˌsɔːt ˈaʊt/",
    translation: "مرتب کردن / حل و فصل کردن"
  },
  {
    verb: "speak up",
    definition: "speak louder or state opinion",
    example: "Please speak up; I can't hear you.",
    phonetic: "/ˌspiːk ˈʌp/",
    translation: "بلندتر حرف زدن / ابراز عقیده"
  },
  {
    verb: "split up",
    definition: "end a relationship or separate into groups",
    example: "They split up last winter.",
    phonetic: "/ˌsplɪt ˈʌp/",
    translation: "جدا شدن"
  },
  {
    verb: "stand for",
    definition: "represent or tolerate",
    example: "What does this symbol stand for?",
    phonetic: "/ˌstænd ˈfɔː/",
    translation: "مخفف چیزی بودن / تحمل کردن"
  },
  {
    verb: "stay up",
    definition: "not go to bed",
    example: "I stayed up late to finish the game.",
    phonetic: "/ˌsteɪ ˈʌp/",
    translation: "بیدار ماندن"
  },
  {
    verb: "tell off",
    definition: "speak angrily to someone because of bad behavior",
    example: "The teacher told him off for being late.",
    phonetic: "/ˌtel ˈɒf/",
    translation: "سرزنش کردن"
  },
  {
    verb: "try out for",
    definition: "try to be chosen for a team or position",
    example: "She tried out for the school team.",
    phonetic: "/ˌtraɪ ˈaʊt fɔː/",
    translation: "تست دادن برای"
  },
  {
    verb: "turn around",
    definition: "change direction or make successful",
    example: "The company turned around after a hard year.",
    phonetic: "/ˌtɜːn əˈraʊnd/",
    translation: "تغییر جهت دادن / متحول کردن"
  },
  {
    verb: "turn out",
    definition: "have a particular result or happen",
    example: "The party turned out better than expected.",
    phonetic: "/ˌtɜːn ˈaʊt/",
    translation: "معلوم شدن / از آب درآمدن"
  },
  {
    verb: "turn up",
    definition: "arrive or increase volume",
    example: "He turned up at my house without calling.",
    phonetic: "/ˌtɜːn ˈʌp/",
    translation: "پیدا شدن / بلند کردن صدا"
  },
  {
    verb: "wait on",
    definition: "serve someone in a restaurant",
    example: "The server waited on our table.",
    phonetic: "/ˌweɪt ˈɒn/",
    translation: "خدمت کردن (در رستوران)"
  },
  {
    verb: "watch out for",
    definition: "be careful of a specific danger",
    example: "Watch out for ice on the sidewalk.",
    phonetic: "/ˌwɒtʃ ˈaʊt fɔː/",
    translation: "مواظب کسی/چیزی بودن"
  },
  {
    verb: "wear off",
    definition: "gradually disappear (like an effect)",
    example: "The pain wore off after an hour.",
    phonetic: "/ˌweər ˈɒf/",
    translation: "از بین رفتن اثر"
  },
  {
    verb: "wipe out",
    definition: "destroy completely",
    example: "The storm wiped out the power.",
    phonetic: "/ˌwaɪp ˈaʊt/",
    translation: "به کلی نابود کردن"
  },
  {
    verb: "work through",
    definition: "deal with a problem to reach a solution",
    example: "We worked through the problem together.",
    phonetic: "/ˌwɜːk ˈθruː/",
    translation: "حل و فصل کردن"
  },
  {
    verb: "write out",
    definition: "write in full detail",
    example: "Please write out your full name.",
    phonetic: "/ˌraɪt ˈaʊt/",
    translation: "با جزئیات نوشتن"
  },
  {
    verb: "yield to",
    definition: "give in to persuasion or allow others go first",
    example: "Drivers must yield to pedestrians.",
    phonetic: "/ˌjiːld ˈtuː/",
    translation: "تسلیم شدن / حق تقدم دادن"
  },
  {
    verb: "zoom in",
    definition: "make an image look larger",
    example: "Zoom in so we can read the text.",
    phonetic: "/ˌzuːm ˈɪn/",
    translation: "بزرگنمایی کردن"
  },
  {
    verb: "aim at",
    definition: "point or direct something at a target",
    example: "This course is aimed at beginners.",
    phonetic: "/ˌeɪm ˈæt/",
    translation: "هدف گرفتن"
  },
  {
    verb: "ask around",
    definition: "ask many people for info or help",
    example: "I asked around, but nobody had seen my bag.",
    phonetic: "/ˌɑːsk əˈraʊnd/",
    translation: "از بقیه پرس‌وجو کردن"
  },
  {
    verb: "back off",
    definition: "move away or stop bothering",
    example: "Back off and give me some space.",
    phonetic: "/ˌbæk ˈɒf/",
    translation: "عقب کشیدن"
  },
  {
    verb: "bear with",
    definition: "be patient with someone",
    example: "Please bear with me while I find the file.",
    phonetic: "/ˌbeə ˈwɪð/",
    translation: "صبر کردن با"
  },
  {
    verb: "beat up",
    definition: "attack someone and hit them many times",
    example: "He got beat up in the fight.",
    phonetic: "/ˌbiːt ˈʌp/",
    translation: "کتک زدن"
  },
  {
    verb: "believe in",
    definition: "be certain that something exists",
    example: "I believe in you.",
    phonetic: "/bɪˈliːv ɪn/",
    translation: "باور داشتن به"
  },
  {
    verb: "bite off",
    definition: "separate something using teeth",
    example: "Don't bite off more than you can chew.",
    phonetic: "/ˌbaɪt ˈɒf/",
    translation: "گاز گرفتن"
  },
  {
    verb: "block out",
    definition: "stop light or sound or try to forget",
    example: "I use music to block out street noise.",
    phonetic: "/ˌblɒk ˈaʊt/",
    translation: "مسدود کردن (نور/فکر)"
  },
  {
    verb: "blow out",
    definition: "extinguish light with air",
    example: "She blew out the candles on her cake.",
    phonetic: "/ˌbləʊ ˈaʊt/",
    translation: "فوت کردن و خاموش کردن"
  },
  {
    verb: "boil over",
    definition: "liquid overflows container when boiling",
    example: "The argument boiled over during dinner.",
    phonetic: "/ˌbɔɪl ˈəʊvə/",
    translation: "سر رفتن (غذا)"
  },
  {
    verb: "break into",
    definition: "enter building by force",
    example: "Someone broke into our garage last night.",
    phonetic: "/ˌbreɪk ˈɪntuː/",
    translation: "به زور وارد شدن"
  },
  {
    verb: "brace for",
    definition: "prepare yourself for something difficult",
    example: "We braced for the heavy snow.",
    phonetic: "/ˌbreɪs ˈfɔː/",
    translation: "آماده شدن (برای سختی)"
  },
  {
    verb: "bring down",
    definition: "cause government to fall or reduce price",
    example: "The bad news brought everyone down.",
    phonetic: "/ˌbrɪŋ ˈdaʊn/",
    translation: "سرنگون کردن / کاهش دادن"
  },
  {
    verb: "buckle up",
    definition: "fasten your seatbelt",
    example: "Buckle up before we start driving.",
    phonetic: "/ˌbʌkl ˈʌp/",
    translation: "کمربند را بستن"
  },
  {
    verb: "burn down",
    definition: "destroy building by fire",
    example: "The old house burned down last winter.",
    phonetic: "/ˌbɜːn ˈdaʊn/",
    translation: "در آتش سوختن"
  },
  {
    verb: "burst out",
    definition: "suddenly start doing something",
    example: "She burst out laughing at the joke.",
    phonetic: "/ˌbɜːst ˈaʊt/",
    translation: "یک دفعه شروع کردن (خنده/گریه)"
  },
  {
    verb: "butt in",
    definition: "interrupt a conversation rudely",
    example: "Sorry to butt in, but I have a question.",
    phonetic: "/ˌbʌt ˈɪn/",
    translation: "پریدن وسط حرف"
  },
  {
    verb: "call around",
    definition: "phone many people for info",
    example: "I called around to find a cheaper price.",
    phonetic: "/ˌkɔːl əˈraʊnd/",
    translation: "به چند جا زنگ زدن"
  },
  {
    verb: "calm down",
    definition: "become less excited or angry",
    example: "She was upset, but she calmed down after a short walk.",
    phonetic: "/ˌkɑːm ˈdaʊn/",
    translation: "آرام شدن"
  },
  {
    verb: "care for",
    definition: "look after or like someone",
    example: "Would you care for some tea?",
    phonetic: "/ˈkeə fɔː/",
    translation: "مراقب بودن / دوست داشتن"
  },
  {
    verb: "check over",
    definition: "examine carefully for mistakes",
    example: "Check over your answers before the test.",
    phonetic: "/ˌtʃek ˈəʊvə/",
    translation: "با دقت چک کردن"
  },
  {
    verb: "cheer up",
    definition: "start feeling happier",
    example: "This funny video will cheer you up.",
    phonetic: "/ˌtʃɪər ˈʌp/",
    translation: "خوشحال شدن"
  },
  {
    verb: "chicken out",
    definition: "decide not to do something through fear",
    example: "He chickened out at the last minute.",
    phonetic: "/ˌtʃɪkɪn ˈaʊt/",
    translation: "جا زدن (از ترس)"
  },
  {
    verb: "chop up",
    definition: "cut into small pieces",
    example: "Chop up the onions for the soup.",
    phonetic: "/ˌtʃɒp ˈʌp/",
    translation: "خرد کردن"
  },
  {
    verb: "clam up",
    definition: "refuse to speak especially through fear",
    example: "He clammed up when I asked about the mistake.",
    phonetic: "/ˌklæm ˈʌp/",
    translation: "لال مانی گرفتن"
  },
  {
    verb: "clear out",
    definition: "tidy and get rid of unwanted things",
    example: "I cleared out my closet this weekend.",
    phonetic: "/ˌklɪər ˈaʊt/",
    translation: "خالی و تمیز کردن"
  },
  {
    verb: "clog up",
    definition: "become blocked",
    example: "Leaves clogged up the drain.",
    phonetic: "/ˌklɒɡ ˈʌp/",
    translation: "مسدود شدن"
  },
  {
    verb: "close off",
    definition: "separate area from others",
    example: "They closed off the road for repairs.",
    phonetic: "/ˌkləʊz ˈɒf/",
    translation: "بستن (مسیر/منطقه)"
  },
  {
    verb: "come back to",
    definition: "return to a topic",
    example: "I'll come back to this question later.",
    phonetic: "/ˌkʌm ˈbæk tuː/",
    translation: "برگشتن به (موضوع)"
  },
  {
    verb: "come by",
    definition: "get something difficult to find",
    example: "Good jobs are hard to come by.",
    phonetic: "/ˌkʌm ˈbaɪ/",
    translation: "به دست آوردن"
  },
  {
    verb: "come down with",
    definition: "start to suffer from illness",
    example: "I came down with a cold yesterday.",
    phonetic: "/ˌkʌm ˈdaʊn wɪð/",
    translation: "مریض شدن"
  },
  {
    verb: "come forward",
    definition: "offer help or information",
    example: "A witness came forward after the accident.",
    phonetic: "/ˌkʌm ˈfɔːwəd/",
    translation: "پیشقدم شدن (کمک)"
  },
  {
    verb: "count on",
    definition: "rely on someone",
    example: "You can count on me for help.",
    phonetic: "/ˈkaʊnt ɒn/",
    translation: "حساب کردن روی"
  },
  {
    verb: "cross out",
    definition: "draw line through something written",
    example: "Cross out the wrong answer.",
    phonetic: "/ˌkrɒs ˈaʊt/",
    translation: "خط زدن"
  },
  {
    verb: "deal with",
    definition: "take action to solve problem",
    example: "I have to deal with this problem today.",
    phonetic: "/ˈdiːl wɪð/",
    translation: "رسیدگی کردن"
  },
  {
    verb: "dig in",
    definition: "start eating with enthusiasm",
    example: "Dig in before the food gets cold.",
    phonetic: "/ˌdɪɡ ˈɪn/",
    translation: "حمله کردن به غذا"
  },
  {
    verb: "do without",
    definition: "manage without something",
    example: "I can do without sugar in my tea.",
    phonetic: "/ˌduː wɪˈðaʊt/",
    translation: "بدون چیزی سر کردن"
  },
  {
    verb: "drag on",
    definition: "continue longer than expected",
    example: "The meeting dragged on for two hours.",
    phonetic: "/ˌdræɡ ˈɒn/",
    translation: "لفت دادن / طولانی شدن"
  },
  {
    verb: "draw up",
    definition: "prepare a document",
    example: "The lawyer drew up the contract.",
    phonetic: "/ˌdrɔː ˈʌp/",
    translation: "تنظیم کردن (قرارداد)"
  },
  {
    verb: "dream up",
    definition: "invent something very unusual",
    example: "She dreamed up a fun game idea.",
    phonetic: "/ˌdriːm ˈʌp/",
    translation: "در رویا پروراندن"
  },
  {
    verb: "drop in",
    definition: "visit someone without arranging it",
    example: "Drop in anytime for coffee.",
    phonetic: "/ˌdrɒp ˈɪn/",
    translation: "سر زده آمدن"
  },
  {
    verb: "drop off",
    definition: "take someone somewhere or fall asleep",
    example: "I'll drop you off at the station.",
    phonetic: "/ˌdrɒp ˈɒf/",
    translation: "پیاده کردن / خواب رفتن"
  }
];

export const PHRASAL_VERBS_DATA: PhrasalVerb[] = RAW_PHRASAL_VERBS_DATA.map(v => ({
  ...v,
  category: (v as any).category || 'phrasal'
}));

export async function enrichPhrasalVerb(rawText: string, category: Category = 'phrasal'): Promise<PhrasalVerb[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this raw vocabulary list into JSON with fields: verb, definition, example, phonetic (IPA), and translation (Persian).
    Raw text: ${rawText.slice(0, 5000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            verb: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            translation: { type: Type.STRING }
          },
          required: ["verb", "definition", "example", "phonetic", "translation"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({ ...item, category }));
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
}

export async function getSpeech(text: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
}
