/**
 * A slow, endless line of names. The list is drawn twice side by side and the track slides
 * exactly one copy's width, so the loop never shows a seam. Hovering pauses it.
 * With less motion asked for, the names simply wrap and stay still.
 */
export function NameDrift({
  label,
  names,
  reverse = false,
}: {
  label: string;
  names: readonly string[];
  reverse?: boolean;
}) {
  return (
    <figure className="drift" data-reverse={reverse || undefined}>
      <figcaption className="drift-label">{label}</figcaption>
      <ul className="sr-only">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="drift-viewport" dir="ltr">
        <div className="drift-track">
          {[0, 1].map((copy) => (
            <span key={copy} className="drift-copy">
              {names.map((name) => (
                <span key={name} className="drift-name">
                  {name}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
