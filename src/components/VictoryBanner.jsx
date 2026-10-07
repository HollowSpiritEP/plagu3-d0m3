export default function VictoryBanner({ victor }) {
  if (!victor) return null;

  return (
    <section className="victory">
      <p className="victory__eyebrow">The Games are over</p>
      <h2 className="victory__name">{victor.name}</h2>
      <p className="victory__meta">
        {victor.districtName} · {victor.kills} {victor.kills === 1 ? 'kill' : 'kills'}
      </p>
    </section>
  );
}
