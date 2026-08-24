"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BusinessBrain,
  Project,
  Agent,
  ActivityItem,
  Task,
  Decision,
  Message,
  BrandArtifact,
  ProductArtifact,
  GrowthArtifact,
  OperationsArtifact,
  AgentStatus,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "ceo",
    name: "Nova",
    role: "Chief Executive Agent",
    department: "CEO",
    status: "IDLE",
    completedTasks: 0,
    avatar: "N",
  },
  {
    id: "product",
    name: "Mira",
    role: "Product & Brand Director",
    department: "PRODUCT",
    status: "IDLE",
    completedTasks: 0,
    avatar: "M",
  },
  {
    id: "growth",
    name: "Ari",
    role: "Growth Director",
    department: "GROWTH",
    status: "IDLE",
    completedTasks: 0,
    avatar: "A",
  },
  {
    id: "operations",
    name: "Noah",
    role: "Operations Director",
    department: "OPERATIONS",
    status: "IDLE",
    completedTasks: 0,
    avatar: "O",
  },
];

interface BrainStore extends BusinessBrain {
  // Actions
  setProject: (project: Project) => void;
  setBrand: (brand: BrandArtifact) => void;
  setProduct: (product: ProductArtifact) => void;
  setGrowth: (growth: GrowthArtifact) => void;
  setOperations: (operations: OperationsArtifact) => void;
  setAgentStatus: (agentId: string, status: AgentStatus, currentTask?: string) => void;
  addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addDecision: (decision: Omit<Decision, "id" | "createdAt">) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setBuildProgress: (progress: number, step?: string) => void;
  reset: () => void;
  completeAgent: (agentId: string) => void;
}

const INITIAL_STATE: BusinessBrain = {
  project: null,
  brand: null,
  product: null,
  growth: null,
  operations: null,
  agents: DEFAULT_AGENTS,
  activity: [],
  tasks: [],
  decisions: [],
  messages: [],
  buildProgress: 0,
  currentBuildStep: "",
};

export const useBrain = create<BrainStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setProject: (project) => set({ project }),
      setBrand: (brand) => set({ brand }),
      setProduct: (product) => set({ product }),
      setGrowth: (growth) => set({ growth }),
      setOperations: (operations) => set({ operations }),

      setAgentStatus: (agentId, status, currentTask) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status, currentTask } : a
          ),
        })),

      addActivity: (item) =>
        set((state) => ({
          activity: [
            {
              ...item,
              id: generateId(),
              timestamp: new Date().toISOString(),
            },
            ...state.activity.slice(0, 99),
          ],
        })),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: generateId() }],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      addDecision: (decision) =>
        set((state) => ({
          decisions: [
            {
              ...decision,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...state.decisions,
          ],
        })),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: generateId(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      setBuildProgress: (progress, step) =>
        set({ buildProgress: progress, currentBuildStep: step ?? "" }),

      completeAgent: (agentId) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId
              ? { ...a, status: "COMPLETED", completedTasks: a.completedTasks + 1 }
              : a
          ),
        })),

      reset: () =>
        set({
          ...INITIAL_STATE,
          agents: DEFAULT_AGENTS.map((a) => ({ ...a, status: "IDLE" })),
        }),
    }),
    {
      name: "xcelerate-brain",
      partialize: (state) => ({
        project: state.project,
        brand: state.brand,
        product: state.product,
        growth: state.growth,
        operations: state.operations,
        tasks: state.tasks,
        decisions: state.decisions,
        messages: state.messages,
      }),
    }
  )
);
