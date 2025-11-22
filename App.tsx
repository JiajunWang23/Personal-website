import React, { useState, useEffect, useRef } from 'react';
import { RESUME_DATA } from './constants';
import { SectionId, Message } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { GithubIcon, LinkedinIcon, MailIcon, SendIcon, ArrowRightIcon } from './components/Icons';

// --- Utility Components ---

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ 
  children, 
  className = "",
  delay = 0 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div 
      ref={ref}
      className={`transform transition-all duration-700 ${className} 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const TypewriterText: React.FC<{ text: string; className?: string; speed?: number }> = ({ text, className, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="cursor-blink"></span>}
    </span>
  );
};

// --- Terminal UI Components ---

const TerminalCard: React.FC<{ 
  children: React.ReactNode; 
  title: string; 
  className?: string; 
  delay?: number;
  isCode?: boolean;
}> = ({ children, title, className, delay = 0, isCode = false }) => {
  return (
    <Reveal delay={delay}>
      <div className={`bg-surface border border-term-green/30 relative group ${className}`}>
        {/* Corner Decorations */}
        <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-term-green"></div>
        <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-term-green"></div>
        <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-term-green"></div>
        <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-term-green"></div>

        {/* Header Bar */}
        <div className="bg-term-green/10 border-b border-term-green/30 p-2 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
             <div className="flex gap-1.5 ml-1">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
             </div>
             <span className="ml-3 text-xs text-term-green font-bold tracking-wider uppercase">{title}</span>
          </div>
          <div className="text-[10px] text-term-gray">utf-8</div>
        </div>

        {/* Content */}
        <div className={`p-6 ${isCode ? 'font-mono text-sm' : ''}`}>
          {children}
        </div>
      </div>
    </Reveal>
  );
};

const NavLink: React.FC<{ 
  id: SectionId; 
  label: string; 
  active: boolean; 
  onClick: (id: SectionId) => void 
}> = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`
      w-full text-left py-2 px-4 transition-all duration-200 font-mono text-sm group flex items-center
      ${active ? 'bg-term-green/20 text-term-green border-l-2 border-term-green' : 'text-term-gray hover:text-white hover:bg-white/5 border-l-2 border-transparent'}
    `}
  >
    <span className="mr-2 opacity-50 text-xs">{active ? '>' : '#'}</span>
    <span className={active ? 'text-glow' : ''}>{label}</span>
    {active && <span className="ml-auto text-xs animate-pulse">_</span>}
  </button>
);

const CodeComment: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-term-gray italic">// {children}</span>
);

const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-term-pink font-bold">{children}</span>
);

const StringVal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-yellow-200">"{children}"</span>
);

const FuncName: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-term-cyan">{children}</span>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.ABOUT);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "System initialized. Hello! I am Jiajun's virtual assistant. Execute a query below.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: SectionId) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.values(SectionId);
      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, input);
      const botMessage: Message = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { role: 'model', text: "Error: Connection refused.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-gray-300 font-mono relative">
      {/* Background Grid */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - System Info */}
        <header className="lg:col-span-3 lg:sticky lg:top-12 h-fit flex flex-col gap-8">
          <Reveal>
            <div className="bg-surface border border-term-gray/20 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-term-green"></div>
              
              {/* Avatar - Always Color */}
              <div className="relative w-32 h-32 mb-6 mx-auto group">
                <div className="absolute inset-0 rounded-full border-2 border-term-green border-dashed animate-[spin_10s_linear_infinite] opacity-50"></div>
                <img 
                  src={RESUME_DATA.avatarUrl} 
                  alt={RESUME_DATA.name} 
                  className="relative w-full h-full object-cover rounded-full border border-term-green/50 z-10 p-1 bg-black"
                />
                {/* Scanning line over avatar */}
                <div className="absolute inset-0 z-20 overflow-hidden rounded-full pointer-events-none opacity-30">
                   <div className="w-full h-[20%] bg-term-green/40 blur-md absolute top-0 animate-[scan_2s_linear_infinite]"></div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 glitch" data-text="JIAJUN WANG">
                  JIAJUN WANG
                </h1>
                <div className="text-xs text-term-green tracking-widest uppercase mb-4">
                  [ SYSTEM ONLINE ]
                </div>
                <p className="text-sm text-term-gray">
                  {RESUME_DATA.title}<br/>
                  <span className="text-[10px]">{RESUME_DATA.contact.location}</span>
                </p>
              </div>
              
              <div className="flex justify-center gap-4 pt-4 border-t border-white/10">
                <a href={RESUME_DATA.contact.github} target="_blank" rel="noopener noreferrer" className="text-term-gray hover:text-term-green transition-colors">
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a href={RESUME_DATA.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-term-gray hover:text-term-cyan transition-colors">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a href={`mailto:${RESUME_DATA.contact.email}`} className="text-term-gray hover:text-term-pink transition-colors">
                  <MailIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </Reveal>

          <nav className="hidden lg:block bg-surface border border-term-gray/20 py-4">
            <div className="px-4 pb-2 text-xs text-term-gray uppercase tracking-wider font-bold mb-2">Directory</div>
            <NavLink id={SectionId.ABOUT} label="./about.md" active={activeSection === SectionId.ABOUT} onClick={scrollToSection} />
            <NavLink id={SectionId.EXPERIENCE} label="./experience.log" active={activeSection === SectionId.EXPERIENCE} onClick={scrollToSection} />
            <NavLink id={SectionId.PROJECTS} label="./projects.json" active={activeSection === SectionId.PROJECTS} onClick={scrollToSection} />
            <NavLink id={SectionId.SKILLS} label="./skills.conf" active={activeSection === SectionId.SKILLS} onClick={scrollToSection} />
          </nav>
        </header>

        {/* Right Content - Main Terminal Area */}
        <main className="lg:col-span-9 space-y-16 pb-24">
          
          {/* Hero Chat Section */}
          <section className="min-h-[50vh] flex flex-col">
            <TerminalCard title="bash — Jiajun's Assistant" className="h-[500px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-sm mb-4 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className="flex gap-2">
                    <span className={`shrink-0 font-bold select-none ${msg.role === 'user' ? 'text-term-pink' : 'text-term-green'}`}>
                      {msg.role === 'user' ? 'visitor@uiuc:~$' : 'sys@jiajun:~>'}
                    </span>
                    <div className={`${msg.role === 'model' ? 'text-gray-300' : 'text-white'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                   <div className="flex gap-2">
                      <span className="text-term-green shrink-0 font-bold">sys@jiajun:~{'>'}</span>
                      <span className="animate-pulse">Processing...</span>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-term-gray/30 pt-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <span className="text-term-pink font-bold">visitor@uiuc:~$</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="sudo ask about_experience"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-700 font-mono"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="text-term-green hover:text-white disabled:opacity-30"
                  >
                    <ArrowRightIcon />
                  </button>
                </form>
              </div>
            </TerminalCard>
          </section>

          {/* Scrolling Binary Decoration */}
          <div className="overflow-hidden opacity-20 font-mono text-xs text-term-green whitespace-nowrap select-none">
             01001010 01001001 01000001 01001010 01010101 01001110 00100000 01010111 01000001 01001110 01000111 00100000 01010011 01001111 01000110 01010100 01010111 01000001 01010010 01000101 00100000 01000101 01001110 01000111 01001001 01001110 01000101 01000101 01010010
          </div>

          {/* About Section */}
          <section id={SectionId.ABOUT} className="scroll-mt-24">
            <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
              <span className="text-term-green">01.</span> 
              <TypewriterText text="cat about.md" />
            </h2>
            
            <TerminalCard title="about.md">
              <div className="space-y-4 text-gray-300 leading-relaxed">
                 <p>{RESUME_DATA.summary}</p>
                 <br/>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black/30 p-4 border-l-2 border-term-cyan">
                       <h3 className="text-term-cyan font-bold mb-2 text-xs uppercase">Class Education</h3>
                       <p className="text-white">{RESUME_DATA.education.institution}</p>
                       <p className="text-sm text-gray-500">{RESUME_DATA.education.degree}</p>
                       <p className="text-xs text-gray-600 mt-1">{RESUME_DATA.education.period} // GPA: {RESUME_DATA.education.gpa}</p>
                    </div>
                    <div className="bg-black/30 p-4 border-l-2 border-term-pink">
                       <h3 className="text-term-pink font-bold mb-2 text-xs uppercase">Array&lt;Coursework&gt;</h3>
                       <div className="flex flex-wrap gap-2">
                          {RESUME_DATA.education.courses.slice(0, 6).map((course, i) => (
                             <span key={i} className="text-xs bg-term-pink/10 text-term-pink px-1.5 py-0.5 rounded">
                                {course}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </TerminalCard>
          </section>

          {/* Experience Section */}
          <section id={SectionId.EXPERIENCE} className="scroll-mt-24">
            <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
              <span className="text-term-green">02.</span> 
              <TypewriterText text="tail -f experience.log" />
            </h2>

            <div className="space-y-6">
              {RESUME_DATA.experience.map((exp, index) => (
                <TerminalCard key={index} title={`log_entry_${index}.txt`} className="border-l-4 border-l-term-green" delay={index * 100}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-1">
                    <div>
                      <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                      <div className="text-term-green">@ {exp.company}</div>
                    </div>
                    <div className="text-xs bg-term-gray/20 px-2 py-1 rounded text-gray-400 font-mono">
                      [{exp.period}]
                    </div>
                  </div>
                  
                  <div className="font-mono text-sm space-y-2 border-l border-gray-800 pl-4 ml-1">
                    {exp.description.map((desc, i) => (
                      <div key={i} className="flex gap-2 text-gray-400">
                        <span className="text-term-gray select-none">{'>'}</span>
                        <span>{desc}</span>
                      </div>
                    ))}
                  </div>

                  {exp.tech && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {exp.tech.map((t, i) => (
                        <span key={i} className="text-xs border border-term-gray/40 text-term-gray px-2 py-0.5 rounded hover:border-term-green hover:text-term-green transition-colors cursor-default">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </TerminalCard>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section id={SectionId.PROJECTS} className="scroll-mt-24">
             <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
              <span className="text-term-green">03.</span> 
              <TypewriterText text="ls -la ./projects" />
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {RESUME_DATA.projects.map((project, index) => (
                <TerminalCard key={index} title={`${project.title.replace(/\s+/g, '_').toLowerCase()}.js`} isCode={true} delay={index * 100}>
                  <div className="text-sm leading-relaxed overflow-x-auto">
                    <div><Keyword>const</Keyword> <FuncName>project</FuncName> = <Keyword>new</Keyword> <FuncName>Project</FuncName>({'{'}</div>
                    <div className="pl-4">
                      <div>name: <StringVal>{project.title}</StringVal>,</div>
                      <div>stack: [<StringVal>{project.techStack.join('", "')}</StringVal>],</div>
                      <div>features: [</div>
                      {project.description.map((desc, i) => (
                        <div key={i} className="pl-4 text-gray-400">
                          <StringVal>"{desc}"</StringVal>,
                        </div>
                      ))}
                      <div>]</div>
                    </div>
                    <div>{'}'});</div>
                  </div>
                </TerminalCard>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          <section id={SectionId.SKILLS} className="scroll-mt-24">
            <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
              <span className="text-term-green">04.</span> 
              <TypewriterText text="cat config.json" />
            </h2>

            <TerminalCard title="config.json" isCode={true}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <CodeComment>Backend & Languages</CodeComment>
                    <ul className="space-y-2 mt-2">
                      {RESUME_DATA.skills.languages.map((skill, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                          <span className="text-term-pink">def</span> {skill}()
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <CodeComment>Libraries & Tools</CodeComment>
                    <ul className="space-y-2 mt-2">
                      {[...RESUME_DATA.skills.frameworks, ...RESUME_DATA.skills.tools].map((skill, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                           <span className="text-term-cyan">import</span> {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>
            </TerminalCard>
          </section>

          {/* Footer */}
          <footer className="pt-12 flex flex-col items-center justify-center text-center gap-4 border-t border-term-gray/20">
             <div className="text-term-green text-sm">
                --- END OF LINE ---
             </div>
             <p className="text-xs text-gray-600">
               © {new Date().getFullYear()} Jiajun Wang. All systems operational.
             </p>
          </footer>

        </main>
      </div>
    </div>
  );
}

export default App;