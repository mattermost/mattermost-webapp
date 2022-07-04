// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';

type Props = {
    channelId: string;

    /*
     * Object from react-router
     */
    match: { params: { postid: string } };
    returnTo: string;
    teamName?: string;
    actions: {
        focusPost: (postId: string, returnTo: string, currentUserId: string) => void;
    };
    currentUserId: string;
}

const PermalinkView = (props: Props) => {
    let mounted: boolean;
    const [valid, setValid] = useState(false);

    useEffect(() => {
        mounted = true;
        doPermalinkEvent(props);
        document.body.classList.add('app__body');

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        // todo check prev props
        doPermalinkEvent(props);
    }, [props.match.params.postid]);

    const doPermalinkEvent = async (propsParam: Props) => {
        const postId = propsParam.match.params.postid;
        await props.actions.focusPost(postId, props.returnTo, props.currentUserId);
        if (mounted) {
            setValid(true);
        }
    };

    const isStateValid = () => valid && props.channelId && props.teamName;

    if (!isStateValid()) {
        return (
            <div
                id='app-content'
                className='app__content'
            />
        );
    }

    return null;
};

export default PermalinkView;
