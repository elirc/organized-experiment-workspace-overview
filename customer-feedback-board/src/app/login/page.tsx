import Link from "next/link";
import { demoUsers } from "@/modules/auth/demo-users";
import { loginAction } from "@/modules/auth/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = params.error === "invalid-user";

  return (
    <div className="page-container">
      <section className="hero">
        <div>
          <h1>Sign in to the feedback board</h1>
          <p className="muted">
            We use demo identities here so you can study role differences without needing external auth setup.
          </p>
          <p className="muted">
            Guests can still browse the public board, but voting, commenting, and internal workflows require a session.
          </p>
          <Link href="/" className="button-secondary">
            Continue as guest
          </Link>
        </div>

        <div className="card">
          <h2>Choose a demo user</h2>
          {error ? <p style={{ color: "var(--danger)" }}>Please choose a valid user.</p> : null}
          <form action={loginAction} className="form-grid">
            <div className="field">
              <label htmlFor="userId">Demo identity</label>
              <select id="userId" name="userId" defaultValue={demoUsers[0]?.id}>
                {demoUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.role.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <button className="button" type="submit">
              Start session
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
