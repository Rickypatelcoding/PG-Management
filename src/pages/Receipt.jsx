import { Button, material, money } from "../shared";

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

export default Receipt;
