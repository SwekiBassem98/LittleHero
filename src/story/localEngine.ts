import { authoredDirection } from "./directions";
import type { Beat, Story, StoryRequest } from "./types";

/**
 * Built-in story engine. It writes a complete eight-page story with no
 * network at all, so the app always works; the AI engine replaces it
 * whenever the server has a key.
 *
 * Grammar helpers inside the texts:
 *   [masc|fem]  agrees with the child      <masc|fem>  agrees with the companion
 */
interface ThemeScript {
  title: string;
  start: string;
  journey: string;
  friend: string;
  problem: string;
  celebrate: string;
}

interface Pack {
  buddy: Record<string, { name: string; fem?: boolean }>;
  themes: Record<string, ThemeScript>;
  idea: Record<string, string>;
  brave: Record<string, string>;
  moral: Record<string, string>;
  end: string;
  endBedtime: string;
  favorite: string;
  /** Two extra chapters per world: a moment of wonder, and the last stretch. */
  more: Record<string, { wonder: string; almost: string }>;
  /** Sound words and the companion's first words, per world. */
  fx: Record<string, { go: string; win: string; hi: string }>;
  question: string;
  traitLabel: Record<string, string>;
}

const fr: Pack = {
  buddy: {
    space: { name: "Bolt" },
    pirate: { name: "Pinso" },
    dinosaur: { name: "Trixie", fem: true },
    fairy: { name: "Champi" },
    superhero: { name: "Zap" },
    underwater: { name: "Plouf" },
    jungle: { name: "Kiki" },
    bedtime: { name: "Nour", fem: true },
  },
  themes: {
    space: {
      title: "{name} et la lumière des étoiles",
      start: "Ce soir, {name} regarde le ciel par la fenêtre. Tiens ? Les étoiles s'éteignent une à une ! Vite, il faut aller voir là-haut.",
      journey: "{name} grimpe dans une petite fusée argentée. Trois, deux, un… décollage ! La Terre devient toute petite, comme une bille bleue.",
      friend: "Sur la planète Poussière d'Étoiles, quelqu'un fait bip-bip : c'est Bolt, le petit robot ! « Les étoiles ont perdu leur lumière. Tu m'aides à la retrouver ? »",
      problem: "Mais une pluie de cailloux de l'espace leur barre la route. Bolt clignote de peur. Comment passer ?",
      celebrate: "Derrière le dernier caillou, une petite étoile toute timide se cachait. {name} lui sourit… et pouf ! Tout le ciel se rallume.",
    },
    pirate: {
      title: "{name} et le trésor de la Mer Arc-en-ciel",
      start: "Ce matin, {name} trouve une bouteille sur la plage. Dedans, une carte au trésor ! Une grande croix rouge brille au milieu de la Mer Arc-en-ciel.",
      journey: "{name} monte à bord de la Méduse, le plus joli bateau du port. « Hissez les voiles à pois ! » Le vent se met à chanter.",
      friend: "Clic, clac ! Sur le pont, un petit crabe agite ses pinces : c'est Pinso, le pirate ! « Je connais le chemin du trésor. On y va ensemble ? »",
      problem: "Soudain, un gros nuage gris cache le soleil et les vagues deviennent toutes grognonnes. Pinso se cache derrière ses pinces. Que faire ?",
      celebrate: "Sur l'île, le coffre s'ouvre enfin. Dedans, pas d'or… mais des couleurs ! Elles s'envolent et repeignent toute la mer en arc-en-ciel.",
    },
    dinosaur: {
      title: "{name} et le mystère de la pierre de lune",
      start: "Au pays des dinosaures, c'est la panique : la pierre de lune a disparu ! {name} enfile son petit chapeau de détective et sort sa loupe.",
      journey: "{name} suit de drôles d'empreintes à trois doigts. Elles passent près du volcan qui ronfle et sous des fougères géantes.",
      friend: "Derrière un rocher, une petite tricératops pointe ses cornes : c'est Trixie ! « Moi aussi je cherche la pierre de lune. On mène l'enquête ensemble ? »",
      problem: "Les empreintes s'arrêtent au bord d'une rivière de boue. Plus aucune trace ! Trixie baisse la tête. Comment continuer ?",
      celebrate: "De l'autre côté, un bébé dinosaure dort, la pierre de lune dans les pattes. Il avait juste peur du noir ! {name} lui offre une veilleuse, et tout le monde rit.",
    },
    fairy: {
      title: "{name} et la Forêt Enchantée",
      start: "Au fond du jardin, {name} découvre une petite porte dans un arbre. Derrière, une forêt où les feuilles scintillent comme des étoiles.",
      journey: "{name} avance sur un chemin de mousse toute douce. Les arbres chuchotent bonjour, et des lucioles montrent la route.",
      friend: "Un chapeau rouge à pois sautille dans l'herbe : c'est Champi, le petit champignon ! « La fontaine magique ne chante plus. Tu viens voir avec moi ? »",
      problem: "Mais des ronces toutes emmêlées ferment le chemin de la fontaine. Champi soupire. Comment passer sans se piquer ?",
      celebrate: "La fontaine était juste bouchée par une feuille ! {name} l'enlève doucement… et l'eau se remet à chanter. Toute la forêt danse.",
    },
    superhero: {
      title: "Super {name} et le Nuage Grognon",
      start: "Ce matin, {name} se réveille avec une drôle de sensation. Son pyjama brille, et une petite cape flotte dans son dos !",
      journey: "{name} fait un petit saut… et s'envole au-dessus des toits ! En bas, la ville a l'air bien triste aujourd'hui.",
      friend: "Sur un toit, un lapin masqué fait de grands signes : c'est Zap ! « Le Nuage Grognon rend tout le monde de mauvaise humeur. On l'arrête ensemble ? »",
      problem: "Le Nuage Grognon est énorme et il souffle très fort. Zap a les oreilles qui tremblent. Comment faire ?",
      celebrate: "{name} n'attaque pas le nuage : {name} lui raconte une blague ! Le nuage pouffe, rit aux éclats… et se transforme en arc-en-ciel.",
    },
    underwater: {
      title: "{name} et le Royaume sous les Vagues",
      start: "Plouf ! {name} glisse sous les vagues… et découvre qu'on peut respirer ici ! Tout en bas brille un château de corail.",
      journey: "{name} nage avec un banc de poissons qui chatouillent. Les algues dansent, et les bulles font de la musique.",
      friend: "Huit bras s'agitent pour dire bonjour : c'est Plouf, la petite pieuvre ! « Les coraux ont perdu leurs couleurs. Tu m'aides à les réveiller ? »",
      problem: "Mais un grand courant tout froid les repousse en arrière. Plouf s'accroche à un rocher. Comment avancer ?",
      celebrate: "Au cœur du récif, une perle géante dormait. {name} la caresse doucement… et les couleurs reviennent : du rose, du jaune, du bleu partout !",
    },
    jungle: {
      title: "{name} et le Temple de la Cascade",
      start: "Dans son sac, {name} trouve une vieille carte qui sent la banane. Elle mène à un temple caché au cœur de la jungle !",
      journey: "{name} écarte les grandes feuilles et marche sur un pont de lianes. Des perroquets de toutes les couleurs crient bonjour.",
      friend: "Hop ! Un petit singe dégringole d'une branche : c'est Kiki ! « J'ai perdu ma famille près du temple. On le cherche ensemble ? »",
      problem: "Le chemin se sépare en trois, et la carte est toute déchirée. Kiki se gratte la tête. Par où aller ?",
      celebrate: "Derrière la cascade, le temple doré apparaît… et toute la famille de Kiki fait la fête ! Il y a des câlins et des bananes pour tout le monde.",
    },
    bedtime: {
      title: "{name} et l'Étoile Endormie",
      start: "{name} bâille très fort quand une petite lumière tombe dans la chambre. C'est une étoile en bonnet de nuit !",
      journey: "{name} prend l'étoile dans ses mains et monte sur un nuage tout doux. Le nuage s'envole lentement au-dessus des toits.",
      friend: "« Je m'appelle Nour », chuchote l'étoile. « J'ai perdu le chemin de ma maison dans le ciel. Tu veux bien m'aider ? »",
      problem: "Mais le ciel est immense, et toutes les étoiles se ressemblent. Nour a les yeux qui piquent. Où est sa maison ?",
      celebrate: "Tout là-haut, une place vide attend, juste à côté de la lune. Nour s'y installe et brille de bonheur. « Merci… et bonne nuit », murmure-t-elle.",
    },
  },
  idea: {
    brave: "{name} respire un grand coup. Le courage, c'est comme un muscle : plus on s'en sert, plus il grandit.",
    curious: "{name} regarde bien partout. « Et si on essayait par là ? » La curiosité trouve toujours un chemin.",
    kind: "{name} pose une main sur l'épaule de {buddy}. « Ne t'inquiète pas, je suis là. » Un mot gentil, et tout va déjà mieux.",
    silly: "{name} fait une grimace très rigolote. {buddy} éclate de rire, et la peur s'envole d'un coup.",
    creative: "{name} a une idée folle : fabriquer quelque chose avec ce qu'il y a autour. Un peu d'imagination, et hop !",
    energetic: "{name} saute, court et bondit. Avec autant d'énergie, rien ne semble impossible !",
    bookworm: "{name} se souvient d'une histoire lue un soir. « Dans mon livre, ils faisaient comme ça ! »",
    dreamer: "{name} ferme les yeux une seconde et imagine la solution. Les rêves donnent parfois de très bonnes idées.",
    friendly: "« À deux, on est plus forts ! » dit {name} en tendant la main à {buddy}.",
    solver: "{name} observe, compte, réfléchit… « J'ai trouvé ! » Chaque problème a sa solution.",
    default: "« J'ai une idée ! » dit {name} avec un grand sourire.",
  },
  brave: {
    courage: "« On peut avoir un peu peur et y aller quand même », dit {name}. Un pas, puis un autre… et ça passe !",
    kindness: "En chemin, {name} aide tous ceux qui en ont besoin. Et chacun, à son tour, donne un coup de main.",
    sharing: "{name} partage son goûter avec {buddy}. Le ventre plein et le cœur léger, tout devient plus facile.",
    curiosity: "{name} pose mille questions et essaie mille choses. À force de chercher, on finit par trouver !",
    perseverance: "Ça ne marche pas du premier coup. Ni du deuxième. Mais {name} recommence encore… et cette fois, ça marche !",
    calm: "{name} respire doucement, comme pour souffler sur une plume. Quand on est calme, on y voit plus clair.",
  },
  moral: {
    courage: "Le courage, ce n'est pas de ne jamais avoir peur : c'est d'avancer quand même.",
    kindness: "Un geste gentil peut changer toute une journée.",
    sharing: "Ce qu'on partage devient encore plus beau.",
    curiosity: "Chaque question est le début d'une aventure.",
    perseverance: "On ne rate jamais vraiment : on apprend.",
    calm: "Une grande respiration, et tout devient plus simple.",
  },
  end: "Le soir, {name} rentre à la maison, le cœur tout chaud. {buddy} fait un dernier coucou. Demain, une nouvelle aventure commence… Fin.",
  endBedtime: "{name} retourne dans son lit, sous sa couverture toute douce. Dans le ciel, Nour fait un clin d'œil. Bonne nuit, {name}.",
  favorite: "Et bien sûr, {name} emporte ce qui compte le plus au monde : {fav} !",
  more: {
    space: {
      wonder: "Bolt montre le chemin en sautillant sur la lune. Ici, on rebondit comme sur un trampoline ! {name} fait un bond de géant et attrape une poussière d'étoile qui chatouille.",
      almost: "Presque arrivés ! Mais la dernière étoile est perchée tout en haut d'une montagne de lune. {name} et Bolt grimpent, glissent, rient… et grimpent encore.",
    },
    pirate: {
      wonder: "Des dauphins sautent autour du bateau en faisant des pirouettes. Pinso leur lance des bulles, et {name} apprend à tenir la barre comme un vrai capitaine.",
      almost: "L'île est juste là ! Mais le coffre est enterré très profond. {name} creuse, Pinso creuse, le sable vole partout… Toc ! Quelque chose de dur.",
    },
    dinosaur: {
      wonder: "En chemin, un énorme diplodocus leur fait un toboggan avec son long cou. Ziiip ! {name} glisse jusqu'en bas pendant que Trixie note tous les indices dans son carnet.",
      almost: "De nouvelles empreintes mènent à une grotte toute sombre. {name} allume sa lampe. Au fond, quelque chose brille doucement…",
    },
    fairy: {
      wonder: "Champi présente ses amis : un hibou à lunettes, des fleurs qui gloussent et un escargot très pressé. {name} danse avec les lucioles, et la forêt entière applaudit avec ses feuilles.",
      almost: "Enfin, la fontaine ! Mais elle est toute silencieuse et triste. {name} s'approche sur la pointe des pieds et regarde bien au fond…",
    },
    superhero: {
      wonder: "Zap montre ses meilleurs tours : il court sur les murs et saute de toit en toit. {name} essaie aussi… et découvre que sa cape fait des loopings toute seule !",
      almost: "Les voilà nez à nez avec le Nuage Grognon. Il gronde, il boude, il fait la grosse voix. {name} s'envole tout près, bien droit dans le vent.",
    },
    underwater: {
      wonder: "Plouf fait visiter le château de corail. Dans la salle de bal, des hippocampes dansent en rond. {name} tourne avec eux et fait des bulles en forme de cœur.",
      almost: "Au bout d'un tunnel d'algues, une lumière clignote faiblement. {name} nage tout doucement pour ne pas faire peur aux petits poissons endormis.",
    },
    jungle: {
      wonder: "Kiki apprend à {name} à se balancer de liane en liane. Yahou ! En bas, un toucan compte les points et des papillons font la course.",
      almost: "On entend enfin la cascade ! Mais il faut traverser la rivière sur des pierres toutes glissantes. Un pas… deux pas… {name} tend la main à Kiki.",
    },
    bedtime: {
      wonder: "Sur le chemin, des moutons de nuage sautent par-dessus la lune. {name} les compte tout doucement : un… deux… trois… Nour bâille et se blottit contre sa joue.",
      almost: "Voici la Grande Ourse, qui connaît toutes les maisons du ciel. Elle montre un endroit du bout de la patte, là-bas, où il fait un peu plus noir.",
    },
  },
  fx: {
    space: { go: "WOOOSH !", win: "POUF !", hi: "Bip-bip !" },
    pirate: { go: "HISSEZ HAUT !", win: "HOURRA !", hi: "Clic, clac !" },
    dinosaur: { go: "TAP TAP TAP", win: "HA HA HA !", hi: "Un indice !" },
    fairy: { go: "CHHHUT…", win: "GLOU GLOU !", hi: "Coucou…" },
    superhero: { go: "ZOUUUM !", win: "HA HA HA !", hi: "Zap !" },
    underwater: { go: "PLOUF !", win: "WAOUH !", hi: "Bloup bloup !" },
    jungle: { go: "CRIC CRAC", win: "YAHOU !", hi: "Hi hi hi !" },
    bedtime: { go: "FFFOU…", win: "BONNE NUIT", hi: "Chut…" },
  },
  question: "Qu'est-ce qui va aider {name} ?",
  traitLabel: {
    brave: "Le courage",
    curious: "La curiosité",
    kind: "La gentillesse",
    silly: "L'humour",
    creative: "L'imagination",
    energetic: "L'énergie",
    bookworm: "Les livres",
    dreamer: "Le rêve",
    friendly: "L'amitié",
    solver: "La réflexion",
  },
};

const ar: Pack = {
  buddy: {
    space: { name: "بولت" },
    pirate: { name: "بينسو" },
    dinosaur: { name: "تريكسي", fem: true },
    fairy: { name: "شامبي" },
    superhero: { name: "زاب" },
    underwater: { name: "بلوف" },
    jungle: { name: "كيكي" },
    bedtime: { name: "نور", fem: true },
  },
  themes: {
    space: {
      title: "{name} ونور النجوم",
      start: "هذا المساء، [ينظر|تنظر] {name} إلى السماء من النافذة. ما هذا؟ النجوم تنطفئ واحدة تلو الأخرى! هيّا بسرعة لنرى ما يحدث هناك.",
      journey: "[يصعد|تصعد] {name} إلى صاروخ فضّي صغير. ثلاثة، اثنان، واحد… انطلاق! تصير الأرض صغيرة جداً مثل كرة زرقاء.",
      friend: "على كوكب غبار النجوم، صوت يقول بيب بيب: إنه بولت، الروبوت الصغير! «النجوم فقدت نورها. هل [تساعدني|تساعدينني] في البحث عنه؟»",
      problem: "لكنّ مطراً من صخور الفضاء يسدّ الطريق. بولت يومض من الخوف. كيف نمرّ؟",
      celebrate: "خلف آخر صخرة، كانت نجمة صغيرة خجولة تختبئ. [ابتسم|ابتسمت] لها {name}… وفجأة أضاءت السماء كلّها!",
    },
    pirate: {
      title: "{name} وكنز بحر قوس قزح",
      start: "هذا الصباح، [يجد|تجد] {name} زجاجة على الشاطئ. بداخلها خريطة كنز! علامة حمراء كبيرة تلمع وسط بحر قوس قزح.",
      journey: "[يصعد|تصعد] {name} إلى «قنديل البحر»، أجمل سفينة في الميناء. «ارفعوا الأشرعة المنقّطة!» وتبدأ الريح بالغناء.",
      friend: "كليك، كلاك! على ظهر السفينة سلطعون صغير يلوّح بمخالبه: إنه بينسو القرصان! «أعرف طريق الكنز. هل نذهب معاً؟»",
      problem: "فجأة، غيمة رمادية كبيرة تحجب الشمس، والأمواج تصير غاضبة. بينسو يختبئ خلف مخالبه. ماذا نفعل؟",
      celebrate: "على الجزيرة، يُفتح الصندوق أخيراً. لا ذهب بداخله… بل ألوان! تطير الألوان وتلوّن البحر كلّه بقوس قزح.",
    },
    dinosaur: {
      title: "{name} ولغز حجر القمر",
      start: "في بلاد الديناصورات، الجميع قلق: حجر القمر اختفى! [يلبس|تلبس] {name} قبّعة المحقّق [ويُخرج|وتُخرج] العدسة المكبّرة.",
      journey: "[يتبع|تتبع] {name} آثار أقدام غريبة بثلاثة أصابع. تمرّ الآثار قرب البركان الذي يشخر وتحت أوراق السرخس العملاقة.",
      friend: "خلف صخرة، تظهر ديناصورة صغيرة بثلاثة قرون: إنها تريكسي! «أنا أيضاً أبحث عن حجر القمر. هل نحقّق معاً؟»",
      problem: "تتوقّف الآثار عند نهر من الطين. لا أثر بعد الآن! تريكسي تُنزل رأسها. كيف نكمل؟",
      celebrate: "على الضفّة الأخرى، ديناصور رضيع نائم وحجر القمر بين يديه. كان يخاف من الظلام فقط! [يهديه|تهديه] {name} مصباحاً صغيراً، ويضحك الجميع.",
    },
    fairy: {
      title: "{name} والغابة المسحورة",
      start: "في آخر الحديقة، [يكتشف|تكتشف] {name} باباً صغيراً في شجرة. خلفه غابة تتلألأ أوراقها مثل النجوم.",
      journey: "[يمشي|تمشي] {name} على طريق من الطحلب الناعم. الأشجار تهمس مرحباً، واليراعات تضيء الطريق.",
      friend: "قبّعة حمراء منقّطة تقفز بين الأعشاب: إنه شامبي، الفطر الصغير! «النافورة السحرية توقّفت عن الغناء. هل [تأتي|تأتين] معي لنرى؟»",
      problem: "لكنّ أشواكاً متشابكة تغلق طريق النافورة. شامبي يتنهّد. كيف نمرّ دون أن نتأذّى؟",
      celebrate: "كانت النافورة مسدودة بورقة شجر فقط! [يزيلها|تزيلها] {name} بلطف… فيعود الماء إلى الغناء، وترقص الغابة كلّها.",
    },
    superhero: {
      title: "سوبر {name} والغيمة الغاضبة",
      start: "هذا الصباح، [يستيقظ|تستيقظ] {name} بإحساس غريب. المنامة تلمع، ورداء صغير يرفرف خلف الظهر!",
      journey: "[يقفز|تقفز] {name} قفزة صغيرة… [ويطير|وتطير] فوق الأسطح! في الأسفل، تبدو المدينة حزينة اليوم.",
      friend: "على أحد الأسطح، أرنب مقنّع يلوّح بيديه: إنه زاب! «الغيمة الغاضبة تجعل الجميع في مزاج سيّئ. هل نوقفها معاً؟»",
      problem: "الغيمة الغاضبة ضخمة وتنفخ بقوّة. أذنا زاب ترتجفان. ما العمل؟",
      celebrate: "{name} لا [يهاجم|تهاجم] الغيمة، بل [يحكي|تحكي] لها نكتة! تضحك الغيمة كثيراً… وتتحوّل إلى قوس قزح.",
    },
    underwater: {
      title: "{name} والمملكة تحت الأمواج",
      start: "بلوب! [ينزلق|تنزلق] {name} تحت الأمواج… [ويكتشف|وتكتشف] أنّ التنفّس ممكن هنا! في الأسفل يلمع قصر من المرجان.",
      journey: "[يسبح|تسبح] {name} مع سرب من الأسماك المدغدِغة. الأعشاب ترقص، والفقاعات تعزف الموسيقى.",
      friend: "ثماني أذرع تلوّح مرحّبة: إنه بلوف، الأخطبوط الصغير! «المرجان فقد ألوانه. هل [تساعدني|تساعدينني] لنوقظه؟»",
      problem: "لكنّ تيّاراً بارداً قوياً يدفعهما إلى الخلف. بلوف يتمسّك بصخرة. كيف نتقدّم؟",
      celebrate: "في قلب الشعاب، لؤلؤة عملاقة نائمة. [يلمسها|تلمسها] {name} بلطف… فتعود الألوان: وردي وأصفر وأزرق في كل مكان!",
    },
    jungle: {
      title: "{name} ومعبد الشلّال",
      start: "في الحقيبة، [يجد|تجد] {name} خريطة قديمة برائحة الموز. إنها تقود إلى معبد مخفيّ في قلب الأدغال!",
      journey: "[يزيح|تزيح] {name} الأوراق الكبيرة [ويمشي|وتمشي] على جسر من الأغصان. الببغاوات الملوّنة تصيح مرحباً.",
      friend: "هوب! قرد صغير ينزل من غصن: إنه كيكي! «أضعت عائلتي قرب المعبد. هل نبحث عنه معاً؟»",
      problem: "ينقسم الطريق إلى ثلاثة، والخريطة ممزّقة. كيكي يحكّ رأسه. من أين نذهب؟",
      celebrate: "خلف الشلّال يظهر المعبد الذهبي… وعائلة كيكي كلّها تحتفل! عناق وموز للجميع.",
    },
    bedtime: {
      title: "{name} والنجمة النعسانة",
      start: "[يتثاءب|تتثاءب] {name} طويلاً حين يسقط ضوء صغير في الغرفة. إنها نجمة بقبّعة نوم!",
      journey: "[يحمل|تحمل] {name} النجمة بين اليدين [ويصعد|وتصعد] على غيمة ناعمة. تطير الغيمة ببطء فوق الأسطح.",
      friend: "«اسمي نور»، تهمس النجمة. «أضعت طريق بيتي في السماء. هل [تساعدني|تساعدينني]؟»",
      problem: "لكنّ السماء واسعة جداً، وكل النجوم متشابهة. عينا نور تدمعان. أين بيتها؟",
      celebrate: "في الأعلى، مكان فارغ ينتظر بجانب القمر تماماً. تجلس نور فيه وتلمع من السعادة. «شكراً… [تصبح|تصبحين] على خير»، تهمس.",
    },
  },
  idea: {
    brave: "[يأخذ|تأخذ] {name} نفَساً عميقاً. الشجاعة مثل العضلة: كلّما استعملناها كبرت.",
    curious: "[ينظر|تنظر] {name} في كل مكان. «ماذا لو جرّبنا من هنا؟» الفضول يجد الطريق دائماً.",
    kind: "[يضع|تضع] {name} يداً على كتف {buddy}. «لا <تقلق|تقلقي>، أنا هنا.» كلمة لطيفة، ويصير كل شيء أفضل.",
    silly: "[يصنع|تصنع] {name} وجهاً مضحكاً جداً. <يضحك|تضحك> {buddy} بصوت عالٍ، ويطير الخوف بعيداً.",
    creative: "تخطر على بال {name} فكرة عجيبة: صُنع شيء ممّا يوجد حولنا. قليل من الخيال، وهوب!",
    energetic: "{name} [يقفز ويركض|تقفز وتركض] بكل نشاط. مع كل هذه الطاقة، لا شيء مستحيل!",
    bookworm: "[يتذكّر|تتذكّر] {name} قصة من كتاب قبل النوم. «في كتابي، فعلوا هكذا!»",
    dreamer: "[يغمض|تغمض] {name} العينين لحظة [ويتخيّل|وتتخيّل] الحلّ. الأحلام تعطينا أحياناً أفكاراً رائعة.",
    friendly: "«معاً نحن أقوى!» [يقول|تقول] {name}، [ويمدّ|وتمدّ] اليد إلى {buddy}.",
    solver: "{name} [يراقب ويعدّ ويفكّر|تراقب وتعدّ وتفكّر]… «وجدتها!» لكل مشكلة حلّ.",
    default: "«عندي فكرة!» [يقول|تقول] {name} بابتسامة كبيرة.",
  },
  brave: {
    courage: "«يمكن أن نخاف قليلاً ونتقدّم مع ذلك»، [يقول|تقول] {name}. خطوة، ثم خطوة… ونجحنا!",
    kindness: "في الطريق، [يساعد|تساعد] {name} كل من يحتاج إلى المساعدة. والجميع يردّ الجميل.",
    sharing: "[يتقاسم|تتقاسم] {name} الطعام مع {buddy}. ببطن شبعان وقلب خفيف، يصير كل شيء أسهل.",
    curiosity: "[يطرح|تطرح] {name} ألف سؤال [ويجرّب|وتجرّب] ألف طريقة. من يبحث يجد في النهاية!",
    perseverance: "لم تنجح المحاولة الأولى. ولا الثانية. لكنّ {name} [يحاول|تحاول] من جديد… وهذه المرّة تنجح!",
    calm: "[يتنفّس|تتنفّس] {name} بهدوء، كمن ينفخ على ريشة. حين نهدأ، نرى الأمور بوضوح.",
  },
  moral: {
    courage: "الشجاعة ليست ألّا نخاف أبداً، بل أن نتقدّم رغم الخوف.",
    kindness: "لفتة لطيفة قد تغيّر يوماً كاملاً.",
    sharing: "ما نتقاسمه يصير أجمل.",
    curiosity: "كل سؤال هو بداية مغامرة.",
    perseverance: "نحن لا نفشل حقاً: نحن نتعلّم.",
    calm: "نفَس عميق، ويصير كل شيء أبسط.",
  },
  end: "في المساء، [يعود|تعود] {name} إلى البيت بقلب دافئ. <يلوّح|تلوّح> {buddy} للمرّة الأخيرة. وغداً تبدأ مغامرة جديدة… النهاية.",
  endBedtime: "[يعود|تعود] {name} إلى السرير، تحت الغطاء الناعم. في السماء، نور تغمز بعينها. [تصبح|تصبحين] على خير يا {name}.",
  favorite: "وطبعاً، [يأخذ|تأخذ] {name} أغلى شيء في الدنيا: {fav}!",
  more: {
    space: {
      wonder: "يقفز بولت على سطح القمر ليدلّ على الطريق. هنا نرتدّ مثل الترامبولين! [يقفز|تقفز] {name} قفزة عملاقة [ويمسك|وتمسك] ذرّة من غبار النجوم تدغدغ اليد.",
      almost: "اقتربنا! لكنّ آخر نجمة تجلس فوق جبل قمري عالٍ. [يتسلّق|تتسلّق] {name} مع بولت، ينزلقان، يضحكان… ثم يتسلّقان من جديد.",
    },
    pirate: {
      wonder: "الدلافين تقفز حول السفينة وتدور في الهواء. بينسو يرسل لها الفقاعات، و{name} [يتعلّم|تتعلّم] الإمساك بالدفّة مثل قبطان حقيقي.",
      almost: "الجزيرة أمامنا! لكنّ الصندوق مدفون عميقاً. [يحفر|تحفر] {name}، ويحفر بينسو، والرمل يتطاير في كل مكان… طَق! شيء صلب.",
    },
    dinosaur: {
      wonder: "في الطريق، ديناصور طويل العنق يصنع لهما زحليقة برقبته. زيييب! [ينزلق|تنزلق] {name} حتى الأسفل، وتريكسي تكتب كل الأدلّة في دفترها.",
      almost: "آثار جديدة تقود إلى مغارة مظلمة. [يشعل|تشعل] {name} المصباح. في العمق، شيء يلمع بهدوء…",
    },
    fairy: {
      wonder: "شامبي يعرّف بأصدقائه: بومة بنظّارة، وأزهار تضحك، وحلزون مستعجل جداً. [يرقص|ترقص] {name} مع اليراعات، والغابة كلّها تصفّق بأوراقها.",
      almost: "أخيراً، النافورة! لكنّها صامتة وحزينة. [يقترب|تقترب] {name} على أطراف الأصابع [وينظر|وتنظر] جيداً في القاع…",
    },
    superhero: {
      wonder: "زاب يُري أفضل حركاته: يركض على الجدران ويقفز من سطح إلى سطح. [يجرّب|تجرّب] {name} أيضاً… [ويكتشف|وتكتشف] أنّ الرداء يدور في الهواء وحده!",
      almost: "ها هما وجهاً لوجه مع الغيمة الغاضبة. إنها ترعد وتعبس وترفع صوتها. [يطير|تطير] {name} قريباً منها، بثبات وسط الريح.",
    },
    underwater: {
      wonder: "بلوف يأخذ {name} في جولة داخل قصر المرجان. في قاعة الرقص، أحصنة البحر تدور في حلقة. [يدور|تدور] {name} معها [ويصنع|وتصنع] فقاعات على شكل قلوب.",
      almost: "في آخر نفق من الأعشاب، ضوء يومض بضعف. [يسبح|تسبح] {name} بهدوء شديد حتى لا تخاف الأسماك الصغيرة النائمة.",
    },
    jungle: {
      wonder: "كيكي يعلّم {name} التأرجح من غصن إلى غصن. ياهوو! في الأسفل، طائر الطوقان يعدّ النقاط والفراشات تتسابق.",
      almost: "أخيراً نسمع صوت الشلّال! لكن يجب عبور النهر فوق حجارة زلقة. خطوة… خطوتان… [يمدّ|تمدّ] {name} اليد إلى كيكي.",
    },
    bedtime: {
      wonder: "في الطريق، خراف من الغيم تقفز فوق القمر. [يعدّها|تعدّها] {name} بهدوء: واحد… اثنان… ثلاثة… نور تتثاءب وتلتصق بالخدّ.",
      almost: "ها هي الدبّ الأكبر، التي تعرف كل بيوت السماء. تشير بطرف يدها إلى مكان هناك، حيث الظلام أكثر قليلاً.",
    },
  },
  fx: {
    space: { go: "هوووش!", win: "بوف!", hi: "بيب بيب!" },
    pirate: { go: "هيّا بنا!", win: "هورّا!", hi: "كليك كلاك!" },
    dinosaur: { go: "طَق طَق طَق", win: "هاهاها!", hi: "وجدتُ دليلاً!" },
    fairy: { go: "هسسس…", win: "غلو غلو!", hi: "مرحباً…" },
    superhero: { go: "زووووم!", win: "هاهاها!", hi: "زاب!" },
    underwater: { go: "بلوب!", win: "واااو!", hi: "بلوب بلوب!" },
    jungle: { go: "كريك كراك", win: "ياهوو!", hi: "هي هي هي!" },
    bedtime: { go: "فوووه…", win: "تصبحون على خير", hi: "هسس…" },
  },
  question: "ما الذي سيساعد {name}؟",
  traitLabel: {
    brave: "الشجاعة",
    curious: "الفضول",
    kind: "اللطف",
    silly: "المرح",
    creative: "الإبداع",
    energetic: "النشاط",
    bookworm: "الكتب",
    dreamer: "الخيال",
    friendly: "الصداقة",
    solver: "التفكير",
  },
};

const packs = { fr, ar };

export function buildLocalStory(req: StoryRequest): Story {
  const pack = packs[req.lang];
  const script = pack.themes[req.themeId] ?? pack.themes.space;
  const buddy = pack.buddy[req.themeId] ?? pack.buddy.space;
  const heroFem = req.gender === "girl";

  const fill = (text: string) =>
    text
      .replace(/\[([^|\]]*)\|([^\]]*)\]/g, (_, m: string, f: string) => (heroFem ? f : m))
      .replace(/<([^|>]*)\|([^>]*)>/g, (_, m: string, f: string) => (buddy.fem ? f : m))
      .split("{name}")
      .join(req.name)
      .split("{buddy}")
      .join(buddy.name);

  const fav = req.favorite.trim();
  const filled = (text: string) => fill(text).split("{fav}").join(fav);

  // The child listening chooses which quality saves the day.
  const picks = [...req.traits.filter((t) => pack.idea[t]), "brave", "curious", "kind"]
    .filter((t, i, list) => list.indexOf(t) === i)
    .slice(0, 2);
  const value = pack.brave[req.value] ? req.value : "courage";

  const more = pack.more[req.themeId] ?? pack.more.space;
  const fx = pack.fx[req.themeId] ?? pack.fx.space;
  const themeId = pack.themes[req.themeId] ? req.themeId : "space";

  const pages: [Beat, string][] = [
    ["start", script.start],
    ["journey", fav ? `${script.journey} ${pack.favorite}` : script.journey],
    ["friend", script.friend],
    ["wonder", more.wonder],
    ["problem", script.problem],
    ["idea", pack.idea[picks[0]]],
    ["brave", pack.brave[value]],
    ["almost", more.almost],
    ["celebrate", script.celebrate],
    ["end", req.themeId === "bedtime" ? pack.endBedtime : pack.end],
  ];
  const words: Partial<Record<Beat, { sfx?: string; says?: string }>> = {
    journey: { sfx: fx.go },
    friend: { says: fx.hi },
    celebrate: { sfx: fx.win },
  };

  return {
    title: fill(script.title),
    pages: pages.map(([beat, text]) => ({ beat, text: filled(text), scene: authoredDirection(themeId, beat, words[beat]) })),
    moral: fill(pack.moral[value]),
    choice: {
      question: fill(pack.question),
      options: picks.map((t) => ({ label: pack.traitLabel[t], text: filled(pack.idea[t]) })),
    },
    source: "offline",
  };
}
