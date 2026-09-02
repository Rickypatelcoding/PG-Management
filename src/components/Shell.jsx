import { useState } from "react";
import { Button, Logo, material, initials } from "../shared";

function Shell({ path, profile, navigate, logout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    ["/dashboard", "Dashboard", "space_dashboard"],
    ["/rooms", "Rooms", "meeting_room"],
    ["/tenants", "Tenants", "group"],
    ["/payments", "Payments", "payments"],
    ["/history", "History & Reports", "analytics"],
    ["/settings", "Settings", "settings"],
  ];
  const current =
    links.find(([href]) => path.startsWith(href))?.[0] || "/dashboard";
  const go = (href) => {
    navigate(href);
    setMobileOpen(false);
  };
  const nav = (
    <aside
      className={`${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#e6e6e6] bg-white transition-transform duration-200`}
    >
      <div className="flex h-20 items-center border-b border-[#f5f5f5] px-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
        {links.map(([href, label, symbol]) => (
          <button
            key={href}
            onClick={() => go(href)}
            className={`focusable flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold ${current === href ? "bg-[#fff4c5] text-[#481a00]" : "text-[#575757] hover:bg-[#f5f5f5]"}`}
          >
            {material(symbol, current === href ? "text-[#bb5602]" : "")}
            <span>{label}</span>
          </button>
        ))}
        <div className="my-5 border-t border-[#f5f5f5]" />
        <button
          onClick={() => go("/receipts/r1")}
          className="focusable flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-[#575757] hover:bg-[#f5f5f5]"
        >
          {material("receipt_long")}
          <span>Receipts</span>
        </button>
      </nav>
      <div className="border-t border-[#f5f5f5] p-4">
        <button
          onClick={() => go("/settings")}
          className="focusable flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[#f5f5f5]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-bold">
            {initials(profile.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {profile.name}
            </span>
            <span className="block truncate text-xs text-[#575757]">
              Administrator
            </span>
          </span>
          {material("chevron_right", "ml-auto text-[#a5a5a5]")}
        </button>
      </div>
    </aside>
  );
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#1a1a1a]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      {nav}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e6e6e6] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="focusable rounded-md p-2 text-[#575757] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              {material("menu")}
            </button>
            <div className="lg:hidden">
              <Logo iconOnly />
            </div>
            <span className="hidden text-sm text-[#575757] lg:block">
              {links.find(([href]) => href === current)?.[1] || "Receipt"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => go("/settings")}
              className="focusable hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold hover:bg-[#f5f5f5] sm:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-bold">
                {initials(profile.name)}
              </span>
              {profile.name}
            </button>
            <button
              onClick={logout}
              className="focusable rounded-lg p-2 text-[#575757] hover:bg-[#f5f5f5]"
              aria-label="Log out"
            >
              {material("logout")}
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export default Shell;
