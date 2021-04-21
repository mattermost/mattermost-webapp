// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import './admin_button_outline.scss';

type Props = {
    onClick: any;
    children?: string;
    disabled?: boolean;
    className?: string;
}

// const AdminButtonOutline: React.FC<Props> = (props: Props) => {
//     return (
//         <button
//             type='button'
//             onClick={props.onClick}
//             className={'AdminButtonOutline btn btn-primary'}
//             disabled={props.disabled}
//         >
//             {props.children}
//         </button>
//     );
// };

// export default AdminButtonOutline;

export default class AdminButtonOutline extends React.PureComponent<Props> {
    render(): JSX.Element {
        return (
            <button
                type='button'
                onClick={this.props.onClick}
                className={'AdminButtonOutline btn btn-primary'}
                disabled={this.props.disabled}
            >
                {this.props.children}
            </button>
        );
    }
}
