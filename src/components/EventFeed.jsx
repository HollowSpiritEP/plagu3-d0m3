import { useEffect, useRef } from 'react';

export default function EventFeed({ phases }) {
  const feedRef = useRef(null);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phases.length]);

  return (
    <section className="panel panel--feed">
      <h2 className="panel__title">The Games</h2>
      <div className="feed" ref={feedRef}>
        {phases.length === 0 ? (
          <p className="feed__empty">Press “Run the Games” to send the tributes into the arena.</p>
        ) : (
          phases.map((phase) => (
            <div className="phase" key={`${phase.day}-${phase.label}`}>
              <h3 className="phase__title">
                {phase.day === 0 ? phase.label : `Day ${phase.day} · ${phase.label}`}
                <span className="phase__count">{phase.events.length} events</span>
              </h3>
              <ul className="phase__events">
                {phase.events.map((event) => (
                  <li key={event.id} className={`event event--${event.type}`}>
                    <span className="event__marker" />
                    <span className="event__text">{event.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
