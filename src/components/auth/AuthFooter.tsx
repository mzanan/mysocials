export function AuthFooter() {
  return (
    <footer className="absolute inset-x-0 bottom-6 text-center text-xs text-fg-faint lg:bottom-8">
      A product by{" "}
      <a
        href="https://itsmatias.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-4 transition-colors hover:text-fg-muted hover:underline"
      >
        itsmatias.com
      </a>
    </footer>
  );
}
