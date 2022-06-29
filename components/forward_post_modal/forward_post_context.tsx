// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {createContext, useContext} from 'react';

type ContextValue = {
    comment: string;
    setComment: (comment: string) => void;
    setPostError: (error: React.ReactNode) => void;
}

const ForwardPostContext = createContext<ContextValue>({
    comment: '',
    setComment: () => {},
    setPostError: () => {},
});

const useForwardPostContext = () => useContext(ForwardPostContext);

export {ForwardPostContext, useForwardPostContext};
