export default function Controls({
  seed,
  onSeedChange,
  onRun,
  onNew,
  onTogglePlay,
  onReplay,
  onSkip,
  playing,
  started,
  finished,
}) {
  return (
    <section className="controls">
      <div className="controls__buttons">
        <button type="button" className="btn btn--primary" onClick={onRun}>
          Run the Games
        </button>
        <button type="button" className="btn" onClick={onNew}>
          New Games
        </button>
        <button
          type="button"
          className="btn"
          onClick={onTogglePlay}
          disabled={!started || finished}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="btn" onClick={onReplay} disabled={!started}>
          Replay
        </button>
        <button type="button" className="btn" onClick={onSkip} disabled={!started || finished}>
          Skip to end
        </button>
      </div>
      <label className="seed">
        Seed
        <input
          type="number"
          min="1"
          value={seed}
          onChange={(event) => onSeedChange(event.target.value)}
        />
      </label>
    </section>
  );
}
