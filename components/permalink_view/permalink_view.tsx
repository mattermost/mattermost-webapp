// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';


type Props= {
    channelId: string;
    match: {
        params: {
            postid: string;
        };
    };
    returnTo: string;
    teamName: string;
    actions: {
        focusPost:(postId: string, returnTo?: string,currentUserId?: string) =>void;
    };
    currentUserId: string;
}
type State ={ 
    valid: boolean;
    postid: string;
}

export default class PermalinkView extends React.PureComponent<Props,State> {

    mounted: boolean | undefined;
    permalink: any;


    static getDerivedStateFromProps(props:Props , state: State) {
        let updatedState = {postid: props.match.params.postid};
        if (state.postid !== props.match.params.postid) {
            updatedState = {...updatedState, ...{valid: false}};
        }

        return updatedState;
    }

    constructor(props: Props) {
        super(props);
        this.state = {valid: false};
    }

    componentDidMount() {
        this.mounted = true;
        this.doPermalinkEvent(this.props);
        document.body.classList.add('app__body');
    }

    componentDidUpdate() {
        if (!this.state.valid) {
            this.doPermalinkEvent(this.props);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    doPermalinkEvent = async (props: Props) => {
        const postId = props.match.params.postid;
        await this.props.actions.focusPost(postId, this.props.returnTo, this.props.currentUserId);
        if (this.mounted) {
            this.setState({valid: true});
        }
    }

    isStateValid = () => {
        return this.state.valid && this.props.channelId && this.props.teamName;
    }

    onShortcutKeyDown = (e: any) => {
        if (e.shiftKey && Utils.cmdOrCtrlPressed(e) && Utils.isKeyPressed(e, Constants.KeyCodes.L) && this.permalink.current) {
            this.permalink.current.focus();
        }
    }

    render() {
        if (!this.isStateValid()) {
            return (
                <div
                    id='app-content'
                    className='app__content'
                />
            );
        }

        return null;
    }
}
