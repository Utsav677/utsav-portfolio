export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: 'Languages',
    skills: ['Python', 'Java', 'C/C++', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    name: 'AI/ML',
    skills: [
      'LangChain',
      'LangGraph',
      'PyTorch',
      'TensorFlow',
      'scikit-learn',
      'RAG',
      'Vector DBs',
      'CNNs',
      'GRUs',
      'LSTMs',
    ],
  },
  {
    name: 'Web',
    skills: ['React Native', 'Next.js', 'Node.js', 'Firebase', 'Redis', 'Supabase'],
  },
  {
    name: 'Cloud',
    skills: ['AWS', 'GCP', 'Docker', 'Cloud Run'],
  },
  {
    name: 'Currently Learning',
    skills: ['MCP servers', 'Apple MLX', 'Vision Transformer fine-tuning'],
  },
];
