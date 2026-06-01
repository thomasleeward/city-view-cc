import Link from "next/link";

const items = [
  { label: "Dashboard", href: "/admin" },
  { label: "Assessments", href: "/admin/assessments" },
  { label: "PCO IDs", href: "/admin/pcoids" },
  { label: "Sermons", href: "/admin/sermons" },
  { label: "Hero", href: "/admin/hero" },
  { label: "View Site", href: "/" },
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-terracotta hover:text-terracotta"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
