// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class TeamButton extends React.PureComponent {
    render() {
        const {small, teamIconUrl} = this.props;
        const classModifier = small ? 'small' : 'large';
        let content;
        if (teamIconUrl) {
            content = (
                <div className='team-btn__content'>
                    <div
                        className={`team-btn__image team-btn-${classModifier}__image`}
                        style={{backgroundImage: `url('${teamIconUrl}')`}}
                    />
                </div>
            );
        } else {
            let initials = this.props.displayName;
            initials = initials ? initials.replace(/\s/g, '').substring(0, 2) : '??';

            content = (
                <div className='team-btn__content'>
                    <div className={`team-btn__initials team-btn-${classModifier}__initials`}>
                        {initials}
                    </div>
                </div>
            );
        }

        return (
            <div
                className='team-container'
            >
                <div className={`team-btn team-btn-${classModifier}`} >
                    {content}
                </div>
            </div>
        );
    }
}

TeamButton.propTypes = {
    small: PropTypes.bool,
    teamIconUrl: PropTypes.string,
    displayName: PropTypes.string,
};
