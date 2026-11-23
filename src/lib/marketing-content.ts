export interface DemoCitation {
  label: string;
  domain: string;
  href: string;
}

export interface DemoBiomarker {
  name: string;
  value: string;
  range: string;
  status: "Normal" | "Attention" | "Critical";
}

export interface DemoVaultProfile {
  id: "self" | "maya" | "david";
  label: string;
  relation: string;
  patientName: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  documentTitle: string;
  category: string;
  date: string;
  fileSize: string;
  facility: string;
  flagLevel: "Normal" | "Attention";
  flagLabel: string;
  overview: string;
  biomarkers: DemoBiomarker[];
  questions: string[];
  citations: DemoCitation[];
  shareTokenPreview: string;
  shareExpiryLabel: string;
}

export const DEMO_VAULT_PROFILES: [DemoVaultProfile, ...DemoVaultProfile[]] = [
  {
    id: "self",
    label: "Self",
    relation: "Primary Account",
    patientName: "Elena Vance",
    badgeBg: "#ECFDF5",
    badgeBorder: "#A7F3D0",
    badgeText: "#065F46",
    documentTitle: "Comprehensive Metabolic Panel",
    category: "Lab Report",
    date: "Oct 14, 2026",
    fileSize: "1.4 MB PDF",
    facility: "Riverside Diagnostics Lab",
    flagLevel: "Attention",
    flagLabel: "Attention · 6.1% HbA1c",
    overview:
      "Hemoglobin A1c is 6.1% (borderline elevated). Kidney filtration, sodium, potassium, and liver enzymes sit comfortably inside standard reference limits.",
    biomarkers: [
      { name: "Hemoglobin A1c", value: "6.1%", range: "4.0 – 5.6%", status: "Attention" },
      { name: "Fasting Glucose", value: "104 mg/dL", range: "70 – 99 mg/dL", status: "Attention" },
      { name: "eGFR (Kidney)", value: "96 mL/min", range: "> 60 mL/min", status: "Normal" },
      { name: "ALT (Liver)", value: "21 U/L", range: "7 – 56 U/L", status: "Normal" },
    ],
    questions: [
      "Should we repeat a fasting glucose and HbA1c panel in three months?",
      "Which nutrition or movement changes help bring HbA1c below 5.7%?",
      "Do any current prescriptions influence my fasting blood glucose?",
    ],
    citations: [
      { label: "WHO HbA1c Guidance", domain: "who.int", href: "https://www.who.int" },
      { label: "NHS Blood Sugar Reference", domain: "nhs.uk", href: "https://www.nhs.uk" },
    ],
    shareTokenPreview: "medbay.health/share/rv84-cmp-24h",
    shareExpiryLabel: "Expires in 23h 58m",
  },
  {
    id: "maya",
    label: "Maya (Child)",
    relation: "Dependent · Age 7",
    patientName: "Maya Vance",
    badgeBg: "#FFFBEB",
    badgeBorder: "#FDE68A",
    badgeText: "#92400E",
    documentTitle: "Pediatric Allergy & Asthma Plan",
    category: "Clinical Note",
    date: "Sep 28, 2026",
    fileSize: "840 KB PDF",
    facility: "St. Jude Children's Clinic",
    flagLevel: "Normal",
    flagLabel: "Routine · Updated Plan",
    overview:
      "Seasonal dust mite sensitivity confirmed with mild intermittent wheezing. Daily controller inhaler is not required; rescue albuterol spacer dosage is updated for Maya's current weight.",
    biomarkers: [
      { name: "Peak Expiratory Flow", value: "215 L/min", range: "195 – 240 L/min", status: "Normal" },
      { name: "SpO2 Resting", value: "99%", range: "95 – 100%", status: "Normal" },
      { name: "Weight Based Dose", value: "2 puffs", range: "Every 4–6h PRN", status: "Normal" },
    ],
    questions: [
      "Should we send an expiring copy of this action plan to Maya's school nurse?",
      "When should we schedule her spring spirometry checkup?",
      "Are HEPA filters recommended alongside her bedtime routine?",
    ],
    citations: [
      { label: "CDC Pediatric Asthma", domain: "cdc.gov", href: "https://www.cdc.gov" },
      { label: "NHS Childhood Asthma", domain: "nhs.uk", href: "https://www.nhs.uk" },
    ],
    shareTokenPreview: "medbay.health/share/mv07-asthma-7d",
    shareExpiryLabel: "Expires in 6d 23h",
  },
  {
    id: "david",
    label: "David (Parent)",
    relation: "Dependent · Father",
    patientName: "David Vance",
    badgeBg: "#EFF6FF",
    badgeBorder: "#BFDBFE",
    badgeText: "#1D4ED8",
    documentTitle: "Cardiology Lipid & Echo Follow Up",
    category: "Radiology & Lab",
    date: "Nov 04, 2026",
    fileSize: "3.2 MB PDF",
    facility: "Mercy Heart Institute",
    flagLevel: "Attention",
    flagLabel: "Attention · LDL 138 mg/dL",
    overview:
      "Left ventricular ejection fraction is preserved at 62% with normal valve motion. LDL cholesterol is modestly above the 100 mg/dL preventive target.",
    biomarkers: [
      { name: "Ejection Fraction", value: "62%", range: "55 – 70%", status: "Normal" },
      { name: "LDL Cholesterol", value: "138 mg/dL", range: "< 100 mg/dL", status: "Attention" },
      { name: "HDL Cholesterol", value: "54 mg/dL", range: "> 40 mg/dL", status: "Normal" },
      { name: "Resting BP", value: "124 / 78", range: "< 130 / 80", status: "Normal" },
    ],
    questions: [
      "Does David's current statin dose need adjustment based on his 138 mg/dL LDL?",
      "How soon should we book his six month cardiology follow up on Google Calendar?",
      "Are there any interactions with his morning blood pressure medication?",
    ],
    citations: [
      { label: "NIH Lipid Guidelines", domain: "nih.gov", href: "https://www.nih.gov" },
      { label: "Mayo Clinic Cholesterol", domain: "mayoclinic.org", href: "https://www.mayoclinic.org" },
    ],
    shareTokenPreview: "medbay.health/share/dv71-echo-24h",
    shareExpiryLabel: "Expires in 23h 59m",
  },
];

export type BlogCategory =
  | "Clinical Literacy"
  | "Family Care"
  | "Privacy & Security"
  | "Product Guide";

export interface BlogArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  coverTone: "emerald" | "slate" | "stone" | "deep";
  coverVisual: "metabolic-panel" | "family-isolation" | "expiring-share" | "rag-citations";
  keyTakeaways: string[];
  sections: BlogArticleSection[];
}

export const BLOG_ARTICLES: [BlogArticle, ...BlogArticle[]] = [
  {
    slug: "how-to-read-your-blood-panel-without-panic",
    title: "How to read a metabolic blood panel before your follow up visit",
    excerpt:
      "Reference ranges, high flags, and unfamiliar abbreviations turn routine lab PDFs into anxious late night searches. Here is a calm framework to read what matters first.",
    category: "Clinical Literacy",
    publishedAt: "November 12, 2026",
    readTime: "6 min read",
    author: {
      name: "Dr. Amara Okafor",
      role: "Clinical Communication Advisor",
    },
    coverTone: "emerald",
    coverVisual: "metabolic-panel",
    keyTakeaways: [
      "A single flagged number rarely tells a complete story without your prior baseline and clinical context.",
      "Group biomarkers into functional systems: glucose regulation, kidney filtration, electrolytes, and liver enzymes.",
      "Bring three concrete, written questions to your appointment rather than trying to memorize medical jargon.",
    ],
    sections: [
      {
        heading: "Why raw lab PDFs feel overwhelming",
        paragraphs: [
          "Most pathology laboratories generate PDF reports designed for clinicians scanning dozens of charts an hour. Abbreviations such as eGFR, AST, BUN, and HbA1c appear in dense monochrome tables with minimal explanation of what a mild elevation actually implies.",
          "When patients open a portal notification at nine in the evening and see an amber or bold H beside a biomarker, the natural instinct is to search fragmented forum threads. Structured plain English summaries grounded in WHO, NHS, and CDC references replace guesswork with grounded preparation.",
        ],
      },
      {
        heading: "Read your report in four calm layers",
        paragraphs: [
          "Instead of scanning row by row from top to bottom, group a Comprehensive Metabolic Panel into four clinical questions that your physician considers together:",
        ],
        bullets: [
          "Blood sugar trends: Fasting glucose captures one morning snapshot, while HbA1c reflects your average over the past two to three months.",
          "Kidney health: Creatinine and eGFR work together to show how efficiently your kidneys filter waste.",
          "Fluid and electrolyte balance: Sodium, potassium, chloride, and carbon dioxide reflect hydration and cellular stability.",
          "Liver enzymes and proteins: ALT, AST, alkaline phosphatase, and albumin indicate liver cell health and nutritional balance.",
        ],
      },
      {
        heading: "Turn findings into a focused doctor conversation",
        paragraphs: [
          "The most productive fifteen minute follow up begins before you walk into the exam room. Highlight any borderline marker, check whether the lab used a different reference range than last year, and note whether you were fasting or recovering from a cold.",
          "Inside MedBay, every uploaded blood panel automatically generates three tailored questions for your physician alongside direct links to verified clinical references so you arrive prepared rather than anxious.",
        ],
      },
    ],
  },
  {
    slug: "organizing-medical-records-for-three-generations",
    title: "Keeping medical records clear across children, parents, and yourself",
    excerpt:
      "Caregivers often juggle pediatric vaccine cards, personal prescriptions, and aging parents' hospital discharges across five portals and three email threads.",
    category: "Family Care",
    publishedAt: "November 03, 2026",
    readTime: "5 min read",
    author: {
      name: "Hannah Lindqvist",
      role: "Product & Caregiver Research Lead",
    },
    coverTone: "stone",
    coverVisual: "family-isolation",
    keyTakeaways: [
      "Children and aging parents should never need separate accounts or passwords just to keep their records accessible in an emergency.",
      "Color coded family profile isolation prevents dangerous dosage or lab mix ups between household members.",
      "A chronological timeline connects uploads, clinic notices, and scheduled follow ups in one calm stream.",
    ],
    sections: [
      {
        heading: "The hidden tax of sandwich generation caregiving",
        paragraphs: [
          "If you care for both a school age child and an aging parent, your phone camera roll probably holds photos of handwritten prescriptions, immunization booklets, and ER discharge instructions mixed in with weekend snapshots.",
          "During an urgent care visit or pharmacy refill, hunting through four clinic portals and two Gmail accounts wastes precious minutes and increases the risk of sharing an outdated dosage list.",
        ],
      },
      {
        heading: "Why strict profile boundaries matter clinically",
        paragraphs: [
          "Putting every household document in one flat cloud drive folder solves storage but creates a dangerous clinical hazard: mixing up who owns which prescription or allergy note.",
          "MedBay solves this with managed dependent profiles under a single encrypted account. Every record is anchored to one family member with automatic patient name detection, distinct visual profile pills, and database level isolation so your child's records never bleed into your parent's AI context.",
        ],
      },
      {
        heading: "Zero extra logins for kids or older relatives",
        paragraphs: [
          "Dependent profiles require zero passwords, email invitations, or extra devices. You maintain custody of up to five managed profiles from your own pocket vault and can switch between them in a single thumb tap.",
        ],
      },
    ],
  },
  {
    slug: "why-expiring-share-links-beat-emailing-medical-pdfs",
    title: "Why expiring doctor share links beat forwarding medical PDFs",
    excerpt:
      "Emailing raw lab reports leaves sensitive health files sitting permanently in third party inboxes. Time limited zero login links give visiting specialists instant clarity without losing control.",
    category: "Privacy & Security",
    publishedAt: "October 22, 2026",
    readTime: "4 min read",
    author: {
      name: "Marcus Chen",
      role: "Security & Privacy Architect",
    },
    coverTone: "deep",
    coverVisual: "expiring-share",
    keyTakeaways: [
      "Standard email attachments are unencrypted at rest in recipient inboxes and cannot be revoked once sent.",
      "Time boxed 24h, 7d, or 30d share links give doctors immediate access to the raw original document with zero recipient sign up.",
      "True share isolation exposes only the single selected file—never your private AI chat history or other family members.",
    ],
    sections: [
      {
        heading: "The problem with clinic fax numbers and email attachments",
        paragraphs: [
          "When you visit a specialist for a second opinion, the front desk often asks you to email your prior scans or lab reports to a shared reception inbox. Once sent, you have no visibility into who downloads the attachment or how many years it remains archived on an external mail server.",
          "Conversely, locking records behind clunky portal invitations with six digit PINs slows down busy physicians during a ten minute consultation.",
        ],
      },
      {
        heading: "Zero friction for physicians, total custody for families",
        paragraphs: [
          "MedBay's one click expiring share links balance emergency usability with strict zero trust security. Choose a 24 hour, 7 day, or 30 day window and hand the doctor a clean link or QR code.",
        ],
        bullets: [
          "Raw document isolation: The public share page strips away all AI summaries, personal doctor questions, and family profile metadata.",
          "Short lived signed streams: Files stream directly from private AES 256 encrypted storage without exposing permanent bucket URLs.",
          "Instant revocation: The moment your consultation finishes, revoke the link in one tap so any future request returns a neutral expired screen.",
        ],
      },
    ],
  },
  {
    slug: "what-profile-isolated-ai-means-for-family-privacy",
    title: "What profile isolated clinical AI actually means for your family",
    excerpt:
      "Most generic chatbots blend every uploaded document into one unstructured thread. Learn how database row level security and verified medical grounding protect accuracy.",
    category: "Product Guide",
    publishedAt: "October 09, 2026",
    readTime: "5 min read",
    author: {
      name: "Claire Beaumont",
      role: "AI Systems Engineer",
    },
    coverTone: "slate",
    coverVisual: "rag-citations",
    keyTakeaways: [
      "MedBay enforces profile isolation inside the PostgreSQL vector retrieval query itself, not just in a fragile prompt instruction.",
      "Every clinical explanation distinguishes between facts from your private vault and verified external guidelines like WHO, NHS, and CDC.",
      "Google Calendar booking turns clinical follow up reminders into real calendar events directly from chat.",
    ],
    sections: [
      {
        heading: "Why prompt only isolation is not enough",
        paragraphs: [
          "When families upload medical records for three or four people into a general purpose AI chat, asking 'What was the last dosage?' can easily pull a snippet from the wrong person's prescription.",
          "MedBay treats family boundary enforcement as a database guarantee. Every document chunk is tagged with both your user identifier and the specific family profile identifier, enforced at the PostgreSQL Row Level Security and RPC retrieval layer.",
        ],
      },
      {
        heading: "Honest source attribution in every answer",
        paragraphs: [
          "Medical clarity depends on knowing where every sentence comes from. MedBay visually separates emerald Vault Citations pointing back to your exact uploaded document from slate blue Authority Citations linking to WHO, NHS, CDC, NIH, MedlinePlus, or Mayo Clinic.",
          "MedBay AI never diagnoses conditions or replaces your clinician; instead, it organizes facts so you and your doctor spend your visit making informed decisions.",
        ],
      },
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do my children or aging parents need their own logins to use MedBay?",
    answer:
      "No. You manage up to five dependent family profiles directly inside your single encrypted MedBay account. Each member gets a distinct color coded profile boundary with zero separate passwords or email invitations.",
  },
  {
    question: "How does MedBay keep one family member's records out of another's AI chat?",
    answer:
      "Profile isolation is enforced at the database layer using PostgreSQL Row Level Security and scoped vector retrieval. When you chat under Maya's profile, MedBay retrieves exclusively Maya's document chunks and never mixes in records belonging to you or another relative.",
  },
  {
    question: "Is MedBay AI giving medical advice or diagnoses?",
    answer:
      "No. MedBay translates complex clinical terminology into plain English, highlights out of range biomarkers, suggests questions for your clinician, and cites verified authorities such as WHO, NHS, and CDC. It is strictly informational and never replaces professional medical care.",
  },
  {
    question: "What does a doctor see when I send a one click expiring share link?",
    answer:
      "Your physician sees only the clean original medical document you selected along with its expiration countdown and download button. They never need a MedBay account or PIN, and they never see your AI chat history, personal notes, or any other family profile.",
  },
  {
    question: "How does the 24 hour Gmail medical scanner work?",
    answer:
      "If you connect Google Workspace with read only Gmail permission, MedBay checks once every 24 hours for new lab notices, prescriptions, and clinic updates. Findings surface as calm in app notifications or Web Push alerts so you can import important attachments into your vault in one tap.",
  },
  {
    question: "Can MedBay schedule my doctor follow up appointments automatically?",
    answer:
      "Yes. With your explicit Google Calendar permission, you can ask MedBay AI inside chat to book a follow up reminder or clinic appointment and review the structured confirmation card immediately.",
  },
  {
    question: "Which medical document formats and file sizes are supported?",
    answer:
      "MedBay supports multi page PDFs, scanned images (JPEG, PNG, WebP), Word documents (DOCX), and plain text records up to 25 MB per file, with built in OCR for photographed prescriptions and paper lab sheets.",
  },
  {
    question: "How are my files and Google tokens encrypted and stored?",
    answer:
      "Uploaded files reside in private AES 256 encrypted storage buckets accessed solely through short lived signed URLs. Connected Google OAuth refresh tokens are encrypted using AES 256 GCM before storage and are never exposed to the browser.",
  },
];

export const ARCHITECTURE_PILLARS = [
  {
    label: "AES 256 Encrypted Private Storage",
    detail: "Every PDF, scan, and clinical photo lives in a private vault bucket streamed only via short lived signed URLs.",
  },
  {
    label: "PostgreSQL Row Level Isolation",
    detail: "Each family member's documents, summaries, and RAG embeddings are isolated at the database policy level.",
  },
  {
    label: "Zero Leak Doctor Share Links",
    detail: "Expiring 24h, 7d, or 30d links reveal only the raw original file and return a neutral gone screen once revoked.",
  },
  {
    label: "Verified Clinical Grounding",
    detail: "Every external reference cites trusted medical authorities including WHO, NHS, CDC, NIH, and Mayo Clinic.",
  },
] as const;

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}
