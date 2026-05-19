export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-muted">
          © {year} Coordi. 모든 권리 보유.
        </p>
        <nav className="flex gap-6 text-sm text-muted">
          <a href="/privacy" className="hover:text-foreground transition">
            개인정보처리방침
          </a>
          <a href="mailto:hello@example.com" className="hover:text-foreground transition">
            문의
          </a>
          <a href="#waitlist" className="hover:text-foreground transition">
            대기열 등록
          </a>
        </nav>
      </div>
    </footer>
  );
}
