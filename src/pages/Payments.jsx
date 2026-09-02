import { useState } from "react";
import { Button, Badge, Empty, Field, Header, Input, Modal, Select, Toolbar, material, money, TODAY } from "../shared";

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

export default Payments;
