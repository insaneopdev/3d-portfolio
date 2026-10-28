import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, Search, X } from 'lucide-react';
import Scene3D, { ProjectPreview } from './Scene3D.jsx';
import InteractiveOrbit from './InteractiveOrbit.jsx';
import './project-overlays.css';
import portfolioLogo from '../Portfolio Logo.png';

const projects = [
  { id: 'sand', number: '01', name: 'SandScope', category: 'AI / COASTAL INTELLIGENCE', year: 'SIH ’25', description: 'Turning shoreline imagery into meaningful coastal signals, from boundary detection to sand-grain size estimation.', details: 'SandScope explores how shoreline imagery can be transformed into measurable coastal insights. The pipeline estimates sand-grain size from images and combines image-based predictions with environmental attributes to support coastal monitoring and understanding of erosion patterns.', stack: ['Python', 'Machine learning', 'OpenCV', 'Image processing', 'Hardware integration'], result: 'Shoreline analysis and sand-attribute detection', accent: '#5a56e8', model: 'shoreline', type: 'Featured project' },
  { id: 'vision', number: '02', name: 'VisionGuard', category: 'REAL-TIME AI / INDUSTRIAL SAFETY', year: 'DELPHI TVS', description: 'A vision-language safety monitoring system for detecting PPE compliance through existing CCTV infrastructure.', details: 'The safety surveillance workflow analyses frames to detect protective equipment such as helmets, goggles, masks, and vests. Multi-frame temporal verification helps reduce false positives, with industrial hardware and PLC/Modbus integration explored for safety alerts.', stack: ['Python', 'PyTorch', 'OpenCV', 'Vision-language models', 'PLC / Modbus'], result: 'Industrial AI / ML internship project', accent: '#ee785b', model: 'helmet', type: 'Featured project' },
  { id: 'blind', number: '03', name: 'BlindSight', category: 'ASSISTIVE TECHNOLOGY', year: 'HACKATHON PROJECT', description: 'Smart glasses exploring context-aware navigation, scene descriptions, and obstacle awareness.', details: 'A wearable smart-glasses concept using vision-language models to describe scenes and detect obstacles. It combines macro-navigation with map routing and micro-navigation for obstacle avoidance to support more independent mobility.', stack: ['Python', 'OpenCV', 'Vision-language models', 'Maps API', 'Sensor fusion'], result: '1st place at a hackathon', accent: '#609b56', model: 'glasses', type: 'Featured project' },
  { id: 'ariv', number: '04', name: 'ARIV.AI', category: 'AI / AUDIO AUTHENTICITY', year: 'PRODUCT CONCEPT', description: 'A phone-first concept for detecting potential AI-generated voice clones during calls.', details: 'ARIV.AI explores real-time call-audio analysis with clear safety signals and a reviewable record of analysed audio. It is presented as a product concept rather than a claim of a deployed detection service.', stack: ['AI audio analysis', 'Machine learning', 'Real-time processing', 'Mobile UX'], result: 'Voice authenticity product concept', accent: '#8b68ce', model: 'audio', type: 'AI / Product' },
  { id: 'power', number: '05', name: 'Power Insights Dashboard', category: 'DATA / INDUSTRIAL INSIGHTS', year: 'DELPHI TVS', description: 'An analytics dashboard that makes energy data easier to interpret across departments.', details: 'The platform processes heterogeneous energy spreadsheets with automatic schema detection and presents interactive trends, peak-usage patterns, and department-level comparisons to support energy analysis.', stack: ['Python', 'Pandas', 'Excel automation', 'Data visualisation', 'Web development'], result: 'Industrial analytics dashboard', accent: '#3d91a0', model: 'dashboard', type: 'Data / Dashboard' },
  { id: 'co2', number: '06', name: 'CO₂ Safety Checklist', category: 'MOBILE / INDUSTRIAL SAFETY', year: 'DELPHI TVS', description: 'A Flutter inspection workflow with AI-assisted safety checklist validation.', details: 'The mobile inspection experience supports checklist verification using image recognition. The workflow includes offline-first operation, cloud synchronisation, timestamped records, and compliance reporting.', stack: ['Flutter', 'Dart', 'Computer vision', 'AI image recognition', 'Cloud sync'], result: 'Mobile safety application', accent: '#b7854b', model: 'checklist', type: 'Mobile / Safety' },
  { id: 'induction', number: '07', name: 'Safety Induction Website', category: 'WEB / LEARNING EXPERIENCE', year: 'DELPHI TVS', description: 'A digital training experience for safety induction and workforce readiness.', details: 'A structured website concept for delivering essential safety training information. The internship work also involved training workflows, assessment modules, performance tracking, and multilingual experience considerations.', stack: ['HTML', 'CSS', 'JavaScript', 'Web development', 'SQL'], result: 'Safety training web experience', accent: '#568c69', model: 'browser', type: 'Web / Learning' },
  { id: 'wow', number: '08', name: 'WoWSQL Web Products', category: 'SOFTWARE / WEB ENGINEERING', year: 'CURRENT ROLE', description: 'Full-stack product engineering work connected to wowfolio.in and wowcare.pro.', details: 'Ongoing software engineering work across responsive interfaces, APIs, relational data, authentication, and product maintenance. This project represents the broader product-engineering work without attributing unverified features to either site.', stack: ['React', 'Node.js', 'REST APIs', 'SQL', 'Git'], result: 'Full-stack product engineering', accent: '#5279bd', model: 'webproducts', type: 'Web / Product' },
  { id: 'vr', number: '09', name: 'Resilience X VR', category: 'VR / EMERGENCY TRAINING', year: 'SIMULATION', description: 'An immersive VR simulation concept for practicing emergency and crisis responses.', details: 'A virtual environment for rehearsing emergency scenarios and decision-making under pressure, with interactive situations and realistic environment design.', stack: ['Godot Engine', 'Virtual reality', 'Simulation design', '3D modelling'], result: 'VR training simulation', accent: '#c06c9a', model: 'vr', type: 'VR / Simulation' },
];

const featured = projects.slice(0, 3);
const archive = projects.slice(3);
const experience = [
  { role: 'Software Engineer Intern', company: 'WoWSQL', period: 'Mar 2026 – Aug 2026', text: 'Full-stack web product development, responsive interfaces, backend APIs, relational databases, and ongoing product maintenance.' },
  { role: 'AI & ML / IIoT Intern', company: 'Delphi TVS', period: 'Dec 2025 – Jan 2026', text: 'Industrial safety AI, energy analytics, mobile automation, and integration concepts for industrial alert workflows.' },
];

function ProjectArt({ project, large = false }) {
  return (
    <div className={`project-art project-art-${project.model}${large ? ' project-art-large' : ''}`} style={{ '--project-accent': project.accent }} aria-hidden="true">
      <ProjectPreview project={project} />
    </div>
  );
}

function ProjectDialog({ project, onClose, archiveOrigin }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="project-modal-backdrop project-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" style={{ '--project-accent': project.accent }}>
        <header className="project-modal-top">
          <span>{project.number} / PROJECT FILE {archiveOrigin ? '· ARCHIVE' : ''}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close project details"><X size={17} /></button>
        </header>
        <div className="project-modal-hero">
          <ProjectArt project={project} large />
          <div className="project-modal-heading">
            <span className="project-modal-category">{project.category}</span>
            <h2 id="project-dialog-title">{project.name}</h2>
            <p>{project.description}</p>
            <span className="project-outcome">{project.result}</span>
          </div>
        </div>
        <div className="project-modal-body">
          <div>
            <span className="section-eyebrow">01 — THE IDEA</span>
            <p className="project-modal-details">{project.details}</p>
          </div>
          <div>
            <span className="section-eyebrow">02 — STACK & TOOLS</span>
            <div className="project-stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </div>
        <footer className="project-modal-footer">
          <span>{project.year}</span>
          <span>INTERACTIVE 3D OBJECT · DRAG TO ROTATE</span>
        </footer>
      </section>
    </div>
  );
}

function MoreProjectsDialog({ items, onSelect, onClose, detailOpen }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !detailOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, detailOpen]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((project) => [project.name, project.category, project.description, project.stack.join(' ')].join(' ').toLowerCase().includes(needle));
  }, [items, query]);

  return (
    <div className="project-modal-backdrop archive-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="more-projects-modal" role="dialog" aria-modal="true" aria-labelledby="archive-title">
        <header className="project-modal-top">
          <span>PROJECT ARCHIVE / {String(items.length).padStart(2, '0')} PROJECTS</span>
          <button className="modal-close" onClick={onClose} aria-label="Close project archive"><X size={17} /></button>
        </header>
        <div className="archive-heading">
          <div>
            <span className="section-eyebrow">A FEW MORE THINGS I’VE BUILT</span>
            <h2 id="archive-title">Beyond the surface<span>.</span></h2>
            <p>Choose a project to inspect its dedicated 3D model, story, and stack.</p>
          </div>
          <label className="archive-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" aria-label="Search projects" />
          </label>
        </div>
        <div className="archive-grid">
          {filtered.map((project) => (
            <button className="archive-card" key={project.id} onClick={() => onSelect(project)} style={{ '--project-accent': project.accent }}>
              <div className="archive-card-art"><ProjectPreview project={project} compact /></div>
              <div className="archive-card-copy">
                <span>{project.number} · {project.category}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="archive-card-bottom">
                  <span>{project.stack.slice(0, 2).join(' / ')}</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p className="archive-empty">No projects match “{query}”. Try another keyword.</p>}
        <footer className="archive-footer">
          <span>SELECT A CARD TO OPEN ITS PROJECT FILE</span>
          <span>THE ARCHIVE STAYS OPEN WHILE YOU EXPLORE</span>
        </footer>
      </section>
    </div>
  );
}

export default function App() {
  const [activeProject, setActiveProject] = useState(featured[0]);
  const [detailProject, setDetailProject] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showProject = (project) => {
    setActiveProject(project);
    setDetailProject(project);
  };
  const closeDetail = () => setDetailProject(null);
  const closeArchive = () => setArchiveOpen(false);

  return (
    <main className="portfolio-shell">
      <nav className="site-nav">
        <a href="#top" className="brand-mark" aria-label="Raghul Sah — home"><img src={portfolioLogo} alt="Raghul Sah" /></a>
        <div className={`nav-links${mobileMenuOpen ? ' nav-links-open' : ''}`}>
          <a href="#work" onClick={() => setMobileMenuOpen(false)}>Work</a>
          <a href="#experience" onClick={() => setMobileMenuOpen(false)}>Experience</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        </div>
        <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen}>
          <span /><span />
        </button>
        <a className="nav-availability" href="mailto:raghulsah@gmail.com"><i /> OPEN TO OPPORTUNITIES</a>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <span className="section-eyebrow"><i className="eyebrow-dot" /> AI & DS · ENGINEERING · 3D</span>
          <h1>Building ideas<br />that <em>move</em> worlds<span>.</span></h1>
          <p className="hero-intro">I’m Raghul — an AI & Data Science student blending intelligent systems, full-stack engineering, and immersive 3D experiences.</p>
          <div className="hero-actions">
            <a className="button-primary" href="#work">Explore selected work <ArrowDownRight size={16} /></a>
            <a className="button-text" href="https://github.com/insaneopdev" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
          </div>
          <div className="hero-index"><span>01 — SELECTED PROJECTS</span><span>SCROLL TO EXPLORE ↓</span></div>
        </div>
        <div className="hero-scene">
          <div className="scene-frame">
            <div className="scene-topline"><span><i /> LIVE 3D OBJECTS</span><span>{activeProject.number} — {String(projects.length).padStart(2, '0')}</span></div>
            <Scene3D project={activeProject} onProjectSelect={showProject} onProjectChange={setActiveProject} />
            <button className="scene-focus-card" onClick={() => showProject(activeProject)} style={{ '--project-accent': activeProject.accent }}>
              <span className="focus-kicker"><i /> CURRENTLY EXPLORING</span>
              <strong>{activeProject.name}</strong>
              <span className="focus-category">{activeProject.category}</span>
              <span className="focus-cta">OPEN PROJECT FILE <ArrowUpRight size={13} /></span>
            </button>
            <div className="scene-caption">ROTATE THE OBJECT · CLICK TO DISCOVER</div>
          </div>
          <div className="scene-side-note">INTERACTIVE PLAYGROUND / R.S.</div>
        </div>
      </section>

      <section className="work-section section-wrap" id="work">
        <div className="section-heading">
          <div><span className="section-eyebrow">01 / SELECTED WORK</span><h2>Ideas, made <em>tangible.</em></h2></div>
          <p>Each project is a different problem, shape, and way of thinking. Select one to inspect the work in 3D.</p>
        </div>
        <div className="featured-grid">
          {featured.map((project) => (
            <button className={`featured-card${activeProject.id === project.id ? ' is-active' : ''}`} key={project.id} onClick={() => { setActiveProject(project); showProject(project); }} style={{ '--project-accent': project.accent }}>
              <div className="featured-art">
                <ProjectPreview project={project} compact />
                <span className="featured-number">{project.number}</span>
                <span className="featured-open"><ArrowUpRight size={17} /></span>
              </div>
              <div className="featured-card-text">
                <span>{project.category}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div>{project.stack.slice(0, 3).map((item) => <small key={item}>{item}</small>)}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="more-projects-row">
          <div><span className="section-eyebrow">THE REST OF THE LAB</span><p>More prototypes, tools, and product work.</p></div>
          <button className="button-primary" onClick={() => setArchiveOpen(true)}>More Projects <ArrowUpRight size={16} /></button>
        </div>
      </section>

      <section className="experience-section section-wrap" id="experience">
        <div className="section-heading">
          <div><span className="section-eyebrow">02 / EXPERIENCE</span><h2>From prototype<br />to <em>production.</em></h2></div>
          <p>Work across applied AI, industrial automation, analytics, and full-stack product development.</p>
        </div>
        <div className="experience-list">
          {experience.map((item, index) => (
            <article className="experience-row" key={item.company}>
              <span className="experience-index">0{index + 1}</span>
              <div><h3>{item.role}</h3><span>{item.company}</span></div>
              <p>{item.text}</p>
              <time>{item.period}</time>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section section-wrap" id="about">
        <InteractiveOrbit />
        <div>
          <span className="section-eyebrow">03 / A LITTLE ABOUT ME</span>
          <h2>Curious by default.<br /><em>Builder by nature.</em></h2>
          <p>I enjoy turning complex ideas into experiences people can understand and use — from computer-vision pipelines and industrial dashboards to assistive technology and interactive 3D spaces.</p>
          <div className="skill-tags">{['Python', 'Computer Vision', 'PyTorch', 'React', 'Node.js', 'SQL', 'Flutter', 'Godot', 'Blender', '3D Interaction'].map((skill) => <span key={skill}>{skill}</span>)}</div>
        </div>
      </section>

      <footer className="contact-section section-wrap" id="contact">
        <div>
          <span className="section-eyebrow">04 / YOUR TURN</span>
          <h2>Have a good<br /><em>problem to solve?</em></h2>
          <a className="contact-email" href="mailto:raghulsah@gmail.com">Let’s talk <ArrowUpRight size={18} /></a>
        </div>
        <div className="contact-side">
          <p>Open to opportunities, collaborations, and ambitious ideas.</p>
          <a href="mailto:raghulsah@gmail.com"><Mail size={16} /> raghulsah@gmail.com</a>
          <a href="https://github.com/insaneopdev" target="_blank" rel="noreferrer"><Github size={16} /> github.com/insaneopdev</a>
          <a href="https://linkedin.com/in/raghulsah" target="_blank" rel="noreferrer"><Linkedin size={16} /> linkedin.com/in/raghulsah</a>
          <span className="copyright">© 2026 RAGHUL SAH VRT · BUILT WITH CURIOSITY</span>
        </div>
      </footer>

      {archiveOpen && <MoreProjectsDialog items={archive} onClose={closeArchive} detailOpen={Boolean(detailProject)} onSelect={(project) => { setActiveProject(project); setDetailProject(project); }} />}
      {detailProject && <ProjectDialog project={detailProject} onClose={closeDetail} archiveOrigin={archiveOpen && archive.some((project) => project.id === detailProject.id)} />}
    </main>
  );
}
