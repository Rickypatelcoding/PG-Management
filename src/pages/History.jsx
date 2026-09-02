import { useState } from "react";
import { Button, Empty, Header, Input, Toolbar, formatDate, material, money, monthlySummary } from "../shared";

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

export default History;
