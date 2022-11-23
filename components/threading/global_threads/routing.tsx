// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, ReactNode} from 'react';

const Ctx = React.createContext<ThreadsPathDefCtx | Partial<ThreadsPathDefCtx>>({});

interface Props {
    children: ReactNode | ReactNode[];
}
type ThreadsPathDefCtx = {
    pathDef: {path: string; teamName?: string} | undefined;
    setPathDef: React.Dispatch<React.SetStateAction<ThreadsPathDefCtx['pathDef']>>;
}

export const GlobalThreadsRoutingProvider = (props: Props) => {
    const [pathDef, setPathDef] = useState<ThreadsPathDefCtx['pathDef']>();

    return (
        <Ctx.Provider value={{pathDef, setPathDef}}>
            {props.children}
        </Ctx.Provider>
    );
};

export const usePathDef = () => React.useContext(Ctx);
