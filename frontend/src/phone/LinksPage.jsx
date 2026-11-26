// Link page: the first thing customers see after scanning the QR code.
// Logo + name + tagline, a row of round icons, then one big button per link (menu, call, maps, socials...).
import { Utensils, Phone, MapPin, Globe, Clock, ChevronRight } from "lucide-react";

// lucide has no brand icons, so these three are drawn here
const Svg = ({ children }) => <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">{children}</svg>;
const Instagram = () => <Svg><path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.8c2.7 0 3 0 4 .1 2.7.1 4 1.4 4.1 4.1.1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.7-1.4 4-4.1 4.1-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1-.1-1.3-.1-4s0-3 .1-4C3.9 5.3 5.3 4 8 3.9c1 0 1.3-.1 4-.1ZM12 2c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.1 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.1 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2Z" /></Svg>;
const Facebook = () => <Svg><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" /></Svg>;
const WhatsApp = () => <Svg><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm0-21.6A11.8 11.8 0 0 0 1.9 17.9L.2 24l6.3-1.6A11.8 11.8 0 1 0 12 .2Z" /></Svg>;

const withHttp = u => (/^https?:\/\//i.test(u) ? u : "https://" + u);
// "@spicegarden", "spicegarden" or a full link -> a full link
const social = (v, base) => {
  const t = String(v || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t) || /\.(com|in|me)\//i.test(t)) return withHttp(t);
  return base + t.replace(/^@/, "");
};

export function buildLinks(shop, mapUrl) {
  const phone = (shop.phone || "").replace(/[^\d+]/g, "");
  const wa = (shop.whatsapp || "").replace(/[^\d]/g, "");
  return [
    { key: "menu", Icon: Utensils, label: "View Our Menu", menu: true },
    phone && { key: "call", Icon: Phone, label: "Call Us", href: "tel:" + phone },
    wa && { key: "wa", Icon: WhatsApp, label: "WhatsApp", href: "https://wa.me/" + wa },
    mapUrl && { key: "map", Icon: MapPin, label: "Find Us on Maps", href: mapUrl },
    shop.website?.trim() && { key: "web", Icon: Globe, label: "Visit Our Website", href: withHttp(shop.website.trim()) },
    shop.instagram?.trim() && { key: "ig", Icon: Instagram, label: "Instagram", href: social(shop.instagram, "https://instagram.com/") },
    shop.facebook?.trim() && { key: "fb", Icon: Facebook, label: "Facebook", href: social(shop.facebook, "https://facebook.com/") }
  ].filter(Boolean);
}

export default function LinksPage({ brand, shop, mapUrl, photo, onMenu }) {
  const links = buildLinks(shop, mapUrl);
  const initial = (brand.name || "M").trim().charAt(0).toUpperCase();
  const linkProps = l => l.menu
    ? { href: "#menu", onClick: e => { e.preventDefault(); onMenu(); } }
    : { href: l.href, target: l.key === "call" ? undefined : "_blank", rel: "noopener noreferrer" };

  return (
    <div className="lp" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.8)), url(https://images.unsplash.com/${photo}?w=${window.innerWidth > 900 ? 1800 : 900}&q=70&auto=format&fit=crop)` }}>
      <div className="lp-card">
        <div className="lp-logo" aria-hidden="true">{initial}</div>
        <h1>{brand.name || "Our Restaurant"}</h1>
        {brand.tagline && <p className="lp-tag">{brand.tagline}</p>}

        {links.length > 2 && (
          <div className="lp-icons">
            {links.filter(l => !l.menu).map(l => <a key={l.key} {...linkProps(l)} aria-label={l.label} title={l.label}><l.Icon /></a>)}
          </div>
        )}

        <div className="lp-list">
          {links.map(l => (
            <a key={l.key} className={"lp-btn" + (l.menu ? " lp-main" : "")} {...linkProps(l)}>
              <span className="lp-ico"><l.Icon /></span>
              <span className="lp-lab">{l.label}</span>
              <ChevronRight className="lp-chev" aria-hidden="true" />
            </a>
          ))}
        </div>

        {(shop.hours || shop.address) && (
          <div className="lp-info">
            {shop.hours && <p><Clock aria-hidden="true" />{shop.hours}</p>}
            {shop.address && <p><MapPin aria-hidden="true" />{shop.address}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
