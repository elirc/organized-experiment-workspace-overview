import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/modules/auth/session";
import { completeTaskAction } from "@/modules/crm/actions";
import { listTasks } from "@/modules/crm/service";
import { formatDate, isOverdue } from "@/modules/shared/format";

export default async function TasksPage() {
  const user = await requireUser();
  const tasks = await listTasks(user);

  return (
    <section className="grid">
      <PageHeader
        title="Tasks"
        description="Task queues are where an internal tool starts feeling operationally useful instead of just informational."
      />
      <article className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  <div className="subtle">{task.description}</div>
                </td>
                <td>
                  <StatusBadge value={task.status} />
                </td>
                <td>{task.priority}</td>
                <td>{task.ownerName}</td>
                <td style={{ color: isOverdue(task.dueDate) ? "var(--danger)" : undefined }}>{formatDate(task.dueDate)}</td>
                <td>
                  {task.status !== "Completed" ? (
                    <form action={completeTaskAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <button className="button-secondary" type="submit">
                        Complete
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
