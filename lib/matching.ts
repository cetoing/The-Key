import type { Internship, InternshipWithMatch } from './types';

export interface MatchResult {
  pct: number;
  matchedSkills: string[];
  missingSkills: string[];
  bonusPoints: string[];
}

const normalise = (s: string) => s.toLowerCase().trim();

function skillsMatch(userSkill: string, required: string): boolean {
  const u = normalise(userSkill);
  const r = normalise(required);
  return u === r || u.includes(r) || r.includes(u);
}

export function computeMatch(
  userSkills: string[],
  careerInterests: string[],
  internship: Internship,
): MatchResult {
  const required = internship.skills_required;
  if (!required.length) return { pct: 0, matchedSkills: [], missingSkills: [], bonusPoints: [] };

  const matchedSkills = required.filter((r) =>
    userSkills.some((u) => skillsMatch(u, r)),
  );
  const missingSkills = required.filter((r) =>
    !userSkills.some((u) => skillsMatch(u, r)),
  );

  const bonusPoints: string[] = [];
  if (careerInterests.some((i) => normalise(i).includes(normalise(internship.type)) || normalise(internship.type).includes(normalise(i)))) {
    bonusPoints.push('Matches your career interests');
  }

  const basePct = Math.round((matchedSkills.length / required.length) * 100);
  const bonus = bonusPoints.length > 0 ? Math.min(10, bonusPoints.length * 5) : 0;
  const pct = Math.min(100, basePct + bonus);

  return { pct, matchedSkills, missingSkills, bonusPoints };
}

export interface SkillGapAction {
  skill: string;
  suggestion: string;
  resources: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const SKILL_GUIDANCE: Record<string, { suggestion: string; resources: string[]; difficulty: 'beginner' | 'intermediate' | 'advanced' }> = {
  javascript: {
    suggestion: 'Build a small interactive web project — a to-do app or portfolio site — to practise core JS concepts.',
    resources: ['javascript.info', 'MDN Web Docs', 'freeCodeCamp'],
    difficulty: 'beginner',
  },
  typescript: {
    suggestion: 'Add TypeScript to an existing JS project. Focus on types, interfaces, and generics.',
    resources: ['typescriptlang.org/docs', 'Total TypeScript (Matt Pocock)', 'Execute Program'],
    difficulty: 'intermediate',
  },
  react: {
    suggestion: 'Follow the official React docs (react.dev) and build a data-fetching app with hooks and state.',
    resources: ['react.dev', 'Scrimba React course', 'The Odin Project'],
    difficulty: 'beginner',
  },
  python: {
    suggestion: 'Complete a 30-day Python challenge or automate a real task — file renaming, web scraping, or a CLI tool.',
    resources: ['python.org/docs', 'Automate the Boring Stuff', 'CS50P (Harvard, free)'],
    difficulty: 'beginner',
  },
  sql: {
    suggestion: 'Practice writing SELECT, JOIN, GROUP BY, and aggregate queries on real datasets using SQLiteOnline.com.',
    resources: ['Mode SQL Tutorial', 'SQLZoo', 'Khan Academy SQL'],
    difficulty: 'beginner',
  },
  git: {
    suggestion: 'Contribute to an open source project or maintain a personal GitHub with regular commits.',
    resources: ['learngitbranching.js.org', 'GitHub Skills', 'Oh My Git!'],
    difficulty: 'beginner',
  },
  'machine learning': {
    suggestion: "Complete Andrew Ng's Machine Learning Specialisation on Coursera and build a classification project.",
    resources: ['Coursera ML Specialisation', 'fast.ai', 'Kaggle Learn'],
    difficulty: 'advanced',
  },
  figma: {
    suggestion: 'Redesign an existing app screen in Figma — practice using components, auto-layout, and prototyping.',
    resources: ['Figma Learn Hub', 'Designlab', 'YouTube: DesignCourse'],
    difficulty: 'beginner',
  },
  'ux research': {
    suggestion: 'Conduct a guerrilla usability test on a website and write up your findings as a case study.',
    resources: ['Nielsen Norman Group Articles', 'UX Mastery', 'Google UX Design Certificate (Coursera)'],
    difficulty: 'intermediate',
  },
  docker: {
    suggestion: 'Containerise a simple web app using Docker, then use docker-compose to connect it to a database.',
    resources: ['docs.docker.com', 'Docker for Beginners (KodeKloud)', 'TechWorld with Nana (YouTube)'],
    difficulty: 'intermediate',
  },
  aws: {
    suggestion: 'Deploy a static site on S3 and a Lambda function — follow the AWS Free Tier getting-started guide.',
    resources: ['AWS Skill Builder (free)', 'A Cloud Guru', 'CloudQuest (gamified, free)'],
    difficulty: 'intermediate',
  },
  linux: {
    suggestion: 'Use a Linux VM or WSL daily for a week — practise file navigation, permissions, and bash scripting.',
    resources: ['OverTheWire Wargames', 'Linux Journey (linuxjourney.com)', 'MIT Missing Semester'],
    difficulty: 'beginner',
  },
  networking: {
    suggestion: 'Study the OSI model, TCP/IP, and basic routing. Use Wireshark to capture and analyse real traffic.',
    resources: ['Professor Messer (CompTIA Net+)', 'Cisco Networking Academy', 'NetworkChuck (YouTube)'],
    difficulty: 'intermediate',
  },
  cybersecurity: {
    suggestion: "Try TryHackMe's \"Pre-Security\" path to learn ethical hacking, networking, and Linux fundamentals.",
    resources: ['TryHackMe', 'HackTheBox', 'OWASP Web Security Testing Guide'],
    difficulty: 'intermediate',
  },
  agile: {
    suggestion: 'Read the Agile Manifesto, then simulate a 2-week sprint on a personal project using a Trello/Kanban board.',
    resources: ['Atlassian Agile Coach', 'Scrum.org resources', 'Coursera: Agile with Atlassian Jira'],
    difficulty: 'beginner',
  },
  communication: {
    suggestion: 'Join a university debate club, Toastmasters, or present a technical topic to peers to build confidence.',
    resources: ['Toastmasters International', 'Coursera: Successful Presentation', 'Duarte.com resources'],
    difficulty: 'beginner',
  },
  'data analysis': {
    suggestion: 'Analyse a public dataset (e.g. from Kaggle or data.gov.uk) and produce a written report with charts.',
    resources: ['Kaggle Learn: Data Analysis', 'DataCamp', 'Google Data Analytics Certificate'],
    difficulty: 'beginner',
  },
  pandas: {
    suggestion: 'Work through the official Pandas docs "10 minutes to pandas" guide and clean a messy CSV dataset.',
    resources: ['pandas.pydata.org/docs', 'Kaggle Pandas micro-course', 'Real Python Pandas tutorials'],
    difficulty: 'beginner',
  },
  tensorflow: {
    suggestion: "Build an image classifier using TensorFlow's tutorials — start with MNIST, then move to custom data.",
    resources: ['tensorflow.org/tutorials', 'DeepLearning.AI TensorFlow Developer Certificate', 'fast.ai'],
    difficulty: 'advanced',
  },
  'rest apis': {
    suggestion: 'Build a REST API with Node.js/Express or FastAPI — design endpoints, test with Postman.',
    resources: ['restfulapi.net', 'Postman Learning Centre', 'Real Python FastAPI tutorial'],
    difficulty: 'intermediate',
  },
  wcag: {
    suggestion: 'Run an automated a11y audit (axe DevTools) on a live site, then fix each issue manually.',
    resources: ['w3.org/WAI/WCAG21', 'deque.com/axe', 'A11y Project checklist'],
    difficulty: 'intermediate',
  },
  accessibility: {
    suggestion: 'Use a screen reader (NVDA/VoiceOver) to navigate a website for 30 minutes and document issues.',
    resources: ['WebAIM (webaim.org)', 'Inclusive Components by Heydon Pickering', 'Smashing Magazine a11y'],
    difficulty: 'beginner',
  },
  'power bi': {
    suggestion: 'Import a CSV into Power BI Desktop and build a 3-page report with slicers, KPI cards, and a bar chart.',
    resources: ['Microsoft Learn: Power BI', 'Guy in a Cube (YouTube)', 'SQLBI DAX patterns'],
    difficulty: 'beginner',
  },
};

function fallbackGuidance(skill: string): SkillGapAction {
  return {
    skill,
    suggestion: `Research "${skill}" using official documentation and build a small project demonstrating its core concepts.`,
    resources: [`Search: "${skill} tutorial for beginners"`, 'YouTube', 'Official documentation'],
    difficulty: 'beginner',
  };
}

export function buildSkillGapPlan(missingSkills: string[], maxActions = 5): SkillGapAction[] {
  return missingSkills.slice(0, maxActions).map((skill) => {
    const key = normalise(skill);
    const entry = SKILL_GUIDANCE[key];
    if (entry) return { skill, ...entry };
    const partial = Object.keys(SKILL_GUIDANCE).find((k) => key.includes(k) || k.includes(key));
    if (partial) return { skill, ...SKILL_GUIDANCE[partial] };
    return fallbackGuidance(skill);
  });
}

export function scoreAllInternships(
  internships: Internship[],
  userSkills: string[],
  careerInterests: string[],
): InternshipWithMatch[] {
  return internships
    .map((i) => {
      const { pct, matchedSkills, missingSkills, bonusPoints } = computeMatch(userSkills, careerInterests, i);
      return { ...i, match_percentage: pct, matched_skills: matchedSkills, missing_skills: missingSkills, bonus_points: bonusPoints };
    })
    .sort((a, b) => b.match_percentage - a.match_percentage);
}
