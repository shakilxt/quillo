// Every word on the page and every product fact lives here. The sections render from this file
// and the chat assistant's system prompt is built from it, so the two can never disagree.
//
// Quillo, its customers and every company and person below are made up (PLAN.md §0.5).
// No email addresses, phone numbers, links or social handles anywhere (PLAN.md §0.6);
// tests/product.test.ts checks this.

import { MAX_QUESTION_LENGTH } from "@/lib/chat/limits";
import { invoiceTotals, type LineItem } from "@/lib/money";
import { formatCardFee, formatPrice, YEARLY_DISCOUNT_PERCENT, type CardFee } from "@/lib/pricing";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** In-page anchor. The site is one page, so nothing links anywhere else. */
export type Anchor = `#${string}`;

/** Icon keys, mapped to lucide-react icons in the components so this file stays plain data. */
export type IconName =
  "invoice" | "card" | "bell" | "repeat" | "globe" | "chart" | "user-plus" | "send" | "badge-check";

export type InvoiceStatus = "paid" | "due-soon" | "overdue" | "draft";

export type PlanId = "starter" | "pro" | "team";

export type AvatarTone = "mint" | "amber" | "primary-soft";

export interface NavLink {
  label: string;
  href: Anchor;
}

export interface Feature {
  icon: IconName;
  title: string;
  body: string;
}

export interface DeepDive {
  eyebrow: string;
  title: string;
  body: string;
  bullets: readonly [string, string, string];
  mockup: "invoice-editor" | "payment-link" | "cashflow";
  /** Describes the mockup for screen readers. */
  mockupLabel: string;
}

export interface Step {
  icon: IconName;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  tone: AvatarTone;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** List price per month in cents. Yearly prices come from `planPrice` in lib/pricing.ts. */
  monthlyCents: number;
  features: readonly string[];
  cta: string;
  highlighted: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Invoice {
  number: string;
  client: string;
  amountCents: number;
  status: InvoiceStatus;
  due: string;
}

export interface FooterColumn {
  title: string;
  /** Items without `href` are plain text: the footer has no external links. */
  items: readonly { label: string; href?: Anchor }[];
}

/* ------------------------------------------------------------------ */
/* Shared facts (used in several places, so defined once)              */
/* ------------------------------------------------------------------ */

export const STARTER_CLIENT_LIMIT = 3;
export const TEAM_SEATS = 5;
export const CARD_FEE: CardFee = { percent: 2.9, fixedCents: 30 };
const cardFee = formatCardFee(CARD_FEE);

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "NZD",
  "CHF",
  "SEK",
  "SGD",
  "JPY",
] as const;

/** Section ids, used for anchors, `aria-labelledby` and the nav's active state. */
export const sectionIds = {
  features: "features",
  howItWorks: "how-it-works",
  pricing: "pricing",
  faq: "faq",
  getStarted: "get-started",
} as const;

const anchor = (id: string): Anchor => `#${id}`;

/* ------------------------------------------------------------------ */
/* Brand and metadata                                                  */
/* ------------------------------------------------------------------ */

export const brand = {
  name: "Quillo",
  tagline: "Invoicing for freelancers and small teams.",
  disclaimer: "Quillo is a fictional product made as a portfolio demo.",
  year: 2026,
} as const;

export const meta = {
  title: "Quillo: invoicing for freelancers and small teams",
  description:
    "Create invoices in a minute, take card payments online and chase late clients automatically. Quillo is a fictional product made as a portfolio demo.",
} as const;

/* ------------------------------------------------------------------ */
/* Nav (§5.1)                                                          */
/* ------------------------------------------------------------------ */

export const nav = {
  links: [
    { label: "Features", href: anchor(sectionIds.features) },
    { label: "How it works", href: anchor(sectionIds.howItWorks) },
    { label: "Pricing", href: anchor(sectionIds.pricing) },
    { label: "FAQ", href: anchor(sectionIds.faq) },
  ] satisfies readonly NavLink[],
  login: {
    label: "Log in",
    popoverTitle: "This is a demo product",
    popoverBody:
      "Quillo isn't a real app, so there's no account to log in to. The page and the AI assistant are real, though.",
  },
  cta: { label: "Start free", href: anchor(sectionIds.getStarted) },
  ariaLabel: "Main",
  menuTitle: "Menu",
  menuOpenLabel: "Open menu",
  menuCloseLabel: "Close menu",
  skipLink: "Skip to content",
} as const;

/* ------------------------------------------------------------------ */
/* Email form (§5.12): validates, then shows success. Sends nothing.   */
/* ------------------------------------------------------------------ */

export const emailForm = {
  label: "Email address",
  placeholder: "Your work email",
  submit: "Start free",
  submitting: "One moment…",
  note: `Free for your first ${STARTER_CLIENT_LIMIT} clients · No card needed`,
  success: "You're on the list! (Demo only, nothing was sent.)",
  errors: {
    required: "Enter your email address.",
    invalid: "That doesn't look like an email address. Check it and try again.",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Mockup data (§5.2, §5.5). Numbers live only inside the mockups.     */
/* ------------------------------------------------------------------ */

/** The freelancer whose Quillo account the mockups show. */
const account = "Wren Studio";

const draftItems: readonly LineItem[] = [
  { description: "Website design", quantity: 1, unitCents: 60_000 },
  { description: "Copywriting (hours)", quantity: 3, unitCents: 8_000 },
  { description: "Icon set", quantity: 1, unitCents: 6_000 },
];
const draftTaxPercent = 10;
const draftTotals = invoiceTotals(draftItems, draftTaxPercent);

const paidInvoice: Invoice = {
  number: "#1042",
  client: "Bright Harbour",
  amountCents: 125_000,
  status: "paid",
  due: "31 Oct",
};
const overdueInvoice: Invoice = {
  number: "#1039",
  client: "Lumen Studio",
  amountCents: 218_000,
  status: "overdue",
  due: "3 Oct",
};
const draftInvoice: Invoice = {
  number: "#1045",
  client: "Tandem Labs",
  amountCents: draftTotals.total,
  status: "draft",
  due: "14 Nov",
};

/** Six months of paid vs outstanding, in cents. The last month is "this month" in the hero. */
const months = [
  { month: "May", paidCents: 1_290_000, outstandingCents: 340_000 },
  { month: "Jun", paidCents: 1_430_000, outstandingCents: 260_000 },
  { month: "Jul", paidCents: 1_360_000, outstandingCents: 410_000 },
  { month: "Aug", paidCents: 1_580_000, outstandingCents: 280_000 },
  { month: "Sep", paidCents: 1_645_000, outstandingCents: 330_000 },
  { month: "Oct", paidCents: 1_842_000, outstandingCents: 282_000 },
] as const;

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  paid: "Paid",
  "due-soon": "Due soon",
  overdue: "Overdue",
  draft: "Draft",
};

export const mockups = {
  account,
  months,
  dashboard: {
    windowTitle: "Quillo · Dashboard",
    sidebar: ["Dashboard", "Invoices", "Clients", "Reports", "Settings"],
    revenueLabel: "Revenue this month",
    changeLabel: "vs last month",
    chartLabel: "Revenue, last 6 months",
    invoicesTitle: "Recent invoices",
    invoices: [
      paidInvoice,
      {
        number: "#1043",
        client: "Mossgrove Cafe",
        amountCents: 64_000,
        status: "due-soon",
        due: "20 Oct",
      },
      overdueInvoice,
      draftInvoice,
    ] satisfies readonly Invoice[],
    paidToast: `Invoice ${paidInvoice.number} paid · ${formatPrice(paidInvoice.amountCents)}`,
    reminderToast: `Reminder sent to ${overdueInvoice.client}`,
  },
  invoiceEditor: {
    windowTitle: `New invoice ${draftInvoice.number}`,
    billToLabel: "Bill to",
    billTo: draftInvoice.client,
    due: `Due ${draftInvoice.due}`,
    columns: { description: "Item", quantity: "Qty", unit: "Rate", amount: "Amount" },
    items: draftItems,
    addItem: "Add item",
    taxPercent: draftTaxPercent,
    subtotalLabel: "Subtotal",
    taxLabel: `Tax (${draftTaxPercent}%)`,
    totalLabel: "Total",
    send: "Send invoice",
  },
  paymentLink: {
    windowTitle: `Pay ${account}`,
    from: account,
    invoice: `Invoice ${paidInvoice.number}`,
    due: `Due ${paidInvoice.due}`,
    amountCents: paidInvoice.amountCents,
    cardLabel: "Card details",
    cardNumber: "Card number",
    expiry: "MM / YY",
    cvc: "CVC",
    pay: `Pay ${formatPrice(paidInvoice.amountCents)}`,
    secureNote: "Secure card payment",
    paidToast: `Invoice ${paidInvoice.number} marked as paid`,
  },
  cashflow: {
    windowTitle: "Cash flow",
    paidLabel: "Paid",
    outstandingLabel: "Outstanding",
    periodLabel: "This month",
    flagged: overdueInvoice,
    flaggedNote: "Reminder sent",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Hero (§5.2)                                                         */
/* ------------------------------------------------------------------ */

export const hero = {
  badge: { tag: "New", text: "Automatic payment reminders" },
  headline: { before: "Send invoices that get ", highlight: "paid on time", after: "." },
  lead: "Quillo helps freelancers and small teams create invoices in a minute, take card payments online and chase late clients automatically.",
  mockupLabel: "Preview of the Quillo dashboard",
} as const;

/* ------------------------------------------------------------------ */
/* Logo strip (§5.3): made-up companies, soft wording, no numbers.     */
/* ------------------------------------------------------------------ */

export const logoStrip = {
  title: "Trusted by small teams everywhere",
  companies: ["Northpine", "Kitebox", "Arcwell", "Oakmere", "Saltbrook", "Halden & Co."],
  /** The mobile marquee's pause button (WCAG 2.2.2: moving content can be paused). */
  pauseLabel: "Pause the scrolling logos",
} as const;

/* ------------------------------------------------------------------ */
/* Features grid (§5.4)                                                */
/* ------------------------------------------------------------------ */

export const features = {
  id: sectionIds.features,
  eyebrow: "Features",
  title: "Everything you need to get paid",
  intro: "The tools a freelancer or small team actually uses, and nothing to slow you down.",
  items: [
    {
      icon: "invoice",
      title: "Invoices in 60 seconds",
      body: "Pick a client, add your line items and send. Quillo fills in the numbering, tax and due date.",
    },
    {
      icon: "card",
      title: "Online card payments",
      body: "Every invoice has its own pay page, so clients can pay by card in a few taps.",
    },
    {
      icon: "bell",
      title: "Automatic reminders",
      body: "Polite follow-ups go out before and after the due date, so you never write an awkward email.",
    },
    {
      icon: "repeat",
      title: "Recurring invoices",
      body: "Set up retainers and monthly work once, and Quillo sends each invoice on schedule.",
    },
    {
      icon: "globe",
      title: "Multi-currency",
      body: "Invoice clients abroad in their own currency and see every total in yours.",
    },
    {
      icon: "chart",
      title: "Reports and tax export",
      body: "See what's paid, due and late at a glance, then export a tidy report at tax time.",
    },
  ] satisfies readonly Feature[],
} as const;

/* ------------------------------------------------------------------ */
/* Feature deep-dives (§5.5)                                           */
/* ------------------------------------------------------------------ */

export const deepDives = [
  {
    eyebrow: "Create",
    title: "A professional invoice in a minute",
    body: "Start from a client and Quillo does the rest: invoice number, tax, totals and due date. Save the items you bill often and add them again in one click.",
    bullets: [
      "Saved items and rates",
      "Tax and totals worked out for you",
      "Your logo and colours on Pro and Team",
    ],
    mockup: "invoice-editor",
    mockupLabel: "Preview of the Quillo invoice editor with three line items, tax and a total",
  },
  {
    eyebrow: "Get paid",
    title: "Clients pay the moment they open it",
    body: "Each invoice comes with a secure pay page. Clients pay by card or bank transfer without creating an account, and the invoice marks itself as paid.",
    bullets: [
      `Card payments at ${cardFee} each`,
      "No account needed for your clients",
      "Paid invoices update straight away",
    ],
    mockup: "payment-link",
    mockupLabel: "Preview of an invoice pay page with a card form and a pay button",
  },
  {
    eyebrow: "Stay on top",
    title: "Always know where your money is",
    body: "One simple view of what's been paid and what's still outstanding, month by month. Late invoices are flagged before they turn into a problem.",
    bullets: [
      "Paid vs outstanding at a glance",
      "Overdue invoices flagged",
      "Reports ready for your accountant",
    ],
    mockup: "cashflow",
    mockupLabel: "Preview of the Quillo cash flow chart, paid against outstanding over six months",
  },
] as const satisfies readonly DeepDive[];

/* ------------------------------------------------------------------ */
/* How it works (§5.6)                                                 */
/* ------------------------------------------------------------------ */

export const howItWorks = {
  id: sectionIds.howItWorks,
  eyebrow: "How it works",
  title: "From first invoice to paid in three steps",
  steps: [
    {
      icon: "user-plus",
      title: "Add your client",
      body: "Save their name, email address and currency once.",
    },
    {
      icon: "send",
      title: "Send the invoice",
      body: "Quillo emails it to your client with a pay link included.",
    },
    {
      icon: "badge-check",
      title: "Get paid",
      body: "The money arrives, the invoice marks itself paid and reminders stop.",
    },
  ] satisfies readonly Step[],
} as const;

/* ------------------------------------------------------------------ */
/* Testimonials (§5.7): made-up people, initials avatars, no numbers.  */
/* ------------------------------------------------------------------ */

export const testimonials = {
  id: "testimonials",
  eyebrow: "What people say",
  title: "Less chasing, more doing the work",
  items: [
    {
      quote: "I used to spend Friday afternoons chasing payments. Now the reminders do it for me.",
      name: "Maya R.",
      role: "Freelance designer",
      initials: "MR",
      tone: "mint",
    },
    {
      quote:
        "My invoices finally look as tidy as the work. Clients notice, and most of them pay straight from their phone.",
      name: "Tom B.",
      role: "Runs a small joinery workshop",
      initials: "TB",
      tone: "amber",
    },
    {
      quote:
        "I look after the books for a few small studios. Recurring invoices and the tax export make month end so much calmer.",
      name: "Priya S.",
      role: "Freelance bookkeeper",
      initials: "PS",
      tone: "primary-soft",
    },
  ] satisfies readonly Testimonial[],
} as const;

/* ------------------------------------------------------------------ */
/* Pricing (§5.8). Prices are computed by lib/pricing.ts.             */
/* ------------------------------------------------------------------ */

export const pricing = {
  id: sectionIds.pricing,
  eyebrow: "Pricing",
  title: "Simple pricing that grows with you",
  intro: "Start free and upgrade when you need more. No setup fees, cancel any time.",
  toggle: {
    label: "Billing period",
    monthly: "Monthly",
    yearly: "Yearly",
    yearlyBadge: `Save ${YEARLY_DISCOUNT_PERCENT}%`,
  },
  perMonth: "/month",
  freeNote: "Free forever",
  monthlyNote: "Billed monthly",
  /** Followed by the yearly total, e.g. "Billed yearly: $115.20". */
  yearlyNote: "Billed yearly:",
  popularBadge: "Most popular",
  includesLabel: "What's included",
  ctaHref: anchor(sectionIds.getStarted),
  plans: [
    {
      id: "starter",
      name: "Starter",
      tagline: "For getting started with your first clients.",
      monthlyCents: 0,
      features: [
        `Up to ${STARTER_CLIENT_LIMIT} clients`,
        "Unlimited invoices",
        `Online card payments (${cardFee} per payment)`,
      ],
      cta: "Start free",
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "For freelancers with a steady stream of work.",
      monthlyCents: 1_200,
      features: [
        "Unlimited clients",
        "Automatic reminders",
        "Recurring invoices",
        "Custom branding with your logo and colours",
      ],
      cta: "Start with Pro",
      highlighted: true,
    },
    {
      id: "team",
      name: "Team",
      tagline: "For small teams who invoice together.",
      monthlyCents: 2_900,
      features: [
        "Everything in Pro",
        `${TEAM_SEATS} team members`,
        "Multi-currency",
        "Reports and tax export",
        "Priority support",
      ],
      cta: "Start with Team",
      highlighted: false,
    },
  ] satisfies readonly Plan[],
} as const;

/* ------------------------------------------------------------------ */
/* FAQ (§5.9)                                                          */
/* ------------------------------------------------------------------ */

export const faq = {
  id: sectionIds.faq,
  eyebrow: "FAQ",
  title: "Questions, answered",
  askPrompt: "Can't find an answer?",
  askAction: "Ask our assistant",
  items: [
    {
      question: "Is there a free plan?",
      answer: `Yes. Starter is free forever for up to ${STARTER_CLIENT_LIMIT} clients, with unlimited invoices and online card payments. You only pay the card fee of ${cardFee} when a client pays by card. Upgrade to Pro or Team when you need more.`,
    },
    {
      question: "What payment methods can clients use?",
      answer: `Clients can pay by credit or debit card on the invoice's pay page, or by bank transfer using the details printed on the invoice. Card payments cost ${cardFee} per payment. Bank transfers have no Quillo fee.`,
    },
    {
      question: "How do automatic reminders work?",
      answer:
        "On Pro and Team, Quillo emails your client a friendly reminder 3 days before the due date, on the due date, and then every 7 days while the invoice is unpaid. You can change the timing, edit the wording or turn reminders off for any client.",
    },
    {
      question: "Can I use my own logo and colours?",
      answer:
        "Yes, on Pro and Team. Add your logo and brand colour, and your invoices, pay pages and reminder emails all match. Starter invoices use a clean Quillo design.",
    },
    {
      question: "Which currencies are supported?",
      answer: `Starter and Pro invoice in one currency of your choice. Team adds multi-currency, so you can invoice each client in their own currency: ${CURRENCIES.join(", ")}. Reports convert everything back to your home currency.`,
    },
    {
      question: "Can I cancel any time?",
      answer:
        "Yes. Cancel from your settings whenever you like and you keep your plan until the end of the period you've paid for. After that you move to Starter, and all your invoices stay available to view and export.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. Your data is encrypted in transit and at rest, and card details are handled by a certified payment processor, so they never touch Quillo's servers. You can export or delete your data at any time.",
    },
    {
      question: "Can I import clients from a spreadsheet?",
      answer:
        "Yes. Upload a CSV file from any spreadsheet app. Quillo matches the columns (name, email address, currency) and shows you a preview before anything is saved.",
    },
  ] satisfies readonly FaqItem[],
} as const;

/* ------------------------------------------------------------------ */
/* Final CTA (§5.10)                                                   */
/* ------------------------------------------------------------------ */

export const finalCta = {
  id: sectionIds.getStarted,
  eyebrow: "Get started",
  title: "Start sending better invoices today.",
  intro: "Set up your first invoice in a few minutes. Upgrade only when you're ready.",
} as const;

/* ------------------------------------------------------------------ */
/* Footer (§5.11): in-page links or plain text only.                   */
/* ------------------------------------------------------------------ */

export const footer = {
  columns: [
    {
      title: "Product",
      items: [
        { label: "Features", href: anchor(sectionIds.features) },
        { label: "How it works", href: anchor(sectionIds.howItWorks) },
        { label: "Pricing", href: anchor(sectionIds.pricing) },
        { label: "FAQ", href: anchor(sectionIds.faq) },
      ],
    },
    {
      title: "Company",
      items: [{ label: "About" }, { label: "Careers" }, { label: "Press" }],
    },
    {
      title: "Legal",
      items: [{ label: "Privacy" }, { label: "Terms" }, { label: "Cookies" }],
    },
  ] satisfies readonly FooterColumn[],
  navLabel: "Footer",
  backToTop: "Back to top",
  copyright: `© ${brand.year} ${brand.name} · ${brand.disclaimer}`,
} as const;

/* ------------------------------------------------------------------ */
/* Chat assistant UI copy (§6.1, §6.2)                                 */
/* ------------------------------------------------------------------ */

export const chat = {
  launcher: "Ask Quillo",
  title: "Quillo assistant",
  subtitle: "AI · answers questions about Quillo",
  close: "Close chat",
  greeting:
    "Hi! I can answer questions about Quillo's features, pricing and setup. What would you like to know? Please don't share personal information.",
  suggestions: [
    "Is there a free plan?",
    "How do reminders work?",
    "Pro vs Team?",
    "Can clients pay by card?",
  ],
  suggestionsLabel: "Suggested questions",
  conversationLabel: "Conversation",
  /** Screen-reader prefixes, so each message says who it's from. */
  youLabel: "You:",
  assistantLabel: "Assistant:",
  typing: "The assistant is typing…",
  inputLabel: "Your question",
  inputPlaceholder: "Ask about features, pricing or setup…",
  /** Read with the counter, e.g. "12 of 500 characters". */
  counterLabel: "characters",
  send: "Send",
  maxLength: MAX_QUESTION_LENGTH,
  footerNote: "Demo assistant powered by Google Gemini. Answers can be wrong.",
  errors: {
    rateLimited: "You've asked a lot of questions! Please try again in a few minutes.",
    offline: "The assistant is offline right now. Most answers are in the FAQ.",
    offlineAction: "Go to the FAQ",
    offlineHref: anchor(sectionIds.faq),
  },
} as const;
