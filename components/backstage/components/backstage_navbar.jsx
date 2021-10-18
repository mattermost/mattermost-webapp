// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import BackIcon from 'components/widgets/icons/fa_back_icon';

export default class BackstageNavbar extends React.PureComponent {
    static get propTypes() {
        return {
            team: PropTypes.object,
            siteName: PropTypes.string,
        };
    }

    render() {
        const {team} = this.props;
        const teamExists = team?.delete_at === 0;

        return (
            <div className='backstage-navbar'>
                <Link
                    className='backstage-navbar__back'
                    to={`/${teamExists ? this.props.team.name : ''}`}
                >
                    <BackIcon/>
                    <span>
                        {teamExists ? (
                            <FormattedMessage
                                id='backstage_navbar.backToMattermost'
                                defaultMessage='Back to {siteName}'
                                values={{
                                    siteName: this.props.siteName ? this.props.siteName : this.props.team.name,
                                }}
                            />
                        ) : (
                            <FormattedMessage
                                id='backstage_navbar.back'
                                defaultMessage='Back'
                            />
                        )}
                    </span>
                </Link>
            </div>
        );
    }
}
