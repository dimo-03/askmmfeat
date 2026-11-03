import {
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Scale,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import bllod1 from "../assets/bllod1.jpg";
import fifth from "../assets/fifth.png";
import first from "../assets/first.png";
import flood1 from "../assets/flood1.jpg";
import fourth from "../assets/fourth.png";
import second from "../assets/second.png";
import third from "../assets/third.png";
import water from "../assets/water.png";

export const FOUNDATION = {
  fullName: 'Advocate Susil Kumar Mohapatra Memorial Foundation and Educational Trust',
  shortName: 'ASKMM Foundation',
  established: '2023',
  tagline: 'Education, Justice, Empowerment, Service',
  logo: '/Logo_of_ASKMMFAET-1st_.png',
};

export const DONATION_AMOUNTS = [500, 1000, 2500, 5000] as const;

export const CONTACT = {
  address: 'Principal Office-Plot No-27/9693, Kendupatna, Balipada, Dadha, Nandankanan, Bhubaneswar Urban, Odisha-751024',
  phone: '+91 7873754996',
  email: 'advsusilkumarmohapatramfaet@gmail.com',
  
};

export interface SocialLink {
  label: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595787192326' },
  { label: 'Instagram', url: 'https://www.instagram.com/advocatesusilfoundation?exln=a2xwYWxsMnNwcWtl' },
  { label: 'YouTube', url: '#' },
  { label: 'X (Twitter)', url: 'https://x.com/advocatesusil' },
];

export interface NavLink {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Initiatives', to: '/initiatives' },
  // { label: 'Our Team', to: '/leadership' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  // { label: 'Impact', to: '/impact' },
  { label: 'Membership', to: '/membership' },
  { label: 'Get Involved', to: '/get-involved' },
  { label: 'Contact', to: '/contact' },
];

export interface Initiative {
  slug: string;
  title: string;
  summary: string;
  overview: string;
  objectives: string[];
  activities: string[];
  beneficiaries: string[];
  image: string;
  icon: LucideIcon;
}

export const INITIATIVES: Initiative[] = [
  {
    slug: 'social-activities',
    title: 'Social Activities',
    summary: 'Community outreach, awareness campaigns and public welfare activities.',
    overview:
      'Social activities bring the Foundation into direct contact with local communities, building understanding of civic rights and encouraging people to take part in shared social development.',
    objectives: [
      'Strengthen community participation in social development',
      'Run awareness campaigns on social issues that affect families',
      'Bring public welfare activities to neighbourhoods that need them most',
    ],
    activities: ['Community outreach visits', 'Awareness campaigns', 'Public welfare drives', 'Social-development meetings'],
    beneficiaries: ['Residents of local communities', 'Families in need of guidance', 'Community volunteers'],
    image:
      'https://images.pexels.com/photos/37495850/pexels-photo-37495850.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: Users,
  },
  {
    slug: 'educational-initiatives',
    title: 'Educational Initiatives',
    summary: 'Educational support, learning awareness and student development.',
    overview:
      'The Foundation’s education work supports students and learners through learning programmes, awareness sessions and resources that help young people build a stronger future.',
    objectives: [
      'Support students in continuing their education',
      'Promote learning and awareness across communities',
      'Encourage personal and academic development among young people',
    ],
    activities: ['Educational support programmes', 'Learning and awareness sessions', 'Student development activities'],
    beneficiaries: ['School and college students', 'Parents and guardians', 'Teachers and learning facilitators'],
    image:
      'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: GraduationCap,
  },
  {
    slug: 'welfare-programmes',
    title: 'Welfare Programmes',
    summary: 'Community welfare, assistance and support for underserved communities.',
    overview:
      'Welfare programmes provide practical assistance to people who need support, with special attention to underserved communities and households facing hardship.',
    objectives: [
      'Provide assistance to people facing hardship',
      'Support underserved communities with practical help',
      'Raise awareness about health and wellbeing',
    ],
    activities: ['Assistance drives', 'Health-awareness initiatives', 'Community support camps'],
    beneficiaries: ['Underserved households', 'Elderly persons and persons in need', 'Families in vulnerable situations'],
    image:
      bllod1,
    icon: HeartHandshake,
  },
  {
    slug: 'training-skill-development',
    title: 'Training and Skill Development',
    summary: 'Vocational training, workshops and capacity-building for youth.',
    overview:
      'Training and skill-development activities help individuals gain practical abilities that improve employability and self-reliance, with a focus on youth development.',
    objectives: [
      'Provide vocational and practical skill training',
      'Conduct workshops and skill-development sessions',
      'Build capacity and confidence among young people',
    ],
    activities: ['Vocational training', 'Hands-on workshops', 'Capacity-building sessions', 'Youth development programmes'],
    beneficiaries: ['Youth seeking employment', 'Women and self-help groups', 'Community members seeking new skills'],
    image:
      fifth,
    icon: Wrench,
  },
  // {
  //   slug: 'justice-legal-awareness',
  //   title: 'Justice and Legal Awareness',
  //   summary: 'Legal awareness campaigns and education on legal rights.',
  //   overview:
  //     'Drawing on the legacy of Advocate Susil Kumar Mohapatra, this work helps people understand their legal rights and access justice through awareness campaigns and community education.',
  //   objectives: [
  //     'Spread awareness of everyday legal rights',
  //     'Make legal information accessible to ordinary citizens',
  //     'Promote fairness and the rule of law in communities',
  //   ],
  //   activities: ['Legal awareness campaigns', 'Rights education sessions', 'Community awareness programmes'],
  //   beneficiaries: ['Citizens seeking legal awareness', 'Students and youth', 'Community leaders'],
  //   image:
  //     'https://images.pexels.com/photos/6077296/pexels-photo-6077296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  //   icon: Scale,
  // },
];

export interface TeamMember {
  name: string;
  designation: string;
  bio: string;
}

export const LEADERSHIP: { chairman: TeamMember; secretary: TeamMember; trustees: TeamMember[]; officeBearers: TeamMember[] } = {
  chairman: {
    name: 'Chairman (name to be confirmed)',
    designation: 'Chairman',
    bio: 'Biography and approved photograph to be provided by the Foundation.',
  },
  secretary: {
    name: 'Dr. S. K. (full name to be confirmed)',
    designation: 'Secretary',
    bio: 'Biography and approved photograph to be provided by the Foundation.',
  },
  trustees: [
    { name: 'Trustee (name to be confirmed)', designation: 'Trustee', bio: 'Details to be provided.' },
    { name: 'Trustee (name to be confirmed)', designation: 'Trustee', bio: 'Details to be provided.' },
  ],
  officeBearers: [
    { name: 'Office bearer (name to be confirmed)', designation: 'Treasurer', bio: 'Details to be provided.' },
    { name: 'Office bearer (name to be confirmed)', designation: 'Joint Secretary', bio: 'Details to be provided.' },
    { name: 'Office bearer (name to be confirmed)', designation: 'Programme Coordinator', bio: 'Details to be provided.' },
  ],
};

export interface FoundationEvent {
  slug: string;
  title: string;
  date: string;
  location: string;
  status: 'Upcoming' | 'Completed';
  category: string;
  summary: string;
  image: string;
  isSample: boolean;
}

export const EVENTS: FoundationEvent[] = [
  {
    slug: 'community-awareness-drive',
    title: 'Community Awareness Drive',
    date: 'Date to be announced',
    location: 'Location to be announced',
    status: 'Upcoming',
    category: 'Social Activities',
    summary: 'A community awareness session on rights, education and social responsibility. Event details will be published once confirmed.',
    image:
      third,
    isSample: true,
  },
  {
    slug: 'education-support-programme',
    title: 'Educational Support Programme',
    date: 'Date to be announced',
    location: 'Location to be announced',
    status: 'Upcoming',
    category: 'Educational Initiatives',
    summary: 'A learning support session for students, with guidance and learning resources. Event details will be published once confirmed.',
    image:
      'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    isSample: true,
  },
  {
    slug: 'vocational-training-workshop',
    title: 'Vocational Training Workshop',
    date: 'Date to be announced',
    location: 'Location to be announced',
    status: 'Upcoming',
    category: 'Training and Skill Development',
    summary: 'A hands-on workshop introducing practical skills to youth and community members.',
    image:
      'https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    isSample: true,
  },
  // {
  //   slug: 'legal-rights-awareness-session',
  //   title: 'Legal Rights Awareness Session',
  //   date: 'Date to be announced',
  //   location: 'Location to be announced',
  //   status: 'Completed',
  //   category: 'Justice and Legal Awareness',
  //   summary: 'An awareness session explaining everyday legal rights to citizens. Replace this entry with a verified completed event.',
  //   image:
  //     'https://images.pexels.com/photos/8850747/pexels-photo-8850747.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  //   isSample: true,
  // },
  {
    slug: 'health-awareness-camp',
    title: 'Health Awareness Camp',
    date: 'Date to be announced',
    location: 'Location to be announced',
    status: 'Completed',
    category: 'Welfare Programmes',
    summary: 'A community health-awareness camp focused on preventive care. Replace this entry with a verified completed event.',
    image:
      bllod1,
    isSample: true,
  },
];

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
}

export const GALLERY_CATEGORIES = [
  'Educational Programmes',
  'Social Activities',
  'Welfare Programmes',
  'Workshops and Training',
  'Community Programmes',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: 'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Students listening attentively in a classroom',
    caption: 'Classroom learning session',
    category: 'Educational Programmes',
  },
  {
    src: fourth,
    alt: 'Two young children reading together in a bright classroom',
    caption: 'Reading support',
    category: 'Educational Programmes',
  },
  {
    src: fifth,
    alt: 'Children engaged with letters in a kindergarten classroom',
    caption: 'Early learning',
    category: 'Educational Programmes',
  },
  {
    src: flood1,
    alt: 'Volunteers organising donated supplies',
    caption: 'Volunteers organising relief supplies',
    category: 'Welfare Programmes',
  },
  {
    src: water,
    alt: 'Volunteers distributing aid at an outdoor centre',
    caption: 'Food distribution',
    category: 'Welfare Programmes',
  },
  {
    src: bllod1,
    alt: 'First aid kit held during a health camp',
    caption: 'Health awareness',
    category: 'Welfare Programmes',
  },
  {
    src: first,
    alt: 'Participants in a hands-on technical training session',
    caption: 'Hands-on technical training',
    category: 'Workshops and Training',
  },
  {
    src: second,
    alt: 'Women attending a sewing class',
    caption: 'Skill development class',
    category: 'Workshops and Training',
  },
  {
    src: third,
    alt: 'Workers practising metalwork in a workshop',
    caption: 'Workshop practice',
    category: 'Workshops and Training',
  },
  // {
  //   src: 'https://images.pexels.com/photos/12823567/pexels-photo-12823567.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  //   alt: 'A large group gathered outdoors in a village setting',
  //   caption: 'Village community gathering',
  //   category: 'Community Programmes',
  // },
  // {
  //   src: 'https://images.pexels.com/photos/25856942/pexels-photo-25856942.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  //   alt: 'People in cultural attire at a community ceremony',
  //   caption: 'Community ceremony',
  //   category: 'Community Programmes',
  // },
  // {
  //   src: 'https://images.pexels.com/photos/6646926/pexels-photo-6646926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  //   alt: 'Volunteers handing out support at a community event',
  //   caption: 'Community support event',
  //   category: 'Social Activities',
  // },
  // {
  //   src: 'https://images.pexels.com/photos/6077091/pexels-photo-6077091.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  //   alt: 'Study room with law books, a gavel and scales of justice',
  //   caption: 'Legal awareness material',
  //   category: 'Social Activities',
  // },
];

export interface ImpactStat {
  label: string;
  description: string;
  icon: LucideIcon;
}

export const IMPACT_STATS: ImpactStat[] = [
  { label: 'Events conducted', description: 'Figure to be verified by the Foundation', icon: BookOpen },
  { label: 'Beneficiaries reached', description: 'Figure to be verified by the Foundation', icon: Users },
  { label: 'Volunteers involved', description: 'Figure to be verified by the Foundation', icon: HeartHandshake },
  { label: 'Initiatives completed', description: 'Figure to be verified by the Foundation', icon: GraduationCap },
];

export const CORE_VALUES = ['Education', 'Justice', 'Empowerment', 'Social Welfare', 'Community Service'];

export const MISSION_VISION_OBJECTIVES = {
  mission: {
    title: 'Our Mission',
    body: 'To support education, promote justice and awareness, empower communities, and contribute to meaningful social welfare. Placeholder wording until the official mission statement is provided.',
  },
  vision: {
    title: 'Our Vision',
    body: 'A society in which every individual has access to learning, legal awareness and opportunity. Placeholder wording until the official vision statement is provided.',
  },
  objectives: {
    title: 'Our Objectives',
    body: 'To run educational support, welfare, training and awareness programmes that serve the community. Placeholder wording until the official objectives are provided.',
  },
};

export const MILESTONES = [
  { year: '2023', title: 'Foundation established', body: 'The Foundation was formed in memory of Advocate Susil Kumar Mohapatra.' },
  { year: 'Ongoing', title: 'Programmes and outreach', body: 'Initiatives in education, welfare, training and legal awareness.' },
];
