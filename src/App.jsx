import { useEffect, useMemo, useState } from 'react';
import { runSimulation } from './game/simulation.js';
import Controls from './components/Controls.jsx';
import EventFeed from './components/EventFeed.jsx';
import RosterPanel from './components/RosterPanel.jsx';
import StatsBar from './components/StatsBar.jsx';
import VictoryBanner from './components/VictoryBanner.jsx';
import './styles.css';

const DEFAULT_SEED = 1337;
const PLAYBACK_MS = 550;

export default function App() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [result, setResult] = useState(() => runSimulation(DEFAULT_SEED));
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const totalPhases = result.phases.length;
  const finished = phaseIndex >= totalPhases;

  useEffect(() => {
    if (!playing || finished) return undefined;
    const timer = setTimeout(() => setPhaseIndex((index) => index + 1), PLAYBACK_MS);
    return () => clearTimeout(timer);
  }, [playing, phaseIndex, finished]);

  useEffect(() => {
    if (finished && playing) setPlaying(false);
  }, [finished, playing]);

  const visiblePhases = useMemo(
    () => result.phases.slice(0, phaseIndex),
    [result, phaseIndex],
  );

  const aliveIds = useMemo(
    () =>
      visiblePhases.length
        ? visiblePhases[visiblePhases.length - 1].aliveIds
        : result.tributes.map((tribute) => tribute.id),
    [visiblePhases, result],
  );

  const kills = useMemo(() => {
    const tally = {};
    for (const phase of visiblePhases) {
      for (const event of phase.events) {
        if (event.killer) tally[event.killer] = (tally[event.killer] ?? 0) + 1;
      }
    }
    return tally;
  }, [visiblePhases]);

  const leader = useMemo(() => {
    const ranked = result.tributes
      .map((tribute) => ({ name: tribute.name, kills: kills[tribute.name] ?? 0 }))
      .sort((a, b) => b.kills - a.kills);
    return ranked[0] && ranked[0].kills > 0 ? ranked[0] : null;
  }, [result, kills]);

  const currentDay = visiblePhases.length
    ? visiblePhases[visiblePhases.length - 1].day
    : 0;

  const loadGames = (nextSeed, autoplay) => {
    setSeed(nextSeed);
    setResult(runSimulation(nextSeed));
    setPhaseIndex(0);
    setPlaying(autoplay);
  };

  return (
    <div className="app">
      <header className="masthead">
        <p className="masthead__eyebrow">Hunger Games simulator</p>
        <h1 className="masthead__title">The PlAGU3 D0M3</h1>
        <p className="masthead__sub">Twenty-four tributes enter. One walks out.</p>
      </header>

      <Controls
        seed={seed}
        onSeedChange={setSeed}
        onRun={() => loadGames(Number(seed) || 1, true)}
        onNew={() => loadGames(Math.floor(Math.random() * 900000) + 1, true)}
        onTogglePlay={() => setPlaying((value) => !value)}
        onReplay={() => {
          setPhaseIndex(0);
          setPlaying(true);
        }}
        onSkip={() => {
          setPhaseIndex(totalPhases);
          setPlaying(false);
        }}
        playing={playing}
        started={phaseIndex > 0 || playing}
        finished={finished}
      />

      <StatsBar
        day={currentDay}
        standing={aliveIds.length}
        fallen={result.tributes.length - aliveIds.length}
        leader={leader}
      />

      {finished && <VictoryBanner victor={result.victor} />}

      <main className="layout">
        <RosterPanel tributes={result.tributes} aliveIds={aliveIds} kills={kills} />
        <EventFeed phases={visiblePhases} />
      </main>
    </div>
  );
}
