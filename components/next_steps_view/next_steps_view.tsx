// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Card from 'components/card';
import professionalLogo from 'images/cloud-logos/professional.svg';

import './next_steps_view.scss';
import Accordion from 'components/accordion';

type Props = {
    skuName: string; 
};

type State = {
    expandedKey: string;
}

export default class NextStepsView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            expandedKey: 'Card_1',
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

    handleButton = (expandedKey: string) => {
        this.setState({expandedKey});
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
                        <Accordion
                            expandedKey={this.state.expandedKey}
                        >
                            <Card 
                                key='Card_1'
                            >
                                <Card.Header>
                                    <span>{'Card Header 1'}</span>
                                    <button onClick={() => this.handleButton('Card_1')}></button>
                                </Card.Header>
                                <Card.Body>
                                    <div>
                                        {'Card Body 1'}
                                    </div>
                                </Card.Body>
                            </Card>
                            <Card 
                                key='Card_2'
                            >
                                <Card.Header>
                                    <span>{'Card Header 2'}</span>
                                    <button onClick={() => this.handleButton('Card_2')}></button>
                                </Card.Header>
                                <Card.Body>
                                    <div>
                                        {'Card Body 2'}
                                    </div>
                                </Card.Body>
                            </Card>
                            <Card 
                                key='Card_3'
                            >
                                <Card.Header>
                                    <span>{'Card Header 3'}</span>
                                    <button onClick={() => this.handleButton('Card_3')}></button>
                                </Card.Header>
                                <Card.Body>
                                    <div>
                                        {'Card Body 3'}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Accordion>
                    </div>
                    <div className='NextStepsView__body-graphic'/>
                </div>
            </div>
        );
    }
}
