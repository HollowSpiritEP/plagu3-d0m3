import TributeCard from './TributeCard.jsx';

export default function RosterPanel({ tributes, aliveIds, kills }) {
  const standing = new Set(aliveIds);

  return (
    <section className="panel">
      <h2 className="panel__title">
        The Tributes
        <span className="panel__count">
          {standing.size}/{tributes.length} standing
        </span>
      </h2>
      <div className="roster">
        {tributes.map((tribute) => (
          <TributeCard
            key={tribute.id}
            tribute={tribute}
            alive={standing.has(tribute.id)}
            kills={kills[tribute.name] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
