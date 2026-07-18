export type AppRole = "founder_admin" | "sales_rep" | "analyst";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  team: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: "user-founder",
    name: "Avery Chen",
    email: "avery@northstar.test",
    role: "founder_admin",
    team: "Leadership"
  },
  {
    id: "user-rep",
    name: "Jordan Miles",
    email: "jordan@northstar.test",
    role: "sales_rep",
    team: "Sales"
  },
  {
    id: "user-analyst",
    name: "Priya Shah",
    email: "priya@northstar.test",
    role: "analyst",
    team: "Revenue Ops"
  }
];

export function getDemoUserById(id: string | undefined) {
  return demoUsers.find((user) => user.id === id) ?? null;
}
