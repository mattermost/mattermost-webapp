// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ChannelStore from 'stores/channel_store.jsx';

import ChannelAndGroupRoute from './channel_group_route';
import UserRoute from './user_route';

const LENGTH_OF_ID = 26;
const LENGTH_OF_GROUP_ID = 40;
const LENGTH_OF_USER_ID_PAIR = 54;

export default class ChannelIdentifierRouter extends React.PureComponent {
    static propTypes = {

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    }

    onChannelByIdentifierEnter(match) {
        const {path, identifier} = match.params;
        if (path === 'channels') {
            if (identifier.length === LENGTH_OF_ID) {
                // It's hard to tell an ID apart from a channel name of the same length, so check first if
                // the identifier matches a channel that we have
                if (ChannelStore.getByName(identifier)) {
                    return (
                        <ChannelAndGroupRoute
                            byName={true}
                            {...this.props}
                        />
                    );
                }
                return (
                    <ChannelAndGroupRoute
                        byId={true}
                        {...this.props}
                    />
                );
            } else if (identifier.length === LENGTH_OF_GROUP_ID) {
                return (
                    <ChannelAndGroupRoute
                        asGroup={true}
                        {...this.props}
                    />
                );
            } else if (identifier.length === LENGTH_OF_USER_ID_PAIR) {
                return (
                    <UserRoute
                        byIds={true}
                        {...this.props}
                    />
                );
            }
            return (
                <ChannelAndGroupRoute
                    byName={true}
                    {...this.props}
                />
            );
        } else if (path === 'messages') {
            if (identifier.indexOf('@') === 0) {
                return (
                    <UserRoute
                        byName={true}
                        {...this.props}
                    />
                );
            } else if (identifier.indexOf('@') > 0) {
                return (
                    <UserRoute
                        byEmail={true}
                        {...this.props}
                    />
                );
            } else if (identifier.length === LENGTH_OF_ID) {
                return (
                    <UserRoute
                        byId={true}
                        {...this.props}
                    />
                );
            } else if (identifier.length === LENGTH_OF_GROUP_ID) {
                return (
                    <ChannelAndGroupRoute
                        asGroup={true}
                        {...this.props}
                    />
                );
            }
        }

        //TODO: fallback??
        return (
            <ChannelAndGroupRoute
                byName={true}
                {...this.props}
            />
        );
    }

    render() {
        return this.onChannelByIdentifierEnter(this.props.match);
    }
}
