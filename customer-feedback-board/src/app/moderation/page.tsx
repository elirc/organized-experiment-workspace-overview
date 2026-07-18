import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { requireRole } from "@/modules/auth/session";
import { mergeDuplicateAction } from "@/modules/feedback/actions";
import { getModerationCenter } from "@/modules/feedback/service";

export default async function ModerationPage() {
  const user = await requireRole(["moderator", "product_manager", "admin"]);
  const data = await getModerationCenter(user);

  return (
    <SiteShell user={user}>
      <PageHeader
        title="Moderation center"
        description="Moderation flows are where a lot of weaker codebases lose auditability. Study how flags and merge behavior are made explicit."
      />
      <section className="grid two">
        <article className="card">
          <h3>Open flags</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Reason</th>
                  <th>Flagged by</th>
                </tr>
              </thead>
              <tbody>
                {data.flags.map((flag) => (
                  <tr key={flag.id}>
                    <td>{flag.postTitle}</td>
                    <td>{flag.reason}</td>
                    <td>{flag.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h3>Merge duplicates</h3>
          <form action={mergeDuplicateAction} className="form-grid">
            <div className="field">
              <label htmlFor="sourcePostId">Source post</label>
              <select id="sourcePostId" name="sourcePostId">
                {data.posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="targetPostId">Canonical post</label>
              <select id="targetPostId" name="targetPostId">
                {data.posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>
            <button className="button" type="submit">
              Merge duplicate
            </button>
          </form>
        </article>
      </section>
    </SiteShell>
  );
}
