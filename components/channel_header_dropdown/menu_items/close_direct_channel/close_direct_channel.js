// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {localizeMessage} from 'utils/utils';
import {Constants} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import Menu from 'components/widgets/menu/menu';

export default class CloseDirectChannel extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about currentUser
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * Object with info about currentTeam
         */
        currentTeam: PropTypes.object.isRequired,

        /**
         * String with info about redirect
         */
        redirectChannel: PropTypes.string.isRequired,

        /**
         * Object with info about channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * Use for test selector
         */
        id: PropTypes.string,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({

            /**
             * Action creator to update user preferences
             */
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,
    };

    isLeaving = false;

    handleClose = () => {
        if (!this.isLeaving) {
            const id = this.props.channel.teammate_id;
            const category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;

            const currentUserId = this.props.currentUser.id;
            this.props.actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id, value: 'false'}]).then(
                () => {
                    this.isLeaving = false;
                }
            );

            browserHistory.push(`/${this.props.currentTeam.name}/channels/${this.props.redirectChannel}`);
        }
    }

    render() {
        const {id, channel} = this.props;
        return (
            <Menu.ItemAction
                id={id}
                show={channel.type === Constants.DM_CHANNEL && channel.type !== Constants.GM_CHANNEL}
                onClick={this.handleClose}
                text={localizeMessage('center_panel.direct.closeChannel', 'Close Channel')}
            />
        );
    }
}