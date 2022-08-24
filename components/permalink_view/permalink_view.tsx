// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect, useCallback, memo} from 'react';
import {match} from 'react-router-dom';

type Props = {
    channelId: string;

    /*
     * Object from react-router
     */
    match: match<{postid: string}>;
    returnTo: string;
    teamName?: string;
    actions: {
        focusPost: (postId: string, returnTo: string, currentUserId: string) => void;
    };
    currentUserId: string;
}

const PermalinkView = (props: Props) => {
    const [mounted, setMounted] = useState(false);

    const doPermalinkAction = useCallback(async () => {
        const postId = props.match.params.postid;
        await props.actions.focusPost(postId, props.returnTo, props.currentUserId);
    }, [props]);

    useEffect(() => {
        document.body.classList.add('app__body');
        doPermalinkAction().then(() => setMounted(true));
    }, [props, doPermalinkAction]);

    const isStateValid = mounted && props.channelId && props.teamName;

    // it is returning null because main idea of this component is to fire focusPost redux action
    if (isStateValid) {
        return null;
    }

    return (
        <div
            id='app-content'
            className='app__content'
        />
    );
};

export default memo(PermalinkView);
