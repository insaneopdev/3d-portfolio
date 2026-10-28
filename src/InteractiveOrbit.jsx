import { useState } from 'react';
import './interactive-orbit.css';

const SPECIMENS = [
  {
    id: 'sand',
    number: '01',
    tab: 'COAST',
    name: 'SandScope',
    category: 'COASTAL INTELLIGENCE',
    artLabel: 'SHORELINE / SAMPLE 04',
    visualTitle: 'Illustrated shoreline map with sediment samples and measurement lines',
    summary: 'Read shoreline boundaries and turn sand-grain imagery into useful coastal signals.',
    tags: ['OpenCV', 'IMAGE ANALYSIS'],
    accent: '#5752d8',
  },
  {
    id: 'vision',
    number: '02',
    tab: 'VISION',
    name: 'VisionGuard',
    category: 'INDUSTRIAL SAFETY',
    artLabel: 'PPE / FRAME CHECK',
    visualTitle: 'Illustrated industrial safety frame with helmet and safety detection boxes',
    summary: 'Explore PPE detection and multi-frame checks for more dependable safety signals.',
    tags: ['VISION MODELS', 'PPE'],
    accent: '#d66e51',
  },
  {
    id: 'blind',
    number: '03',
    tab: 'SIGHT',
    name: 'BlindSight',
    category: 'ASSISTIVE TECHNOLOGY',
    artLabel: 'FIELD TEST / 003',
    visualTitle: 'Hand-drawn smart glasses with a navigation route and obstacle markers',
    summary: 'Combine scene descriptions, route guidance, and obstacle awareness in a wearable concept.',
    tags: ['COMPUTER VISION', 'ACCESSIBILITY'],
    accent: '#448675',
  },
  {
    id: 'vr',
    number: '04',
    tab: 'SPATIAL',
    name: 'Resilience X VR',
    category: 'IMMERSIVE SIMULATION',
    artLabel: 'SCENARIO / ROOM 04',
    visualTitle: 'Perspective drawing of a virtual training room with a route and waypoints',
    summary: 'Rehearse emergency decisions inside an interactive virtual training environment.',
    tags: ['GODOT', 'VR SIMULATION'],
    accent: '#a65f91',
  },
];

function SpecimenDrawing({ specimen }) {
  if (specimen.id === 'sand') {
    return (
      <svg className='project-specimen__drawing project-specimen__drawing--sand' viewBox='0 0 260 160' role='img' aria-label={specimen.visualTitle}>
        <rect width='260' height='160' fill='#f1ecdf' />
        {Array.from({ length: 7 }, (_, index) => (
          <path key={`contour-${index}`} d={`M ${-18 + index * 3} ${22 + index * 16} C 50 ${-3 + index * 15}, 99 ${49 + index * 10}, 157 ${20 + index * 15} S 237 ${34 + index * 14}, 282 ${8 + index * 17}`} fill='none' stroke='#c9b9a4' strokeWidth='0.7' opacity='0.75' />
        ))}
        <path d='M0 105 C32 91 55 116 85 104 S142 91 167 106 S221 121 260 99 L260 160 L0 160Z' fill='#d7c49d' />
        <path d='M0 113 C35 100 57 126 91 112 S144 102 174 117 S220 129 260 110' fill='none' stroke='#9e895f' strokeWidth='1.2' />
        <path d='M0 128 C44 117 72 141 109 128 S169 120 204 137 S239 137 260 130' fill='none' stroke='#b09a70' strokeWidth='1' />
        <path d='M0 74 C42 63 63 89 105 75 S176 65 213 79 S242 83 260 75' fill='none' stroke='#6eacbf' strokeWidth='2.4' className='specimen-drawing__wave' />
        <path d='M0 82 C42 72 65 97 105 84 S176 74 213 88 S242 92 260 84' fill='none' stroke='#a3cbd1' strokeWidth='1.3' />
        <path d='M20 51 L92 67 L151 51 L224 64' fill='none' stroke='#7770dd' strokeWidth='1' strokeDasharray='3 4' />
        {[[29, 119, 4], [49, 130, 3], [67, 116, 5], [101, 135, 3], [124, 119, 4], [146, 132, 2.7], [172, 121, 4], [196, 138, 3], [218, 118, 3.5], [237, 132, 2.8]].map(([cx, cy, r], index) => (
          <circle key={`grain-${index}`} cx={cx} cy={cy} r={r} fill={index % 3 === 0 ? '#8b7453' : index % 3 === 1 ? '#bba377' : '#6f9ca0'} stroke='#f0e8d6' strokeWidth='0.8' />
        ))}
        <circle cx='190' cy='43' r='12' fill='none' stroke='#5752d8' strokeWidth='1' />
        <circle cx='190' cy='43' r='3' fill='#5752d8' />
        <path d='M190 25 V34 M190 52 V61 M172 43 H181 M199 43 H208' stroke='#5752d8' strokeWidth='1' />
        <text x='13' y='18' fill='#827967' fontSize='7' letterSpacing='1.2'>TRANSECT / 04</text>
      </svg>
    );
  }

  if (specimen.id === 'vision') {
    return (
      <svg className='project-specimen__drawing project-specimen__drawing--vision' viewBox='0 0 260 160' role='img' aria-label={specimen.visualTitle}>
        <rect width='260' height='160' fill='#e9eee7' />
        <rect x='12' y='13' width='236' height='134' rx='5' fill='#f5f5ee' stroke='#b8c7bb' />
        <path d='M12 32 H248' stroke='#b8c7bb' />
        <circle cx='23' cy='23' r='2' fill='#d66e51' />
        <circle cx='31' cy='23' r='2' fill='#c9b28b' />
        <circle cx='39' cy='23' r='2' fill='#91aea0' />
        <text x='56' y='25.5' fill='#65766a' fontSize='7' letterSpacing='1'>SAFETY FRAME / 0081</text>
        <path d='M66 85 C66 62 77 47 96 47 C115 47 127 62 127 85 L139 91 L135 99 L61 99 L56 91 Z' fill='#e9b84f' stroke='#8d7550' strokeWidth='1.3' />
        <path d='M61 86 Q95 76 133 86' fill='none' stroke='#f9e2a6' strokeWidth='4' />
        <path d='M82 100 L73 117 L77 140 L113 140 L118 117 L108 100' fill='#d66e51' stroke='#a55743' strokeWidth='1.2' />
        <path d='M77 116 L95 126 L113 116' fill='none' stroke='#f7eee2' strokeWidth='3' />
        <rect x='51' y='40' width='92' height='104' fill='none' stroke='#d66e51' strokeWidth='1.5' strokeDasharray='5 3' />
        <path d='M151 55 H222 M151 62 H209 M151 76 H229' stroke='#c3cec0' strokeWidth='2' />
        <rect x='151' y='88' width='76' height='24' rx='3' fill='#e5eee4' stroke='#a7bca9' />
        <circle cx='161' cy='100' r='3' fill='#448675' />
        <text x='169' y='102.5' fill='#426b5c' fontSize='7'>PPE CHECK</text>
        <path d='M151 124 H221' stroke='#c3cec0' strokeWidth='2' />
        <path d='M151 132 H201' stroke='#c3cec0' strokeWidth='2' />
        <path className='specimen-drawing__scanline' d='M17 49 H243' stroke='#d66e51' strokeWidth='1.3' opacity='0.8' />
      </svg>
    );
  }

  if (specimen.id === 'blind') {
    return (
      <svg className='project-specimen__drawing project-specimen__drawing--blind' viewBox='0 0 260 160' role='img' aria-label={specimen.visualTitle}>
        <rect width='260' height='160' fill='#eeecef' />
        <path d='M0 31 H260 M0 63 H260 M0 95 H260 M0 127 H260' stroke='#d9d3dc' strokeWidth='0.7' />
        <path d='M28 108 C62 94 73 77 100 82 S143 117 170 96 S217 65 238 43' fill='none' stroke='#b8d2c2' strokeWidth='8' opacity='0.55' />
        <path className='specimen-drawing__route' d='M28 108 C62 94 73 77 100 82 S143 117 170 96 S217 65 238 43' fill='none' stroke='#448675' strokeWidth='2' strokeDasharray='4 4' />
        <rect x='48' y='46' width='70' height='49' rx='16' fill='#faf8f0' stroke='#344e4a' strokeWidth='3' />
        <rect x='142' y='46' width='70' height='49' rx='16' fill='#faf8f0' stroke='#344e4a' strokeWidth='3' />
        <path d='M118 60 Q130 52 142 60' fill='none' stroke='#344e4a' strokeWidth='4' />
        <path d='M48 59 L32 49 M212 59 L228 49' fill='none' stroke='#344e4a' strokeWidth='3' strokeLinecap='round' />
        <path d='M58 57 H108 M152 57 H202' stroke='#c0d1ca' strokeWidth='1.5' />
        <circle cx='100' cy='82' r='4' fill='#d66e51' stroke='#f6eee3' strokeWidth='1.2' />
        <circle cx='170' cy='96' r='4' fill='#5752d8' stroke='#f6eee3' strokeWidth='1.2' />
        <circle cx='238' cy='43' r='5' fill='#448675' stroke='#f6eee3' strokeWidth='1.5' />
        <text x='13' y='17' fill='#726b76' fontSize='7' letterSpacing='1.2'>WAYFINDING / PATH A</text>
        <text x='15' y='148' fill='#448675' fontSize='7' letterSpacing='1'>SCENE → ROUTE → AWARENESS</text>
      </svg>
    );
  }

  return (
    <svg className='project-specimen__drawing project-specimen__drawing--vr' viewBox='0 0 260 160' role='img' aria-label={specimen.visualTitle}>
      <rect width='260' height='160' fill='#302d40' />
      <path d='M0 122 L130 76 L260 122 L260 160 H0 Z' fill='#454056' />
      <path d='M0 122 L130 76 L260 122 M0 140 L130 76 L260 140 M36 160 L130 76 L224 160 M86 160 L130 76 L174 160' fill='none' stroke='#777188' strokeWidth='0.8' opacity='0.65' />
      <path d='M46 106 L46 37 L130 15 L214 37 L214 106' fill='none' stroke='#8a819c' strokeWidth='1.2' />
      <path d='M91 95 L91 45 L169 45 L169 95' fill='#242333' stroke='#d3b7d0' strokeWidth='2' />
      <path d='M103 95 L103 56 L157 56 L157 95' fill='#555067' stroke='#a78aa5' strokeWidth='1' />
      <path d='M130 95 L130 118 L156 108' fill='none' stroke='#e5a078' strokeWidth='2.5' strokeLinecap='round' />
      <path className='specimen-drawing__route' d='M32 117 L69 128 L96 119 L130 129 L167 112 L208 128 L230 119' fill='none' stroke='#e5a078' strokeWidth='2' strokeDasharray='4 4' />
      <circle cx='32' cy='117' r='4' fill='#e5a078' />
      <circle cx='130' cy='129' r='4' fill='#f2d6a2' />
      <circle cx='230' cy='119' r='4' fill='#a4c9bc' />
      <text x='13' y='17' fill='#d4c6df' fontSize='7' letterSpacing='1.1'>SCENARIO / 04</text>
      <text x='13' y='148' fill='#d4c6df' fontSize='7' letterSpacing='1'>TRAIN · DECIDE · RESPOND</text>
    </svg>
  );
}

export default function ProjectSpecimen() {
  const [activeId, setActiveId] = useState('sand');
  const active = SPECIMENS.find((specimen) => specimen.id === activeId) || SPECIMENS[0];

  return (
    <aside className='project-specimen' aria-label='Interactive project field notes'>
      <div className='project-specimen__header'>
        <span><i aria-hidden='true' /> WORKSHOP NOTES / RS</span>
        <span>FILE 01—04</span>
      </div>

      <div className='project-specimen__paper' style={{ '--specimen-accent': active.accent }}>
        <span className='project-specimen__tape' aria-hidden='true' />
        <div className='project-specimen__paper-head'>
          <span>{active.category}</span>
          <span>{active.number} / 04</span>
        </div>

        <div className='project-specimen__art' key={active.id}>
          <SpecimenDrawing specimen={active} />
          <span className='project-specimen__art-label'>{active.artLabel}</span>
          <span className='project-specimen__art-corner' aria-hidden='true'>RS / LAB</span>
        </div>

        <div className='project-specimen__details' key={`details-${active.id}`} aria-live='polite' aria-atomic='true'>
          <div className='project-specimen__detail-meta'>
            <span>CASE NOTE</span>
            <span>NO. {active.number}</span>
          </div>
          <h3>{active.name}<span>.</span></h3>
          <p>{active.summary}</p>
          <div className='project-specimen__tags'>
            {active.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <a className='project-specimen__browse' href='#work'>
            BROWSE THE PROJECT INDEX <span aria-hidden='true'>↗</span>
          </a>
        </div>
      </div>

      <div className='project-specimen__selector' role='group' aria-label='Select a project field note'>
        {SPECIMENS.map((specimen) => (
          <button
            key={specimen.id}
            type='button'
            className={`project-specimen__tab${active.id === specimen.id ? ' is-active' : ''}`}
            style={{ '--tab-accent': specimen.accent }}
            onClick={() => setActiveId(specimen.id)}
            aria-pressed={active.id === specimen.id}
            aria-label={`Inspect ${specimen.name}`}
          >
            <span>{specimen.number}</span>
            <strong>{specimen.tab}</strong>
          </button>
        ))}
      </div>

      <div className='project-specimen__footnote'>
        <span>SELECT A FIELD NOTE</span>
        <span>{active.number} OF 04 <b aria-hidden='true'>↙</b></span>
      </div>
    </aside>
  );
}
