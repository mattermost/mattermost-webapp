// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

const PostContext = React.createContext({

    // Post component event handler that should be
    // called when any child component opens/closes a
    // popup type component.
    handlePopupOpened: null,

    // Whether the post is currently under aria-hidden
    // used when post is not hovered and a11y is inactive
    ariaHidden: null
});

export default PostContext;
