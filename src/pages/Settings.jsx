import { useState } from "react";
import { Button, Field, Input, Modal, copy, initialData, material } from "../shared";

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

export default Settings;
