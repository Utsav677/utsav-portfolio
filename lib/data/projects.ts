export interface Project {
  name: string;
  slug: string;
  stats: string;
  stack: string[];
  description: string;
  highlights: string[];
  url?: string;
}

export const projects: Project[] = [
  {
    name: 'Huddle Social',
    slug: 'huddle-social',
    stats: '2,200+ users',
    stack: ['React Native', 'Node.js', 'Firebase', 'Redis', 'Google Maps'],
    description:
      'Social platform for local community events and group meetups with real-time location features.',
    highlights: [
      '2,200+ registered users organically acquired',
      'Real-time location-based event discovery via Google Maps API',
      'Redis pub/sub for push notifications — <50ms delivery latency',
      'Firebase Auth + Firestore for scalable real-time data layer',
      'Cross-platform: iOS + Android from single codebase',
    ],
  },
  {
    name: 'Corteva RAG',
    slug: 'corteva-rag',
    stats: '15-node agentic graph',
    stack: ['LangChain', 'LangGraph', 'Chroma', 'GPT-4', 'Python'],
    description:
      'Enterprise agentic RAG pipeline for Corteva Agriscience — multi-hop reasoning over internal research documents.',
    highlights: [
      '15-node agentic graph with parallel retrieval paths',
      'Chroma vector database for semantic chunk retrieval',
      'LangGraph for stateful multi-hop question answering',
      'GPT-4 synthesis layer with citation tracking',
      'Reduced research query time from hours to seconds',
    ],
  },
  {
    name: 'Plate Mate',
    slug: 'plate-mate',
    stats: 'Best Pitch + Best Presentation @ Purdue Hackathon',
    stack: ['Next.js', 'Supabase', 'Python', 'GPT-4'],
    description:
      'AI-powered meal planning and nutrition app that uses 14-dimensional KNN to match meals to user profiles.',
    highlights: [
      'Won Best Pitch AND Best Presentation at Purdue Hackathon',
      '14-dimensional KNN for personalized meal recommendation',
      'GPT-4 integration for natural language meal preference parsing',
      'Supabase for real-time nutritional data and user profiles',
      'Built in 24 hours by a team of 3',
    ],
  },
  {
    name: 'OpenClaw',
    slug: 'openclaw',
    stats: 'Scout / Applier / Publisher subagents',
    stack: ['Python', 'LangGraph', 'OpenAI API'],
    description:
      'Multi-agent job application automation system with specialized Scout, Applier, and Publisher subagents.',
    highlights: [
      'Scout agent: crawls job boards and filters by criteria',
      'Applier agent: tailors resume/cover letter per job posting',
      'Publisher agent: submits applications and tracks status',
      'LangGraph for inter-agent state management and orchestration',
      'Applies to 50+ jobs per hour autonomously',
    ],
  },
  {
    name: 'Crypto Bot',
    slug: 'crypto-bot',
    stats: 'Solana DEX signal trading',
    stack: ['Python', 'Solana Web3.js', 'GCP Cloud Run'],
    description:
      'Automated trading bot for Solana DEX markets using technical signal analysis and on-chain data.',
    highlights: [
      'Monitors 100+ Solana token pairs in real-time',
      'Signal-based entry/exit logic with configurable risk parameters',
      'Deployed on GCP Cloud Run for 24/7 uptime',
      'Slippage protection and MEV-aware transaction routing',
      'Built-in PnL tracking and Telegram alert integration',
    ],
  },
  {
    name: 'RAHAHA',
    slug: 'rahaha',
    stats: 'SemEval-2026 Task 1 (MWAHAHA)',
    stack: ['Python', 'PyTorch', 'Transformers', 'NLP'],
    description:
      'NLP system for SemEval-2026 Task 1: detecting humor and sarcasm in multilingual text (MWAHAHA track).',
    highlights: [
      'SemEval-2026 Task 1 submission — MWAHAHA track',
      'Fine-tuned multilingual LLM for humor/sarcasm classification',
      'Custom data augmentation pipeline for low-resource languages',
      'Ensemble of transformer models with calibrated confidence',
      'Ongoing research with Purdue NLP lab',
    ],
  },
  {
    name: 'March Madness',
    slug: 'march-madness',
    stats: 'NCAA bracket prediction',
    stack: ['Python', 'scikit-learn', 'pandas', 'NumPy'],
    description:
      'NCAA bracket prediction system using Monte Carlo simulation and ensemble ML models.',
    highlights: [
      'Monte Carlo simulation for bracket outcome probability',
      'Feature engineering from 10+ years of historical NCAA data',
      'Ensemble of Random Forest, XGBoost, and logistic regression',
      'Achieved 73% first-round accuracy vs 67% baseline',
      'Visualizes full bracket with confidence intervals',
    ],
  },
];
