import React from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export const SessionTimeoutWatcher: React.FC = () => {
  useSessionTimeout();
  return null;
};

