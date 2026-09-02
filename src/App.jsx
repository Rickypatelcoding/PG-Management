import { useEffect, useState } from "react";
import Logo from "./components/BrandLogo";
import Button from "./components/ActionButton";
import Badge from "./components/StatusBadge";

const TODAY = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = "pg-management-demo-v1";

const initialData = {
  session: null,
  profile: {
    name: "Admin User",
    email: "admin@mypg.com",
    pgName: "My PG",
    address: "12 Green Park, Bengaluru",
  },
  rooms: [
    {
      id: "101",
      floor: 1,
      type: "Single",
      rent: 8000,
      status: "active",
      beds: [
        { id: "101-1", tenantId: "t1" },
        { id: "101-2", tenantId: null },
      ],
    },
    {
      id: "201",
      floor: 2,
      type: "Double",
      rent: 7500,
      status: "active",
      beds: [
        { id: "201-1", tenantId: "t2" },
        { id: "201-2", tenantId: "t3" },
      ],
    },
    {
      id: "301",
      floor: 3,
      type: "Dorm",
      rent: 6000,
      status: "active",
      beds: [
        { id: "301-1", tenantId: "t4" },
        { id: "301-2", tenantId: null },
        { id: "301-3", tenantId: null },
      ],
    },
    {
      id: "302",
      floor: 3,
      type: "Double",
      rent: 6500,
      status: "maintenance",
      beds: [
        { id: "302-1", tenantId: null },
        { id: "302-2", tenantId: null },
      ],
    },
  ],
  tenants: [
    {
      id: "t1",
      name: "Raj Kumar",
      phone: "9876543210",
      email: "raj@example.com",
      roomId: "101",
      bedId: "101-1",
      status: "active",
      moveIn: "2024-08-15",
      idType: "Aadhaar",
      idNumber: "1234-5678-9012",
      emergencyName: "Anita Kumar",
      emergencyPhone: "9876500000",
      documents: [{ id: "d1", name: "Aadhaar Proof.pdf", status: "verified" }],
    },
    {
      id: "t2",
      name: "Priya Singh",
      phone: "9123456789",
      email: "priya@example.com",
      roomId: "201",
      bedId: "201-1",
      status: "active",
      moveIn: "2024-08-04",
      idType: "PAN",
      idNumber: "ABCDE1234F",
      emergencyName: "Ravi Singh",
      emergencyPhone: "9123400000",
      documents: [{ id: "d2", name: "PAN Card.jpg", status: "verified" }],
    },
    {
      id: "t3",
      name: "Neha Patel",
      phone: "8765432109",
      email: "neha@example.com",
      roomId: "201",
      bedId: "201-2",
      status: "active",
      moveIn: "2024-08-10",
      idType: "Aadhaar",
      idNumber: "9876-5432-1098",
      emergencyName: "Meena Patel",
      emergencyPhone: "8765400000",
      documents: [{ id: "d3", name: "Aadhaar Proof.pdf", status: "pending" }],
    },
    {
      id: "t4",
      name: "Amit Patel",
      phone: "9988776655",
      email: "amit@example.com",
      roomId: "301",
      bedId: "301-1",
      status: "active",
      moveIn: "2024-07-25",
      idType: "Driving Licence",
      idNumber: "KA01202400001",
      emergencyName: "Vijay Patel",
      emergencyPhone: "9988700000",
      documents: [
        { id: "d4", name: "Driving Licence.pdf", status: "verified" },
      ],
    },
    {
      id: "t5",
      name: "Vikas Desai",
      phone: "9111222333",
      email: "vikas@example.com",
      roomId: null,
      bedId: null,
      status: "vacated",
      moveIn: "2024-05-02",
      idType: "Aadhaar",
      idNumber: "4567-8901-2345",
      emergencyName: "Rina Desai",
      emergencyPhone: "9111200000",
      documents: [],
    },
  ],
  payments: [
    {
      id: "p1",
      tenantId: "t1",
      amount: 8000,
      dueDate: "2024-09-05",
      status: "paid",
      paidDate: "2024-09-01",
      mode: "Cash",
      receiptId: "r1",
    },
    {
      id: "p2",
      tenantId: "t2",
      amount: 7500,
      dueDate: "2024-09-03",
      status: "paid",
      paidDate: "2024-09-01",
      mode: "UPI",
      receiptId: "r2",
    },
    {
      id: "p3",
      tenantId: "t3",
      amount: 7500,
      dueDate: "2024-09-03",
      status: "pending",
    },
    {
      id: "p4",
      tenantId: "t4",
      amount: 6000,
      dueDate: "2024-08-25",
      status: "overdue",
    },
    {
      id: "p5",
      tenantId: "t5",
      amount: 6000,
      dueDate: "2024-08-20",
      status: "overdue",
    },
  ],
  receipts: [
    { id: "r1", number: "001", paymentId: "p1", createdAt: TODAY },
    { id: "r2", number: "002", paymentId: "p2", createdAt: TODAY },
  ],
};

const copy = (value) => JSON.parse(JSON.stringify(value));
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const material = (name, className = "") => (
  <span aria-hidden="true" className={`material-symbols-rounded ${className}`}>
    {name}
  </span>
);
const addDays = (date, days) => {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};
const nextDueDate = (date) => addDays(date, 30);
const currentDate = () => new Date().toISOString().slice(0, 10);
const monthlySummary = (payments) =>
  Object.values(
    payments.reduce((summary, payment) => {
      const key = payment.dueDate.slice(0, 7);
      const month = summary[key] || { key, expected: 0, collected: 0 };
      month.expected += Number(payment.amount || 0);
      if (payment.status === "paid")
        month.collected += Number(payment.amount || 0);
      summary[key] = month;
      return summary;
    }, {}),
  ).sort((a, b) => b.key.localeCompare(a.key));
const ensureNextRentCycles = (data) => {
  const additions = data.tenants
    .filter((tenant) => tenant.status === "active" && tenant.roomId)
    .flatMap((tenant) => {
      const history = data.payments
        .filter((payment) => payment.tenantId === tenant.id)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
      const latest = history[0];
      if (!latest || latest.status !== "paid") return [];
      const dueDate = nextDueDate(latest.dueDate);
      if (
        data.payments.some(
          (payment) =>
            payment.tenantId === tenant.id && payment.dueDate === dueDate,
        )
      )
        return [];
      return [
        {
          id: `p${tenant.id}-${dueDate}`,
          tenantId: tenant.id,
          amount:
            data.rooms.find((room) => room.id === tenant.roomId)?.rent ||
            latest.amount,
          dueDate,
          status: "pending",
        },
      ];
    });
  return additions.length
    ? { ...data, payments: [...data.payments, ...additions] }
    : data;
};

// Keep the client-side demo state internally consistent. A real API must enforce
// the same constraints transactionally; this prevents stale localStorage from
// turning one bed into two active assignments.
function normalizeData(value) {
  const data = copy(value);
  const seenTenants = new Set();
  data.rooms = data.rooms.map((room) => ({
    ...room,
    beds: room.beds.map((bed) => {
      const tenant = data.tenants.find((item) => item.id === bed.tenantId);
      if (
        !tenant ||
        tenant.status === "vacated" ||
        seenTenants.has(bed.tenantId)
      )
        return { ...bed, tenantId: null };
      seenTenants.add(bed.tenantId);
      return bed;
    }),
  }));
  const assignments = new Map(
    data.rooms.flatMap((room) =>
      room.beds
        .filter((bed) => bed.tenantId)
        .map((bed) => [bed.tenantId, { roomId: room.id, bedId: bed.id }]),
    ),
  );
  data.tenants = data.tenants.map((tenant) => {
    const assignment = assignments.get(tenant.id);
    if (!assignment)
      return {
        ...tenant,
        roomId: null,
        bedId: null,
        status: tenant.status === "vacated" ? "vacated" : "active",
      };
    return { ...tenant, ...assignment, status: "active" };
  });
  // Payment state is time-derived: unpaid rent becomes overdue as soon as its
  // due date has passed, including after a reload or while the app is open.
  const today = currentDate();
  data.payments = data.payments.map((payment) =>
    payment.status === "paid"
      ? payment
      : { ...payment, status: payment.dueDate < today ? "overdue" : "pending" },
  );
  return data;
}

function readData() {
  try {
    return normalizeData(
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData,
    );
  } catch {
    return copy(initialData);
  }
}

function useNavigation() {
  const [path, setPath] = useState(
    window.location.pathname + window.location.search,
  );
  useEffect(() => {
    const onPopState = () =>
      setPath(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  };
  return [path, navigate];
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`focusable h-10 w-full rounded-md border border-[#e6e6e6] bg-white px-3 text-sm placeholder:text-[#a5a5a5] focus:border-[#e27d00] ${className}`}
      {...props}
    />
  );
}
function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`focusable h-10 w-full rounded-md border border-[#e6e6e6] bg-white px-3 text-sm focus:border-[#e27d00] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
function Field({ label, required, error, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-[#575757]">
        {label}
        {required && <span className="text-[#b91c1c]"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-[#575757]">{hint}</span>}
      {error && (
        <span className="block text-xs font-medium text-[#b91c1c]">
          {material("error", "mr-1 align-middle text-sm")}
          {error}
        </span>
      )}
    </label>
  );
}
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,.12)]"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="focusable rounded-md p-1 text-[#575757] hover:bg-[#f5f5f5]"
            aria-label="Close"
          >
            {material("close")}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({ icon = "inbox", title, copyText, action }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 rounded-full bg-[#f5f5f5] p-3 text-[#a5a5a5]">
        {material(icon, "text-3xl")}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#575757]">{copyText}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
function Toast({ message, close }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-lg border border-[#e6e6e6] border-l-4 border-l-[#16a34a] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,.12)]">
      <span className="text-[#15803d]">{material("check_circle")}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={close}
        className="focusable ml-2 text-[#575757]"
        aria-label="Dismiss"
      >
        {material("close", "text-lg")}
      </button>
    </div>
  );
}
function Header({ eyebrow, title, description, children }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#bb5602]">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-[#575757]">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}
function Toolbar({ search, setSearch, placeholder = "Search...", children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative min-w-0 flex-1 md:max-w-sm">
        {material(
          "search",
          "pointer-events-none absolute left-3 top-2.5 text-xl text-[#a5a5a5]",
        )}
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

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

function Dashboard({ data, navigate }) {
  const totalBeds = data.rooms.reduce((sum, room) => sum + room.beds.length, 0);
  const occupied = data.rooms.reduce(
    (sum, room) => sum + room.beds.filter((bed) => bed.tenantId).length,
    0,
  );
  const pending = data.payments.filter((p) => p.status === "pending");
  const overdue = data.payments.filter((p) => p.status === "overdue");
  return (
    <>
      <Header
        eyebrow="Overview"
        title={`Good morning, ${data.profile.name.split(" ")[0]}`}
        description="Here’s what’s happening across your property today."
      >
        <Button onClick={() => navigate("/tenants?new=1")}>
          {material("person_add")}Add tenant
        </Button>
      </Header>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Occupancy rate"
          value={`${Math.round((occupied / totalBeds) * 100)}%`}
          detail={`${occupied} of ${totalBeds} beds occupied`}
          link="View rooms"
          icon="meeting_room"
          onClick={() => navigate("/rooms")}
        />
        <Metric
          label="Pending payments"
          value={money(pending.reduce((sum, p) => sum + p.amount, 0))}
          detail={`${pending.length} tenant awaiting payment`}
          link="View payments"
          icon="payments"
          onClick={() => navigate("/payments")}
        />
        <Metric
          label="Overdue amount"
          value={money(overdue.reduce((sum, p) => sum + p.amount, 0))}
          detail={`${overdue.length} overdue records`}
          link="Review overdue"
          icon="warning"
          danger
          onClick={() => navigate("/payments?status=overdue")}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-xl border border-[#e6e6e6]">
          <div className="flex items-center justify-between border-b border-[#f5f5f5] p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Upcoming due dates</h2>
              <p className="mt-1 text-sm text-[#575757]">
                The next payments that need your attention.
              </p>
            </div>
            <button
              onClick={() => navigate("/payments")}
              className="focusable text-sm font-bold text-[#7c360b]"
            >
              View all
            </button>
          </div>
          {pending.length ? (
            <div className="divide-y divide-[#f5f5f5]">
              {pending.slice(0, 3).map((payment) => {
                const tenant = data.tenants.find(
                  (t) => t.id === payment.tenantId,
                );
                return (
                  <div
                    className="flex items-center justify-between gap-4 p-5"
                    key={payment.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-bold">
                        {initials(tenant?.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {tenant?.name}
                        </p>
                        <p className="text-xs text-[#575757]">
                          Room {tenant?.roomId || "—"} · Due{" "}
                          {formatDate(payment.dueDate)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular">
                      {money(payment.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty
              title="No upcoming payments"
              copyText="You’re all caught up for now."
            />
          )}
        </section>
        <section className="rounded-xl border border-[#e6e6e6]">
          <div className="flex items-start justify-between border-b border-[#f5f5f5] p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Overdue alerts</h2>
              <p className="mt-1 text-sm text-[#575757]">
                Follow up with these tenants.
              </p>
            </div>
            <span className="rounded-lg bg-[#fee2e2] p-2 text-[#b91c1c]">
              {material("priority_high")}
            </span>
          </div>
          <div className="border-l-4 border-[#ef4444] bg-[#fef2f2] p-5">
            <p className="text-sm font-semibold">
              {overdue.length} payment{overdue.length === 1 ? "" : "s"} overdue
            </p>
            <p className="mt-1 text-sm text-[#575757]">
              {overdue[0] &&
                `${data.tenants.find((t) => t.id === overdue[0].tenantId)?.name} is past their due date.`}
            </p>
            <button
              onClick={() => navigate("/payments?status=overdue")}
              className="focusable mt-4 text-sm font-bold text-[#b91c1c]"
            >
              View overdue list →
            </button>
          </div>
        </section>
      </div>
      <section className="mt-6 rounded-xl border border-[#e6e6e6] p-5 sm:p-6">
        <h2 className="text-lg font-bold">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/tenants?new=1")}
          >
            {material("person_add")}Add tenant
          </Button>
          <Button variant="secondary" onClick={() => navigate("/rooms")}>
            {material("meeting_room")}View rooms
          </Button>
          <Button variant="secondary" onClick={() => navigate("/payments")}>
            {material("payments")}Record payment
          </Button>
        </div>
      </section>
    </>
  );
}
function Metric({ label, value, detail, link, icon: symbol, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="focusable w-full rounded-xl border border-[#e6e6e6] p-5 text-left transition-colors hover:border-[#d6d6d6] sm:p-6"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#575757]">
          {label}
        </span>
        <span className="text-[#bb5602]">{material(symbol, "text-2xl")}</span>
      </div>
      <div
        className={`mt-4 text-3xl font-bold tabular ${danger ? "text-[#b91c1c]" : ""}`}
      >
        {value}
      </div>
      <p className="mt-1 text-sm text-[#575757]">{detail}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#7c360b]">
        {link}
        {material("arrow_forward", "text-base")}
      </span>
    </button>
  );
}

function Rooms({ data, update, navigate, notify }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    id: "",
    floor: "1",
    type: "Double",
    beds: "2",
    rent: "7000",
  });
  const rooms = data.rooms.filter((room) =>
    `${room.id} ${room.type}`.toLowerCase().includes(search.toLowerCase()),
  );
  const addRoom = (event) => {
    event.preventDefault();
    if (!form.id || data.rooms.some((room) => room.id === form.id)) return;
    const room = {
      id: form.id,
      floor: Number(form.floor),
      type: form.type,
      rent: Number(form.rent),
      status: "active",
      beds: Array.from({ length: Number(form.beds) }, (_, i) => ({
        id: `${form.id}-${i + 1}`,
        tenantId: null,
      })),
    };
    update((next) => ({ ...next, rooms: [...next.rooms, room] }));
    setModal(null);
    notify("Room added successfully");
  };
  return (
    <>
      <Header
        eyebrow="Property"
        title="Rooms & beds"
        description="Keep your inventory accurate and prevent double-booking."
      >
        <Button variant="outline" onClick={() => setModal("add")}>
          {material("add")}Add room
        </Button>
        <Button onClick={() => navigate("/tenants?new=1")}>
          {material("person_add")}Assign tenant
        </Button>
      </Header>
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search rooms..."
      >
        <Select className="w-auto">
          <option>All statuses</option>
          <option>Active</option>
          <option>Maintenance</option>
        </Select>
      </Toolbar>
      <div className="overflow-hidden rounded-xl border border-[#e6e6e6]">
        <div className="hidden grid-cols-[1.4fr_.7fr_1fr_1fr_1fr_40px] gap-4 bg-[#fafafa] px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#575757] md:grid">
          <span>Room</span>
          <span>Floor</span>
          <span>Type</span>
          <span>Occupancy</span>
          <span>Status</span>
          <span />
        </div>
        {rooms.length ? (
          rooms.map((room) => {
            const count = room.beds.filter((bed) => bed.tenantId).length;
            return (
              <div
                key={room.id}
                className="border-t border-[#f5f5f5] first:border-t-0"
              >
                <div className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_.7fr_1fr_1fr_1fr_40px] md:items-center md:gap-4">
                  <button
                    onClick={() =>
                      setExpanded({
                        ...expanded,
                        [room.id]: !expanded[room.id],
                      })
                    }
                    className="focusable flex items-center gap-2 text-left text-sm font-bold"
                  >
                    <span
                      className={`transition-transform ${expanded[room.id] ? "rotate-180" : ""}`}
                    >
                      {material("expand_more")}
                    </span>
                    Room {room.id}
                  </button>
                  <span className="text-sm text-[#575757]">
                    Floor {room.floor}
                  </span>
                  <span className="text-sm text-[#575757]">
                    {room.type} · {money(room.rent)}
                  </span>
                  <span className="text-sm font-semibold tabular">
                    {count}/{room.beds.length} beds
                  </span>
                  <span>
                    <Badge
                      status={
                        room.status === "maintenance"
                          ? "maintenance"
                          : count === room.beds.length
                            ? "occupied"
                            : "vacant"
                      }
                    />
                  </span>
                  <button
                    onClick={() => {
                      update((next) => ({
                        ...next,
                        rooms: next.rooms.map((item) =>
                          item.id === room.id
                            ? {
                                ...item,
                                status:
                                  item.status === "maintenance"
                                    ? "active"
                                    : "maintenance",
                              }
                            : item,
                        ),
                      }));
                      notify(
                        room.status === "maintenance"
                          ? "Room marked active"
                          : "Room marked for maintenance",
                      );
                    }}
                    className="focusable rounded-md p-2 text-[#575757] hover:bg-[#f5f5f5]"
                    aria-label="Toggle room maintenance"
                  >
                    {material("more_vert")}
                  </button>
                </div>
                {expanded[room.id] && (
                  <div className="space-y-2 bg-[#fafafa] px-6 py-4 md:px-12">
                    {room.beds.map((bed, index) => {
                      const tenant = data.tenants.find(
                        (item) => item.id === bed.tenantId,
                      );
                      return (
                        <div
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e6e6e6] bg-white px-4 py-3"
                          key={bed.id}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              Bed {index + 1}
                            </span>
                            {tenant ? (
                              <button
                                onClick={() =>
                                  navigate(`/tenants/${tenant.id}`)
                                }
                                className="focusable text-sm text-[#7c360b]"
                              >
                                {tenant.name}
                              </button>
                            ) : (
                              <span className="text-sm text-[#575757]">
                                Unassigned
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              status={
                                tenant
                                  ? "occupied"
                                  : room.status === "maintenance"
                                    ? "maintenance"
                                    : "vacant"
                              }
                            />
                            {!tenant && room.status !== "maintenance" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setModal({
                                    type: "assign",
                                    roomId: room.id,
                                    bedId: bed.id,
                                  })
                                }
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <Empty
            icon="meeting_room"
            title="No rooms found"
            copyText="Try a different search or add your first room."
          />
        )}
      </div>
      {modal === "add" && (
        <Modal title="Add room" onClose={() => setModal(null)}>
          <form onSubmit={addRoom} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Room number" required>
                <Input
                  required
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. 401"
                />
              </Field>
              <Field label="Floor">
                <Input
                  type="number"
                  min="1"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Room type">
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Single</option>
                  <option>Double</option>
                  <option>Dorm</option>
                </Select>
              </Field>
              <Field label="Beds">
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={form.beds}
                  onChange={(e) => setForm({ ...form, beds: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Monthly rent per bed">
              <Input
                type="number"
                min="0"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Add room</Button>
            </div>
          </form>
        </Modal>
      )}
      {modal?.type === "assign" && (
        <AssignModal
          modal={modal}
          data={data}
          update={update}
          close={() => setModal(null)}
          notify={notify}
        />
      )}
    </>
  );
}
function AssignModal({ modal, data, update, close, notify }) {
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const assign = (event) => {
    event.preventDefault();
    const tenant = data.tenants.find((item) => item.id === tenantId);
    const room = data.rooms.find((item) => item.id === modal.roomId);
    const bed = room?.beds.find((item) => item.id === modal.bedId);
    if (!tenantId || !tenant || tenant.status === "vacated")
      return setError("Choose an active, unassigned tenant.");
    if (!room || room.status === "maintenance" || !bed || bed.tenantId)
      return setError(
        "This bed is no longer available. Refresh and choose another bed.",
      );
    update((next) => ({
      ...next,
      rooms: next.rooms.map((item) =>
        item.id === modal.roomId
          ? {
              ...item,
              beds: item.beds.map((itemBed) =>
                itemBed.id === modal.bedId ? { ...itemBed, tenantId } : itemBed,
              ),
            }
          : item,
      ),
      tenants: next.tenants.map((item) =>
        item.id === tenantId
          ? {
              ...item,
              roomId: modal.roomId,
              bedId: modal.bedId,
              status: "active",
            }
          : item,
      ),
    }));
    close();
    notify("Tenant assigned successfully");
  };
  return (
    <Modal title="Assign tenant" onClose={close}>
      <form onSubmit={assign} className="space-y-4">
        <Field label="Select tenant" required error={error}>
          <Select
            value={tenantId}
            onChange={(event) => {
              setTenantId(event.target.value);
              setError("");
            }}
          >
            <option value="">Choose an unassigned tenant</option>
            {data.tenants
              .filter((tenant) => !tenant.roomId && tenant.status !== "vacated")
              .map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Assign tenant</Button>
        </div>
      </form>
    </Modal>
  );
}

function TenantForm({ data, update, navigate, close, notify, existing }) {
  const [form, setForm] = useState(
    existing || {
      name: "",
      phone: "",
      email: "",
      roomId: "",
      moveIn: TODAY,
      idType: "Aadhaar",
      idNumber: "",
      emergencyName: "",
      emergencyPhone: "",
    },
  );
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const save = (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(form.phone))
      return setError("Phone must be exactly 10 digits");
    if (form.emergencyPhone && !/^\d{10}$/.test(form.emergencyPhone))
      return setError("Emergency phone must be exactly 10 digits");
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return setError("Enter a valid email address");
    if (!existing && form.moveIn < TODAY)
      return setError("Move-in date cannot be in the past");
    if (!existing && !file) return setError("ID proof is required");
    if (file && file.size > 5 * 1024 * 1024)
      return setError("File must be smaller than 5 MB");
    if (
      file &&
      !["application/pdf", "image/jpeg", "image/jpg"].includes(file.type)
    )
      return setError("Only PDF or JPG files are accepted");
    const id = existing?.id || `t${Date.now()}`;
    const selectedRoom = data.rooms.find((room) => room.id === form.roomId);
    const selectedBed = selectedRoom?.beds.find(
      (bed) => !bed.tenantId || bed.tenantId === id,
    );
    if (
      form.roomId &&
      (!selectedRoom || selectedRoom.status === "maintenance" || !selectedBed)
    )
      return setError("Choose a room with an available active bed.");
    const tenant = {
      ...form,
      id,
      roomId: form.roomId || null,
      bedId: selectedBed?.id || null,
      status: form.roomId ? "active" : existing?.status || "active",
      documents: file
        ? [
            ...(existing?.documents || []),
            { id: `d${Date.now()}`, name: file.name, status: "pending" },
          ]
        : existing?.documents || [],
    };
    update((next) => ({
      ...next,
      tenants: existing
        ? next.tenants.map((item) => (item.id === id ? tenant : item))
        : [...next.tenants, tenant],
      // PRD: creating an assigned tenant starts the first 30-day rent cycle.
      payments:
        !existing && tenant.roomId
          ? [
              ...next.payments,
              {
                id: `p${Date.now()}`,
                tenantId: id,
                amount:
                  next.rooms.find((room) => room.id === tenant.roomId)?.rent ||
                  0,
                dueDate: nextDueDate(tenant.moveIn),
                status: "pending",
              },
            ]
          : next.payments,
      rooms: next.rooms.map((room) => ({
        ...room,
        beds: room.beds.map((bed) => {
          if (bed.tenantId === id) return { ...bed, tenantId: null };
          if (room.id === tenant.roomId && bed.id === tenant.bedId)
            return { ...bed, tenantId: id };
          return bed;
        }),
      })),
    }));
    close();
    notify(existing ? "Tenant profile updated" : "Tenant added successfully");
    navigate(`/tenants/${id}`);
  };
  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#575757]">
          Personal information
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Phone" required>
            <Input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="numeric"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Move-in date" required>
            <Input
              type="date"
              required
              value={form.moveIn}
              onChange={(e) => setForm({ ...form, moveIn: e.target.value })}
            />
          </Field>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#575757]">
          Government ID
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ID type">
            <Select
              value={form.idType}
              onChange={(e) => setForm({ ...form, idType: e.target.value })}
            >
              <option>Aadhaar</option>
              <option>PAN</option>
              <option>Driving Licence</option>
            </Select>
          </Field>
          <Field label="ID number" required>
            <Input
              required
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field
            label="ID proof"
            required={!existing}
            hint="PDF or JPG, up to 5 MB"
          >
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="py-2 file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-semibold"
            />
          </Field>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#575757]">
          Room assignment
        </p>
        <Field label="Room">
          <Select
            value={form.roomId || ""}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
          >
            <option value="">Keep unassigned</option>
            {data.rooms.flatMap((room) =>
              room.beds
                .filter((bed) => !bed.tenantId && room.status !== "maintenance")
                .map((bed) => (
                  <option key={bed.id} value={room.id}>
                    Room {room.id} · Bed available
                  </option>
                )),
            )}
          </Select>
        </Field>
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#575757]">
          Emergency contact
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input
              value={form.emergencyName}
              onChange={(e) =>
                setForm({ ...form, emergencyName: e.target.value })
              }
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.emergencyPhone}
              onChange={(e) =>
                setForm({ ...form, emergencyPhone: e.target.value })
              }
            />
          </Field>
        </div>
      </div>
      {error && (
        <div
          aria-live="polite"
          className="rounded-lg border border-[#fee2e2] bg-[#fef2f2] p-3 text-sm font-medium text-[#b91c1c]"
        >
          {material("error", "mr-2 align-middle")}
          {error}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit">
          {existing ? "Save changes" : "Save tenant"}
        </Button>
      </div>
    </form>
  );
}

function Tenants({ data, update, navigate, notify }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(
    new URLSearchParams(window.location.search).get("new") ? "add" : null,
  );
  const list = data.tenants.filter((t) =>
    `${t.name} ${t.phone} ${t.roomId || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <Header
        eyebrow="Residents"
        title="Tenant profiles"
        description="Manage resident details, room assignments, and documents."
      >
        <Button onClick={() => setModal("add")}>
          {material("person_add")}Add new tenant
        </Button>
      </Header>
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search tenants..."
      >
        <Select className="w-auto">
          <option>All statuses</option>
          <option>Active</option>
          <option>Vacated</option>
        </Select>
      </Toolbar>
      <div className="overflow-hidden rounded-xl border border-[#e6e6e6]">
        <div className="hidden grid-cols-[1.5fr_1fr_1.2fr_1fr_1fr_40px] gap-4 bg-[#fafafa] px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#575757] md:grid">
          <span>Tenant</span>
          <span>Room</span>
          <span>Phone</span>
          <span>Status</span>
          <span className="text-right">Dues</span>
          <span />
        </div>
        {list.length ? (
          list.map((tenant) => {
            const dues = data.payments
              .filter((p) => p.tenantId === tenant.id && p.status !== "paid")
              .reduce((sum, p) => sum + p.amount, 0);
            return (
              <div
                key={tenant.id}
                className="grid gap-3 border-t border-[#f5f5f5] px-5 py-4 first:border-t-0 md:grid-cols-[1.5fr_1fr_1.2fr_1fr_1fr_40px] md:items-center md:gap-4"
              >
                <button
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                  className="focusable flex items-center gap-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-bold">
                    {initials(tenant.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {tenant.name}
                    </span>
                    <span className="block truncate text-xs text-[#575757]">
                      {tenant.email}
                    </span>
                  </span>
                </button>
                <span className="text-sm text-[#575757]">
                  {tenant.roomId ? `Room ${tenant.roomId}` : "Unassigned"}
                </span>
                <span className="text-sm tabular text-[#575757]">
                  {tenant.phone}
                </span>
                <span>
                  <Badge status={tenant.status} />
                </span>
                <span
                  className={`text-sm font-bold tabular md:text-right ${dues ? "text-[#b91c1c]" : ""}`}
                >
                  {dues ? money(dues) : "No dues"}
                </span>
                <button
                  onClick={() => setModal(tenant)}
                  className="focusable rounded-md p-2 text-[#575757] hover:bg-[#f5f5f5]"
                  aria-label={`Edit ${tenant.name}`}
                >
                  {material("more_vert")}
                </button>
              </div>
            );
          })
        ) : (
          <Empty
            icon="group"
            title="No tenants found"
            copyText="Try a different search or add a new tenant."
          />
        )}
      </div>
      {modal === "add" && (
        <Modal title="Add new tenant" onClose={() => setModal(null)}>
          <TenantForm
            data={data}
            update={update}
            navigate={navigate}
            close={() => setModal(null)}
            notify={notify}
          />
        </Modal>
      )}
      {modal && modal !== "add" && (
        <Modal title={`Edit ${modal.name}`} onClose={() => setModal(null)}>
          <TenantForm
            existing={modal}
            data={data}
            update={update}
            navigate={navigate}
            close={() => setModal(null)}
            notify={notify}
          />
        </Modal>
      )}
    </>
  );
}

function TenantDetail({ data, update, navigate, notify, id }) {
  const tenant = data.tenants.find((item) => item.id === id);
  const [edit, setEdit] = useState(false);
  if (!tenant)
    return (
      <Empty
        icon="person_off"
        title="Tenant not found"
        copyText="This profile may have been removed."
        action={
          <Button onClick={() => navigate("/tenants")}>Back to tenants</Button>
        }
      />
    );
  const payments = data.payments.filter((p) => p.tenantId === id);
  const dues = payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const vacate = () => {
    if (!window.confirm(`Mark ${tenant.name} as vacant?`)) return;
    update((next) => ({
      ...next,
      tenants: next.tenants.map((t) =>
        t.id === id
          ? { ...t, status: "vacated", roomId: null, bedId: null }
          : t,
      ),
      rooms: next.rooms.map((room) => ({
        ...room,
        beds: room.beds.map((bed) =>
          bed.tenantId === id ? { ...bed, tenantId: null } : bed,
        ),
      })),
    }));
    notify("Tenant marked as vacated");
    navigate("/tenants");
  };
  return (
    <>
      <Header
        eyebrow="Tenant profile"
        title={tenant.name}
        description={`${tenant.status === "active" ? "Active resident" : "Historical resident"} · Added ${formatDate(tenant.moveIn)}`}
      >
        <Button variant="outline" onClick={() => setEdit(true)}>
          {material("edit")}Edit profile
        </Button>
        <Button
          variant="danger"
          disabled={tenant.status === "vacated"}
          onClick={vacate}
        >
          {material("logout")}Mark vacant
        </Button>
      </Header>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#e6e6e6] p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4c5] text-lg font-bold text-[#7c360b]">
                  {initials(tenant.name)}
                </span>
                <div>
                  <h2 className="text-xl font-bold">{tenant.name}</h2>
                  <p className="mt-1 text-sm text-[#575757]">{tenant.email}</p>
                </div>
              </div>
              <Badge status={tenant.status} />
            </div>
            <div className="mt-6 grid gap-5 border-t border-[#f5f5f5] pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#575757]">
                  Phone
                </p>
                <p className="mt-1 text-sm font-semibold tabular">
                  {tenant.phone}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#575757]">
                  Room
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {tenant.roomId ? `Room ${tenant.roomId}` : "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#575757]">
                  Move-in date
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(tenant.moveIn)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#575757]">
                  Emergency contact
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {tenant.emergencyName || "—"}{" "}
                  <span className="font-normal text-[#575757]">
                    {tenant.emergencyPhone}
                  </span>
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-[#e6e6e6] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Rent & payment summary</h2>
                <p className="mt-1 text-sm text-[#575757]">
                  Current record for this tenant.
                </p>
              </div>
              {material("payments", "text-[#575757] text-2xl")}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[#575757]">Monthly rent</p>
                <p className="mt-1 text-lg font-bold">
                  {money(data.rooms.find((r) => r.id === tenant.roomId)?.rent)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#575757]">Outstanding</p>
                <p
                  className={`mt-1 text-lg font-bold ${dues ? "text-[#b91c1c]" : ""}`}
                >
                  {dues ? money(dues) : "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#575757]">Payment records</p>
                <p className="mt-1 text-lg font-bold tabular">
                  {payments.length}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => navigate("/payments")}
            >
              View payment history {material("arrow_forward")}
            </Button>
          </section>
        </div>
        <section className="rounded-xl border border-[#e6e6e6] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Documents</h2>
              <p className="mt-1 text-sm text-[#575757]">
                Identity and tenancy records.
              </p>
            </div>
            <button
              onClick={() =>
                notify("Document upload is available from Edit profile")
              }
              className="focusable rounded-lg p-2 text-[#575757] hover:bg-[#f5f5f5]"
              aria-label="Upload document"
            >
              {material("upload_file")}
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {tenant.documents?.length ? (
              tenant.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 rounded-lg border border-[#f5f5f5] p-3"
                >
                  <span className="rounded-md bg-[#f5f5f5] p-2 text-[#575757]">
                    {material("description")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {document.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#575757]">
                      Identity document
                    </p>
                  </div>
                  <Badge
                    status={
                      document.status === "pending" ? "pendingDoc" : "verified"
                    }
                  />
                </div>
              ))
            ) : (
              <Empty
                icon="folder_off"
                title="No documents"
                copyText="Upload ID proof from the edit form."
              />
            )}
          </div>
        </section>
      </div>
      {edit && (
        <Modal title={`Edit ${tenant.name}`} onClose={() => setEdit(false)}>
          <TenantForm
            existing={tenant}
            data={data}
            update={update}
            navigate={navigate}
            close={() => setEdit(false)}
            notify={notify}
          />
        </Modal>
      )}
    </>
  );
}

function Payments({ data, update, navigate, notify }) {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(params.get("status") || "all");
  const [selected, setSelected] = useState(null);
  const list = data.payments.filter((p) => {
    const t = data.tenants.find((item) => item.id === p.tenantId);
    return (
      (filter === "all" || p.status === filter) &&
      `${t?.name} ${t?.roomId || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });
  const total = (status) =>
    data.payments
      .filter((p) => status === "expected" || p.status === status)
      .reduce((sum, p) => sum + p.amount, 0);
  const save = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const receiptId = `r${Date.now()}`;
    update((next) => ({
      ...next,
      payments: next.payments.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              status: "paid",
              paidDate: form.get("paidDate"),
              mode: form.get("mode"),
              reference: form.get("reference"),
              receiptId,
            }
          : p,
      ),
      receipts: [
        ...next.receipts,
        {
          id: receiptId,
          paymentId: selected.id,
          number: String(next.receipts.length + 1).padStart(3, "0"),
          createdAt: form.get("paidDate"),
        },
      ],
    }));
    setSelected(null);
    notify("Payment marked as paid and receipt generated");
    navigate(`/receipts/${receiptId}`);
  };
  return (
    <>
      <Header
        eyebrow="Finance"
        title="Payment tracking"
        description="Track rent collection and follow up on outstanding payments."
      >
        <Button variant="outline" onClick={() => navigate("/history")}>
          {material("download")}Export report
        </Button>
      </Header>
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search tenant or room..."
      >
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-auto"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </Select>
      </Toolbar>
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Expected", "expected"],
          ["Collected", "paid"],
          ["Pending", "pending"],
          ["Overdue", "overdue"],
        ].map(([label, status]) => (
          <div className="rounded-lg border border-[#e6e6e6] p-4" key={label}>
            <p className="text-xs text-[#575757]">{label}</p>
            <p
              className={`mt-1 text-lg font-bold tabular ${status === "overdue" ? "text-[#b91c1c]" : ""}`}
            >
              {money(total(status))}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-[#e6e6e6]">
        <div className="hidden grid-cols-[1.5fr_.7fr_1fr_1fr_1fr_120px] gap-4 bg-[#fafafa] px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#575757] md:grid">
          <span>Tenant</span>
          <span>Room</span>
          <span className="text-right">Amount</span>
          <span>Due date</span>
          <span>Status</span>
          <span />
        </div>
        {list.length ? (
          list.map((payment) => {
            const tenant = data.tenants.find((t) => t.id === payment.tenantId);
            return (
              <div
                className="grid gap-3 border-t border-[#f5f5f5] px-5 py-4 first:border-t-0 md:grid-cols-[1.5fr_.7fr_1fr_1fr_1fr_120px] md:items-center md:gap-4"
                key={payment.id}
              >
                <button
                  onClick={() => navigate(`/tenants/${tenant?.id}`)}
                  className="focusable text-left text-sm font-bold"
                >
                  {tenant?.name}
                </button>
                <span className="text-sm text-[#575757]">
                  {tenant?.roomId ? `Room ${tenant.roomId}` : "—"}
                </span>
                <span className="text-sm font-bold tabular md:text-right">
                  {money(payment.amount)}
                </span>
                <span className="text-sm text-[#575757]">
                  {formatDate(payment.dueDate)}
                </span>
                <span>
                  <Badge status={payment.status} />
                </span>
                <div className="flex gap-2">
                  {payment.status !== "paid" && (
                    <Button size="sm" onClick={() => setSelected(payment)}>
                      Mark paid
                    </Button>
                  )}
                  {payment.receiptId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/receipts/${payment.receiptId}`)}
                      aria-label="View receipt"
                    >
                      {material("receipt_long")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <Empty
            icon="payments"
            title="No payments found"
            copyText="Adjust your filters to see more records."
          />
        )}
      </div>
      {selected && (
        <Modal title="Mark payment received" onClose={() => setSelected(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="rounded-lg bg-[#fafafa] p-4">
              <p className="text-xs text-[#575757]">Payment for</p>
              <p className="mt-1 font-bold">
                {data.tenants.find((t) => t.id === selected.tenantId)?.name}
              </p>
              <p className="mt-1 text-sm text-[#575757]">
                {money(selected.amount)} · Due {formatDate(selected.dueDate)}
              </p>
            </div>
            <Field label="Date received" required>
              <Input
                name="paidDate"
                type="date"
                defaultValue={TODAY}
                required
              />
            </Field>
            <Field label="Payment mode" required>
              <Select name="mode" defaultValue="Cash">
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
              </Select>
            </Field>
            <Field label="Reference">
              <Input name="reference" placeholder="Optional transaction ID" />
            </Field>
            <Field label="Notes">
              <textarea
                name="notes"
                className="focusable min-h-24 w-full rounded-md border border-[#e6e6e6] p-3 text-sm"
                placeholder="Optional notes"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save & generate receipt</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Receipt({ data, navigate, id }) {
  const receipt =
    data.receipts.find((item) => item.id === id) || data.receipts[0];
  const payment = data.payments.find((item) => item.id === receipt?.paymentId);
  const tenant = data.tenants.find((item) => item.id === payment?.tenantId);
  if (!receipt || !payment || !tenant)
    return (
      <Empty
        title="Receipt unavailable"
        copyText="This receipt could not be found."
        action={
          <Button onClick={() => navigate("/payments")}>
            Back to payments
          </Button>
        }
      />
    );
  return (
    <>
      <div className="no-print mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/payments")}>
          {material("arrow_back")}Back to payments
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            {material("print")}Print / Save PDF
          </Button>
          <Button variant="ghost" onClick={() => navigate("/history")}>
            {material("share")}
            <span className="hidden sm:inline">Share (v2)</span>
          </Button>
        </div>
      </div>
      <article className="print-area mx-auto max-w-2xl border border-[#e6e6e6] bg-white p-6 text-[#000] sm:p-12">
        <div className="flex items-start justify-between border-b-2 border-[#000] pb-8">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm">{data.profile.address}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold">RENT PAYMENT RECEIPT</p>
            <p className="mt-2">Receipt #: {receipt.number}</p>
            <p>Date: {formatDate(receipt.createdAt)}</p>
          </div>
        </div>
        <div className="grid gap-6 border-b border-[#000] py-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">
              Bill to
            </p>
            <p className="mt-2 text-lg font-bold">{tenant.name}</p>
            <p className="mt-1 text-sm">Room {tenant.roomId || "—"}</p>
            <p className="text-sm">{tenant.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest">
              Payment details
            </p>
            <p className="mt-2 text-sm">
              Paid on {formatDate(payment.paidDate)}
            </p>
            <p className="text-sm">Mode: {payment.mode}</p>
          </div>
        </div>
        <div className="border-b border-[#000] py-6">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="mt-5 flex justify-between text-sm">
            <span>
              Rent for{" "}
              {new Date(`${payment.dueDate}T00:00:00`).toLocaleDateString(
                "en-IN",
                { month: "long", year: "numeric" },
              )}
            </span>
            <span className="font-bold tabular">{money(payment.amount)}</span>
          </div>
          <div className="mt-5 flex justify-between border-t border-[#000] pt-4 text-base font-bold">
            <span>Total</span>
            <span className="tabular">{money(payment.amount)}</span>
          </div>
        </div>
        <div className="flex justify-between pt-8 text-sm">
          <span>Received by: {data.profile.name}</span>
          <span>Thank you for your payment.</span>
        </div>
      </article>
    </>
  );
}

function History({ data, navigate, notify }) {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const rows = data.payments
    .filter((payment) => payment.status === "paid")
    .filter((payment) =>
      data.tenants
        .find((tenant) => tenant.id === payment.tenantId)
        ?.name.toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((payment) => !month || payment.paidDate?.slice(0, 7) === month);
  const summary = monthlySummary(data.payments);
  const exportCsv = () => {
    const csv = [
      "Date,Tenant,Room,Amount,Mode,Status",
      ...rows.map((payment) => {
        const tenant = data.tenants.find(
          (item) => item.id === payment.tenantId,
        );
        return [
          payment.paidDate,
          tenant?.name,
          tenant?.roomId || "",
          payment.amount,
          payment.mode,
          payment.status,
        ]
          .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
          .join(",");
      }),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pg-payment-history.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("CSV downloaded");
  };
  return (
    <>
      <Header
        eyebrow="Reporting"
        title="History & reports"
        description="Review collection history and download operational reports."
      >
        <Button variant="outline" onClick={exportCsv}>
          {material("download")}Export CSV
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          {material("print")}Print
        </Button>
      </Header>
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search payment history..."
      >
        <Input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="w-auto"
        />
      </Toolbar>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-[#e6e6e6]">
          <div className="border-b border-[#f5f5f5] p-5">
            <h2 className="font-bold">Payment log</h2>
            <p className="mt-1 text-sm text-[#575757]">
              Completed transactions from your property.
            </p>
          </div>
          {rows.length ? (
            rows.map((payment) => {
              const tenant = data.tenants.find(
                (item) => item.id === payment.tenantId,
              );
              return (
                <div
                  className="flex items-center justify-between gap-4 border-t border-[#f5f5f5] p-5"
                  key={payment.id}
                >
                  <div>
                    <p className="text-sm font-bold">{tenant?.name}</p>
                    <p className="mt-1 text-xs text-[#575757]">
                      {formatDate(payment.paidDate)} · Room{" "}
                      {tenant?.roomId || "—"} · {payment.mode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular">
                      {money(payment.amount)}
                    </p>
                    <button
                      onClick={() => navigate(`/receipts/${payment.receiptId}`)}
                      className="focusable mt-1 text-xs font-semibold text-[#7c360b]"
                    >
                      Receipt →
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <Empty
              title="No completed payments"
              copyText="Completed transactions will appear here."
            />
          )}
        </section>
        <section className="rounded-xl border border-[#e6e6e6]">
          <div className="border-b border-[#f5f5f5] p-5">
            <h2 className="font-bold">Monthly summary</h2>
            <p className="mt-1 text-sm text-[#575757]">
              Calculated from recorded payment data.
            </p>
          </div>
          {summary.map((item) => {
            const complete = item.expected
              ? Math.round((item.collected / item.expected) * 100)
              : 0;
            return (
              <div
                className="grid grid-cols-[1.3fr_1fr_1fr_.6fr] gap-2 border-t border-[#f5f5f5] p-5 text-sm"
                key={item.key}
              >
                <span className="font-semibold">
                  {new Date(`${item.key}-01T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { month: "long", year: "numeric" },
                  )}
                </span>
                <span className="text-right tabular text-[#575757]">
                  {money(item.expected)}
                </span>
                <span className="text-right tabular">
                  {money(item.collected)}
                </span>
                <span className="text-right font-bold text-[#15803d]">
                  {complete}%
                </span>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}

function Settings({ data, update, logout, notify }) {
  const [profile, setProfile] = useState(data.profile);
  const [password, setPassword] = useState(false);
  const save = (e) => {
    e.preventDefault();
    update((next) => ({ ...next, profile }));
    notify("Profile updated successfully");
  };
  const deleteAccount = () => {
    if (window.confirm("Delete this local demo account and sign out?"))
      logout();
  };
  return (
    <>
      <Header
        eyebrow="Workspace"
        title="Settings"
        description="Manage your profile and workspace preferences."
      />
      <div className="grid max-w-4xl gap-6">
        <section className="rounded-xl border border-[#e6e6e6] p-5 sm:p-6">
          <h2 className="text-lg font-bold">Admin profile</h2>
          <p className="mt-1 text-sm text-[#575757]">
            This information appears on receipts and your workspace.
          </p>
          <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </Field>
            <Field label="PG name">
              <Input
                value={profile.pgName}
                onChange={(e) =>
                  setProfile({ ...profile, pgName: e.target.value })
                }
              />
            </Field>
            <Field label="Address">
              <Input
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </section>
        <section className="rounded-xl border border-[#e6e6e6] p-5 sm:p-6">
          <h2 className="text-lg font-bold">Account settings</h2>
          <div className="mt-5 divide-y divide-[#f5f5f5]">
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div>
                <p className="text-sm font-semibold">Change password</p>
                <p className="mt-1 text-xs text-[#575757]">
                  Update the password used for this demo account.
                </p>
              </div>
              <Button variant="outline" onClick={() => setPassword(true)}>
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold">
                  Two-factor authentication
                </p>
                <p className="mt-1 text-xs text-[#575757]">
                  Extra account security is coming in v2.
                </p>
              </div>
              <Button variant="outline" disabled>
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold">Reset demo data</p>
                <p className="mt-1 text-xs text-[#575757]">
                  Restore the original sample residents and payments.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  update(() => copy(initialData));
                  notify("Demo data reset");
                }}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-[#b91c1c]">
                  Delete account
                </p>
                <p className="mt-1 text-xs text-[#575757]">
                  This demo action clears your local session.
                </p>
              </div>
              <Button variant="danger" onClick={deleteAccount}>
                Delete
              </Button>
            </div>
          </div>
        </section>
        <Button variant="ghost" className="justify-self-start" onClick={logout}>
          {material("logout")}Log out
        </Button>
      </div>
      {password && (
        <Modal title="Change password" onClose={() => setPassword(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPassword(false);
              notify("Password updated for this demo");
            }}
            className="space-y-4"
          >
            <Field label="Current password" required>
              <Input type="password" required />
            </Field>
            <Field
              label="New password"
              required
              hint="Use at least 8 characters"
            >
              <Input type="password" minLength="8" required />
            </Field>
            <Field label="Confirm password" required>
              <Input type="password" minLength="8" required />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save password</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Auth({ navigate, setSession }) {
  const [signup, setSignup] = useState(
    window.location.pathname.endsWith("signup"),
  );
  const [form, setForm] = useState({
    email: "admin@mypg.com",
    password: "demo1234",
    pgName: "",
  });
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!form.email.includes("@") || form.password.length < 8)
      return setError(
        "Enter a valid email and a password of at least 8 characters.",
      );
    setSession(
      { email: form.email, role: "admin" },
      signup ? { email: form.email, pgName: form.pgName || "My PG" } : null,
    );
    navigate("/dashboard");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">
            {signup ? "Create your workspace" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-[#575757]">
            {signup
              ? "Set up your PG management workspace."
              : "Sign in to manage your property."}
          </p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-[#e6e6e6] p-6 sm:p-8"
        >
          <Field label="Email address" required>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          {signup && (
            <Field label="PG name" required>
              <Input
                required
                value={form.pgName}
                onChange={(e) => setForm({ ...form, pgName: e.target.value })}
                placeholder="e.g. Green Park PG"
              />
            </Field>
          )}
          <Field label="Password" required>
            <Input
              type="password"
              minLength="8"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {!signup && (
              <span className="block text-xs text-[#575757]">
                Demo account is prefilled. Use any password with 8+ characters.
              </span>
            )}
          </Field>
          {error && (
            <div
              aria-live="polite"
              className="rounded-lg bg-[#fef2f2] p-3 text-sm text-[#b91c1c]"
            >
              {material("error", "mr-2 align-middle")}
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">
            {signup ? "Create account" : "Log in"}
            {material("arrow_forward")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[#575757]">
          {signup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setSignup(!signup);
              setError("");
              navigate(signup ? "/auth" : "/auth/signup");
            }}
            className="focusable font-bold text-[#7c360b]"
          >
            {signup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [path, navigate] = useNavigation();
  const [data, setData] = useState(readData);
  const [toast, setToast] = useState("");
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  // Keep overdue alerts current while the dashboard is open, as required by the PRD.
  useEffect(() => {
    const timer = window.setInterval(
      () => setData((current) => normalizeData(current)),
      5000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const update = (mutator) =>
    setData((current) => ensureNextRentCycles(mutator(current)));
  const notify = (message) => setToast(message);
  const logout = () => {
    update((next) => ({ ...next, session: null }));
    navigate("/auth");
  };
  const setSession = (session, profile) =>
    update((next) => ({
      ...next,
      session,
      profile: profile ? { ...next.profile, ...profile } : next.profile,
    }));
  const auth = path.startsWith("/auth");
  useEffect(() => {
    if (!data.session && !auth) navigate("/auth");
    if (data.session && auth) navigate("/dashboard");
  }, [data.session, auth, navigate]);
  if (!data.session || auth)
    return <Auth navigate={navigate} setSession={setSession} />;
  const pathname = path.split("?")[0];
  let page;
  if (pathname === "/" || pathname === "/dashboard")
    page = <Dashboard data={data} navigate={navigate} />;
  else if (pathname === "/rooms")
    page = (
      <Rooms data={data} update={update} navigate={navigate} notify={notify} />
    );
  else if (pathname === "/tenants")
    page = (
      <Tenants
        data={data}
        update={update}
        navigate={navigate}
        notify={notify}
      />
    );
  else if (pathname.startsWith("/tenants/"))
    page = (
      <TenantDetail
        id={pathname.split("/")[2]}
        data={data}
        update={update}
        navigate={navigate}
        notify={notify}
      />
    );
  else if (pathname === "/payments")
    page = (
      <Payments
        data={data}
        update={update}
        navigate={navigate}
        notify={notify}
      />
    );
  else if (pathname.startsWith("/receipts/"))
    page = (
      <Receipt id={pathname.split("/")[2]} data={data} navigate={navigate} />
    );
  else if (pathname === "/history")
    page = <History data={data} navigate={navigate} notify={notify} />;
  else if (pathname === "/settings")
    page = (
      <Settings data={data} update={update} logout={logout} notify={notify} />
    );
  else
    page = (
      <Empty
        icon="route"
        title="Page not found"
        copyText="The page you requested does not exist."
        action={
          <Button onClick={() => navigate("/dashboard")}>
            Go to dashboard
          </Button>
        }
      />
    );
  return (
    <>
      <Shell
        path={pathname}
        profile={data.profile}
        navigate={navigate}
        logout={logout}
      >
        {page}
      </Shell>
      <Toast message={toast} close={() => setToast("")} />
    </>
  );
}
