// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Card from 'components/card/card';
import professionalLogo from 'images/cloud-logos/professional.svg';

import './next_steps_view.scss';
import Accordion from 'components/accordion';

type Props = {
    skuName: string;
};

export default class NextStepsView extends React.PureComponent<Props> {
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
                defaultMessage='Here are some recommended next steps to help you get started'
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

    render() {
        return (
            <section
                id='app-content'
                className='app__content NextStepsView'
            >
                <header className='NextStepsView__header'>
                    <div className='NextStepsView__header-headerText'>
                        <h1 className='NextStepsView__header-headerTopText'>
                            <FormattedMessage
                                id='next_steps_view.welcomeToMattermost'
                                defaultMessage='Welcome to Mattermost'
                            />
                        </h1>
                        <h2 className='NextStepsView__header-headerBottomText'>
                            {this.getBottomText()}
                        </h2>
                    </div>
                    <div className='NextStepsView__header-logo'>
                        <img src={this.getLogo()}/>
                    </div>
                </header>
                <div className='NextStepsView__body'>
                    <div className='NextStepsView__body-main'>
                        <Accordion defaultExpandedKey={'Card_1'}>
                            {(setExpanded, expandedKey) => {
                                return (
                                    <>
                                        <Card expanded={expandedKey === 'Card_1'}>
                                            <Card.Header>
                                                <span>{'Card Header 1'}</span>
                                                <button onClick={() => setExpanded('Card_1')}>{'Toggle'}</button>
                                            </Card.Header>
                                            <Card.Body>
                                                <div>
                                                    {'Card Body 1'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                        <Card expanded={expandedKey === 'Card_2'}>
                                            <Card.Header>
                                                <span>{'Card Header 2'}</span>
                                                <button onClick={() => setExpanded('Card_2')}>{'Toggle'}</button>
                                            </Card.Header>
                                            <Card.Body>
                                                <div>
                                                    {'Card Body 2'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                        <Card expanded={expandedKey === 'Card_3'}>
                                            <Card.Header>
                                                <span>{'Card Header 3'}</span>
                                                <button onClick={() => setExpanded('Card_3')}>{'Toggle'}</button>
                                            </Card.Header>
                                            <Card.Body>
                                                <div>
                                                    {'Card Body 3'}
                                                    <br/>
                                                    {'Bigger Card Body'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </>
                                );
                            }}
                        </Accordion>
                    </div>
                    <div className='NextStepsView__body-graphic'/>
                </div>
            </section>
        );
    }
}
