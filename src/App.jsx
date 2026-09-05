import { useEffect, useState } from "react";
import { Button, Empty, Toast, STORAGE_KEY, ensureNextRentCycles, normalizeData, readData, useNavigation } from "./shared";
import Shell from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import { Tenants, TenantDetail } from "./pages/Tenants";
import Payments from "./pages/Payments";
import Receipt from "./pages/Receipt";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import UserDashboard from "./pages/UserDashboard";

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
  const pathname = path.split("?")[0];
  const auth = pathname.startsWith("/auth");
  const publicPage = pathname === "/" || pathname === "/user-dashboard";
  useEffect(() => {
    if (!data.session && !auth && !publicPage) navigate("/auth");
    if (data.session && auth) navigate("/dashboard");
  }, [data.session, auth, navigate]);
  if (publicPage && pathname === "/") return <Landing navigate={navigate} />;
  if (publicPage && pathname === "/user-dashboard") return <UserDashboard data={data} navigate={navigate} />;
  if (!data.session || auth)
    return <Auth navigate={navigate} setSession={setSession} />;
  let page;
  if (pathname === "/dashboard" || pathname === "/academy-admin/dashboard")
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
  else if (pathname === "/settings" || pathname === "/academy-admin/settings")
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
