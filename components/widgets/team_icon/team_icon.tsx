// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {imageURLForTeam} from 'utils/utils.jsx';

import './team_icon.scss';

type Props = {
    url?: string;
    name: string;
    size?: 'small'|'regular'|'large';
    withHover?: boolean;
};

export default class TeamIcon extends React.PureComponent<Props> {
    public static defaultProps = {
        size: 'regular',
    };

    public render() {
        const {name, url, size, withHover} = this.props;
        if (!name && !url) {
            throw new Error("Either `url` or `name` prop is required ");
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
