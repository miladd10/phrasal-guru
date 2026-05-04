import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PhrasalVerb {
  verb: string;
  definition: string;
  example: string;
  phonetic: string;
  translation: string;
}

export const PHRASAL_VERBS_DATA: PhrasalVerb[] = [
  {
    verb: "add up",
    definition: "to combine to produce a particular result or effect",
    example: "These new measures do not add up to genuine reform.",
    phonetic: "/ˌæd ˈʌp/",
    translation: "به نتیجه منطقی رسیدن"
  },
  {
    verb: "answer back",
    definition: "reply rudely to someone who has more authority",
    example: "I got into trouble for answering the teacher back.",
    phonetic: "/ˌɑːnsə ˈbæk/",
    translation: "جواب پس دادن (با گستاخی)"
  },
  {
    verb: "ask out",
    definition: "invite someone to go with you to start a romantic relationship",
    example: "Fred asked Vanessa to go out with him but she said no.",
    phonetic: "/ˌɑːsk ˈaʊt/",
    translation: "قرار گذاشتن / دعوت به بیرون"
  },
  {
    verb: "back down",
    definition: "stop asking for something because people oppose you",
    example: "I'm not going to back down just because people disagree.",
    phonetic: "/ˌback ˈdaʊn/",
    translation: "عقب‌نشینی کردن"
  },
  {
    verb: "back up",
    definition: "give support by telling others you agree with them",
    example: "Janice backed him up.",
    phonetic: "/ˌbæk ˈʌp/",
    translation: "حمایت کردن"
  },
  {
    verb: "black out",
    definition: "suddenly become unconscious",
    example: "He had blacked out as his car hit the tree.",
    phonetic: "/ˌblæk ˈaʊt/",
    translation: "بیهوش شدن"
  },
  {
    verb: "blend in",
    definition: "be similar to surrounding things and not be noticed",
    example: "The building doesn't really blend in very well.",
    phonetic: "/ˌblend ˈɪn/",
    translation: "همرنگ جماعت شدن"
  },
  {
    verb: "blurt out",
    definition: "say something suddenly and without thinking",
    example: "She blurted out his name.",
    phonetic: "/ˌblɜːrt ˈaʊt/",
    translation: "پراندن (حرف)"
  },
  {
    verb: "board up",
    definition: "cover a window or door with wooden boards",
    example: "We boarded the house up.",
    phonetic: "/ˌbɔːrd ˈʌp/",
    translation: "تخته‌کوب کردن"
  },
  {
    verb: "break down",
    definition: "divide something into separate parts",
    example: "Break it down into monthly payments.",
    phonetic: "/ˌbreɪk ˈdaʊn/",
    translation: "تجزیه کردن"
  },
  {
    verb: "break up",
    definition: "end a relationship or separate into pieces",
    example: "When did Diana and James break up?",
    phonetic: "/ˌbreɪk ˈʌp/",
    translation: "به هم زدن"
  },
  {
    verb: "brighten up",
    definition: "start looking or feeling happier",
    example: "Sarah brightended up considerably.",
    phonetic: "/ˌbraɪtn ˈʌp/",
    translation: "شاد شدن"
  },
  {
    verb: "bring about",
    definition: "make something happen, especially cause changes",
    example: "It's not something we can bring about overnight.",
    phonetic: "/ˌbrɪŋ əˈbaʊt/",
    translation: "باعث شدن"
  },
  {
    verb: "bring out",
    definition: "produce a new product or show a quality",
    example: "They've brought out a new camera.",
    phonetic: "/ˌbrɪŋ ˈaʊt/",
    translation: "بیرون دادن (محصول)"
  },
  {
    verb: "bring together",
    definition: "create a situation in which people meet and do something",
    example: "The attack on the city really brought people together.",
    phonetic: "/ˌbrɪŋ təˈɡeðə/",
    translation: "متحد کردن / گرد هم آوردن"
  },
  {
    verb: "brush up (on)",
    definition: "practise and improve your skills or knowledge",
    example: "I took a class to brush up my German.",
    phonetic: "/ˌbrʌʃ ˈʌp/",
    translation: "مرور کردن / تقویت مهارت"
  },
  {
    verb: "build up",
    definition: "gradually develop, increase, or move at the same speed",
    example: "Writers built up their reputations.",
    phonetic: "/ˌbɪld ˈʌp/",
    translation: "تقویت کردن / ایجاد کردن"
  },
  {
    verb: "bump into",
    definition: "meet someone unexpectedly",
    example: "Guess who I bumped into in town?",
    phonetic: "/ˌbʌmp ˈɪntuː/",
    translation: "اتفاقی دیدن"
  },
  {
    verb: "buy off",
    definition: "give money so they do not act against you",
    example: "Efforts to buy her off have failed.",
    phonetic: "/ˌbaɪ ˈɒf/",
    translation: "خریدن (رشوه دادن)"
  },
  {
    verb: "buy out",
    definition: "pay money to control all of a business",
    example: "The directors offered to buy me out.",
    phonetic: "/ˌbaɪ ˈaʊt/",
    translation: "خریدن سهم شریک"
  },
  {
    verb: "buy up",
    definition: "buy large amounts of something in one go",
    example: "Developers have been buying up old theatres.",
    phonetic: "/ˌbaɪ ˈʌp/",
    translation: "همه را خریدن"
  },
  {
    verb: "cancel out",
    definition: "stop something from having any effect",
    example: "These headphones cancel out any other noise.",
    phonetic: "/ˌkænsl ˈaʊt/",
    translation: "خنثی کردن"
  },
  {
    verb: "carry over",
    definition: "take something from one period into the next",
    example: "You cannot carry over holiday entitlement.",
    phonetic: "/ˌkæri ˈəʊvə/",
    translation: "انتقال دادن (به دوره بعد)"
  },
  {
    verb: "catch on",
    definition: "become popular or finally understand",
    example: "Sports drinks have caught on.",
    phonetic: "/ˌkætʃ ˈɒn/",
    translation: "رواج یافتن / فهمیدن"
  },
  {
    verb: "centre around",
    definition: "have someone or something as the main subject",
    example: "The book centres around a woman astronaut.",
    phonetic: "/ˈsentə əˌraʊnd/",
    translation: "محور بودن"
  },
  {
    verb: "chance upon",
    definition: "find or see someone unexpectedly",
    example: "We chanced upon a charming little restaurant.",
    phonetic: "/ˌtʃɑːns əˈpɒn/",
    translation: "تصادفی دیدن"
  },
  {
    verb: "change around",
    definition: "move things so they are in different places",
    example: "My friends changed all the furniture around.",
    phonetic: "/ˌtʃeɪndʒ əˈraʊnd/",
    translation: "جابجا کردن"
  },
  {
    verb: "change into",
    definition: "stop being in one state and start in another",
    example: "The man changes into a werewolf.",
    phonetic: "/ˌtʃeɪndʒ ˈɪntə/",
    translation: "تبدیل شدن به"
  },
  {
    verb: "change out of",
    definition: "take off clothes and put on different ones",
    example: "Change out of those wet things.",
    phonetic: "/ˌtʃeɪndʒ ˈaʊt əv/",
    translation: "تعویض لباس"
  },
  {
    verb: "check out",
    definition: "examine in order to be certain of truth",
    example: "Their story just didn't check out.",
    phonetic: "/ˌtʃek ˈaʊt/",
    translation: "بررسی کردن"
  },
  {
    verb: "clock up",
    definition: "reach a particular number or amount",
    example: "He has clocked up 34 years.",
    phonetic: "/ˌklɒk ˈʌp/",
    translation: "به ثبت رساندن"
  },
  {
    verb: "close up",
    definition: "lock the doors of a building or business",
    example: "The newsagent was closing up.",
    phonetic: "/ˌkləʊz ˈʌp/",
    translation: "تعطیل کردن (موقتی)"
  },
  {
    verb: "club together",
    definition: "people giving money for a shared outcome",
    example: "Let's all club together for a present.",
    phonetic: "/ˌklʌb təˈɡeðə/",
    translation: "دنگی پول گذاشتن"
  },
  {
    verb: "come across",
    definition: "meet someone or find something by chance",
    example: "I came across a reference to my grandfather.",
    phonetic: "/ˌkʌm əˈkrɒs/",
    translation: "اتفاقی پیدا کردن"
  },
  {
    verb: "come around to",
    definition: "change your opinion because of persuasion",
    example: "I've come around to the idea now.",
    phonetic: "/ˌkʌm əˈraʊnd tuː/",
    translation: "مجاب شدن / تغییر عقیده"
  },
  {
    verb: "come between",
    definition: "cause a disagreement between people",
    example: "I would never let anything come between us.",
    phonetic: "/ˌkʌm bɪˈtwiːn/",
    translation: "فاصله انداختن"
  },
  {
    verb: "come out",
    definition: "be removing by washing or become available",
    example: "The magazine comes out every Thursday.",
    phonetic: "/ˌkʌm ˈaʊt/",
    translation: "بیرون آمدن / پاک شدن"
  },
  {
    verb: "come out in",
    definition: "become covered in spots or a rash",
    example: "She comes out in spots if she eats shellfish.",
    phonetic: "/ˌkʌm ˈaʊt ɪn/",
    translation: "دانه زدن / جوش زدن (بدن)"
  },
  {
    verb: "come out with",
    definition: "say something suddenly that surprises people",
    example: "You never know what children will come out with.",
    phonetic: "/ˌkʌm ˈaʊt wɪð/",
    translation: "یک دفعه حرفی زدن"
  },
  {
    verb: "come round",
    definition: "become conscious again or visit someone's house",
    example: "I felt sick when I came round.",
    phonetic: "/ˌkʌm ˈraʊnd/",
    translation: "به هوش آمدن / سر زدن"
  },
  {
    verb: "come up with",
    definition: "think of something such as an idea or plan",
    example: "Is that the best you can come up with?",
    phonetic: "/ˌkʌm ˈʌp wɪð/",
    translation: "ارائه دادن (طرح و ایده)"
  },
  {
    verb: "cool down",
    definition: "become cooler or less angry",
    example: "It's cooled down a lot lately.",
    phonetic: "/ˌkuːl ˈdaʊn/",
    translation: "خنک شدن / آرام شدن"
  },
  {
    verb: "cordon off",
    definition: "stop people entering an area using rope/tape",
    example: "They cordoned off the city centre.",
    phonetic: "/ˌkɔːrdn ˈɒf/",
    translation: "منطقه را محصور کردن"
  },
  {
    verb: "cotton on",
    definition: "begin to realise or understand something",
    example: "Suddenly I cottoned on. She'd been lying.",
    phonetic: "/ˌkɒtn ˈɒn/",
    translation: "دوزاری افتادن / متوجه شدن"
  },
  {
    verb: "crack down on",
    definition: "start dealing with something more strictly",
    example: "Crack down on people who drop litter.",
    phonetic: "/ˌkræk ˈdaʊn ɒn/",
    translation: "سخت‌گیری کردن"
  },
  {
    verb: "crease up",
    definition: "laugh a lot or make someone laugh",
    example: "You really crease me up!",
    phonetic: "/ˌkriːs ˈʌp/",
    translation: "از خنده روده بر شدن"
  },
  {
    verb: "creep up on",
    definition: "move towards someone quietly to surprise them",
    example: "I watched as it crept up on a bird.",
    phonetic: "/ˌkriːp ˈʌp ɒn/",
    translation: "دزدکی نزدیک شدن"
  },
  {
    verb: "crop up",
    definition: "appear or happen suddenly or unexpectedly",
    example: "Something's cropped up at work.",
    phonetic: "/ˌkrɒp ˈʌp/",
    translation: "پیش آمدن (ناگهانی)"
  },
  {
    verb: "crowd around",
    definition: "move to a place at the same time as many others",
    example: "Everyone crowded around the actor.",
    phonetic: "/ˌkraʊd əˈraʊnd/",
    translation: "هجوم آوردن دور کسی"
  },
  {
    verb: "cut back on",
    definition: "reduce the amount of something, especially money",
    example: "Trying to cut back on groceries.",
    phonetic: "/ˌkʌt ˈbæk ɒn/",
    translation: "صرفه‌جویی کردن"
  },
  {
    verb: "cut out",
    definition: "stop eating something especially for health",
    example: "I have to cut coffee out.",
    phonetic: "/ˌkʌt ˈaʊt/",
    translation: "حذف کردن (رژیم)"
  },
  {
    verb: "die out",
    definition: "become weaker and then disappear completely",
    example: "Wolves here have died out.",
    phonetic: "/ˌdaɪ ˈaʊt/",
    translation: "منقرض شدن"
  },
  {
    verb: "dig up",
    definition: "find information or remove from ground",
    example: "Dig up evidence.",
    phonetic: "/ˌdɪɡ ˈʌp/",
    translation: "از زیر خاک درآوردن / کنکاش"
  },
  {
    verb: "dive in",
    definition: "start doing something enthusiastically",
    example: "Take a chance and dive in.",
    phonetic: "/ˌdaɪv ˈɪn/",
    translation: "شیرجه زدن در کار"
  },
  {
    verb: "do away with",
    definition: "get rid of something",
    example: "Do away with private schools.",
    phonetic: "/ˌduː əˈweɪ wɪð/",
    translation: "برانداختن / لغو کردن"
  },
  {
    verb: "do up",
    definition: "fasten clothing or repair/decorate something",
    example: "We're intending to do it up.",
    phonetic: "/ˌduː ˈʌp/",
    translation: "بستن (دکمه) / بازسازی"
  },
  {
    verb: "drum up",
    definition: "try to make people support you or buy from you",
    example: "Drum up some business.",
    phonetic: "/ˌdrʌm ˈʌp/",
    translation: "جلب کردن / راه انداختن"
  },
  {
    verb: "dry up",
    definition: "water comes out or stop being available",
    example: "The river has dried up.",
    phonetic: "/ˌdraɪ ˈʌp/",
    translation: "خشک شدن / ته کشیدن"
  },
  {
    verb: "end up",
    definition: "be in a particular state after something",
    example: "You'll end up in serious trouble.",
    phonetic: "/ˌend ˈʌp/",
    translation: "منتهی شدن"
  },
  {
    verb: "face up to",
    definition: "accept something and try to deal with it",
    example: "Face up to the problem.",
    phonetic: "/ˌfeɪs ˈʌp tuː/",
    translation: "روبرو شدن با واقعیت"
  },
  {
    verb: "fade away",
    definition: "disappear slowly",
    example: "Letters slowly faded away.",
    phonetic: "/ˌfeɪd əˈweɪ/",
    translation: "محو شدن"
  },
  {
    verb: "fall behind",
    definition: "make less progress than others",
    example: "I fell behind in school.",
    phonetic: "/ˌfɔːl bɪˈhaɪnd/",
    translation: "عقب افتادن"
  },
  {
    verb: "figure out",
    definition: "understand or solve a problem",
    example: "Figure out the connection.",
    phonetic: "/ˌfɪɡər ˈaʊt/",
    translation: "سر درآوردن"
  },
  {
    verb: "fix up",
    definition: "clean, repair or decorate something",
    example: "Fix up that old bike.",
    phonetic: "/ˌfɪks ˈʌp/",
    translation: "تعمیر و نوسازی"
  },
  {
    verb: "follow up",
    definition: "find out more or check effectiveness",
    example: "Following up new leads.",
    phonetic: "/ˌfɒləʊ ˈʌp/",
    translation: "پیگیری کردن"
  },
  {
    verb: "get across",
    definition: "make people understand something",
    example: "Get the message across.",
    phonetic: "/ˌɡet əˈkrɒs/",
    translation: "فهماندن"
  },
  {
    verb: "get around",
    definition: "if news gets around, people hear it",
    example: "The rumours got around quickly.",
    phonetic: "/ˌɡet əˈraʊnd/",
    translation: "پخش شدن (خبر)"
  },
  {
    verb: "get down",
    definition: "make someone feel sad",
    example: "Same thing every day gets you down.",
    phonetic: "/ˌɡet ˈdaʊn/",
    translation: "افسرده کردن"
  },
  {
    verb: "get in",
    definition: "be elected for a political job",
    example: "If I get in, changes will happen.",
    phonetic: "/ˌɡet ˈɪn/",
    translation: "منتخب شدن"
  },
  {
    verb: "get into",
    definition: "become involved or start enjoying",
    example: "Get into crime.",
    phonetic: "/ˌɡet ˈɪntə/",
    translation: "وارد شدن / علاقه‌مند شدن"
  },
  {
    verb: "get off",
    definition: "holiday or not be punished severely",
    example: "Get Easter off.",
    phonetic: "/ˌɡet ˈɒf/",
    translation: "مرخصی گرفتن / قسر در رفتن"
  },
  {
    verb: "get over",
    definition: "solve a problem or feel well after illness",
    example: "Get over an illness.",
    phonetic: "/ˌɡet ˈəʊvə/",
    translation: "بهبودی یافتن / چیره شدن"
  },
  {
    verb: "get through",
    definition: "finish work or stay alive until end of difficulty",
    example: "A lot of work to get through.",
    phonetic: "/ˌɡet ˈθruː/",
    translation: "به پایان رساندن"
  },
  {
    verb: "get through to",
    definition: "be connected by phone or make someone understand",
    example: "The teacher isn't getting through to the kids.",
    phonetic: "/ˌɡet ˈθruː tuː/",
    translation: "فهماندن به / وصل شدن به"
  },
  {
    verb: "give in",
    definition: "stop competing and accept defeat",
    example: "In the end, I gave in.",
    phonetic: "/ˌɡɪv ˈɪn/",
    translation: "تسلیم شدن"
  },
  {
    verb: "go astray",
    definition: "become lost or go to wrong place",
    example: "We went astray.",
    phonetic: "/ˌɡəʊ əˈstreɪ/",
    translation: "به بیراهه رفتن"
  },
  {
    verb: "go down with",
    definition: "to start to suffer from an infectious disease",
    example: "He's gone down with the flu.",
    phonetic: "/ˈɡəʊ daʊn wɪð/",
    translation: "مریض شدن"
  },
  {
    verb: "go in for",
    definition: "choose a career or enjoy an activity",
    example: "Go in for dentistry.",
    phonetic: "/ˌɡəʊ ˈɪn fə/",
    translation: "انتخاب کردن / علاقه داشتن"
  },
  {
    verb: "go off",
    definition: "explode, be fired, or food not fresh",
    example: "A bomb went off.",
    phonetic: "/ˌɡəʊ ˈɒf/",
    translation: "منفجر شدن / فاسد شدن"
  },
  {
    verb: "go together",
    definition: "frequently exist together or look good together",
    example: "Poverty and crime go together.",
    phonetic: "/ˌɡəʊ təˈɡeðə/",
    translation: "با هم آمدن / جور بودن"
  },
  {
    verb: "grow on",
    definition: "start to like someone/something more",
    example: "It's growing on me.",
    phonetic: "/ˌɡrəʊ ˈɒn/",
    translation: "به دل نشستن"
  },
  {
    verb: "hang out",
    definition: "lean out of a window or spend time in a place",
    example: "We hang out at each other's houses.",
    phonetic: "/ˌhæŋ ˈaʊt/",
    translation: "وقت‌گذرانی کردن"
  },
  {
    verb: "head off",
    definition: "prevent someone going somewhere/something happening",
    example: "Head off a catastrophe.",
    phonetic: "/ˌhed ˈɒf/",
    translation: "جلوگیری کردن"
  },
  {
    verb: "heat up",
    definition: "make something hot or become hot",
    example: "Heat up the baby's milk.",
    phonetic: "/ˌhiːt ˈʌp/",
    translation: "گرم کردن"
  },
  {
    verb: "hit back",
    definition: "criticise someone who criticised you",
    example: "The Minister hit back.",
    phonetic: "/ˌhɪt ˈbæk/",
    translation: "تلافی کردن / پاسخ دادن"
  },
  {
    verb: "hit upon",
    definition: "suddenly have an idea or discover something",
    example: "Hit upon the truth.",
    phonetic: "/ˌhɪt əˈpɒn/",
    translation: "یک دفعه به فکر رسیدن"
  },
  {
    verb: "hold back",
    definition: "stop someone moving forwards",
    example: "Police held back the crowd.",
    phonetic: "/ˌhəʊld ˈbæk/",
    translation: "عقب نگه داشتن"
  },
  {
    verb: "keep up",
    definition: "continue or move at same speed",
    example: "Keep up with him.",
    phonetic: "/ˌkiːp ˈʌp/",
    translation: "ادامه دادن / همپای کسی رفتن"
  },
  {
    verb: "key in",
    definition: "put info into computer using keyboard",
    example: "Key your details in.",
    phonetic: "/ˌkiː ˈɪn/",
    translation: "تایپ کردن / وارد کردن داده"
  },
  {
    verb: "kick off with",
    definition: "begin or start something with",
    example: "Kick off with a look at sales.",
    phonetic: "/ˌkɪk ˈɒf wɪð/",
    translation: "شروع کردن با"
  },
  {
    verb: "kill off",
    definition: "destroy living things so all are dead",
    example: "Pollution killed off the fish.",
    phonetic: "/ˌkɪl ˈɒf/",
    translation: "از بین بردن"
  },
  {
    verb: "knock off",
    definition: "stop working",
    example: "Do you want to knock off early?",
    phonetic: "/ˌnɒk ˈɒf/",
    translation: "دست از کار کشیدن"
  },
  {
    verb: "knock down",
    definition: "destroy a building or wall or hit someone with vehicle",
    example: "Knocked the old factory down.",
    phonetic: "/ˌnɒk ˈdaʊn/",
    translation: "تخریب کردن / زیر گرفتن"
  },
  {
    verb: "knuckle down",
    definition: "start working hard",
    example: "Time to knuckle down.",
    phonetic: "/ˌnʌkl ˈdaʊn/",
    translation: "سخت مشغول کار شدن"
  },
  {
    verb: "lash out",
    definition: "speak angrily or attack suddenly",
    example: "Lashed out at the council.",
    phonetic: "/ˌlæʃ ˈaʊt/",
    translation: "پرخاش کردن / حمله کردن"
  },
  {
    verb: "lay off",
    definition: "end employment or stop using for short time",
    example: "Lay off workers.",
    phonetic: "/ˌleɪ ˈɒf/",
    translation: "تعدیل نیرو / دست کشیدن"
  },
  {
    verb: "laze around",
    definition: "relax and enjoy yourself doing no work",
    example: "Laze around this weekend.",
    phonetic: "/ˌleɪz əˈraʊnd/",
    translation: "ول گشتن / تنبلی کردن"
  },
  {
    verb: "let on",
    definition: "talk about secret",
    example: "He knows more than he lets on.",
    phonetic: "/ˌlet ˈɒn/",
    translation: "بروز دادن (راز)"
  },
  {
    verb: "lie ahead",
    definition: "happening to you in the future",
    example: "A bright future lies ahead.",
    phonetic: "/ˌlaɪ əˈhed/",
    translation: "در پیش بودن"
  },
  {
    verb: "liven up",
    definition: "make more interesting or exciting",
    example: "Some music to liven things up.",
    phonetic: "/ˌlaɪvn ˈʌp/",
    translation: "روح بخشیدن / باطراوت کردن"
  },
  {
    verb: "lock up",
    definition: "lock doors or put in prison",
    example: "Lock him up.",
    phonetic: "/ˌlɒk ˈʌp/",
    translation: "زندانی کردن / قفل کردن"
  },
  {
    verb: "make into",
    definition: "change someone/something so they become something else",
    example: "Make me into the ideal student.",
    phonetic: "/ˌmeɪk ˈɪntə/",
    translation: "تبدیل کردن به"
  },
  {
    verb: "make out",
    definition: "see/hear with difficulty or suggest",
    example: "Can you make out a face?",
    phonetic: "/ˌmeɪk ˈaʊt/",
    translation: "تشخیص دادن / وانمود کردن"
  },
  {
    verb: "make over",
    definition: "change or improve appearance",
    example: "They made over three contestants.",
    phonetic: "/ˌmeɪk ˈəʊvə/",
    translation: "تغییر ظاهر دادن"
  },
  {
    verb: "make up",
    definition: "work at different times or invent story",
    example: "I'll make up the time.",
    phonetic: "/ˌmeɪk ˈʌp/",
    translation: "جبران کردن / سر هم کردن"
  },
  {
    verb: "meet up",
    definition: "come together with someone",
    example: "Meet up in Berlin.",
    phonetic: "/ˌmiːt ˈʌp/",
    translation: "ملاقات کردن"
  },
  {
    verb: "mess about/around",
    definition: "behave sillily or spend time relaxing",
    example: "Stop messing around.",
    phonetic: "/ˌmes əˈbaʊt/",
    translation: "مسخره‌بازی درآوردن / وقت تلف کردن"
  },
  {
    verb: "mess up",
    definition: "make mistake or cause physical problems",
    example: "Messed up the interview.",
    phonetic: "/ˌmes ˈʌp/",
    translation: "خراب کردن"
  },
  {
    verb: "mix up",
    definition: "put things together without order",
    example: "Mixed them up.",
    phonetic: "/ˌmɪks ˈʌp/",
    translation: "قاطی کردن / اشتباه گرفتن"
  },
  {
    verb: "mount up",
    definition: "get much larger",
    example: "Costs are beginning to mount up.",
    phonetic: "/ˌmaʊnt ˈʌp/",
    translation: "بالا رفتن (مقدار)"
  },
  {
    verb: "move in with",
    definition: "start living in a different flat/house with",
    example: "Moved in with me.",
    phonetic: "/ˌmuːv ˈɪn wɪð/",
    translation: "هم‌خانه شدن"
  },
  {
    verb: "move on",
    definition: "leave one place or stop discussing topic",
    example: "Move on or we'll never finish.",
    phonetic: "/ˌmuːv ˈɒn/",
    translation: "ادامه دادن / نقل مکان کردن"
  },
  {
    verb: "move out",
    definition: "permanently leave house/flat",
    example: "Finally moved out.",
    phonetic: "/ˌmuːv ˈaʊt/",
    translation: "اسباب‌کشی کردن (رفتن)"
  },
  {
    verb: "move over",
    definition: "change position to make space",
    example: "The woman moved over.",
    phonetic: "/ˌmuːv ˈəʊvə/",
    translation: "کمی آن‌طرف‌تر رفتن"
  },
  {
    verb: "mull over",
    definition: "think carefully about something over period of time",
    example: "Time to mull over proposals.",
    phonetic: "/ˌmʌl ˈəʊvə/",
    translation: "تأمل کردن"
  },
  {
    verb: "open up",
    definition: "make traveling easier or talk about feelings",
    example: "Doesn't find it easy to open up.",
    phonetic: "/ˌəʊpən ˈʌp/",
    translation: "درددل کردن / باز شدن"
  },
  {
    verb: "opt out of",
    definition: "decide not to take part in something",
    example: "Opted out of the trip.",
    phonetic: "/ˌɒpt ˈaʊt əv/",
    translation: "انصراف دادن"
  },
  {
    verb: "paper over",
    definition: "hide problem rather than solve it",
    example: "Papered over fundamental problems.",
    phonetic: "/ˌpeɪpə ˈəʊvə/",
    translation: "ماست‌مالی کردن"
  },
  {
    verb: "pass away",
    definition: "polite way to say die",
    example: "Passed away in sleep.",
    phonetic: "/ˌpɑːs əˈweɪ/",
    translation: "درگذشتن"
  },
  {
    verb: "pass on",
    definition: "give someone something meant for them",
    example: "Please pass it on.",
    phonetic: "/ˌpɑːs ˈɒn/",
    translation: "انتقال دادن (پیام)"
  },
  {
    verb: "patch up",
    definition: "become friends again or give basic treatment",
    example: "Patch up relations.",
    phonetic: "/ˌpætʃ ˈʌp/",
    translation: "دوستانه حل کردن / مداوا کردن"
  },
  {
    verb: "pay back",
    definition: "give same amount of money borrowed",
    example: "Pay you back next week.",
    phonetic: "/ˌpeɪ ˈbæk/",
    translation: "پس دادن پول"
  },
  {
    verb: "pay out",
    definition: "provide money or spend a lot",
    example: "Paid out thousands.",
    phonetic: "/ˌpeɪ ˈaʊt/",
    translation: "پرداخت کردن (زیاد)"
  },
  {
    verb: "phase out",
    definition: "gradually stop using something",
    example: "Phasing out the old style.",
    phonetic: "/ˌfeɪz ˈaʊt/",
    translation: "تدریجاً کنار گذاشتن"
  },
  {
    verb: "pick on",
    definition: "keep treating someone badly/unfairly",
    example: "Pick on someone your size.",
    phonetic: "/ˌpɪk ˈɒn/",
    translation: "اذیت کردن / پیله کردن"
  },
  {
    verb: "pick up",
    definition: "meet arranged vehicle or learn new skill",
    example: "Pick you up at twelve.",
    phonetic: "/ˌpɪk ˈʌp/",
    translation: "سوار کردن / یاد گرفتن"
  },
  {
    verb: "piece together",
    definition: "learn truth by considering separate bits",
    example: "Piecing together circumstances.",
    phonetic: "/ˌpiːs təˈɡeðə/",
    translation: "سرهم کردن (اطلاعات)"
  },
  {
    verb: "pile up",
    definition: "amount increases a lot",
    example: "Washing-up is beginning to pile up.",
    phonetic: "/ˌpaɪl ˈʌp/",
    translation: "کومه‌شدن / روی هم انباشتن"
  },
  {
    verb: "play up",
    definition: "cause difficulties or behave badly",
    example: "Printer's playing up again.",
    phonetic: "/ˌpleɪ ˈʌp/",
    translation: "بد قلقلی کردن"
  },
  {
    verb: "press ahead/on with",
    definition: "continue in determined way despite difficulty",
    example: "Pressed ahead regardless.",
    phonetic: "/ˌpres əˈhed wɪð/",
    translation: "با پشتکار ادامه دادن"
  },
  {
    verb: "prop up",
    definition: "help system continue to exist or stop sth falling",
    example: "Books to prop my desk up.",
    phonetic: "/ˌprɒp ˈʌp/",
    translation: "نگه‌داری کردن / تکیه‌گاه دادن"
  },
  {
    verb: "pull over",
    definition: "stop by side of road in vehicle",
    example: "Pull over for a second.",
    phonetic: "/ˌpʊl ˈəʊvə/",
    translation: "بغل زدن (رانندگی)"
  },
  {
    verb: "pull through",
    definition: "stay alive after illness or succeed in difficulty",
    example: "Pull through the operation.",
    phonetic: "/ˌpʊl ˈθruː/",
    translation: "جان سالم به در بردن"
  },
  {
    verb: "push around",
    definition: "keep telling someone what to do unfairly",
    example: "Don't let her push you around.",
    phonetic: "/ˌpʊʃ əˈraʊnd/",
    translation: "زورگویی کردن"
  },
  {
    verb: "put across/over",
    definition: "explain idea in easy way to understand",
    example: "Putting across health messages.",
    phonetic: "/ˌpʊt əˈkrɒs/",
    translation: "فهماندن / بیان کردن"
  },
  {
    verb: "put down to",
    definition: "think it happened for a particular reason",
    example: "Put success down to hard work.",
    phonetic: "/ˌpʊt ˈdaʊn tuː/",
    translation: "نسبت دادن به"
  },
  {
    verb: "put in",
    definition: "fix equipment or spend amount of time",
    example: "Put in a lot of hard work.",
    phonetic: "/ˌpʊt ˈɪn/",
    translation: "قرار دادن / وقت گذاشتن"
  },
  {
    verb: "put together",
    definition: "choose people/things to form group or join parts",
    example: "Putting together an expedition.",
    phonetic: "/ˌpʊt təˈɡeðə/",
    translation: "گردآوری کردن / سرهم کردن"
  },
  {
    verb: "put up",
    definition: "build structure or let someone stay in house",
    example: "Put you up for a few days.",
    phonetic: "/ˌpʊt ˈʌp/",
    translation: "بنا کردن / اسکان دادن"
  },
  {
    verb: "puzzle out",
    definition: "solve complicated problem by thinking carefully",
    example: "Puzzle out who the caller was.",
    phonetic: "/ˌpʌzl ˈaʊt/",
    translation: "حل کردن (معما)"
  },
  {
    verb: "read up (on/about)",
    definition: "get info on subject by reading a lot",
    example: "Read up on British history.",
    phonetic: "/ˌriːd ˈʌp/",
    translation: "مطالعه کردن (درباره)"
  },
  {
    verb: "run down",
    definition: "organisation size is reduced (run-down)",
    example: "Running the factory down.",
    phonetic: "/ˌrʌn ˈdaʊn/",
    translation: "روبه‌زوال رفتن"
  },
  {
    verb: "scrape through",
    definition: "succeed but not in impressive way",
    example: "Scrape through the entrance exam.",
    phonetic: "/ˌskreɪp ˈθruː/",
    translation: "پلکانی گذشتن / به سختی موفق شدن"
  },
  {
    verb: "seek out",
    definition: "find someone/something by looking determinedly",
    example: "Trained to seek out drugs.",
    phonetic: "/ˌsiːk ˈaʊt/",
    translation: "جستجو و یافتن"
  },
  {
    verb: "set down",
    definition: "state officially how it should be done or write on paper",
    example: "Set down in her diary.",
    phonetic: "/ˌset ˈdaʊn/",
    translation: "تعیین کردن / نوشتن"
  },
  {
    verb: "set out",
    definition: "start working to achieve aim",
    example: "Set out to become a millionaire.",
    phonetic: "/ˌset ˈaʊt/",
    translation: "قصد کردن / شروع کردن"
  },
  {
    verb: "set up",
    definition: "build structure or make equipment ready",
    example: "Set the tent up.",
    phonetic: "/ˌset ˈʌp/",
    translation: "برپا کردن / تنظیم کردن"
  },
  {
    verb: "shout down",
    definition: "make it difficult to hear what someone says by shouting",
    example: "Minister was shouted down.",
    phonetic: "/ˌʃaʊt ˈdaʊn/",
    translation: "با فریاد مانع حرف کسی شدن"
  },
  {
    verb: "shrivel up",
    definition: "become smaller/thinner or weaker",
    example: "Leaves shrivelled up.",
    phonetic: "/ˌʃrɪvl ˈʌp/",
    translation: "چروکیده شدن / تحلیل رفتن"
  },
  {
    verb: "single out",
    definition: "choose one person from group for special attention",
    example: "Singled out his manager.",
    phonetic: "/ˌsɪnɡl ˈaʊt/",
    translation: "گلچین کردن"
  },
  {
    verb: "size up",
    definition: "think carefully and form opinion about person",
    example: "Sized up the situation.",
    phonetic: "/ˌsaɪz ˈʌp/",
    translation: "برانداز کردن"
  },
  {
    verb: "slip away",
    definition: "leave secretly",
    example: "Managed to slip away.",
    phonetic: "/ˌslɪp əˈweɪ/",
    translation: "جیم شدن"
  },
  {
    verb: "slip up",
    definition: "make careless mistake",
    example: "Afford to slip up this time.",
    phonetic: "/ˌslɪp ˈʌp/",
    translation: "سهل‌انگاری کردن"
  },
  {
    verb: "smarten up",
    definition: "make look tidy and clean",
    example: "Smarten myself up before meeting.",
    phonetic: "/ˌsmɑːrtn ˈʌp/",
    translation: "آراسته کردن"
  },
  {
    verb: "snow under",
    definition: "too much of something to deal with",
    example: "Snowed under with work.",
    phonetic: "/ˌsnəʊ ˈʌndə/",
    translation: "غرق در کار بودن"
  },
  {
    verb: "sound out",
    definition: "find out opinions by talking to them",
    example: "Sound out local opinion.",
    phonetic: "/ˌsaʊnd ˈaʊt/",
    translation: "سنجیدن نظر"
  },
  {
    verb: "speak out",
    definition: "state opinion firmly and publicly",
    example: "Spoken out in favour of women.",
    phonetic: "/ˌspiːk ˈaʊt/",
    translation: "علنی صحبت کردن"
  },
  {
    verb: "spread out",
    definition: "move away from one another to cover large area",
    example: "Spread out to find him.",
    phonetic: "/ˌspred ˈaʊt/",
    translation: "پهن شدن"
  },
  {
    verb: "spring up",
    definition: "appear or be produced suddenly",
    example: "Cafes sprung up lately.",
    phonetic: "/ˌsprɪŋ ˈʌp/",
    translation: "قارچ‌گونه روییدن / پدیدار شدن"
  },
  {
    verb: "stand out",
    definition: "easy to see or much more impressive",
    example: "Germany stands out as leader.",
    phonetic: "/ˌstænd ˈaʊt/",
    translation: "برجسته بودن"
  },
  {
    verb: "stand up to",
    definition: "not allow yourself to be treated badly",
    example: "Stand up to your boss.",
    phonetic: "/ˌstænd ˈʌp tuː/",
    translation: "ایستادگی کردن"
  },
  {
    verb: "step aside",
    definition: "leave job so someone else takes over or move so sb pass",
    example: "Stepped aside to let him through.",
    phonetic: "/ˌstep əˈsaɪd/",
    translation: "کنار رفتن"
  },
  {
    verb: "stop off",
    definition: "visit somewhere before continuing to another place",
    example: "Stop off at the bakery.",
    phonetic: "/ˌstɒp ˈɒf/",
    translation: "توقف کوتاه در مسیر"
  },
  {
    verb: "store up",
    definition: "cause future problems or keep a lot for later",
    example: "Store up nuts for winter.",
    phonetic: "/ˌstɔːr ˈʌp/",
    translation: "ذخیره کردن / فراهم کردن (مشکل)"
  },
  {
    verb: "summon up",
    definition: "manage to produce quality helping deal with difficulty",
    example: "Couldn't summon up strength.",
    phonetic: "/ˌsʌmən ˈʌp/",
    translation: "گردآوری کردن (نیرو)"
  },
  {
    verb: "switch on/off",
    definition: "start/stop machine or light",
    example: "Switch conditioning on.",
    phonetic: "/ˌswɪtʃ ˈɒn/",
    translation: "کشی/خاموش کردن"
  },
  {
    verb: "swot up (on)",
    definition: "study something very hard for an exam",
    example: "Swot up the French Revolution.",
    phonetic: "/ˌswɒt ˈʌp/",
    translation: "سخت مطالعه کردن"
  },
  {
    verb: "take after",
    definition: "look or behave like an older relative",
    example: "Take after her mother.",
    phonetic: "/ˌteɪk ˈɑːftə/",
    translation: "به کسی رفتن (ظاهر/اخلاق)"
  },
  {
    verb: "take apart",
    definition: "separate an object into pieces",
    example: "Took my computer apart.",
    phonetic: "/ˌteɪk əˈpɑːt/",
    translation: "از هم باز کردن"
  },
  {
    verb: "take away",
    definition: "remove one number from another",
    example: "Take three away from five.",
    phonetic: "/ˌteɪk əˈweɪ/",
    translation: "کم کردن / بیرون‌بر"
  },
  {
    verb: "take down",
    definition: "separate structures or write down information",
    example: "Police took down details.",
    phonetic: "/ˌteɪk ˈdaʊn/",
    translation: "پیاده کردن / یادداشت کردن"
  },
  {
    verb: "take in",
    definition: "accept as real or understand/remember",
    example: "Taking in sceneray.",
    phonetic: "/ˌteɪk ˈɪn/",
    translation: "فهمیدن / فریب خوردن / گنجاندن"
  },
  {
    verb: "take off",
    definition: "become successful fast or away from work",
    example: "Design took off immediately.",
    phonetic: "/ˌteɪk ˈɒf/",
    translation: "بلند شدن / موفق شدن"
  },
  {
    verb: "take on",
    definition: "accept work/responsibility or employ someone",
    example: "Not taking on new staff.",
    phonetic: "/ˌteɪk ˈɒn/",
    translation: "پذیرفتن / استخدام کردن"
  },
  {
    verb: "take out",
    definition: "take someone to cinema/restaurant and pay",
    example: "Took everyone out bowling.",
    phonetic: "/ˌteɪk ˈaʊt/",
    translation: "بیرون بردن"
  },
  {
    verb: "take over",
    definition: "begin to do what someone else was doing/control",
    example: "Driver took over.",
    phonetic: "/ˌteɪk ˈəʊvə/",
    translation: "به عهده گرفتن / کنترل کردن"
  },
  {
    verb: "take to",
    definition: "begin to like someone/something or start habit",
    example: "Taken to getting up earlier.",
    phonetic: "/ˌteɪk ˈtuː/",
    translation: "علاقه‌مند شدن / عادت کردن"
  },
  {
    verb: "talk down to",
    definition: "talk as if they are not clever or important",
    example: "Talks down to people.",
    phonetic: "/ˌtɔːk ˈdaʊn tuː/",
    translation: "با تحقیر حرف زدن"
  },
  {
    verb: "talk over",
    definition: "discuss a problem or plan",
    example: "Talk it over tonight.",
    phonetic: "/ˌtɔːk ˈəʊvə/",
    translation: "بحث و گفتگو کردن"
  },
  {
    verb: "talk round",
    definition: "discuss in general way or persuade",
    example: "Talk her round.",
    phonetic: "/ˌtɔːk ˈraʊnd/",
    translation: "کلی‌گویی / متقاعد کردن"
  },
  {
    verb: "test out",
    definition: "try using machine to find whether it works correctly",
    example: "Test my aeroplane out.",
    phonetic: "/ˌtest ˈaʊt/",
    translation: "آزمایش کردن"
  },
  {
    verb: "think over",
    definition: "consider problem or decision carefully",
    example: "Think over his proposal.",
    phonetic: "/ˌθɪŋk ˈəʊvə/",
    translation: "سنجیدن / فکر کردن"
  },
  {
    verb: "think through",
    definition: "consider facts in organised way",
    example: "Think things through.",
    phonetic: "/ˌθɪŋk ˈθruː/",
    translation: "همه جوانب را در نظر گرفتن"
  },
  {
    verb: "think up",
    definition: "invent or imagine something",
    example: "Think up a good reason.",
    phonetic: "/ˌθɪŋk ˈʌp/",
    translation: "سر هم کردن / اختراع کردن"
  },
  {
    verb: "throw out",
    definition: "force someone leave or get rid of something",
    example: "Thrown out of Scouts.",
    phonetic: "/ˌθrəʊ ˈaʊt/",
    translation: "بیرون انداختن / دور ریختن"
  },
  {
    verb: "throw up",
    definition: "cause dust/water rise or produce new problem",
    example: "Helicopter threw up dust.",
    phonetic: "/ˌθrəʊ ˈʌp/",
    translation: "ایجاد کردن / استفراغ"
  },
  {
    verb: "tide over",
    definition: "help someone get to end of difficult period",
    example: "Tide me over until pay day.",
    phonetic: "/ˌtaɪd ˈəʊvə/",
    translation: "از پس (مشکل مالی) برآمدن"
  },
  {
    verb: "tip up",
    definition: "have one end move upwards or turn container down",
    example: "Bench began to tip up.",
    phonetic: "/ˌtɪp ˈʌp/",
    translation: "واژگون شدن"
  },
  {
    verb: "touch up",
    definition: "make surface look better with small improvements",
    example: "Touch up paintwork.",
    phonetic: "/ˌtʌtʃ ˈʌp/",
    translation: "اصلاح و لکه گیری"
  },
  {
    verb: "turn into",
    definition: "change or develop into something different",
    example: "Sofa turns into a bed.",
    phonetic: "/ˌtɜːn ˈɪntə/",
    translation: "تبدیل شدن به"
  },
  {
    verb: "use up",
    definition: "use all of a supply of something",
    example: "Use the butter up.",
    phonetic: "/ˌjuːz ˈʌp/",
    translation: "مصرف کردن و تمام کردن"
  },
  {
    verb: "walk out",
    definition: "leave meeting or suddenly leave relationship",
    example: "Walked out halfway through film.",
    phonetic: "/ˌwɔːk ˈaʊt/",
    translation: "ترک کردن (قهر)"
  },
  {
    verb: "ward off",
    definition: "prevent someone/something harming you",
    example: "Ward off attacks.",
    phonetic: "/ˌwɔːrd ˈɒf/",
    translation: "دفع کردن"
  },
  {
    verb: "warm up",
    definition: "prepare for sport by doing gentle exercises",
    example: "Warm up before exercise.",
    phonetic: "/ˌwɔːrm ˈʌp/",
    translation: "گرم کردن (ورزش)"
  },
  {
    verb: "waste away",
    definition: "gradually become thinner and weaker",
    example: "Starting to waste away.",
    phonetic: "/ˌweɪst əˈweɪ/",
    translation: "تحلیل رفتن (جسمی)"
  },
  {
    verb: "water down",
    definition: "add water to liquid or make statement less powerful",
    example: "Watered my article down.",
    phonetic: "/ˌwɔːtə ˈdaʊn/",
    translation: "رقیق کردن / از تاب و توان انداختن"
  },
  {
    verb: "wear down",
    definition: "make someone lose energy or wear thin by rubbing",
    example: "Criticism is wearing me down.",
    phonetic: "/ˌweə ˈdaʊn/",
    translation: "فرسوده کردن / از پا درآوردن"
  },
  {
    verb: "wear out",
    definition: "use something a lot so no longer works",
    example: "Wore out three pairs of boots.",
    phonetic: "/ˌweər ˈaʊt/",
    translation: "فرسوده کردن / کهنه کردن"
  },
  {
    verb: "weigh down",
    definition: "cause problems or make heavy/unable to move",
    example: "Industry weighed down by uncertainty.",
    phonetic: "/ˌweɪ ˈdaʊn/",
    translation: "سنگینی کردن / نگران کردن"
  },
  {
    verb: "while away",
    definition: "spend time in relaxed way when nothing else to do",
    example: "Whiled away Saturday afternoon.",
    phonetic: "/ˌwaɪl əˈweɪ/",
    translation: "گذراندن وقت"
  },
  {
    verb: "wind down",
    definition: "finish gradually or relax after excitement",
    example: "Wind down production.",
    phonetic: "/ˌwaɪnd ˈdaʊn/",
    translation: "کاستن / ریلکس کردن"
  },
  {
    verb: "write off",
    definition: "damage vehicle badly or decide someone won't succeed",
    example: "Teachers written him off.",
    phonetic: "/ˌraɪt ˈɒf/",
    translation: "اسقاط کردن / نادیده گرفتن"
  }
];

export async function enrichPhrasalVerb(rawText: string): Promise<PhrasalVerb[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this raw phrasal verb list into JSON with fields: verb, definition, example, phonetic (IPA), and translation (Persian).
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
    return JSON.parse(response.text || "[]");
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
