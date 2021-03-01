// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {imageURLForTeam} from 'utils/utils.jsx';

import './team_icon.scss';

type Props = {

    /** Team icon URL (when available) */
    url?: string | null;

    /** Team display name (used for the initials) if icon URL is not set */
    content: React.ReactNode;

    /**
     * Size of the icon, "sm", "md" or "lg".
     *
     * @default "regular"
     **/
    size?: 'sm' | 'lg';

    /** Whether to add hover effect to the icon */
    withHover?: boolean;

    /** Whether to add additional classnames */
    className?: string;
};

/**
 * An icon representing a Team. If `url` is set - shows the image,
 * otherwise shows team initials
 */
export class TeamIcon extends React.PureComponent<Props> {
    public static defaultProps = {
        size: 'sm',
    };

    public render() {
        const {content, url, size, withHover, className} = this.props;
        const hoverCss = withHover ? '' : 'no-hover';

        // FIXME Nowhere does imageURLForTeam seem to check for display_name.
        const teamIconUrl = url || imageURLForTeam({display_name: content});
        let icon;
        if (typeof content === 'string') {
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
                        {content ? content.replace(/\s/g, '').substring(0, 2) : '??'}
                    </div>
                );
            }
        } else {
            icon = content;
        }
        return (
            <div className={classNames(`TeamIcon TeamIcon__${size}`, {withImage: teamIconUrl}, className, hoverCss)}>
                <div className={`TeamIcon__content ${hoverCss}`}>
                    {icon}
                </div>
            </div>
        );
    }
}

export default TeamIcon;
