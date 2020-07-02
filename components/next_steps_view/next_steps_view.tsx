// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Card from 'components/card';
import professionalLogo from 'images/cloud-logos/professional.svg';

import './next_steps_view.scss';

type Props = {
    skuName: string; 
};

type State = {
    collapsed: boolean;
}

export default class NextStepsView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            collapsed: false,
        };
    }

    getBottomText = () => {
        // TODO: will be stored in user prefs at a later date
        const {isFinished} = {isFinished: false};

        if (isFinished) {
            return (
                <FormattedMessage
                    id='next_steps_view.allSetToGo'
                    defaultMessage={'You\'re all set to go!'}
                />
            );
        }

        return (
            <FormattedMessage
                id='next_steps_view.hereAreSomeNextSteps'
                defaultMessage='Here are some recommended next steps to help you collaborate'
            />
        );
    }

    getLogo = () => {
        // TODO: Switch logos based on edition once we have the other logos

        switch (this.props.skuName) {
        default:
            return professionalLogo;
        }
    }

    handleButton = () => {
        this.setState({collapsed: !this.state.collapsed});
    }

    render() {
        return (
            <div
                id='app-content'
                className='app__content NextStepsView'
            >
                <div className='NextStepsView__header'>
                    <div className='NextStepsView__header-headerText'>
                        <div className='NextStepsView__header-headerTopText'>
                            <FormattedMessage
                                id='next_steps_view.welcomeToMattermost'
                                defaultMessage='Welcome to Mattermost'
                            />
                        </div>
                        <div className='NextStepsView__header-headerBottomText'>
                            {this.getBottomText()}
                        </div>
                    </div>
                    <div className='NextStepsView__header-logo'>
                        <img src={this.getLogo()}/>
                    </div>
                </div>
                <div className='NextStepsView__body'>
                    <div className='NextStepsView__body-main'>
                        <button onClick={this.handleButton}>{'Collapse'}</button>
                        <Card collapsed={this.state.collapsed}>
                            <Card.Header>
                                <span>{'Card Header'}</span>
                            </Card.Header>
                            <Card.Body>
                                <div>
                                    {'Card Body'}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className='NextStepsView__body-graphic'/>
                </div>
            </div>
        );
    }
}
