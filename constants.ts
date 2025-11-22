import { Education, Experience, Project, Contact } from './types';

export const RESUME_DATA = {
  name: "Jiajun Wang",
  // LinkedIn Profile Picture
  avatarUrl: "https://media.licdn.com/dms/image/v2/D5603AQHuUZiC5wVJ6g/profile-displayphoto-crop_800_800/B56ZpqkO42HkAI-/0/1762724475041?e=1765411200&v=beta&t=FHtIPNyUyO47-4tOkg-OUuhM7KKTW0xsJPaBN6MtGlU", 
  title: "Software Engineer ｜ UIUC",
  contact: {
    phone: "447-902-0249",
    email: "uiucwangjiajun@gmail.com",
    linkedin: "https://www.linkedin.com/in/jiajun-w-814867365/", 
    github: "https://github.com/JiajunWang23",
    location: "Champaign, IL"
  } as Contact,
  summary: "Statistics major and Computer Science minor student at UIUC with strong expertise in distributed systems. I have completed a software engineering internship at AWS.",
  education: {
    institution: "University of Illinois at Urbana-Champaign",
    degree: "Bachelor of Science in Statistics, Minor in Computer Science",
    gpa: "3.86/4.00",
    period: "Aug 2022 - May 2026",
    courses: [
      "Distributed Systems",
      "Cloud Infrastructure",
      "Advanced Algorithms",
      "Database Management",
      "Software Engineering",
      "Machine Learning",
      "Computer Networks"
    ]
  } as Education,
  experience: [
    {
      company: "Amazon Web Services (AWS)",
      role: "Software Engineering Intern - Direct Connect Team",
      location: "Herndon, VA",
      period: "May 2024 - Aug 2024",
      description: [
        "Developed router orchestration system replacing manual lab testing integrating LyreBird and Veracity registry.",
        "Built backend RESTful APIs in Java provisioning retrieving emulated routers on demand deployed via CI/CD.",
        "Leveraged AWS EventBridge scheduling cleanup tasks triggering Lambda, ECS deleting expired devices.",
        "Persisted lifecycle metadata in DynamoDB for real-time use by downstream services streamlining infrastructure.",
        "Streamlined test setup across engineering teams saving 30+ minutes per engineer daily improving testing efficiency."
      ],
      tech: ["Java", "AWS Lambda", "ECS", "DynamoDB", "EventBridge", "CI/CD"]
    },
    {
      company: "Aleoga",
      role: "Data Scientist Intern",
      location: "Remote",
      period: "Apr 2024 - Jul 2024",
      description: [
        "Conducted data analysis across platforms including Instagram, Facebook, Twitter evaluating user engagement.",
        "Utilized Python for web scraping gathering user engagement metrics uncovering key growth trends behavior.",
        "Visualized user interaction data evaluated effectiveness advertising strategies optimizing campaign performance.",
        "Achieved 25% increase active users improved advertising ROI by 18% reduced marketing costs 12%."
      ],
      tech: ["Python", "Web Scraping", "Data Analysis"]
    },
    {
      company: "University of Illinois at Urbana-Champaign",
      role: "Data Analyst Intern",
      location: "Champaign, IL",
      period: "Jan 2023 - May 2023",
      description: [
        "Analyzed data from anti-sexual harassment courses improving satisfaction rate through statistical methods insights.",
        "Employed statistical methods like linear regression-based Python created dashboards using Tableau analysis.",
        "Visualized survey data using Python, Tableau highlighting satisfaction guiding future course planning decisions.",
        "Provided insights achieving 20% improvement participant satisfaction scores after targeted course redesigns."
      ],
      tech: ["Python", "Tableau", "Statistics"]
    }
  ] as Experience[],
  projects: [
    {
      title: "Real-Time Analytics Dashboard",
      techStack: ["Python", "Flask", "React", "WebSocket", "Redis", "PostgreSQL", "Docker", "REST API"],
      description: [
        "Built real-time analytics dashboard using Flask, React processing 100K+ events daily with visualizations.",
        "Implemented WebSocket connections with Redis pub/sub achieving sub-100ms latency for real-time data updates.",
        "Designed PostgreSQL schema storing 5M+ event records with aggregation pipelines reducing query time 50%.",
        "Deployed containerized services using Docker achieving 99.8% uptime supporting 1K+ concurrent users."
      ]
    },
    {
      title: "Mobile App - Professors' Ratings",
      techStack: ["Java", "SQL", "REST API", "Android Development"],
      description: [
        "Developed mobile application in Java allowing students viewing rating professors' ratings at UIUC campus.",
        "Enabled search functionality allowing finding professor ratings-based course department enhancing experience.",
        "Implemented backend functionalities handling user interactions including updating ratings and leaving comments.",
        "Designed integrated robust API for student identity certification ensuring secure authenticated access to app.",
        "Utilized SQL for data storage management maintaining professor ratings feedback ensuring scalability performance."
      ]
    },
    {
      title: "Media Industry Talent Analysis Research",
      techStack: ["Python", "NLP", "Data Analysis", "Preprocessing Pipeline"],
      description: [
        "Conducted research alignment between industry requirements university media training analyzing 1K+ job postings.",
        "Classified analyzed job postings with Python extracting key skills quantifying word frequencies identifying trends.",
        "Improved matching accuracy and preprocessing pipeline structuring posting data building app alignment analysis.",
        "Enhanced relevance training programs through keyword-based analysis and alignment matching mechanisms."
      ]
    }
  ] as Project[],
  skills: {
    languages: ["Python", "Java", "C++", "C", "Golang", "MATLAB", "SQL", "R", "JavaScript", "HTML", "CSS"],
    frameworks: ["Django", "React", "Streamlit", "LangChain", "Jenkins", "JUnit", "Jest", "GitHub Actions", "Linux"],
    tools: ["AWS", "Kubernetes", "Docker", "RESTful API", "GraphQL", "MongoDB", "Pinecone", "Joblib"],
    visualization: ["Tableau", "Matplotlib", "Seaborn"]
  }
};

export const SYSTEM_PROMPT = `
You are an AI assistant representing Jiajun Wang. You are embedded in his personal portfolio website.
Answer questions based strictly on the following resume data. Be professional, concise, and helpful.
If asked about contact info, provide it. If asked about experience, summarize the key points.
Do not hallucinate details not present in the text below.

RESUME DATA:
Name: ${RESUME_DATA.name}
Title: ${RESUME_DATA.title}
Summary: ${RESUME_DATA.summary}
Phone: ${RESUME_DATA.contact.phone}
Email: ${RESUME_DATA.contact.email}
LinkedIn: ${RESUME_DATA.contact.linkedin}
GitHub: ${RESUME_DATA.contact.github}
Education: ${RESUME_DATA.education.institution}, ${RESUME_DATA.education.degree}, GPA: ${RESUME_DATA.education.gpa}.
Experience:
${RESUME_DATA.experience.map(e => `- ${e.role} at ${e.company} (${e.period}): ${e.description.join(' ')}`).join('\n')}
Projects:
${RESUME_DATA.projects.map(p => `- ${p.title} (${p.techStack.join(', ')}): ${p.description.join(' ')}`).join('\n')}
Skills:
Languages: ${RESUME_DATA.skills.languages.join(', ')}
Frameworks: ${RESUME_DATA.skills.frameworks.join(', ')}
Tools: ${RESUME_DATA.skills.tools.join(', ')}
`;