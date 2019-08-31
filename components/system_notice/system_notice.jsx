// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, intlShape} from 'react-intl';

import {Preferences} from 'utils/constants.jsx';
import MattermostLogo from 'components/widgets/icons/mattermost_logo';

export default class SystemNotice extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        notices: PropTypes.arrayOf(PropTypes.object).isRequired,
        preferences: PropTypes.object.isRequired,
        dismissedNotices: PropTypes.object.isRequired,
        isSystemAdmin: PropTypes.bool,
        serverVersion: PropTypes.string.isRequired,
        config: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
        analytics: PropTypes.object,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
            dismissNotice: PropTypes.func.isRequired,
            getStandardAnalytics: PropTypes.func.isRequired,
        }).isRequired,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    componentDidMount() {
        if (this.props.isSystemAdmin) {
            this.props.actions.getStandardAnalytics();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isSystemAdmin !== this.props.isSystemAdmin && this.props.isSystemAdmin) {
            this.props.actions.getStandardAnalytics();
        }
    }

    getCurrentNotice = () => {
        for (const notice of this.props.notices) {
            // Skip if dismissed previously this session
            if (this.props.dismissedNotices[notice.name]) {
                continue;
            }

            // Skip if dismissed forever
            if (this.props.preferences[notice.name]) {
                continue;
            }

            if (notice.adminOnly && !this.props.isSystemAdmin) {
                continue;
            }

            if (!notice.show(this.props.serverVersion, this.props.config, this.props.license, this.props.analytics)) {
                continue;
            }

            return notice;
        }
        return null;
    }

    hide = (remind = false) => {
        const notice = this.getCurrentNotice();
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
        const notice = this.getCurrentNotice();
        const {formatMessage} = this.context.intl;

        if (notice == null) {
            return null;
        }

        let visibleMessage;
        if (notice.adminOnly) {
            visibleMessage = (
                <div className='system-notice__info'>
                    <i
                        className='fa fa-eye'
                        title={formatMessage({id: 'system_notice.adminVisible.icon', defaultMessage: 'Only visible to System Admins Icon'})}
                    />
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
                            id='system_notice.remind_me'
                            defaultMessage='Remind me later'
                        />
                    </button>
                    {notice.allowForget &&
                        <button
                            id='systemnotice_dontshow'
                            className='btn btn-transparent'
                            onClick={this.hideAndForget}
                        >
                            <FormattedMessage
                                id='system_notice.dont_show'
                                defaultMessage="Don't show again"
                            />
                        </button>}
                </div>
            </div>
        );
    }
}
