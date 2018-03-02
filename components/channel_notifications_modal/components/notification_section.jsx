// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import CollapseView from './collapse_view.jsx';
import ExpandView from './expand_view.jsx';

export default class NotificationSection extends React.PureComponent {
    static propTypes = {

        /**
         * Notification section
         */
        section: PropTypes.string.isRequired,

        /**
         * Expand if true, else collapse the section
         */
        expand: PropTypes.bool.isRequired,

        /**
         * Member's desktop notification level
         */
        memberNotificationLevel: PropTypes.string.isRequired,

        /**
         * User's global notification level
         */
        globalNotificationLevel: PropTypes.string,

        /**
         * onChange handles update of desktop notification level
         */
        onChange: PropTypes.func.isRequired,

        /**
         * Submit function to save notification level
         */
        onSubmit: PropTypes.func.isRequired,

        /**
         * Update function to to expand or collapse a section
         */
        onUpdateSection: PropTypes.func.isRequired,

        /**
         * Error string from the server
         */
        serverError: PropTypes.string,
    }

    handleOnChange = (e) => {
        this.props.onChange(e.target.value);
    }

    handleExpandSection = () => {
        this.props.onUpdateSection(this.props.section);
    }

    handleCollapseSection = () => {
        this.props.onUpdateSection();
    }

    render() {
        const {
            expand,
            globalNotificationLevel,
            memberNotificationLevel,
            onSubmit,
            section,
            serverError,
        } = this.props;

        if (expand) {
            return (
                <ExpandView
                    section={section}
                    memberNotifyLevel={memberNotificationLevel}
                    globalNotifyLevel={globalNotificationLevel}
                    onChange={this.handleOnChange}
                    onSubmit={onSubmit}
                    serverError={serverError}
                    onCollapseSection={this.handleCollapseSection}
                />
            );
        }

        return (
            <CollapseView
                section={section}
                onExpandSection={this.handleExpandSection}
                memberNotifyLevel={memberNotificationLevel}
                globalNotifyLevel={globalNotificationLevel}
            />
        );
    }
}
