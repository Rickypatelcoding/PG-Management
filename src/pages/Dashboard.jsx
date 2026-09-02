import { Button, Badge, Empty, Field, Header, Input, Modal, Select, Toolbar, Logo, copy, formatDate, initials, material, money, monthlySummary } from "../shared";

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


export default Dashboard;

