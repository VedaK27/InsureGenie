import { theme } from "../constants/theme";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        Insur<span className="g">Genie</span>
      </div>
      <div className="footer-links">
        {theme.footerLinks.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
      <div className="footer-copy">{theme.footerCopy}</div>
    </footer>
  );
}