export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string[];
}

export const experiences: Experience[] = [
  {
    role: 'Undergraduate Researcher',
    company: 'The Data Mine @ Purdue (Corteva Agriscience)',
    period: 'Aug 2025 – Dec 2025',
    description: [
      'Built a 15-node agentic RAG graph using LangChain + LangGraph',
      'Integrated Chroma vector database for semantic retrieval over ag datasets',
      'Leveraged GPT-4 for intelligent query synthesis and multi-hop reasoning',
      'Deployed pipeline within Corteva\'s internal research infrastructure',
    ],
  },
  {
    role: 'ML Research Intern',
    company: 'Smart Energy Water (SEW)',
    period: 'May 2025 – Aug 2025',
    description: [
      'Developed ML models for energy and water consumption forecasting',
      'Applied CNNs and GRU networks for time-series prediction on utility data',
      'Improved prediction accuracy by 23% vs previous statistical baselines',
      'Deployed models to production via GCP Cloud Run with auto-scaling',
    ],
  },
  {
    role: 'Founder',
    company: 'Automated Consultancy Services (ACS)',
    period: 'Jan 2025 – Present',
    description: [
      'Founded AI automation consultancy serving SMBs across multiple verticals',
      'Build custom LLM-powered workflows: lead gen, document processing, support bots',
      'Clients include e-commerce brands, law firms, and marketing agencies',
      'Built and scaled to $3K MRR within 6 months of founding',
    ],
  },
];
