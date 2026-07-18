import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/modules/auth/session";
import { getBoardHome } from "@/modules/feedback/service";

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const board = await getBoardHome(user, {});
  const roadmapPosts = board.posts.filter((post) => ["Planned", "In Progress", "Shipped"].includes(post.status));

  return (
    <SiteShell user={user}>
      <PageHeader
        title="Roadmap"
        description="Public roadmap views should be a projection of product-team state, not a separate untrusted source of truth."
      />
      <div className="grid three">
        {roadmapPosts.map((post) => (
          <article key={post.id} className="card">
            <StatusBadge value={post.status} />
            <h3>{post.title}</h3>
            <p className="muted">{post.body}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
