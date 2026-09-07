/** Fixed atmospheric background used on every marketing/legal page. */
export function Background() {
  return (
    <>
      <div className="bg-grid pointer-events-none fixed inset-0 z-0 opacity-40" />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora" />
      </div>
    </>
  );
}
