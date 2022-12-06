// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

const Ctx = React.createContext<{pathDef?: PathDef}>({});

interface Props {
    children: ReactNode | ReactNode[];
    pathDef: PathDef;
}
type PathDef = {path: string; teamName?: string};

export const GlobalThreadsRoutingProvider = ({pathDef, children}: Props) => {
    return (
        <Ctx.Provider value={{pathDef}}>
            {children}
        </Ctx.Provider>
    );
};

export const usePathDef = () => React.useContext(Ctx);
