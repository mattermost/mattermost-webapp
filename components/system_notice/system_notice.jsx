// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'utils/constants.jsx';
import MattermostLogo from 'components/svg/mattermost_logo';

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

        let visibleMessage;
        if (notice.adminOnly) {
            visibleMessage = (
                <div className='system-notice__info'>
                    <i className='fa fa-eye'/>
                    <FormattedMessage
                        id='system_notice.adminVisible'
                        defaultMessage='Only visible to System Admins'
                    />
                </div>
            );
        }

        return (
            <div
                className='system-notice bg--white shadow--2'
            >
                <div className='system-notice__header'>
                    <div className='system-notice__logo'>
                        <MattermostLogo/>
                    </div>
                    <div className='system-notice__title'>
                        {notice.title}
                    </div>
                </div>
                <div className='system-notice__body'>
                    {notice.body}
                </div>
                {visibleMessage}
                <div className='system-notice__footer'>
                    <button
                        id='systemnotice_remindme'
                        className='btn btn-transparent'
                        onClick={this.hideAndRemind}
                    >
                        <FormattedMessage
                            id='system_notice_remind_me'
                            defaultMessage='Remind me later'
                        />
                    </button>
                    <button
                        id='systemnotice_dontshow'
                        className='btn btn-transparent'
                        onClick={this.hideAndForget}
                    >
                        <FormattedMessage
                            id='system_notice_dont_show'
                            defaultMessage="Don't show again"
                        />
                    </button>
                </div>
            </div>
        );
    }
}
