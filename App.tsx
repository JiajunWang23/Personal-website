import React, { useState, useEffect, useRef } from 'react';
import { RESUME_DATA } from './constants';
import { SectionId, Message } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { GithubIcon, LinkedinIcon, MailIcon, SendIcon, XIcon, SparklesIcon, ArrowRightIcon } from './components/Icons';

// --- Sub-components ---

const NavLink: React.FC<{ 
  id: SectionId; 
  label: string; 
  active: boolean; 
  onClick: (id: SectionId) => void 
}> = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`text-sm font-bold tracking-widest transition-all duration-300 flex items-center gap-3 group ${
      active ? 'text-primary' : 'text-secondary hover:text-accent'
    }`}
  >
    <span className={`h-[2px] transition-all duration-300 ${active ? 'w-12 bg-accent' : 'w-6 bg-secondary/30 group-hover:w-10 group-hover:bg-accent/60'}`}></span>
    {label}
  </button>
);

const Section: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  id?: string;
}> = ({ title, children, className, id }) => (
  <section id={id} className={`mb-20 md:mb-32 scroll-mt-24 ${className}`}>
    <div className="flex items-center gap-4 mb-8 sticky top-0 bg-background/90 backdrop-blur-md py-4 z-10 lg:static lg:bg-transparent lg:p-0 lg:z-auto">
       <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary italic relative">
        {title}
        <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-accent to-transparent opacity-30 rounded-full"></span>
      </h2>
      <span className="h-[1px] flex-1 bg-secondary/10 lg:hidden"></span>
    </div>
    {children}
  </section>
);

const ExperienceCard: React.FC<{
  role: string;
  company: string;
  period: string;
  description: string[];
  tech?: string[];
}> = ({ role, company, period, description, tech }) => (
  <div className="glass glass-hover rounded-xl p-6 transition-all duration-300 mb-4 group border-l-4 border-l-transparent hover:border-l-accent">
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
      <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors font-serif">{role}</h3>
      <span className="text-xs font-mono text-secondary/70 uppercase tracking-wider mt-1 sm:mt-0 bg-white/50 px-2 py-0.5 rounded-full">{period}</span>
    </div>
    <div className="text-accent font-medium mb-4 text-sm tracking-wide">{company}</div>
    <ul className="space-y-2.5 mb-5">
      {description.map((item, idx) => (
        <li key={idx} className="text-secondary text-sm leading-relaxed flex items-start gap-2.5">
          <span className="mt-2 min-w-[4px] h-[4px] rounded-full bg-accent/40"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
    {tech && (
      <div className="flex flex-wrap gap-2 mt-4">
        {tech.map((t) => (
          <span key={t} className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100 group-hover:border-teal-200 transition-colors">
            {t}
          </span>
        ))}
      </div>
    )}
  </div>
);

const ProjectCard: React.FC<{
  title: string;
  description: string[];
  techStack: string[];
}> = ({ title, description, techStack }) => (
  <div className="glass glass-hover rounded-xl p-6 transition-all duration-300 flex flex-col h-full group">
    <h3 className="text-lg font-bold text-primary mb-3 font-serif group-hover:text-accent transition-colors flex items-center gap-2">
      {title}
      <ArrowRightIcon className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent" />
    </h3>
    <div className="flex-1">
      <ul className="space-y-2 mb-6">
        {description.map((item, idx) => (
          <li key={idx} className="text-sm text-secondary leading-relaxed">
             {item}
          </li>
        ))}
      </ul>
    </div>
    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-secondary/5">
      {techStack.map((tech) => (
        <span key={tech} className="text-xs font-mono text-accent/90 bg-accent/5 px-2 py-1 rounded border border-accent/10">
          {tech}
        </span>
      ))}
    </div>
  </div>
);

const ChatInterface: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void 
}> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm Jiajun's virtual assistant. I can answer questions about his background, skills, and experience.", timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToGemini(messages, input);
    
    const botMsg: Message = { role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[90vw] md:w-[400px] h-[500px] bg-white/90 backdrop-blur-xl border border-white/50 shadow-glass rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 ring-1 ring-white/60">
      <div className="bg-teal-50/80 p-4 flex justify-between items-center border-b border-teal-100/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="font-serif font-medium text-primary italic">Jiajun's Assistant</span>
        </div>
        <button onClick={onClose} className="text-secondary hover:text-primary transition-colors bg-white/50 p-1 rounded-full">
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-teal-100 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-accent text-white rounded-br-sm' 
                : 'bg-white text-primary border border-teal-50 shadow-sm rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-teal-50 text-secondary rounded-2xl p-3 rounded-bl-sm text-xs flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-teal-50/50 border-t border-teal-100/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about my experience..."
            className="flex-1 bg-white border border-teal-100 rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-secondary/40"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-accent text-white p-2 rounded-xl hover:bg-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/10 hover:shadow-lg hover:shadow-accent/20"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.ABOUT);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Initialize with the value from constants
  const [imgSrc, setImgSrc] = useState(RESUME_DATA.avatarUrl);

  // Watch for changes in RESUME_DATA (useful during development)
  useEffect(() => {
    setImgSrc(RESUME_DATA.avatarUrl);
  }, []);

  // Scroll spy to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.values(SectionId);
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-monet font-sans selection:bg-accent-light selection:text-primary relative overflow-x-hidden">
      {/* Abstract Water Lily Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         {/* Large soft green/blue blobs */}
         <div className="absolute top-[-5%] right-[0%] w-[600px] h-[600px] bg-water-blue/30 rounded-full blur-[100px] mix-blend-multiply"></div>
         <div className="absolute bottom-[0%] left-[-5%] w-[700px] h-[700px] bg-leaf-green/20 rounded-full blur-[120px] mix-blend-multiply"></div>
         <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] bg-accent-light/30 rounded-full blur-[80px] mix-blend-multiply"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:flex lg:justify-between lg:gap-20 relative z-10">
        
        {/* Left Column: Fixed Info (Desktop) */}
        <header className="lg:fixed lg:w-1/3 lg:h-[calc(100vh-10rem)] lg:flex lg:flex-col lg:justify-between mb-16 lg:mb-0">
          <div>
            <div className="mb-10">
              {/* Profile Picture Container - Monet Style Frame */}
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto lg:mx-0 mb-8 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-leaf-green via-water-blue to-accent blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-700 animate-pulse-slow"></div>
                <div className="absolute inset-1 bg-white rounded-full z-10 flex items-center justify-center overflow-hidden border-4 border-white shadow-glass">
                   <img 
                      src={imgSrc} 
                      onError={() => setImgSrc("https://ui-avatars.com/api/?name=Jiajun+Wang&background=bae6fd&color=134e4a&size=256")}
                      alt="Jiajun Wang" 
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                   />
                </div>
                {/* Decorative flower accent */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full z-20 flex items-center justify-center shadow-md">
                   <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                     <div className="w-3 h-3 bg-accent rounded-full"></div>
                   </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-primary mb-3 drop-shadow-sm">{RESUME_DATA.name}</h1>
              <h2 className="text-xl text-accent font-medium mb-6 tracking-wide italic">{RESUME_DATA.title}</h2>
              <p className="text-secondary leading-relaxed max-w-sm mb-8 text-base">
                {RESUME_DATA.summary}
              </p>
            </div>

            <nav className="hidden lg:block space-y-4 mb-12">
              <NavLink id={SectionId.ABOUT} label="ABOUT" active={activeSection === SectionId.ABOUT} onClick={scrollToSection} />
              <NavLink id={SectionId.EXPERIENCE} label="EXPERIENCE" active={activeSection === SectionId.EXPERIENCE} onClick={scrollToSection} />
              <NavLink id={SectionId.PROJECTS} label="PROJECTS" active={activeSection === SectionId.PROJECTS} onClick={scrollToSection} />
              <NavLink id={SectionId.SKILLS} label="SKILLS" active={activeSection === SectionId.SKILLS} onClick={scrollToSection} />
            </nav>
          </div>

          <div className="flex items-center gap-6 text-secondary/70">
            <a href={RESUME_DATA.contact.github} target="_blank" rel="noreferrer" className="hover:text-accent hover:-translate-y-1 transition-all duration-300">
              <GithubIcon className="w-6 h-6" />
            </a>
            <a href={RESUME_DATA.contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent hover:-translate-y-1 transition-all duration-300">
              <LinkedinIcon className="w-6 h-6" />
            </a>
            <a href={`mailto:${RESUME_DATA.contact.email}`} className="hover:text-accent hover:-translate-y-1 transition-all duration-300">
              <MailIcon className="w-6 h-6" />
            </a>
          </div>
        </header>

        {/* Right Column: Scrollable Content */}
        <main className="lg:w-1/2 lg:ml-auto pt-4">
          
          {/* About Section (Mobile Only view) */}
          <section id={SectionId.ABOUT} className="mb-20 md:mb-32 lg:hidden">
             <div className="glass rounded-xl p-6 border-l-4 border-l-accent">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4">About</h3>
                <p className="text-secondary leading-relaxed">
                  {RESUME_DATA.summary}
                </p>
             </div>
          </section>

          {/* Experience Section */}
          <Section id={SectionId.EXPERIENCE} title="Experience">
            <div className="space-y-6">
              {RESUME_DATA.experience.map((job, idx) => (
                <ExperienceCard key={idx} {...job} />
              ))}
            </div>
          </Section>

          {/* Projects Section */}
          <Section id={SectionId.PROJECTS} title="Projects">
            <div className="grid gap-6">
              {RESUME_DATA.projects.map((project, idx) => (
                <ProjectCard key={idx} {...project} />
              ))}
            </div>
          </Section>

          {/* Skills Section */}
          <Section id={SectionId.SKILLS} title="Skills">
             <div className="glass rounded-xl p-8 space-y-10 border border-white/60">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {RESUME_DATA.skills.languages.map(skill => (
                      <span key={skill} className="text-primary/80 bg-white/50 px-3 py-1.5 rounded-md text-sm border border-white hover:border-accent/30 hover:bg-white transition-all duration-300 shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    Frameworks & Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[...RESUME_DATA.skills.frameworks, ...RESUME_DATA.skills.tools].map(skill => (
                      <span key={skill} className="text-primary/80 bg-white/50 px-3 py-1.5 rounded-md text-sm border border-white hover:border-accent/30 hover:bg-white transition-all duration-300 shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
             </div>
          </Section>
          
        </main>
      </div>

      {/* Chat Bot Trigger */}
      <button
        onClick={() => setIsChatOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-500 z-40 flex items-center gap-2 border border-white/40 ${
          isChatOpen ? 'bg-white text-secondary rotate-90 opacity-0 pointer-events-none scale-75' : 'bg-accent text-white hover:bg-accent-dim hover:scale-110 shadow-accent/30'
        }`}
      >
        <SparklesIcon className="w-6 h-6 animate-pulse" />
      </button>

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}