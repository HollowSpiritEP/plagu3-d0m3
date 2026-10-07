export default function TributeCard({ tribute, alive, kills }) {
  const label = alive
    ? tribute.weapon
      ? `Armed with ${tribute.weapon}`
      : 'Unarmed'
    : tribute.cause;

  return (
    <article className={`tribute ${alive ? 'tribute--alive' : 'tribute--dead'}`}>
      <header className="tribute__head">
        <span className="tribute__district">{tribute.district}</span>
        <span className="tribute__name">{tribute.name}</span>
      </header>
      <p className="tribute__meta">
        <span>{tribute.age}</span>
        <span className="tribute__divider">·</span>
        <span>{tribute.districtName}</span>
      </p>
      <footer className="tribute__foot">
        <span className="tribute__label">{label}</span>
        <span className="tribute__kills">
          {kills} {kills === 1 ? 'kill' : 'kills'}
        </span>
      </footer>
    </article>
  );
}
