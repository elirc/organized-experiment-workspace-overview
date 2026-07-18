import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/modules/auth/session";
import { createPostAction } from "@/modules/feedback/actions";
import { getFeedbackDatabase } from "@/modules/feedback/repository";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const db = await getFeedbackDatabase();

  return (
    <SiteShell user={user}>
      <PageHeader
        title="Submit feedback"
        description="This form should stay simple. Validation, visibility rules, and persistence live in server-side modules."
      />
      <article className="card">
        <form action={createPostAction} className="form-grid">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>
          <div className="field">
            <label htmlFor="body">Description</label>
            <textarea id="body" name="body" rows={6} required />
          </div>
          <div className="field">
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId">
              {db.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="visibility">Visibility</label>
            <select id="visibility" name="visibility" defaultValue="public">
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </div>
          <button className="button" type="submit">
            Submit idea
          </button>
        </form>
      </article>
    </SiteShell>
  );
}
