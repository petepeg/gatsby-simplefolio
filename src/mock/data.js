import { nanoid } from 'nanoid';

// HEAD DATA
export const headData = {
  title: 'Peter Pegues | Software Engineer', // e.g: 'Name | Developer'
  lang: 'en', // e.g: en, es, fr, jp
  description: 'Portfolio For Peter Pegues', // e.g: Welcome to my website
};

// HERO DATA
export const heroData = {
  title: 'Hello, my name is',
  name: 'Peter Pegues',
  subtitle: 'Software Engineer',
  cta: 'Learn More',
};

// ABOUT DATA
export const aboutData = {
  img: 'profile.jpg',
  paragraphOne: 'I live in Abington, PA with my wife Emily, our son Will and our two dogs and cat.',
  paragraphTwo: 'I love working with web technologies, I like JavaScript and love Python.',
  paragraphThree: 'I recently graduated From SNHU with a degree in Computer Science and I am looking for work.',
  resume: 'PeterPegResume.pdf', // if no resume, the button will not show up
};

// PROJECTS DATA
export const projectsData = [
  {
    id: nanoid(),
    img: 'Pacman.png',
    title: 'Pacman in JS',
    info: 'A quick clone of Pacman made in JS over three days.',
    info2: '',
    url: 'pacman/Pacman.html',
    repo: 'https://github.com/petepeg/Pacman.js', // if no repo, the button will not show up
  },
  {
    id: nanoid(),
    img: 'thwumper.png',
    title: 'Thwumper',
    info: 'A basic Twitter clone In Angular to learn and explore MEAN stack',
    info2: '',
    url: '',
    repo: 'https://github.com/petepeg/Thwumper', // if no repo, the button will not show up
  },
  {
    id: nanoid(),
    img: 'Sudoku.png',
    title: 'Sudoku Solver',
    info: 'Solves Sudoku Puzzles using a backtracking algorithm. Also generates puzzles and verifies them using the solver.',
    info2: 'Has a GUI written in PyGame, that lets you generate and play puzzles.',
    url: '',
    repo: 'hhttps://github.com/petepeg/PySudoku', // if no repo, the button will not show up
  },
];

// CONTACT DATA
export const contactData = {
  cta: 'Reach Out',
  btn: 'Email',
  email: 'peter.pegues@gmail.com',
};

// FOOTER DATA
export const footerData = {
  networks: [
    {
      id: nanoid(),
      name: 'linkedin',
      url: 'https://www.linkedin.com/in/peter-pegues-aba6171b9/',
    },
    {
      id: nanoid(),
      name: 'github',
      url: 'https://github.com/petepeg/',
    },
  ],
};

// Github start/fork buttons
export const githubButtons = {
  isEnabled: false, // set to false to disable the GitHub stars/fork buttons
};
