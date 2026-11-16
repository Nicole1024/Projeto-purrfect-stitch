/** Decoração 1: agulhas de crochê. Balança e gira levemente ao passar o mouse. */
export default function DecoracaoAgulhas({ className = '' }: { className?: string }) {
  return (
    <img
      src="/img/agulhas.png"
      alt=""
      aria-hidden="true"
      className={`decoracao decoracao-agulhas ${className}`}
      draggable={false}
    />
  );
}
