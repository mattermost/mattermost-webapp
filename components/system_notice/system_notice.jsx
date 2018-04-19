// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'utils/constants.jsx';

export default class SystemNotice extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        notices: PropTypes.arrayOf(PropTypes.object).isRequired,
        preferences: PropTypes.object.isRequired,
        dismissedNotices: PropTypes.object.isRequired,
        isSystemAdmin: PropTypes.bool,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
            dismissNotice: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            currentNotice: null,
        };
    }

    componentDidMount() {
        this.setCurrentNotice();
    }

    componentWillReceiveProps(nextProps) {
        this.setCurrentNotice(nextProps);
    }

    setCurrentNotice = (props = this.props) => {
        for (const notice of props.notices) {
            // Skip if dismissed previously this session
            if (props.dismissedNotices[notice.name]) {
                continue;
            }

            // Skip if dismissed forever
            if (props.preferences[notice.name]) {
                continue;
            }

            if (notice.adminOnly && !props.isSystemAdmin) {
                continue;
            }

            this.setState({currentNotice: notice});
            return;
        }

        this.setState({currentNotice: null});
    }

    hide = (remind = false) => {
        const notice = this.state.currentNotice;
        if (!notice) {
            return;
        }

        if (!remind) {
            this.props.actions.savePreferences(this.props.currentUserId, [{
                user_id: this.props.currentUserId,
                category: Preferences.CATEGORY_SYSTEM_NOTICE,
                name: notice.name,
                value: 'dismissed',
            }]);
        }

        this.props.actions.dismissNotice(notice.name);
    }

    hideAndRemind = () => {
        this.hide(true);
    }

    hideAndForget = () => {
        this.hide(false);
    }

    render() {
        const notice = this.state.currentNotice;

        if (notice == null) {
            return null;
        }

        return (
            <div
                className='system-notice'
            >
                <img
                    className='system-notice-icon'
                    src={notice.icon}
                />
                <div className='system-notice-title'>
                    {notice.title}
                </div>
                <div className='system-notice-body'>
                    {notice.body}
                </div>
                <button
                    id='systemnotice_remindme'
                    className='system-notice-button left'
                    onClick={this.hideAndRemind}
                >
                    <FormattedMessage
                        id='system_notice_remind_me'
                        defaultMessage='Remind me later'
                    />
                </button>
                <button
                    id='systemnotice_dontshow'
                    className='system-notice-button right'
                    onClick={this.hideAndForget}
                >
                    <FormattedMessage
                        id='system_notice_dont_show'
                        defaultMessage="Don't show again"
                    />
                </button>
            </div>
        );
    }
}
