// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class UnreadBelowIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.arrow.down'
                    defaultMessage='Down Arrow Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='10px'
                            height='10px'
                            viewBox='0 0 10 10'
                            style={style}
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <g transform='matrix(1,0,0,1,-20,-18)'>
                                <g transform='matrix(0.0330723,0,0,0.0322634,15.8132,12.3164)'>
                                    <path d='M245.803,377.493C245.803,377.493 204.794,336.485 179.398,311.088C168.55,300.24 150.962,300.24 140.114,311.088C138.327,312.875 136.517,314.686 134.73,316.473C123.882,327.321 123.882,344.908 134.73,355.756C167.972,388.998 233.949,454.975 256.949,477.975C262.158,483.184 269.223,486.111 276.591,486.111C277.38,486.111 278.176,486.111 278.965,486.111C286.332,486.111 293.397,483.184 298.607,477.975C321.607,454.975 387.584,388.998 420.826,355.756C431.674,344.908 431.674,327.321 420.826,316.473C419.039,314.686 417.228,312.875 415.441,311.088C404.593,300.24 387.005,300.24 376.158,311.088C350.761,336.485 309.753,377.493 309.753,377.493C309.753,377.493 309.753,279.687 309.753,203.94C309.753,196.573 306.826,189.508 301.617,184.298C296.408,179.089 289.342,176.162 281.975,176.162C279.191,176.162 276.364,176.162 273.58,176.162C266.213,176.162 259.148,179.089 253.939,184.298C248.729,189.508 245.803,196.573 245.803,203.94L245.803,377.493Z'/>
                                </g>
                            </g>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}

const style = {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    strokeLinejoin: 'round',
    strokeMiterlimit: 1.41421,
};
