'use client';

import React, { createContext, useContext, useState } from 'react';

type EditorHeaderActionsContextType = {
  actions: React.ReactNode;
  setActions: (actions: React.ReactNode) => void;
};

const EditorHeaderActionsContext = createContext<EditorHeaderActionsContextType | undefined>(undefined);

export const useEditorHeaderActions = () => {
  const context = useContext(EditorHeaderActionsContext);
  if (!context) {
    // Return a dummy context if not within a provider, so AppHeader doesn't break
    return { actions: null, setActions: () => {} };
  }
  return context;
};

export const EditorHeaderActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<React.ReactNode>(null);

  return (
    <EditorHeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </EditorHeaderActionsContext.Provider>
  );
};
