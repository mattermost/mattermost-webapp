// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {imageURLForTeam} from 'utils/utils.jsx';

import './team_icon.scss';

type Props = {

    /** Team icon URL (when available) */
    url?: string;

    /** Team display name (used for the initials) if icon URL is not set */
    name: string;

    /**
     * Size of the icon, "sm", "md" or "lg".
     *
     * @default "regular"
     **/
    size?: 'sm'|'md'|'lg';

    /** Whether to add hover effect to the icon */
    withHover?: boolean;
};

/**
 * An icon representing a Team. If `url` is set - shows the image,
 * otherwise shows team initials
 */
export class TeamIcon extends React.PureComponent<Props> {
    public static defaultProps = {
        size: 'md',
    };

    public render() {
        const {name, url, size, withHover} = this.props;
        const hoverCss = withHover ? '' : 'no-hover';
        const teamIconUrl = url || imageURLForTeam({display_name: name});
        let icon;
        if (teamIconUrl) {
            icon = (
                <div
                    data-testid='teamIconImage'
                    className={`TeamIcon__image TeamIcon__${size}`}
                    aria-label={'Team Icon'}
                    style={{backgroundImage: `url('${teamIconUrl}')`}}
                />
            );
        } else {
            icon = (
                <div
                    data-testid='teamIconInitial'
                    className={`TeamIcon__initials TeamIcon__initials__${size}`}
                    aria-label={'Team Initials'}
                >
                    {name ? name.replace(/\s/g, '').substring(0, 2) : '??'}
                </div>
            );
        }
        return (
            <div className={`TeamIcon ${hoverCss} TeamIcon__${size}`} >
                <div className={`TeamIcon__content ${hoverCss}`}>
                    {icon}
                </div>
            </div>
        );
    }
}

export default TeamIcon;
