
'use client';

import React, { createContext, useState, SetStateAction } from 'react';
import type { Paper, PaperSettings, PageContent } from './page';

type EditorHeaderContextType = {
    actions: React.ReactNode;
    paper: Paper;
    preparePdfDownload: () => void;
    handleSaveAndExit: () => void;
    settings: PaperSettings;
    setSettings: React.Dispatch<SetStateAction<PaperSettings>>;
    bookletPages: any[];
    setBookletPages: React.Dispatch<SetStateAction<any[]>>;
    generatePdf: () => void;
    isDownloading: boolean;
    pages: PageContent[][];
};

export const EditorHeaderContext = createContext<EditorHeaderContextType | null>(null);

export const EditorHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [dummyState, setDummyState] = useState({});

  const value = {
      ...dummyState
  } as EditorHeaderContextType;

  return (
    <EditorHeaderContext.Provider value={value}>
        {children}
    </EditorHeaderContext.Provider>
  );
};
