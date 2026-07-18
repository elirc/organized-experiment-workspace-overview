import { loginAction } from "@/modules/auth/actions";
import { demoUsers } from "@/modules/auth/demo-users";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = params.error === "invalid-user";

  return (
    <div className="hero-login">
      <section className="hero-pane brand">
        <h1 style={{ fontSize: "3rem", marginBottom: 16 }}>Founder CRM Lite</h1>
        <p style={{ maxWidth: 560, lineHeight: 1.7 }}>
          This training app is structured like a realistic internal sales tool: explicit domain services, role-aware
          workflows, activity timelines, and CRUD flows that are meant to be read and reviewed like production code.
        </p>
        <div className="list" style={{ marginTop: 28 }}>
          <div className="list-item">Track leads from intake through qualification and conversion.</div>
          <div className="list-item">Review pipeline health, owner workload, and overdue follow-ups.</div>
          <div className="list-item">Study how business logic stays out of React components.</div>
        </div>
      </section>

      <section className="hero-pane" style={{ display: "grid", alignItems: "center" }}>
        <div className="card login-card">
          <h2>Choose a demo identity</h2>
          <p className="subtle">
            We are using a cookie-backed demo session so the code can focus on permission boundaries rather than
            external identity setup.
          </p>
          {error ? <p style={{ color: "var(--danger)" }}>Please choose a valid demo user.</p> : null}
          <form action={loginAction} className="form-grid">
            <div className="field">
              <label htmlFor="userId">Demo user</label>
              <select id="userId" name="userId" defaultValue={demoUsers[0]?.id}>
                {demoUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.role.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="button">
              Start session
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
