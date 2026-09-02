import { useState } from "react";
import { Button, Badge, Empty, Field, Header, Input, Modal, Select, Toolbar, copy, formatDate, material, money, TODAY, nextDueDate } from "../shared";

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


export { Tenants, TenantDetail };
