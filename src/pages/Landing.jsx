import { Button, Header, Logo } from "../shared";

function Landing({ navigate }) {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <header className="flex items-center justify-between border-b border-[#f5f5f5] px-6 py-5 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/auth")}>Log in</Button>
          <Button onClick={() => navigate("/auth/signup")}>Get started</Button>
        </nav>
      </header>
      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.15em] text-[#bb5602]">PG management, made simple</p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Run your property with clarity.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#575757]">Manage rooms, residents, rent and receipts from one calm, practical workspace.</p>
          <div className="mt-8 flex justify-center gap-3"><Button onClick={() => navigate("/auth/signup")}>Get started</Button><Button variant="outline" onClick={() => navigate("/auth")}>Log in</Button></div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 sm:grid-cols-3">
          {["One clear overview", "Simpler room management", "Payments that stay clear"].map((title) => <article key={title} className="rounded-xl border border-[#e6e6e6] p-6"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm text-[#575757]">Everything you need to keep your PG running smoothly.</p></article>)}
        </section>
      </main>
    </div>
  );
}

export default Landing;
