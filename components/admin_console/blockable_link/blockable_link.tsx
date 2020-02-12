// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {NavLink} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';

type Props = {

    /*
   * Bool whether navigation is blocked
   */
    blocked: boolean;

    /*
   * String Link destination
   */
    to: string;
    actions: {

        /*
     * Function for deferring navigation while blocked
     */
        deferNavigation: (func: () => void) => void;
    };
    children?: string | React.ReactNode;
    className?: string;
};
export default class BlockableLink extends React.PureComponent<Props> {
    private handleClick = (e: React.MouseEvent) => {
        if (this.props.blocked) {
            e.preventDefault();

            this.props.actions.deferNavigation(() => {
                browserHistory.push(this.props.to);
            });
        }
    };

    public render() {
        const props = {...this.props};
        Reflect.deleteProperty(props, 'blocked');
        Reflect.deleteProperty(props, 'actions');

        return (
            <NavLink
                {...props}
                onClick={this.handleClick}
            />);
    }
}
