export type AssessmentType = "disc" | "spiritual_gifts";

export type DiscKey = "D" | "I" | "S" | "C";

export type DiscQuestion = {
  words: string[];
  keys: DiscKey[];
};

export type SpiritualGiftKey =
  | "administration"
  | "discernment"
  | "encouragement"
  | "evangelism"
  | "faith"
  | "giving"
  | "healing"
  | "hospitality"
  | "knowledge"
  | "leadership"
  | "mercy"
  | "prophecy"
  | "shepherding"
  | "serving"
  | "teaching"
  | "wisdom";

export type SpiritualGiftQuestion = {
  prompt: string;
  gift: SpiritualGiftKey;
};

export type SpiritualGift = {
  key: SpiritualGiftKey;
  label: string;
  statements: string[];
  roles: string[];
};

export const discNames: Record<DiscKey, string> = {
  D: "Dominance",
  I: "Influence",
  S: "Steadiness",
  C: "Compliance",
};

export const spiritualGiftNames: Record<SpiritualGiftKey, string> = {
  administration: "Administration",
  discernment: "Discernment",
  encouragement: "Encouragement",
  evangelism: "Evangelism",
  faith: "Faith",
  giving: "Giving",
  healing: "Healing",
  hospitality: "Hospitality",
  knowledge: "Knowledge",
  leadership: "Leadership",
  mercy: "Mercy / Compassion",
  prophecy: "Prophecy",
  shepherding: "Shepherding / Pastoring",
  serving: "Serving / Helps",
  teaching: "Teaching",
  wisdom: "Wisdom",
};

export const discQuestions: DiscQuestion[] = [
  { words: ["Restrained", "Forceful", "Careful", "Expressive"], keys: ["S", "D", "C", "I"] },
  { words: ["Pioneering", "Correct", "Exciting", "Satisfied"], keys: ["D", "C", "I", "S"] },
  { words: ["Willing", "Animated", "Bold", "Precise"], keys: ["S", "I", "D", "C"] },
  { words: ["Argumentative", "Doubting", "Indecisive", "Unpredictable"], keys: ["D", "C", "S", "I"] },
  { words: ["Respectful", "Out-going", "Patient", "Daring"], keys: ["C", "I", "S", "D"] },
  { words: ["Persuasive", "Self-reliant", "Logical", "Gentle"], keys: ["I", "D", "C", "S"] },
  { words: ["Cautious", "Even-tempered", "Decisive", "Life-of-the-party"], keys: ["C", "S", "D", "I"] },
  { words: ["Popular", "Assertive", "Perfectionist", "Generous"], keys: ["I", "D", "C", "S"] },
  { words: ["Colorful", "Modest", "Easy-going", "Unyielding"], keys: ["I", "C", "S", "D"] },
  { words: ["Systematic", "Optimistic", "Persistent", "Accommodating"], keys: ["C", "I", "D", "S"] },
  { words: ["Relentless", "Humble", "Neighborly", "Talkative"], keys: ["D", "C", "S", "I"] },
  { words: ["Friendly", "Observant", "Playful", "Strong-willed"], keys: ["S", "C", "I", "D"] },
  { words: ["Charming", "Adventurous", "Disciplined", "Deliberate"], keys: ["I", "D", "C", "S"] },
  { words: ["Restrained", "Steady", "Aggressive", "Attractive"], keys: ["C", "S", "D", "I"] },
  { words: ["Enthusiastic", "Analytical", "Sympathetic", "Determined"], keys: ["I", "C", "S", "D"] },
  { words: ["Commanding", "Impulsive", "Slow-paced", "Critical"], keys: ["D", "I", "S", "C"] },
  { words: ["Consistent", "Force-of-character", "Lively", "Laid-back"], keys: ["C", "D", "I", "S"] },
  { words: ["Influential", "Kind", "Independent", "Orderly"], keys: ["I", "S", "D", "C"] },
  { words: ["Idealistic", "Popular", "Pleasant", "Out-spoken"], keys: ["C", "I", "S", "D"] },
  { words: ["Impatient", "Serious", "Procrastinator", "Emotional"], keys: ["D", "C", "S", "I"] },
  { words: ["Competitive", "Spontaneous", "Loyal", "Thoughtful"], keys: ["D", "I", "S", "C"] },
  { words: ["Self-sacrificing", "Considerate", "Convincing", "Courageous"], keys: ["C", "S", "I", "D"] },
  { words: ["Dependent", "Flighty", "Stoic", "Pushy"], keys: ["S", "I", "C", "D"] },
  { words: ["Tolerant", "Conventional", "Stimulating", "Directing"], keys: ["S", "C", "I", "D"] },
];

export const spiritualGifts: SpiritualGift[] = [
  {
    key: "leadership",
    label: "Leadership",
    statements: [
      "I enjoy leading and influencing others toward a goal.",
      "People often look to me for direction.",
      "I like bringing order and vision to teams or projects.",
    ],
    roles: [
      "Team Leader",
      "Home Group / Connect Group Leader",
      "Ministry Area Coordinator",
      "Event or Project Lead",
    ],
  },
  {
    key: "encouragement",
    label: "Encouragement / Exhortation",
    statements: [
      "I love motivating others to keep going or step into more.",
      "I often notice when someone needs a word of hope.",
      "I enjoy being a source of positivity and strength.",
    ],
    roles: [
      "Prayer Team",
      "Care Team",
      "First Impressions Team",
      "Discipleship Leader",
      "Home Group / Connect Group Leader or Host",
    ],
  },
  {
    key: "administration",
    label: "Administration",
    statements: [
      "I'm good at organizing, planning, and managing details.",
      "I find joy in keeping things running smoothly.",
      "Others trust me with logistics and follow-through.",
    ],
    roles: [
      "Service Coordinator",
      "Admin Support",
      "Ministry Coordinator",
      "Online Service Moderator",
      "Communications Team",
      "Events Team",
      "Programming Team",
    ],
  },
  {
    key: "evangelism",
    label: "Evangelism",
    statements: [
      "I'm passionate about sharing the Gospel with others.",
      "I look for opportunities to talk about Jesus.",
      'I feel most alive when someone says "yes" to Christ.',
    ],
    roles: [
      "Outreach Team",
      "First Impressions Team",
      "Prayer Team",
      "Care Team",
      "Discipleship Leader",
      "Kids/Youth Team",
      "Home Group / Connect Group Leader",
    ],
  },
  {
    key: "teaching",
    label: "Teaching",
    statements: [
      "I enjoy helping people understand truth clearly.",
      "I'm passionate about digging into Scripture.",
      "People say I make complex ideas easier to grasp.",
    ],
    roles: [
      "Home Group / Connect Group Leader",
      "Kids/Youth Teacher",
      "Discipleship Leader",
      "Connect Class Leader",
      "Service Host or Speaker",
    ],
  },
  {
    key: "faith",
    label: "Faith",
    statements: [
      "I believe God for big things, even when others are unsure.",
      "I tend to trust God deeply in uncertain situations.",
      "People often say my faith encourages their own.",
    ],
    roles: [
      "Prayer Ministry",
      "Care Team",
      "Kids/Youth Team",
      "Discipleship Leader",
      "Home Group / Connect Group Leader",
    ],
  },
  {
    key: "shepherding",
    label: "Shepherding / Pastoring",
    statements: [
      "I naturally care for people's spiritual growth.",
      "I enjoy walking with people over the long haul.",
      "I feel responsible for helping others mature in Christ.",
    ],
    roles: [
      "Home Group / Connect Group Leader",
      "Kids/Youth Teacher",
      "Prayer Team",
      "Care Team",
      "Discipleship Leader",
    ],
  },
  {
    key: "discernment",
    label: "Discernment",
    statements: [
      'I can sense when something is spiritually "off" or not from God.',
      "I have a strong awareness of truth vs deception.",
      "I can often discern people's motives or spiritual dynamics.",
    ],
    roles: [
      "Prayer Team",
      "Care Team",
      "Discipleship Leader",
      "Connect Class Leader",
      "Home Group / Connect Group Leader",
    ],
  },
  {
    key: "giving",
    label: "Giving",
    statements: [
      "I'm quick to give time, money, or resources when needed.",
      "I see giving as a form of worship and joy.",
      "I'm drawn to support causes or people with generosity.",
    ],
    roles: [
      "Stewardship Team",
      "Missions Support",
      "Benevolence / Outreach Contributor",
      "Facilities / Resource / Project Funders",
    ],
  },
  {
    key: "wisdom",
    label: "Wisdom",
    statements: [
      "I tend to see what's best or most godly in complicated situations.",
      "Others come to me for guidance or godly insight.",
      "I often think in terms of long-term spiritual outcomes.",
    ],
    roles: [
      "Prayer Team",
      "Preaching / Teaching",
      "Discipleship Leader",
      "Home Group / Connect Group Leader",
      "Communications Team",
    ],
  },
  {
    key: "mercy",
    label: "Mercy / Compassion",
    statements: [
      "I feel deeply for people who are hurting.",
      "I'm drawn to those others might overlook or ignore.",
      "I'm quick to show grace, comfort, or practical help.",
    ],
    roles: [
      "Care Team",
      "Prayer Team",
      "Outreach Ministry",
      "Kids/Youth Team",
      "Discipleship Leader",
    ],
  },
  {
    key: "knowledge",
    label: "Knowledge",
    statements: [
      "I love studying Scripture and theology deeply.",
      "I enjoy uncovering biblical truths and making connections.",
      "I retain biblical or spiritual knowledge easily.",
    ],
    roles: [
      "Kids/Youth Team",
      "Discipleship Leader",
      "Home Group Leader",
      "Programming Team",
    ],
  },
  {
    key: "serving",
    label: "Serving / Helps",
    statements: [
      "I love meeting practical needs and staying behind the scenes.",
      "I enjoy doing tasks that support others.",
      "I'm often the first to volunteer without being asked.",
    ],
    roles: [
      "Set-up / Tear-down Team",
      "First Impressions Team",
      "Kids/Youth Team",
      "Facilities / Maintenance",
      "Support Roles for Events or Teams",
    ],
  },
  {
    key: "healing",
    label: "Healing",
    statements: [
      "I believe God still heals today and I pray for it expectantly.",
      "I've seen healing happen through prayer in my life or others'.",
      "I feel called to pray for physical, emotional, or spiritual healing.",
    ],
    roles: ["Prayer Team", "Care Team"],
  },
  {
    key: "hospitality",
    label: "Hospitality",
    statements: [
      "I love creating welcoming spaces for others.",
      "I enjoy hosting and helping people feel at home.",
      "People feel safe and valued when they're around me.",
    ],
    roles: [
      "Hospitality",
      "First Impressions Team",
      "Connect Team",
      "Host for Home Groups",
    ],
  },
  {
    key: "prophecy",
    label: "Prophecy",
    statements: [
      "I feel burdened to speak truth, even when it's uncomfortable.",
      "I often sense that God is speaking through me or to me.",
      "I have a strong desire to call people to repentance or obedience.",
    ],
    roles: [
      "Prayer Team",
      "Care Team",
      "Preaching / Teaching",
      "Discipleship Leader",
    ],
  },
];

export const spiritualGiftQuestions: SpiritualGiftQuestion[] =
  spiritualGifts.flatMap((gift) =>
    gift.statements.map((prompt) => ({
      prompt,
      gift: gift.key,
    })),
  );
