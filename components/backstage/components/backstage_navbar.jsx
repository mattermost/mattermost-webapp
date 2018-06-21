// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Constants} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export default class BackstageNavbar extends React.Component {
    static get propTypes() {
        return {
            team: PropTypes.object.isRequired,
            siteName: PropTypes.string,
        };
    }

    render() {
        if (!this.props.team) {
            return null;
        }

        return (
            <div className='backstage-navbar'>
                <Link
                    className='backstage-navbar__back'
                    to={`/${this.props.team.name}/channels/${Constants.DEFAULT_CHANNEL}`}
                >
                    <i
                        className='fa fa-angle-left'
                        title={localizeMessage('generic_icons.back', 'Back Icon')}
                    />
                    <span>
                        <FormattedMessage
                            id='backstage_navbar.backToMattermost'
                            defaultMessage='Back to {siteName}'
                            values={{
                                siteName: this.props.siteName,
                            }}
                        />
                    </span>
                </Link>
            </div>
        );
    }
}
