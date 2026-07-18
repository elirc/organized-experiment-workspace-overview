import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { getCurrentUser, canManageRoadmap, canModerate } from "@/modules/auth/session";
import { addCommentAction, addInternalNoteAction, addOfficialResponseAction, changeStatusAction, flagPostAction, toggleFollowAction, toggleVoteAction } from "@/modules/feedback/actions";
import { getPostDetail } from "@/modules/feedback/service";
import { formatDateTime } from "@/modules/shared/format";

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const detail = await getPostDetail(user, slug);

  if (!detail) {
    notFound();
  }

  const roadmapEditor = canManageRoadmap(user);

  return (
    <SiteShell user={user}>
      <PageHeader
        title={detail.post.title}
        description="This page is a good place to study how one record can have public discussion, PM communication, moderation state, and internal context without collapsing into one giant component."
        actions={
          <div className="stack">
            <StatusBadge value={detail.post.status} />
            <span className="badge blue">{detail.categoryName}</span>
            <span className="badge blue">{detail.voteCount} votes</span>
          </div>
        }
      />

      <section className="grid two">
        <article className="card">
          <p>{detail.post.body}</p>
          <p className="muted">
            Submitted by {detail.authorName} · Last activity {formatDateTime(detail.post.lastActivityAt)}
          </p>

          <div className="toolbar">
            {user ? (
              <>
                <form action={toggleVoteAction}>
                  <input type="hidden" name="postId" value={detail.post.id} />
                  <button className={detail.hasVoted ? "button-secondary" : "button"} type="submit">
                    {detail.hasVoted ? "Remove vote" : "Vote"}
                  </button>
                </form>
                <form action={toggleFollowAction}>
                  <input type="hidden" name="postId" value={detail.post.id} />
                  <button className="button-secondary" type="submit">
                    {detail.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </form>
                <form action={flagPostAction}>
                  <input type="hidden" name="postId" value={detail.post.id} />
                  <input type="hidden" name="reason" value="duplicate" />
                  <button className="button-danger" type="submit">
                    Flag as duplicate
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </article>

        <article className="card">
          <h3>Official updates</h3>
          <Timeline
            items={detail.officialUpdates.map((update) => ({
              id: update.id,
              title: "Official team update",
              body: update.body,
              createdAt: update.createdAt,
              actor: update.authorName
            }))}
          />
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <h3>Comments</h3>
          <Timeline
            items={detail.comments.map((comment) => ({
              id: comment.id,
              title: comment.authorName,
              body: comment.body,
              createdAt: comment.createdAt
            }))}
          />
          {user ? (
            <form action={addCommentAction} className="form-grid" style={{ marginTop: 18 }}>
              <input type="hidden" name="postId" value={detail.post.id} />
              <div className="field">
                <label htmlFor="body">Add comment</label>
                <textarea id="body" name="body" rows={4} required />
              </div>
              <button className="button-secondary" type="submit">
                Add comment
              </button>
            </form>
          ) : null}
        </article>

        <article className="card">
          <h3>Moderation / roadmap timeline</h3>
          <Timeline
            items={detail.moderationActions.map((action) => ({
              id: action.id,
              title: action.details,
              createdAt: action.createdAt,
              actor: action.actorName
            }))}
          />

          {roadmapEditor ? (
            <div className="grid" style={{ marginTop: 18 }}>
              <form action={changeStatusAction} className="form-grid">
                <input type="hidden" name="postId" value={detail.post.id} />
                <div className="field">
                  <label htmlFor="status">Change status</label>
                  <select id="status" name="status" defaultValue={detail.post.status}>
                    <option>Open</option>
                    <option>Under Review</option>
                    <option>Planned</option>
                    <option>In Progress</option>
                    <option>Shipped</option>
                    <option>Declined</option>
                    <option>Duplicate</option>
                  </select>
                </div>
                <button className="button-secondary" type="submit">
                  Save status
                </button>
              </form>

              <form action={addOfficialResponseAction} className="form-grid">
                <input type="hidden" name="postId" value={detail.post.id} />
                <div className="field">
                  <label htmlFor="body">Official response</label>
                  <textarea id="body" name="body" rows={3} required />
                </div>
                <button className="button-secondary" type="submit">
                  Publish official response
                </button>
              </form>

              <form action={addInternalNoteAction} className="form-grid">
                <input type="hidden" name="postId" value={detail.post.id} />
                <div className="field">
                  <label htmlFor="body">Internal note</label>
                  <textarea id="body" name="body" rows={3} required />
                </div>
                <button className="button-secondary" type="submit">
                  Add internal note
                </button>
              </form>
            </div>
          ) : null}
        </article>
      </section>

      {canManageRoadmap(user) ? (
        <article className="card">
          <h3>Internal notes</h3>
          <Timeline
            items={detail.internalNotes.map((note) => ({
              id: note.id,
              title: "Internal note",
              body: note.body,
              createdAt: note.createdAt,
              actor: note.authorName
            }))}
          />
        </article>
      ) : null}

      {canModerate(user) ? (
        <article className="card">
          <h3>Moderation access</h3>
          <p className="muted">Moderators, PMs, and admins can review duplicate flags and merge records from the moderation center.</p>
        </article>
      ) : null}
    </SiteShell>
  );
}
