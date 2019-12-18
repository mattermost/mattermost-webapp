// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import DelayedAction from 'utils/delayed_action';
import Constants, {RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import RhsCardHeader from 'components/rhs_card_header';
import Markdown from 'components/markdown';
import UserProfile from 'components/user_profile';
import PostProfilePicture from 'components/post_profile_picture';
import * as GlobalActions from 'actions/global_actions.jsx';

export function renderView(props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

export default class RhsCard extends React.Component {
    static propTypes = {
        selected: PropTypes.object,
        pluginPostCardTypes: PropTypes.object,
        previousRhsState: PropTypes.oneOf(Object.values(RHSStates)),
        enablePostUsernameOverride: PropTypes.bool,
        teamUrl: PropTypes.string,
    }

    static defaultProps = {
        pluginPostCardTypes: {},
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        this.state = {
            isScrolling: false,
            topRhsPostCreateAt: 0,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextState.selected, this.props.selected)) {
            return true;
        }
        if (nextState.isScrolling !== this.state.isScrolling) {
            return true;
        }
        return false;
    }

    handleScroll = () => {
        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
        }

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    handleScrollStop = () => {
        this.setState({
            isScrolling: false,
        });
    }

    handleClick = () => {
        if (Utils.isMobile()) {
            GlobalActions.emitCloseRightHandSide();
        }
    };

    render() {
        if (this.props.selected == null) {
            return (<div/>);
        }

        const {selected, pluginPostCardTypes, teamUrl} = this.props;
        const postType = selected.type;
        let content = null;
        if (pluginPostCardTypes.hasOwnProperty(postType)) {
            const PluginComponent = pluginPostCardTypes[postType].component;
            content = <PluginComponent post={selected}/>;
        }

        if (!content) {
            content = (
                <div className='info-card'>
                    <Markdown message={selected.props && selected.props.card}/>
                </div>
            );
        }

        let user = (
            <UserProfile
                userId={selected.user_id}
                hideStatus={true}
                disablePopover={true}
            />
        );
        if (selected.props.override_username && this.props.enablePostUsernameOverride) {
            user = (
                <UserProfile
                    userId={selected.user_id}
                    hideStatus={true}
                    disablePopover={true}
                    overwriteName={selected.props.override_username}
                />
            );
        }
        const avatar = (
            <PostProfilePicture
                compactDisplay={false}
                post={selected}
                userId={selected.user_id}
            />
        );

        return (
            <div className='sidebar-right__body sidebar-right__card'>
                <RhsCardHeader previousRhsState={this.props.previousRhsState}/>
                <Scrollbars
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    onScroll={this.handleScroll}
                >
                    <div className='post-right__scroll'>
                        {content}
                        <div className='d-flex post-card--info'>
                            <div className='post-card--post-by overflow--ellipsis'>
                                <FormattedMessage
                                    id='rhs_card.message_by'
                                    defaultMessage='Message by {avatar} {user}'
                                    values={{user, avatar}}
                                />
                            </div>
                            <div className='post-card--view-post'>
                                <Link
                                    to={`${teamUrl}/pl/${selected.id}`}
                                    className='post__permalink'
                                    onClick={this.handleClick}
                                >
                                    <FormattedMessage
                                        id='rhs_card.jump'
                                        defaultMessage='Jump'
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
