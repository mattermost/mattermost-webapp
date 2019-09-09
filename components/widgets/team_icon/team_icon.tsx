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
     * Size of the icon, "small", "regular" or "large".
     *
     * @default "regular"
     **/
    size?: 'small'|'regular'|'large';

    /** Whether to add hover effect to the icon */
    withHover?: boolean;
};

/**
 * An icon representing a Team. If `url` is set - shows the image,
 * otherwise shows team initials
 */
export class TeamIcon extends React.PureComponent<Props> {
    public static defaultProps = {
        size: 'regular',
    };

    public render() {
        const {name, url, size, withHover} = this.props;
        if (!name && !url) {
            throw new Error('Either `url` or `name` prop is required ');
        }
        const hoverCss = withHover ? '' : 'no-hover';
        const teamIconUrl = url || imageURLForTeam({display_name: name});
        let icon = null;
        if (teamIconUrl) {
            icon = (
                <div
                    className={`TeamIcon__image TeamIcon__${size}`}
                    style={{backgroundImage: `url('${teamIconUrl}')`}}
                />
            );
        } else {
            icon = (
                <div className={`TeamIcon__initials TeamIcon__initials__${size}`}>
                    {name ? name.replace(/\s/g, '').substring(0, 2) : '??'}
                </div>
            );
        }
        return (

            <div className={`TeamIcon ${hoverCss} TeamIcon__${size}`}>
                <div className={`TeamIcon__content ${hoverCss}`}>
                    {icon}
                </div>
            </div>
        );
    }
}

export default TeamIcon;
