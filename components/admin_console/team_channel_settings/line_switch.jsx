// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import Toggle from 'components/toggle';

export default class LineSwitch extends React.PureComponent {
    static propTypes = {
        title: PropTypes.node.isRequired,
        last: PropTypes.bool,
        toggled: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        singleLine: PropTypes.bool,
        subTitle: PropTypes.node.isRequired,
        onToggle: PropTypes.func.isRequired,
        children: PropTypes.node,
        offText: PropTypes.node,
        onText: PropTypes.node,
    };

    render() {
        const {title, subTitle, singleLine, toggled, onToggle, children, offText, onText, disabled, last} = this.props;
        return (<div>
            <div className='row align-items-start'>
                <div className='col-sm-10'>
                    <label className='control-label'>{title}</label>
                </div>
                <div className='col-sm-2'>
                    <Toggle
                        disabled={disabled}
                        onToggle={onToggle}
                        toggled={toggled}
                        onText={onText}
                        offText={offText}
                    />
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-10'>
                    <div className={`help-text-small help-text-no-padding ${singleLine ? 'help-text-single-line' : ''}`}>{subTitle}</div>
                </div>
            </div>
            {children}
            {!last && <div className='section-separator'><hr className='separator__hr'/></div>}
        </div>);
    }
}
