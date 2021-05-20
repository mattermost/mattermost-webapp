// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import TutorialIntroScreens from './tutorial_intro_screens';

type Props = {
    isRoot?: boolean;
    townSquareDisplayName: string;
    appDownloadLink?: string;
    isLicensed: boolean;
    restrictTeamInvite: boolean;
    supportEmail?: string;
}

export default class TutorialView extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        isRoot: true,
    }

    componentDidMount() {
        if (this.props.isRoot) {
            document.body.classList.add('app__body');
        }
    }

    componentWillUnmount() {
        if (this.props.isRoot) {
            document.body.classList.remove('app__body');
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
