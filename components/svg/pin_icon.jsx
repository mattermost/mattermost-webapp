// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class PinIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M300.79 203.91L290.67 128H328c13.25 0 24-10.75 24-24V24c0-13.25-10.75-24-24-24H56C42.75 0 32 10.75 32 24v80c0 13.25 10.75 24 24 24h37.33l-10.12 75.91C34.938 231.494 0 278.443 0 335.24c0 8.84 7.16 16 16 16h160v120.779c0 .654.08 1.306.239 1.94l8 32c2.009 8.037 13.504 8.072 15.522 0l8-32a7.983 7.983 0 0 0 .239-1.94V351.24h160c8.84 0 16-7.16 16-16 0-56.797-34.938-103.746-83.21-131.33zM33.26 319.24c6.793-42.889 39.635-76.395 79.46-94.48L128 96H64V32h256v64h-64l15.28 128.76c40.011 18.17 72.694 51.761 79.46 94.48H33.26z"/></svg>
            </span>
        );
    }
}
