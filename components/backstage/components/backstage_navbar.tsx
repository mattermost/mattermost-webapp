// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import BackIcon from 'components/widgets/icons/fa_back_icon';
import {Team} from 'mattermost-redux/types/teams';

type Props = {
    team: Team;
    siteName?: string;
};

export default class BackstageNavbar extends React.PureComponent<Props> {
    render(): React.ReactNode {
        if (!this.props.team) {
            return null;
        }

        return (
            <div className='backstage-navbar'>
                <Link
                    className='backstage-navbar__back'
                    to={`/${this.props.team.name}`}
                >
                    <BackIcon/>
                    <span>
                        <FormattedMessage
                            id='backstage_navbar.backToMattermost'
                            defaultMessage='Back to {siteName}'
                            values={{
                                siteName: this.props.siteName ? this.props.siteName : this.props.team.name,
                            }}
                        />
                    </span>
                </Link>
            </div>
        );
    }
}
