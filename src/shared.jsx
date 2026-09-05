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
function Toast({ message }) {
  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className="toast-enter toast-responsive fixed bottom-5 right-5 z-[60] flex max-w-sm items-center rounded-lg border-2 border-success-600 bg-success-300 text-success-700  px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,.12)]">
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{message}</p>
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
    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-[#f5f5f5] bg-[#fafafa] p-3 md:flex-row md:items-center md:justify-between">
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



export { TODAY, STORAGE_KEY, initialData, copy, money, formatDate, initials, material, addDays, nextDueDate, currentDate, monthlySummary, ensureNextRentCycles, normalizeData, readData, useNavigation, Input, Select, Field, Modal, Empty, Toast, Header, Toolbar, Logo, Button, Badge };
