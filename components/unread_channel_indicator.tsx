// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

import UnreadBelowIcon from 'components/widgets/icons/unread_below_icon';

type Props = {

    /**
     * Function to call when the indicator is clicked
     */
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

    /**
     * Set whether to show the indicator or not
     */
    show?: boolean;

    /**
     * The additional CSS class for the indicator
     */
    extraClass?: string;

    /**
     * The content of the indicator
     */
    content?: ReactNode;

    /**
     * The name of the indicator
     */
    name?: string;
}

export default class UnreadChannelIndicator extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        show: false,
        extraClass: '',
        content: '',
    };

    public render(): JSX.Element {
        let classes = 'nav-pills__unread-indicator ';
        if (this.props.show) {
            classes += 'nav-pills__unread-indicator--visible ';
        }

        return (
            <div
                id={'unreadIndicator' + this.props.name}
                className={classes + this.props.extraClass}
                onClick={this.props.onClick}
            >
                {this.props.content}
                <UnreadBelowIcon className='icon icon__unread'/>
            </div>
        );
    }
}
