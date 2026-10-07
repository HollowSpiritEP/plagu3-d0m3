export default function StatsBar({ day, standing, fallen, leader }) {
  const stats = [
    { label: 'Day', value: day },
    { label: 'Standing', value: standing },
    { label: 'Fallen', value: fallen },
    {
      label: 'Most kills',
      value: leader ? `${leader.name} · ${leader.kills}` : '—',
    },
  ];

  return (
    <section className="stats">
      {stats.map((stat) => (
        <div className="stat" key={stat.label}>
          <span className="stat__value">{stat.value}</span>
          <span className="stat__label">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
