import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio, Lightbulb, Blinds, Thermometer, Activity, Clock,
  ChevronRight, ChevronDown, X, Zap, Sun, Moon,
  Search, Filter, Maximize2, Download, Settings
} from 'lucide-react';

/* ============================================================
   DATA MODEL — mô phỏng project thực tế
   2 keypad × 4 button × 3 press mode + 1 presence + 1 timer
   → 6 scenes
   → 10 lights, 3 shades, 2 HVAC
   ============================================================ */

const PROJECT = {
  name: 'Villa Thảo Điền — Tầng 1',
  client: 'Mr. Nguyen',
  source: 'ETS6 + Savant',

  keypads: [
    {
      id: 'KP1', name: 'Keypad Phòng Khách', ext: '1.1.20', room: 'Living Room',
      buttons: [
        { id: 'KP1-B1', idx: 1, label: 'Top L', modes: { short: 'SC-WELCOME', long: 'SC-RELAX', double: 'SC-BRIGHT' } },
        { id: 'KP1-B2', idx: 2, label: 'Top R', modes: { short: 'SC-MOVIE', long: 'SC-NIGHT', double: null } },
        { id: 'KP1-B3', idx: 3, label: 'Bot L', modes: { short: 'ACT-SHADE-UP', long: null, double: null } },
        { id: 'KP1-B4', idx: 4, label: 'Bot R', modes: { short: 'ACT-SHADE-DOWN', long: null, double: null } },
      ]
    },
    {
      id: 'KP2', name: 'Keypad Phòng Ngủ', ext: '1.1.21', room: 'Master Bedroom',
      buttons: [
        { id: 'KP2-B1', idx: 1, label: 'Top L', modes: { short: 'SC-READING', long: 'SC-NIGHT', double: null } },
        { id: 'KP2-B2', idx: 2, label: 'Top R', modes: { short: 'SC-WELCOME', long: null, double: null } },
        { id: 'KP2-B3', idx: 3, label: 'Bot L', modes: { short: 'ACT-HVAC-COOL', long: null, double: null } },
        { id: 'KP2-B4', idx: 4, label: 'Bot R', modes: { short: 'ACT-HVAC-OFF', long: null, double: null } },
      ]
    },
  ],

  presence: { id: 'PS1', name: 'Presence Sensor LR', ext: '1.1.30', triggers: 'SC-WELCOME', condition: 'lux < 200 && occupancy=true' },
  timer:    { id: 'TM1', name: 'Timer 23:00', triggers: 'SC-NIGHT', condition: 'daily @ 23:00:00' },

  scenes: [
    {
      id: 'SC-WELCOME', name: 'Welcome',
      controls: [
        { target: 'L1', op: 'set_brightness', value: 80, cct: 3000 },
        { target: 'L2', op: 'set_brightness', value: 80, cct: 3000 },
        { target: 'L3', op: 'set_brightness', value: 60, cct: 3000 },
        { target: 'SH1', op: 'set_position', value: 0 },
      ]
    },
    {
      id: 'SC-RELAX', name: 'Relax',
      controls: [
        { target: 'L1', op: 'set_brightness', value: 30, cct: 2700 },
        { target: 'L2', op: 'set_brightness', value: 30, cct: 2700 },
        { target: 'L4', op: 'set_brightness', value: 50, cct: 2700 },
        { target: 'HVAC1', op: 'set_setpoint', value: 25, mode: 'cool' },
      ]
    },
    {
      id: 'SC-MOVIE', name: 'Movie',
      controls: [
        { target: 'L1', op: 'turn_off' },
        { target: 'L2', op: 'turn_off' },
        { target: 'L3', op: 'turn_off' },
        { target: 'L4', op: 'set_brightness', value: 10, cct: 2700 },
        { target: 'SH1', op: 'set_position', value: 100 },
        { target: 'SH2', op: 'set_position', value: 100 },
        { target: 'HVAC1', op: 'set_setpoint', value: 24, mode: 'cool' },
      ]
    },
    {
      id: 'SC-BRIGHT', name: 'Bright',
      controls: [
        { target: 'L1', op: 'set_brightness', value: 100, cct: 5000 },
        { target: 'L2', op: 'set_brightness', value: 100, cct: 5000 },
        { target: 'L3', op: 'set_brightness', value: 100, cct: 5000 },
        { target: 'L4', op: 'set_brightness', value: 100, cct: 5000 },
      ]
    },
    {
      id: 'SC-NIGHT', name: 'Night',
      controls: [
        { target: 'L1', op: 'turn_off' },
        { target: 'L2', op: 'turn_off' },
        { target: 'L3', op: 'turn_off' },
        { target: 'L4', op: 'turn_off' },
        { target: 'L5', op: 'turn_off' },
        { target: 'L6', op: 'turn_off' },
        { target: 'L7', op: 'turn_off' },
        { target: 'L8', op: 'turn_off' },
        { target: 'L9', op: 'set_brightness', value: 5, cct: 2200 },
        { target: 'L10', op: 'set_brightness', value: 5, cct: 2200 },
        { target: 'SH1', op: 'set_position', value: 100 },
        { target: 'SH2', op: 'set_position', value: 100 },
        { target: 'SH3', op: 'set_position', value: 100 },
        { target: 'HVAC1', op: 'set_setpoint', value: 26, mode: 'sleep' },
        { target: 'HVAC2', op: 'set_setpoint', value: 26, mode: 'sleep' },
      ]
    },
    {
      id: 'SC-READING', name: 'Reading',
      controls: [
        { target: 'L9', op: 'set_brightness', value: 80, cct: 4000 },
        { target: 'L10', op: 'set_brightness', value: 40, cct: 3000 },
      ]
    },
  ],

  // Direct action shortcuts (không qua scene)
  actions: [
    { id: 'ACT-SHADE-UP',   name: 'All Shades Up',   controls: [{ target: 'SH1', op:'set_position', value:0 },{ target:'SH2', op:'set_position', value:0 },{ target:'SH3', op:'set_position', value:0 }] },
    { id: 'ACT-SHADE-DOWN', name: 'All Shades Down', controls: [{ target: 'SH1', op:'set_position', value:100 },{ target:'SH2', op:'set_position', value:100 },{ target:'SH3', op:'set_position', value:100 }] },
    { id: 'ACT-HVAC-COOL',  name: 'HVAC Cool 24°C',  controls: [{ target:'HVAC2', op:'set_setpoint', value:24, mode:'cool' }] },
    { id: 'ACT-HVAC-OFF',   name: 'HVAC Off',        controls: [{ target:'HVAC2', op:'turn_off' }] },
  ],

  lights: [
    { id:'L1',  name:'LR Ceiling Main',   ga:'1/2/15', dpt:'5.001', room:'Living Room' },
    { id:'L2',  name:'LR Ceiling Aux',    ga:'1/2/16', dpt:'5.001', room:'Living Room' },
    { id:'L3',  name:'LR Wall Wash',      ga:'1/2/17', dpt:'5.001', room:'Living Room' },
    { id:'L4',  name:'LR Accent Strip',   ga:'1/2/18', dpt:'5.001', room:'Living Room' },
    { id:'L5',  name:'Dining Pendant',    ga:'1/2/19', dpt:'5.001', room:'Dining' },
    { id:'L6',  name:'Kitchen Main',      ga:'1/2/20', dpt:'5.001', room:'Kitchen' },
    { id:'L7',  name:'Kitchen Counter',   ga:'1/2/21', dpt:'5.001', room:'Kitchen' },
    { id:'L8',  name:'Hallway',           ga:'1/2/22', dpt:'5.001', room:'Hallway' },
    { id:'L9',  name:'MBR Ceiling',       ga:'1/2/23', dpt:'5.001', room:'Master Bedroom' },
    { id:'L10', name:'MBR Bedside',       ga:'1/2/24', dpt:'5.001', room:'Master Bedroom' },
  ],
  shades: [
    { id:'SH1', name:'LR Window L',  ga:'2/1/3', room:'Living Room' },
    { id:'SH2', name:'LR Window R',  ga:'2/1/4', room:'Living Room' },
    { id:'SH3', name:'MBR Window',   ga:'2/1/5', room:'Master Bedroom' },
  ],
  hvacs: [
    { id:'HVAC1', name:'LR FCU',     ga:'3/1/1', room:'Living Room' },
    { id:'HVAC2', name:'MBR FCU',    ga:'3/1/2', room:'Master Bedroom' },
  ],
};

/* ============================================================
   LAYOUT — vị trí mỗi node trên canvas SVG (column-based)
   ============================================================ */

const COL_X = { input: 60, logic: 540, output: 980 };
const NODE_W = { keypad: 220, scene: 160, output: 200 };

function buildLayout(p) {
  const nodes = {};

  // INPUT column
  let y = 40;
  p.keypads.forEach((kp, ki) => {
    const kpH = 50 + kp.buttons.length * 56;
    nodes[kp.id] = { kind:'keypad', x:COL_X.input, y, w:NODE_W.keypad, h:kpH, data:kp };
    kp.buttons.forEach((b, bi) => {
      const by = y + 50 + bi*56;
      nodes[b.id] = { kind:'button', x:COL_X.input + 20, y:by, w:180, h:48, data:b, parent:kp.id };
      ['short','long','double'].forEach((m,mi) => {
        if (b.modes[m]) {
          nodes[`${b.id}-${m}`] = {
            kind:'pmode', mode:m,
            x: COL_X.input + 20 + 6 + mi*56, y: by+24, w:50, h:18,
            data: { button:b.id, target:b.modes[m] }, parent:b.id
          };
        }
      });
    });
    y += kpH + 24;
  });

  nodes[p.presence.id] = { kind:'sensor', x:COL_X.input, y, w:NODE_W.keypad, h:64, data:p.presence };
  y += 88;
  nodes[p.timer.id] = { kind:'timer', x:COL_X.input, y, w:NODE_W.keypad, h:64, data:p.timer };

  // LOGIC column
  y = 40;
  p.scenes.forEach((sc, i) => {
    nodes[sc.id] = { kind:'scene', x:COL_X.logic, y, w:NODE_W.scene, h:54, data:sc };
    y += 72;
  });
  // direct actions also in logic column, below scenes
  y += 16;
  p.actions.forEach(a => {
    nodes[a.id] = { kind:'action', x:COL_X.logic, y, w:NODE_W.scene, h:48, data:a };
    y += 60;
  });

  // OUTPUT column — grouped
  y = 40;
  // Lights group
  nodes['GRP-LIGHTS'] = { kind:'group', x:COL_X.output, y, w:NODE_W.output, h: 40 + p.lights.length*30, label:'LIGHTS', color:'emerald' };
  p.lights.forEach((l, i) => {
    nodes[l.id] = { kind:'light', x:COL_X.output+12, y:y+36+i*30, w:NODE_W.output-24, h:26, data:l, parent:'GRP-LIGHTS' };
  });
  y += 40 + p.lights.length*30 + 20;

  nodes['GRP-SHADES'] = { kind:'group', x:COL_X.output, y, w:NODE_W.output, h: 40 + p.shades.length*30, label:'SHADES', color:'violet' };
  p.shades.forEach((s, i) => {
    nodes[s.id] = { kind:'shade', x:COL_X.output+12, y:y+36+i*30, w:NODE_W.output-24, h:26, data:s, parent:'GRP-SHADES' };
  });
  y += 40 + p.shades.length*30 + 20;

  nodes['GRP-HVAC'] = { kind:'group', x:COL_X.output, y, w:NODE_W.output, h: 40 + p.hvacs.length*30, label:'HVAC', color:'amber' };
  p.hvacs.forEach((h, i) => {
    nodes[h.id] = { kind:'hvac', x:COL_X.output+12, y:y+36+i*30, w:NODE_W.output-24, h:26, data:h, parent:'GRP-HVAC' };
  });

  // EDGES
  const edges = [];
  p.keypads.forEach(kp => kp.buttons.forEach(b => {
    ['short','long','double'].forEach(m => {
      if (b.modes[m]) {
        edges.push({ src:`${b.id}-${m}`, dst:b.modes[m], kind:'triggers', mode:m });
      }
    });
  }));
  edges.push({ src:p.presence.id, dst:p.presence.triggers, kind:'triggers', mode:'auto' });
  edges.push({ src:p.timer.id,    dst:p.timer.triggers,    kind:'triggers', mode:'time' });

  p.scenes.forEach(sc => sc.controls.forEach(c => {
    edges.push({ src:sc.id, dst:c.target, kind:'controls', action:c });
  }));
  p.actions.forEach(a => a.controls.forEach(c => {
    edges.push({ src:a.id, dst:c.target, kind:'controls', action:c });
  }));

  return { nodes, edges };
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function App() {
  const { nodes, edges } = useMemo(() => buildLayout(PROJECT), []);
  const [selected, setSelected] = useState(null); // node id
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [openSidebar, setOpenSidebar] = useState({ kp:true, sens:true, scenes:true, lights:true, shades:true, hvac:true });
  const [filter, setFilter] = useState('');

  /* compute highlight set */
  const highlight = useMemo(() => {
    if (!selected) return null;
    const nodeIds = new Set([selected]);
    const edgeIdx = new Set();

    // add ancestors (parent chain)
    let cur = selected;
    while (nodes[cur]?.parent) {
      cur = nodes[cur].parent;
      nodeIds.add(cur);
    }

    // BFS downstream
    const queue = [selected];
    while (queue.length) {
      const n = queue.shift();
      edges.forEach((e, i) => {
        if (e.src === n) {
          nodeIds.add(e.dst);
          edgeIdx.add(i);
          queue.push(e.dst);
          // if dst is grouped child, also add group
          if (nodes[e.dst]?.parent) nodeIds.add(nodes[e.dst].parent);
        }
      });
    }
    // BFS upstream (for outputs / scenes)
    const upQ = [selected];
    while (upQ.length) {
      const n = upQ.shift();
      edges.forEach((e, i) => {
        if (e.dst === n) {
          nodeIds.add(e.src);
          edgeIdx.add(i);
          upQ.push(e.src);
          if (nodes[e.src]?.parent) nodeIds.add(nodes[e.src].parent);
        }
      });
    }
    return { nodeIds, edgeIdx };
  }, [selected, nodes, edges]);

  const isDimmed = (id) => highlight && !highlight.nodeIds.has(id);
  const isEdgeDimmed = (i) => highlight && !highlight.edgeIdx.has(i);

  const selNode = selected ? nodes[selected] : null;

  /* edge path helper — bezier curve from right edge of src to left edge of dst */
  const edgePath = (e) => {
    const s = nodes[e.src], d = nodes[e.dst];
    if (!s || !d) return '';
    // anchor points
    let x1, y1, x2, y2;
    if (s.kind === 'pmode') { x1 = s.x + s.w; y1 = s.y + s.h/2; }
    else { x1 = s.x + s.w; y1 = s.y + s.h/2; }
    x2 = d.x; y2 = d.y + d.h/2;
    const dx = (x2 - x1) * 0.5;
    return `M ${x1},${y1} C ${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
  };

  const totalH = 1280;
  const totalW = 1240;

  return (
    <div className="knx-app">
      <style>{CSS}</style>

      {/* ============ TOP BAR ============ */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h6v6h-6zM10 10h4v4h-4z"/></svg>
          </div>
          <div>
            <div className="brand-title">KNXgraph<span className="brand-dot">.</span></div>
            <div className="brand-sub">Knowledge graph for building automation</div>
          </div>
        </div>
        <div className="project-meta">
          <div className="meta-cell"><span className="meta-k">PROJECT</span><span className="meta-v">{PROJECT.name}</span></div>
          <div className="meta-cell"><span className="meta-k">CLIENT</span><span className="meta-v">{PROJECT.client}</span></div>
          <div className="meta-cell"><span className="meta-k">SOURCE</span><span className="meta-v">{PROJECT.source}</span></div>
          <div className="meta-cell"><span className="meta-k">LAST SYNC</span><span className="meta-v">2026-05-11 09:42 ✓</span></div>
        </div>
        <div className="topbar-actions">
          <button className="iconbtn" title="Search"><Search size={14}/></button>
          <button className="iconbtn" title="Filter"><Filter size={14}/></button>
          <button className="iconbtn" title="Fullscreen"><Maximize2 size={14}/></button>
          <button className="iconbtn" title="Export PDF"><Download size={14}/></button>
        </div>
      </header>

      <div className="main">
        {/* ============ SIDEBAR ============ */}
        <aside className="sidebar">
          <div className="search-wrap">
            <Search size={12} />
            <input placeholder="Tìm thiết bị, GA, scene…" value={filter} onChange={e=>setFilter(e.target.value)} />
          </div>

          <SideGroup
            title="Keypads" count={PROJECT.keypads.length} icon={<Radio size={11}/>}
            open={openSidebar.kp} onToggle={()=>setOpenSidebar(s=>({...s,kp:!s.kp}))}
            tone="cyan"
          >
            {PROJECT.keypads.map(kp => (
              <SideNode key={kp.id} id={kp.id} label={kp.name} sub={kp.ext} selected={selected} setSelected={setSelected}>
                {kp.buttons.map(b => (
                  <SideSubNode key={b.id} id={b.id} label={`B${b.idx} · ${b.label}`} selected={selected} setSelected={setSelected}>
                    {['short','long','double'].map(m => b.modes[m] && (
                      <SideMode key={m} id={`${b.id}-${m}`} mode={m} selected={selected} setSelected={setSelected} />
                    ))}
                  </SideSubNode>
                ))}
              </SideNode>
            ))}
          </SideGroup>

          <SideGroup title="Sensors & Timers" count={2} icon={<Activity size={11}/>}
            open={openSidebar.sens} onToggle={()=>setOpenSidebar(s=>({...s,sens:!s.sens}))} tone="cyan">
            <SideNode id={PROJECT.presence.id} label={PROJECT.presence.name} sub="lux + occupancy" selected={selected} setSelected={setSelected} />
            <SideNode id={PROJECT.timer.id} label={PROJECT.timer.name} sub="cron daily" selected={selected} setSelected={setSelected} />
          </SideGroup>

          <SideGroup title="Scenes & Actions" count={PROJECT.scenes.length+PROJECT.actions.length} icon={<Zap size={11}/>}
            open={openSidebar.scenes} onToggle={()=>setOpenSidebar(s=>({...s,scenes:!s.scenes}))} tone="amber">
            {PROJECT.scenes.map(sc => (
              <SideNode key={sc.id} id={sc.id} label={sc.name} sub={`${sc.controls.length} targets`} selected={selected} setSelected={setSelected} />
            ))}
            {PROJECT.actions.map(a => (
              <SideNode key={a.id} id={a.id} label={a.name} sub="direct action" selected={selected} setSelected={setSelected} />
            ))}
          </SideGroup>

          <SideGroup title="Lights" count={PROJECT.lights.length} icon={<Lightbulb size={11}/>}
            open={openSidebar.lights} onToggle={()=>setOpenSidebar(s=>({...s,lights:!s.lights}))} tone="emerald">
            {PROJECT.lights.map(l => (
              <SideNode key={l.id} id={l.id} label={l.name} sub={l.ga} selected={selected} setSelected={setSelected} />
            ))}
          </SideGroup>

          <SideGroup title="Shades" count={PROJECT.shades.length} icon={<Blinds size={11}/>}
            open={openSidebar.shades} onToggle={()=>setOpenSidebar(s=>({...s,shades:!s.shades}))} tone="violet">
            {PROJECT.shades.map(s => (
              <SideNode key={s.id} id={s.id} label={s.name} sub={s.ga} selected={selected} setSelected={setSelected} />
            ))}
          </SideGroup>

          <SideGroup title="HVAC" count={PROJECT.hvacs.length} icon={<Thermometer size={11}/>}
            open={openSidebar.hvac} onToggle={()=>setOpenSidebar(s=>({...s,hvac:!s.hvac}))} tone="amber">
            {PROJECT.hvacs.map(h => (
              <SideNode key={h.id} id={h.id} label={h.name} sub={h.ga} selected={selected} setSelected={setSelected} />
            ))}
          </SideGroup>
        </aside>

        {/* ============ GRAPH CANVAS ============ */}
        <main className="canvas-wrap" onClick={()=>setSelected(null)}>
          {/* column headers */}
          <div className="col-headers">
            <div className="col-h" style={{left: COL_X.input, width: NODE_W.keypad}}>
              <span className="col-dot" style={{background:'var(--cyan)'}}/> INPUTS
            </div>
            <div className="col-h" style={{left: COL_X.logic, width: NODE_W.scene}}>
              <span className="col-dot" style={{background:'var(--amber)'}}/> LOGIC
            </div>
            <div className="col-h" style={{left: COL_X.output, width: NODE_W.output}}>
              <span className="col-dot" style={{background:'var(--emerald)'}}/> OUTPUTS
            </div>
          </div>

          <svg className="canvas" viewBox={`0 0 ${totalW} ${totalH}`} preserveAspectRatio="xMidYMin meet" onClick={(e)=>e.stopPropagation()}>
            {/* grid pattern */}
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(120,140,180,0.06)" strokeWidth="1"/>
              </pattern>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="var(--knx-blue)" stopOpacity="0.5"/>
              </linearGradient>
              <linearGradient id="edgeGradHl" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--knx-blue)" stopOpacity="1"/>
                <stop offset="100%" stopColor="var(--cyan)" stopOpacity="1"/>
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>

            {/* edges first */}
            {edges.map((e, i) => {
              const dim = isEdgeDimmed(i);
              const hl = highlight && highlight.edgeIdx.has(i);
              return (
                <g key={i} className={`edge ${dim?'dim':''} ${hl?'hl':''}`}>
                  <path d={edgePath(e)} fill="none"
                    stroke={hl ? 'url(#edgeGradHl)' : 'url(#edgeGrad)'}
                    strokeWidth={hl ? 2.2 : 1.2}
                    filter={hl ? 'url(#glow)' : undefined}
                  />
                </g>
              );
            })}

            {/* nodes — order: groups first (background), then everything else */}
            {Object.entries(nodes).filter(([,n])=>n.kind==='group').map(([id,n]) => (
              <GroupNode key={id} id={id} n={n} dim={isDimmed(id)} />
            ))}

            {Object.entries(nodes).filter(([,n])=>n.kind==='keypad').map(([id,n]) => (
              <KeypadNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>n.kind==='button').map(([id,n]) => (
              <ButtonNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>n.kind==='pmode').map(([id,n]) => (
              <PModeNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>n.kind==='sensor').map(([id,n]) => (
              <SensorNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>n.kind==='timer').map(([id,n]) => (
              <TimerNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>n.kind==='scene').map(([id,n]) => (
              <SceneNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>n.kind==='action').map(([id,n]) => (
              <ActionNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
            {Object.entries(nodes).filter(([,n])=>['light','shade','hvac'].includes(n.kind)).map(([id,n]) => (
              <OutputNode key={id} id={id} n={n} sel={selected===id} dim={isDimmed(id)} onClick={(e)=>{e.stopPropagation();setSelected(id);}} />
            ))}
          </svg>

          {/* legend bottom-left */}
          <div className="legend">
            <span className="lg-item"><span className="lg-dot" style={{background:'var(--cyan)'}}/>Input</span>
            <span className="lg-item"><span className="lg-dot" style={{background:'var(--amber)'}}/>Logic</span>
            <span className="lg-item"><span className="lg-dot" style={{background:'var(--emerald)'}}/>Light</span>
            <span className="lg-item"><span className="lg-dot" style={{background:'var(--violet)'}}/>Shade</span>
            <span className="lg-item"><span className="lg-dot" style={{background:'var(--orange)'}}/>HVAC</span>
            <span className="lg-sep"/>
            <span className="lg-hint">Click một node để focus · click nền để reset</span>
          </div>
        </main>

        {/* ============ DETAIL PANEL ============ */}
        <aside className={`detail ${selected ? 'open' : ''}`}>
          {selNode && <DetailPanel id={selected} node={selNode} project={PROJECT} edges={edges} nodes={nodes} onClose={()=>setSelected(null)} setSelected={setSelected} />}
          {!selNode && <EmptyDetail />}
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR COMPONENTS
   ============================================================ */

function SideGroup({ title, count, icon, open, onToggle, tone, children }) {
  return (
    <div className="sgroup">
      <button className={`sgroup-head tone-${tone}`} onClick={onToggle}>
        {open ? <ChevronDown size={11}/> : <ChevronRight size={11}/>}
        <span className="sgroup-icon">{icon}</span>
        <span className="sgroup-title">{title}</span>
        <span className="sgroup-count">{count}</span>
      </button>
      {open && <div className="sgroup-body">{children}</div>}
    </div>
  );
}

function SideNode({ id, label, sub, selected, setSelected, children }) {
  const isSel = selected === id;
  return (
    <div className="snode-wrap">
      <button className={`snode ${isSel?'sel':''}`} onClick={(e)=>{e.stopPropagation();setSelected(id);}}>
        <span className="snode-label">{label}</span>
        {sub && <span className="snode-sub">{sub}</span>}
      </button>
      {children && <div className="snode-children">{children}</div>}
    </div>
  );
}

function SideSubNode({ id, label, selected, setSelected, children }) {
  const isSel = selected === id;
  return (
    <div className="ssub-wrap">
      <button className={`ssub ${isSel?'sel':''}`} onClick={(e)=>{e.stopPropagation();setSelected(id);}}>
        <span>{label}</span>
      </button>
      {children && <div className="ssub-modes">{children}</div>}
    </div>
  );
}

function SideMode({ id, mode, selected, setSelected }) {
  const isSel = selected === id;
  const letter = { short:'S', long:'L', double:'D' }[mode];
  return (
    <button className={`smode mode-${mode} ${isSel?'sel':''}`} onClick={(e)=>{e.stopPropagation();setSelected(id);}}>
      {letter}
    </button>
  );
}

/* ============================================================
   GRAPH NODE COMPONENTS (SVG)
   ============================================================ */

function KeypadNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  return (
    <g className={`gn keypad ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="10" className="gn-bg"/>
      <rect width="3" height={n.h} className="gn-stripe" fill="var(--cyan)"/>
      <text x="14" y="20" className="gn-title">{d.name}</text>
      <text x="14" y="36" className="gn-meta">{d.ext} · {d.room}</text>
      <text x={n.w-12} y="20" className="gn-pill" textAnchor="end">KEYPAD</text>
    </g>
  );
}

function ButtonNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  return (
    <g className={`gn button ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="6" className="gn-bg btn-bg"/>
      <circle cx="14" cy="14" r="8" className="btn-idx-bg"/>
      <text x="14" y="17" className="btn-idx" textAnchor="middle">{d.idx}</text>
      <text x="30" y="17" className="gn-meta">{d.label}</text>
      <text x="30" y="30" className="gn-sub">{Object.values(d.modes).filter(Boolean).length} modes</text>
    </g>
  );
}

function PModeNode({ id, n, sel, dim, onClick }) {
  const letter = { short:'S', long:'L', double:'D' }[n.mode];
  const colorVar = { short:'--cyan', long:'--knx-blue', double:'--violet' }[n.mode];
  return (
    <g className={`gn pmode ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="4" className="pm-bg" stroke={`var(${colorVar})`} fill={`color-mix(in srgb, var(${colorVar}) 18%, transparent)`}/>
      <text x={n.w/2} y={n.h/2+4} className="pm-text" textAnchor="middle" fill={`var(${colorVar})`}>
        {letter} · {n.mode.toUpperCase()}
      </text>
    </g>
  );
}

function SensorNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  return (
    <g className={`gn sensor ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="10" className="gn-bg"/>
      <rect width="3" height={n.h} fill="var(--cyan)"/>
      <text x="14" y="22" className="gn-title">{d.name}</text>
      <text x="14" y="40" className="gn-meta">{d.condition}</text>
      <text x={n.w-12} y="22" className="gn-pill" textAnchor="end">SENSOR</text>
    </g>
  );
}

function TimerNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  return (
    <g className={`gn timer ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="10" className="gn-bg"/>
      <rect width="3" height={n.h} fill="var(--cyan)"/>
      <text x="14" y="22" className="gn-title">{d.name}</text>
      <text x="14" y="40" className="gn-meta">{d.condition}</text>
      <text x={n.w-12} y="22" className="gn-pill" textAnchor="end">TIMER</text>
    </g>
  );
}

function SceneNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  return (
    <g className={`gn scene ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="8" className="gn-bg scene-bg"/>
      <rect width="3" height={n.h} fill="var(--amber)"/>
      <text x="14" y="22" className="gn-title">{d.name}</text>
      <text x="14" y="40" className="gn-meta">{d.controls.length} targets · scene</text>
    </g>
  );
}

function ActionNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  return (
    <g className={`gn action ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="8" className="gn-bg action-bg" strokeDasharray="3 3"/>
      <rect width="3" height={n.h} fill="var(--amber)" opacity="0.6"/>
      <text x="14" y="20" className="gn-title">{d.name}</text>
      <text x="14" y="36" className="gn-meta">direct · {d.controls.length} targets</text>
    </g>
  );
}

function GroupNode({ id, n, dim }) {
  const color = `var(--${n.color})`;
  return (
    <g className={`gn group ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`}>
      <rect width={n.w} height={n.h} rx="10" fill={`color-mix(in srgb, ${color} 4%, var(--surface))`} stroke={`color-mix(in srgb, ${color} 30%, transparent)`} strokeWidth="1"/>
      <text x="12" y="22" className="grp-label" fill={color}>{n.label}</text>
    </g>
  );
}

function OutputNode({ id, n, sel, dim, onClick }) {
  const d = n.data;
  const kindColors = { light:'--emerald', shade:'--violet', hvac:'--orange' };
  const c = `var(${kindColors[n.kind]})`;
  return (
    <g className={`gn output ${n.kind} ${sel?'sel':''} ${dim?'dim':''}`} transform={`translate(${n.x},${n.y})`} onClick={onClick}>
      <rect width={n.w} height={n.h} rx="5" className="out-bg"/>
      <circle cx="10" cy={n.h/2} r="3.5" fill={c}/>
      <text x="20" y={n.h/2+4} className="out-name">{d.name}</text>
      <text x={n.w-8} y={n.h/2+4} className="out-ga" textAnchor="end">{d.ga}</text>
    </g>
  );
}

/* ============================================================
   DETAIL PANEL
   ============================================================ */

function EmptyDetail() {
  return (
    <div className="empty-detail">
      <div className="ed-icon">
        <svg viewBox="0 0 64 64" width="48" height="48">
          <circle cx="14" cy="14" r="4" fill="var(--cyan)" opacity="0.7"/>
          <circle cx="50" cy="14" r="4" fill="var(--amber)" opacity="0.7"/>
          <circle cx="50" cy="50" r="4" fill="var(--emerald)" opacity="0.7"/>
          <path d="M14 14 L50 14 L50 50" stroke="var(--knx-blue)" strokeWidth="1.5" fill="none" opacity="0.5"/>
        </svg>
      </div>
      <div className="ed-title">Chưa chọn node</div>
      <div className="ed-sub">Click vào một keypad, button, scene hoặc thiết bị để xem chi tiết & các liên kết.</div>
      <div className="ed-tips">
        <div className="ed-tip"><kbd>S</kbd><span>Short press</span></div>
        <div className="ed-tip"><kbd>L</kbd><span>Long press</span></div>
        <div className="ed-tip"><kbd>D</kbd><span>Double press</span></div>
      </div>
    </div>
  );
}

function DetailPanel({ id, node, project, edges, nodes, onClose, setSelected }) {
  const downstream = edges.filter(e => e.src === id);
  const upstream = edges.filter(e => e.dst === id);

  const kindLabel = {
    keypad:'KEYPAD', button:'BUTTON', pmode:'PRESS MODE', sensor:'SENSOR',
    timer:'TIMER', scene:'SCENE', action:'DIRECT ACTION',
    light:'LIGHT', shade:'SHADE', hvac:'HVAC', group:'GROUP'
  }[node.kind] || node.kind.toUpperCase();

  const kindColor = {
    keypad:'cyan', button:'cyan', pmode:'cyan', sensor:'cyan', timer:'cyan',
    scene:'amber', action:'amber',
    light:'emerald', shade:'violet', hvac:'orange'
  }[node.kind] || 'cyan';

  const d = node.data || {};

  return (
    <div className="detail-inner">
      <div className="detail-head">
        <div className={`kind-badge tone-${kindColor}`}>{kindLabel}</div>
        <button className="iconbtn" onClick={onClose}><X size={14}/></button>
      </div>

      <h2 className="detail-title">
        {node.kind === 'pmode' ? `${d.button} · ${node.mode.toUpperCase()} PRESS` : (d.name || id)}
      </h2>
      <div className="detail-id">id: <span className="mono">{id}</span></div>

      {/* Properties */}
      <section className="detail-section">
        <h3 className="dh">PROPERTIES</h3>
        <div className="props">
          {node.kind === 'keypad' && (<>
            <Prop k="Individual address" v={d.ext}/>
            <Prop k="Room" v={d.room}/>
            <Prop k="Buttons" v={`${d.buttons.length} × physical`}/>
          </>)}
          {node.kind === 'button' && (<>
            <Prop k="Index" v={`B${d.idx}`}/>
            <Prop k="Label" v={d.label}/>
            <Prop k="Parent" v={node.parent}/>
            <Prop k="Modes programmed" v={Object.values(d.modes).filter(Boolean).length}/>
          </>)}
          {node.kind === 'pmode' && (<>
            <Prop k="Source button" v={d.button}/>
            <Prop k="Press kind" v={node.mode}/>
            <Prop k="Triggers" v={d.target}/>
          </>)}
          {node.kind === 'sensor' && (<>
            <Prop k="Address" v={d.ext}/>
            <Prop k="Condition" v={d.condition} mono/>
            <Prop k="Triggers" v={d.triggers}/>
          </>)}
          {node.kind === 'timer' && (<>
            <Prop k="Schedule" v={d.condition} mono/>
            <Prop k="Triggers" v={d.triggers}/>
          </>)}
          {node.kind === 'scene' && (<>
            <Prop k="Targets" v={`${d.controls.length} devices`}/>
            <Prop k="Triggered by" v={`${upstream.length} input(s)`}/>
          </>)}
          {(node.kind === 'light' || node.kind==='shade' || node.kind==='hvac') && (<>
            <Prop k="Group address" v={d.ga} mono/>
            {d.dpt && <Prop k="DPT" v={d.dpt} mono/>}
            <Prop k="Room" v={d.room}/>
            <Prop k="Controlled by" v={`${upstream.length} scene/action(s)`}/>
          </>)}
        </div>
      </section>

      {/* Upstream (what triggers this) */}
      {upstream.length > 0 && (
        <section className="detail-section">
          <h3 className="dh">UPSTREAM <span className="dh-count">{upstream.length}</span></h3>
          <div className="link-list">
            {upstream.map((e, i) => (
              <button key={i} className="link-row" onClick={()=>setSelected(e.src)}>
                <span className="link-arrow">←</span>
                <span className="link-name">{nodes[e.src]?.data?.name || e.src}</span>
                <span className="link-kind">{e.kind}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Downstream (what this controls) */}
      {downstream.length > 0 && (
        <section className="detail-section">
          <h3 className="dh">DOWNSTREAM <span className="dh-count">{downstream.length}</span></h3>
          <div className="link-list">
            {downstream.map((e, i) => (
              <button key={i} className="link-row" onClick={()=>setSelected(e.dst)}>
                <span className="link-arrow">→</span>
                <span className="link-name">{nodes[e.dst]?.data?.name || e.dst}</span>
                {e.action && (
                  <span className="action-chip">
                    {e.action.op}
                    {e.action.value !== undefined && <span className="ac-val">={e.action.value}{e.action.op==='set_brightness'?'%':''}{e.action.op==='set_position'?'%':''}{e.action.op==='set_setpoint'?'°C':''}</span>}
                    {e.action.cct && <span className="ac-val">·{e.action.cct}K</span>}
                    {e.action.mode && <span className="ac-val">·{e.action.mode}</span>}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Raw JSON (for scene/action) */}
      {(node.kind === 'scene' || node.kind === 'action') && (
        <section className="detail-section">
          <h3 className="dh">ACTION JSON</h3>
          <pre className="json-block">{JSON.stringify({ id, controls: d.controls }, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

function Prop({ k, v, mono }) {
  return (
    <div className="prop">
      <span className="prop-k">{k}</span>
      <span className={`prop-v ${mono?'mono':''}`}>{v}</span>
    </div>
  );
}

/* ============================================================
   CSS — KNX dark theme
   ============================================================ */

const CSS = `
:root {
  --bg:           #070a14;
  --bg-2:         #0a0f1c;
  --surface:      #0f1626;
  --surface-2:    #131c30;
  --surface-3:    #1a2440;
  --border:       rgba(120, 150, 220, 0.10);
  --border-2:     rgba(120, 150, 220, 0.18);
  --text:         #d8e1f0;
  --text-2:       #8a97b3;
  --text-3:       #5d6b87;

  --knx-blue:     #00a0ef;
  --knx-blue-2:   #0070bb;
  --cyan:         #22d3ee;
  --amber:        #fbbf24;
  --emerald:      #34d399;
  --violet:       #a78bfa;
  --orange:       #fb923c;
  --red:          #f87171;
}

* { box-sizing: border-box; }

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

body, html {
  margin: 0; padding: 0;
  background: var(--bg);
  font-family: 'IBM Plex Sans', -apple-system, sans-serif;
  color: var(--text);
}

.knx-app {
  display: flex; flex-direction: column;
  height: 100vh;
  background: var(--bg);
  font-size: 13px;
  letter-spacing: -0.005em;
}

.mono { font-family: 'IBM Plex Mono', monospace !important; }

/* ===== TOPBAR ===== */
.topbar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  gap: 24px;
}

.brand { display: flex; align-items: center; gap: 10px; min-width: 230px; }
.brand-mark {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--knx-blue) 0%, var(--knx-blue-2) 100%);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 4px 16px -4px var(--knx-blue);
}
.brand-title { font-size: 14px; font-weight: 600; letter-spacing: -0.02em; }
.brand-dot { color: var(--knx-blue); }
.brand-sub { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em; }

.project-meta { display: flex; gap: 28px; flex: 1; }
.meta-cell { display: flex; flex-direction: column; gap: 1px; }
.meta-k { font-size: 9px; color: var(--text-3); letter-spacing: 0.12em; font-weight: 500; }
.meta-v { font-size: 12px; color: var(--text); font-weight: 500; font-family: 'IBM Plex Mono', monospace; }

.topbar-actions { display: flex; gap: 4px; }
.iconbtn {
  background: var(--surface-2); border: 1px solid var(--border-2);
  color: var(--text-2); padding: 7px; border-radius: 5px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.iconbtn:hover { background: var(--surface-3); color: var(--knx-blue); border-color: var(--knx-blue); }

/* ===== MAIN LAYOUT ===== */
.main {
  display: grid;
  grid-template-columns: 270px 1fr 360px;
  flex: 1;
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.sidebar {
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 10px 0;
}

.search-wrap {
  display: flex; align-items: center; gap: 8px;
  margin: 0 12px 14px;
  padding: 7px 10px;
  background: var(--surface);
  border: 1px solid var(--border-2);
  border-radius: 6px;
  color: var(--text-3);
}
.search-wrap input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text); font-size: 12px; font-family: inherit;
}
.search-wrap input::placeholder { color: var(--text-3); }

.sgroup { margin-bottom: 4px; }
.sgroup-head {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 7px 12px;
  background: none; border: none; cursor: pointer;
  color: var(--text-2); font-family: inherit;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  transition: color 0.15s;
}
.sgroup-head:hover { color: var(--text); }
.sgroup-head.tone-cyan .sgroup-icon { color: var(--cyan); }
.sgroup-head.tone-amber .sgroup-icon { color: var(--amber); }
.sgroup-head.tone-emerald .sgroup-icon { color: var(--emerald); }
.sgroup-head.tone-violet .sgroup-icon { color: var(--violet); }
.sgroup-icon { display: flex; }
.sgroup-title { flex: 1; text-align: left; }
.sgroup-count {
  background: var(--surface-2);
  padding: 1px 6px; border-radius: 8px;
  font-size: 9px; color: var(--text-3);
}
.sgroup-body { padding: 0 4px 6px; }

.snode-wrap { margin-bottom: 1px; }
.snode {
  display: flex; flex-direction: column;
  width: 100%;
  padding: 5px 10px 5px 28px;
  background: none; border: none; border-left: 2px solid transparent;
  cursor: pointer; text-align: left;
  font-family: inherit;
  transition: all 0.15s;
}
.snode:hover { background: var(--surface); }
.snode.sel { background: color-mix(in srgb, var(--knx-blue) 12%, transparent); border-left-color: var(--knx-blue); }
.snode-label { font-size: 12px; color: var(--text); }
.snode-sub { font-size: 10px; color: var(--text-3); font-family: 'IBM Plex Mono', monospace; }

.snode-children { padding-left: 12px; }
.ssub-wrap { margin: 1px 0; }
.ssub {
  display: flex; align-items: center;
  width: 100%; padding: 3px 10px 3px 28px;
  background: none; border: none; border-left: 2px solid transparent;
  color: var(--text-2); font-family: inherit; font-size: 11px;
  cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.ssub:hover { background: var(--surface); color: var(--text); }
.ssub.sel { background: color-mix(in srgb, var(--knx-blue) 10%, transparent); border-left-color: var(--knx-blue); color: var(--knx-blue); }
.ssub-modes { display: flex; gap: 3px; padding: 2px 0 4px 28px; }
.smode {
  width: 18px; height: 16px;
  border-radius: 3px;
  background: var(--surface-2); border: 1px solid var(--border-2);
  color: var(--text-3); font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.smode.mode-short:hover { color: var(--cyan); border-color: var(--cyan); }
.smode.mode-long:hover { color: var(--knx-blue); border-color: var(--knx-blue); }
.smode.mode-double:hover { color: var(--violet); border-color: var(--violet); }
.smode.sel.mode-short { background: var(--cyan); color: #000; border-color: var(--cyan); }
.smode.sel.mode-long { background: var(--knx-blue); color: #000; border-color: var(--knx-blue); }
.smode.sel.mode-double { background: var(--violet); color: #000; border-color: var(--violet); }

/* ===== CANVAS ===== */
.canvas-wrap {
  position: relative;
  background:
    radial-gradient(ellipse 800px 600px at 30% 20%, rgba(0,160,239,0.04), transparent),
    radial-gradient(ellipse 600px 400px at 80% 80%, rgba(34,211,238,0.025), transparent),
    var(--bg);
  overflow: auto;
}

.col-headers {
  position: sticky; top: 0;
  height: 36px;
  background: linear-gradient(180deg, var(--bg) 60%, transparent);
  z-index: 5;
  pointer-events: none;
}
.col-h {
  position: absolute; top: 12px;
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-2);
}
.col-dot { width: 6px; height: 6px; border-radius: 50%; }

.canvas {
  display: block;
  width: 100%;
  min-width: 1240px;
  height: auto;
}

/* node base styles */
.gn { cursor: pointer; transition: opacity 0.25s; }
.gn.dim { opacity: 0.15; pointer-events: none; }
.gn-bg {
  fill: var(--surface);
  stroke: var(--border-2);
  stroke-width: 1;
}
.gn:hover .gn-bg { stroke: var(--knx-blue); fill: var(--surface-2); }
.gn.sel .gn-bg { stroke: var(--knx-blue); stroke-width: 1.8; fill: var(--surface-2); filter: drop-shadow(0 0 10px rgba(0,160,239,0.3)); }
.gn-stripe { rx: 1; }
.gn-title { fill: var(--text); font-size: 13px; font-weight: 600; }
.gn-meta { fill: var(--text-3); font-size: 10px; font-family: 'IBM Plex Mono', monospace; }
.gn-sub { fill: var(--text-3); font-size: 9.5px; font-family: 'IBM Plex Mono', monospace; }
.gn-pill {
  fill: var(--text-3);
  font-size: 8.5px; font-weight: 600;
  letter-spacing: 0.12em;
}

/* button node */
.btn-bg { fill: var(--surface-2); }
.gn.button:hover .btn-bg { fill: var(--surface-3); }
.gn.button.sel .btn-bg { fill: color-mix(in srgb, var(--cyan) 12%, var(--surface-2)); stroke: var(--cyan); }
.btn-idx-bg { fill: var(--surface-3); stroke: var(--border-2); }
.gn.button.sel .btn-idx-bg { fill: var(--cyan); stroke: var(--cyan); }
.btn-idx { fill: var(--text); font-size: 11px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
.gn.button.sel .btn-idx { fill: #000; }

/* press mode */
.pmode { cursor: pointer; }
.pm-bg {
  stroke-width: 1; opacity: 0.85;
}
.gn.pmode:hover .pm-bg { opacity: 1; stroke-width: 1.5; }
.gn.pmode.sel .pm-bg { opacity: 1; stroke-width: 2; filter: drop-shadow(0 0 6px currentColor); }
.pm-text { font-size: 9.5px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em; }

/* scene */
.scene-bg { fill: color-mix(in srgb, var(--amber) 4%, var(--surface)); }
.gn.scene:hover .scene-bg { stroke: var(--amber); }
.gn.scene.sel .scene-bg { stroke: var(--amber); stroke-width: 1.8; filter: drop-shadow(0 0 10px rgba(251,191,36,0.3)); }

/* action */
.action-bg { fill: color-mix(in srgb, var(--amber) 3%, var(--surface)); stroke: color-mix(in srgb, var(--amber) 40%, var(--border-2)); }

/* group */
.gn.group { cursor: default; }
.grp-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; }

/* output */
.out-bg { fill: var(--surface-2); stroke: var(--border); stroke-width: 1; }
.gn.output:hover .out-bg { fill: var(--surface-3); stroke: var(--knx-blue); }
.gn.output.sel .out-bg { fill: var(--surface-3); stroke: var(--knx-blue); stroke-width: 1.5; filter: drop-shadow(0 0 8px rgba(0,160,239,0.4)); }
.out-name { fill: var(--text); font-size: 11px; font-weight: 500; }
.out-ga { fill: var(--text-3); font-size: 10px; font-family: 'IBM Plex Mono', monospace; }

/* edges */
.edge { transition: opacity 0.25s; }
.edge.dim { opacity: 0.06; }
.edge.hl path { stroke-width: 2.5; }

/* legend */
.legend {
  position: absolute; bottom: 12px; left: 16px;
  display: flex; align-items: center; gap: 14px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  border: 1px solid var(--border-2);
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 10px; color: var(--text-2);
  backdrop-filter: blur(6px);
  z-index: 10;
}
.lg-item { display: flex; align-items: center; gap: 5px; }
.lg-dot { width: 7px; height: 7px; border-radius: 50%; }
.lg-sep { width: 1px; height: 14px; background: var(--border-2); }
.lg-hint { color: var(--text-3); }

/* ===== DETAIL PANEL ===== */
.detail {
  background: var(--surface);
  border-left: 1px solid var(--border);
  overflow-y: auto;
}

.detail-inner { padding: 16px; }
.empty-detail {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-3);
}
.ed-icon { display: flex; justify-content: center; margin-bottom: 16px; opacity: 0.7; }
.ed-title { font-size: 14px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }
.ed-sub { font-size: 12px; color: var(--text-3); line-height: 1.5; margin-bottom: 24px; }
.ed-tips { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; margin: 0 auto; width: fit-content; }
.ed-tip { display: flex; gap: 8px; align-items: center; font-size: 11px; }
.ed-tip kbd {
  background: var(--surface-2); border: 1px solid var(--border-2);
  padding: 1px 7px; border-radius: 3px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  color: var(--knx-blue);
}

.detail-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.kind-badge {
  font-size: 9px; font-weight: 700;
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.14em;
}
.kind-badge.tone-cyan    { background: color-mix(in srgb, var(--cyan) 15%, transparent); color: var(--cyan); }
.kind-badge.tone-amber   { background: color-mix(in srgb, var(--amber) 15%, transparent); color: var(--amber); }
.kind-badge.tone-emerald { background: color-mix(in srgb, var(--emerald) 15%, transparent); color: var(--emerald); }
.kind-badge.tone-violet  { background: color-mix(in srgb, var(--violet) 15%, transparent); color: var(--violet); }
.kind-badge.tone-orange  { background: color-mix(in srgb, var(--orange) 15%, transparent); color: var(--orange); }

.detail-title {
  font-size: 17px; font-weight: 600;
  margin: 0 0 4px;
  letter-spacing: -0.015em;
  line-height: 1.3;
}
.detail-id { font-size: 11px; color: var(--text-3); margin-bottom: 18px; }
.detail-id .mono { color: var(--text-2); }

.detail-section { margin-bottom: 20px; }
.dh {
  font-size: 9.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--text-3);
  margin: 0 0 8px;
  display: flex; align-items: center; gap: 8px;
}
.dh-count {
  background: var(--surface-2);
  border-radius: 8px;
  padding: 1px 7px;
  font-size: 9px;
  color: var(--text-2);
  letter-spacing: 0;
}

.props { display: flex; flex-direction: column; gap: 1px; }
.prop {
  display: grid; grid-template-columns: 110px 1fr;
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
  font-size: 11.5px;
}
.prop:last-child { border-bottom: none; }
.prop-k { color: var(--text-3); }
.prop-v { color: var(--text); }

.link-list { display: flex; flex-direction: column; gap: 4px; }
.link-row {
  display: flex; align-items: center; gap: 8px;
  width: 100%;
  padding: 7px 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--text);
  font-family: inherit; font-size: 11.5px;
  cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.link-row:hover { background: var(--surface-3); border-color: var(--knx-blue); }
.link-arrow {
  color: var(--knx-blue);
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  width: 14px;
}
.link-name { flex: 1; }
.link-kind {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--text-3);
  letter-spacing: 0.1em;
}
.action-chip {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--knx-blue) 14%, transparent);
  color: var(--knx-blue);
  display: flex; gap: 3px; align-items: center;
}
.ac-val { opacity: 0.75; }

.json-block {
  background: var(--bg);
  border: 1px solid var(--border-2);
  border-radius: 5px;
  padding: 10px 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--text-2);
  overflow-x: auto;
  margin: 0;
  line-height: 1.55;
  max-height: 260px;
}

/* scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--knx-blue-2); }
`;
