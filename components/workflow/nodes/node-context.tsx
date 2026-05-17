"use client";

import { createContext, useContext } from "react";

type WorkflowNodeContextType = {
  onRunNode?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  runningNodeIds?: string[];
};

export const WorkflowNodeContext = createContext<WorkflowNodeContextType>({});

export const useWorkflowNode = () => useContext(WorkflowNodeContext);
