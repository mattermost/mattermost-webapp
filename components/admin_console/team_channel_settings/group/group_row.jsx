// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class GroupRow extends React.Component {
    static propTypes = {
        group: PropTypes.object.isRequired,
        removeGroup: PropTypes.func.isRequired,
    };

    render = () => {
        const {group} = this.props;
        return (
            <div
                className={'group '}
            >
                <div className='group-row'>
                    <span className='group-name'>
                        {group.display_name || group.name}
                    </span>
                    <span className='group-description'>
                        <FormattedMessage
                            id='admin.team_settings.group_row.members'
                            defaultMessage='{memberCount} members'
                            values={{memberCount: group.member_count}}
                        />
                    </span>
                    <span className='group-actions'>
                        <a
                            href='#'
                            onClick={() => this.props.removeGroup(group.id)}
                        >
                            <FormattedMessage
                                id='admin.team_settings.group_row.remove'
                                defaultMessage='Remove'
                            />
                        </a>
                    </span>
                </div>
            </div>
        );
    };
}
