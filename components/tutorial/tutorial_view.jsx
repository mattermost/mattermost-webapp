// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import TutorialIntroScreens from './tutorial_intro_screens';

export default class TutorialView extends React.Component {
    componentDidMount() {
        if (this.props.isRoot) {
            $('body').addClass('app__body');
        }
    }

    componentWillUnmount() {
        if (this.props.isRoot) {
            $('body').removeClass('app__body');
        }
    }

    render() {
        return (
            <div
                id='app-content'
                className='app__content'
            >
                <TutorialIntroScreens
                    townSquareDisplayName={this.props.townSquareDisplayName}
                    appDownloadLink={this.props.appDownloadLink}
                    isLicensed={this.props.isLicensed}
                    restrictTeamInvite={this.props.restrictTeamInvite}
                    supportEmail={this.props.supportEmail}
                />
            </div>
        );
    }
}

TutorialView.propTypes = {
    isRoot: PropTypes.bool,
    townSquareDisplayName: PropTypes.string.isRequired,
    appDownloadLink: PropTypes.string,
    isLicensed: PropTypes.bool.isRequired,
    restrictTeamInvite: PropTypes.bool.isRequired,
    supportEmail: PropTypes.string.isRequired,
};

TutorialView.defaultProps = {
    isRoot: true,
};
