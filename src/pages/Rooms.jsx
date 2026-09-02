import { useState } from "react";
import { Button, Badge, Empty, Field, Header, Input, Modal, Select, Toolbar, material, money, TODAY } from "../shared";

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

export default Rooms;
