import type { QuestionType } from './types';

export interface Question {
  text: string;
  type: QuestionType;
  hint: string;
}

const BEHAVIOURAL: Question[] = [
  {
    text: 'Tell me about a time you worked effectively in a team. What was your role and what did you contribute?',
    type: 'behavioural',
    hint: 'Use the STAR method: Situation, Task, Action, Result.',
  },
  {
    text: 'Describe a situation where you had to manage multiple deadlines at once. How did you prioritise?',
    type: 'behavioural',
    hint: 'Show that you can organise your workload and remain calm under pressure.',
  },
  {
    text: 'Tell me about a time you received critical feedback. How did you respond to it?',
    type: 'behavioural',
    hint: 'Demonstrate self-awareness and a growth mindset.',
  },
  {
    text: 'Describe a project or task where something went wrong. What happened and what did you learn?',
    type: 'behavioural',
    hint: 'Focus on what you learned and how you adapted, not just what went wrong.',
  },
  {
    text: 'Give an example of when you took initiative and went beyond what was expected of you.',
    type: 'behavioural',
    hint: 'Show proactivity and a willingness to go the extra mile.',
  },
  {
    text: 'Tell me about a time you had to learn a new skill quickly. How did you approach it?',
    type: 'behavioural',
    hint: 'Highlight your approach to learning and adaptability.',
  },
  {
    text: 'Describe a time you disagreed with a team member or supervisor. How did you handle it?',
    type: 'behavioural',
    hint: 'Show emotional intelligence and constructive conflict resolution.',
  },
];

const SITUATIONAL: Question[] = [
  {
    text: 'If you were assigned to a project where the brief was unclear, what would you do first?',
    type: 'situational',
    hint: 'Show that you ask clarifying questions and take initiative to understand expectations.',
  },
  {
    text: 'Imagine your manager gives you two urgent tasks with the same deadline. How would you handle this?',
    type: 'situational',
    hint: 'Demonstrate prioritisation skills and willingness to communicate.',
  },
  {
    text: 'You notice a mistake in a piece of work that a colleague has already submitted. What do you do?',
    type: 'situational',
    hint: 'Balance honesty, tact, and teamwork in your answer.',
  },
  {
    text: 'You are halfway through a project and realise the approach you chose won\'t work. What do you do?',
    type: 'situational',
    hint: 'Show that you can adapt and communicate proactively.',
  },
];

const MOTIVATIONAL: Question[] = [
  {
    text: 'Why are you applying for this role and what attracts you to this company?',
    type: 'motivational',
    hint: 'Be specific — mention the company\'s work, values, or the skills you hope to develop.',
  },
  {
    text: 'Where do you see yourself in five years, and how does this internship fit into those plans?',
    type: 'motivational',
    hint: 'Show ambition and that you\'ve thought about your career path.',
  },
  {
    text: 'What are your greatest strengths, and how would they benefit this team?',
    type: 'motivational',
    hint: 'Choose 2-3 strengths that are relevant and back each one with a brief example.',
  },
  {
    text: 'What is one area you would most like to develop professionally, and why?',
    type: 'motivational',
    hint: 'Be honest but frame it as a growth opportunity, not a weakness.',
  },
  {
    text: 'What do you know about our industry and the challenges it currently faces?',
    type: 'motivational',
    hint: 'Show that you\'ve done your research — mention specific trends or challenges.',
  },
];

const TECHNICAL: Question[] = [
  {
    text: 'Can you walk me through a technical project you have completed? What was your approach?',
    type: 'technical',
    hint: 'Cover what you built, the technologies you used, challenges you faced, and what you\'d do differently.',
  },
  {
    text: 'How do you approach debugging a problem in your code when you are stuck?',
    type: 'technical',
    hint: 'Describe your systematic approach — reading error messages, isolating the issue, testing hypotheses.',
  },
  {
    text: 'Explain a concept from your field of study to someone who knows nothing about it.',
    type: 'technical',
    hint: 'Use an analogy or everyday example. This tests communication as much as knowledge.',
  },
  {
    text: 'Describe the most technically challenging thing you have worked on. What made it difficult?',
    type: 'technical',
    hint: 'Focus on your problem-solving process and what you learned.',
  },
];

const ALL_QUESTIONS: Question[] = [
  ...BEHAVIOURAL,
  ...SITUATIONAL,
  ...MOTIVATIONAL,
  ...TECHNICAL,
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getSessionQuestions(count = 8): Question[] {
  const b = shuffle(BEHAVIOURAL).slice(0, 3);
  const s = shuffle(SITUATIONAL).slice(0, 2);
  const m = shuffle(MOTIVATIONAL).slice(0, 2);
  const t = shuffle(TECHNICAL).slice(0, 1);
  return shuffle([...b, ...s, ...m, ...t]).slice(0, count);
}

export function getQuestionsByType(type: QuestionType): Question[] {
  return ALL_QUESTIONS.filter((q) => q.type === type);
}
