// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import Toggle from 'components/toggle';

export default class LineSwitch extends React.PureComponent {
    static propTypes = {
        title: PropTypes.node.isRequired,
        toggled: PropTypes.bool.isRequired,
        subTitle: PropTypes.node.isRequired,
        onToggle: PropTypes.func.isRequired,
        children: PropTypes.node,
        offText: PropTypes.string,
        onText: PropTypes.string,
    };

    render() {
        const {title, subTitle, toggled, onToggle, children, offText, onText} = this.props;
        return (<div className='padding-bottom x2'>
            <div className='row align-items-start'>
                <div className='col-sm-10'>
                    <label className='control-label'>{title}</label>
                </div>
                <div className='col-sm-2'>
                    <Toggle
                        onToggle={onToggle}
                        toggled={toggled}
                        onText={onText}
                        offText={offText}
                    />
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-10'>
                    <div className='help-text'>{subTitle}</div>
                </div>
            </div>
            {children}
        </div>);
    }
}
