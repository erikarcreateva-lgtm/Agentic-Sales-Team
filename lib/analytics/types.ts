export interface DashboardStats {
  activeAgents: number;
  tasksRunning: number;
  leadsWorked: number;
  perAgent: { agentId: string; leadsWorked: number }[];
}

export interface ActivityItem {
  agentId: string | null;
  text: string;
}
