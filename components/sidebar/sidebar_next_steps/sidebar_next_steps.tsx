// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {PreferenceType} from 'mattermost-redux/types/preferences';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {Steps} from 'components/next_steps_view/steps';
import ProgressBar from 'components/progress_bar';
import {ModalIdentifiers, RecommendedNextSteps, Preferences} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import './sidebar_next_steps.scss';

import CloseNextStepsModal from './close_next_steps_modal';

type Props = {
    active: boolean;
    showNextSteps: boolean;
    currentUserId: string;
    preferences: PreferenceType[];
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => void;
        closeModal: (modalId: string) => void;
        setShowNextStepsView: (show: boolean) => void;
    };
};

type State = {
    complete: number;
};

export default class SidebarNextSteps extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            complete: 0,
        };
    }

    closeNextSteps = () => {
        const screenTitle = this.props.showNextSteps ?
            localizeMessage('sidebar_next_steps.gettingStarted', 'Getting Started') :
            localizeMessage('sidebar_next_steps.tipsAndNextSteps', 'Tips & Next Steps');

        this.props.actions.openModal({
            modalId: ModalIdentifiers.CLOSE_NEXT_STEPS_MODAL,
            dialogType: CloseNextStepsModal,
            dialogProps: {
                screenTitle,
                onConfirm: this.onConfirmModal,
                onCancel: this.onCloseModal,
            }
        });
    }

    onCloseModal = () => {
        this.props.actions.closeModal(ModalIdentifiers.CLOSE_NEXT_STEPS_MODAL);
    }

    onConfirmModal = () => {
        this.props.actions.savePreferences(this.props.currentUserId, [{
            user_id: this.props.currentUserId,
            category: Preferences.RECOMMENDED_NEXT_STEPS,
            name: RecommendedNextSteps.HIDE,
            value: 'true',
        }]);

        this.props.actions.setShowNextStepsView(false);

        this.onCloseModal();
    }

    render() {
        if (this.props.preferences.some((pref) => pref.name === RecommendedNextSteps.HIDE && pref.value)) {
            return null;
        }

        if (!this.props.active && !this.props.showNextSteps) {
            return null;
        }

        const total = Steps.length;
        const complete = this.props.preferences.filter((pref) => pref.value).length;

        let header = (
            <FormattedMessage
                id='sidebar_next_steps.gettingStarted'
                defaultMessage='Getting Started'
            />
        );
        if (!this.props.showNextSteps) {
            header = (
                <FormattedMessage
                    id='sidebar_next_steps.tipsAndNextSteps'
                    defaultMessage='Tips & Next Steps'
                />
            );
        }

        let middleSection = (
            <FormattedMarkdownMessage
                id='sidebar_next_steps.stepsComplete'
                defaultMessage='{complete} / {total} steps complete'
                values={{
                    complete,
                    total,
                }}
            />
        );
        if (!this.props.showNextSteps) {
            middleSection = (
                <FormattedMessage
                    id='sidebar_next_steps.otherAreasToExplore'
                    defaultMessage='A few other areas to explore'
                />
            );
        }

        return (
            <div
                className={classNames('SidebarNextSteps', {
                    active: this.props.active,
                })}
            >
                <div className='SidebarNextSteps__top'>
                    <span>
                        {header}
                    </span>
                    <button
                        className='SidebarNextSteps__close'
                        onClick={this.closeNextSteps}
                    >
                        <i className='icon icon-close'/>
                    </button>
                </div>
                <div className='SidebarNextSteps__middle'>
                    <span>
                        {middleSection}
                    </span>
                </div>
                {this.props.showNextSteps &&
                <div className='SidebarNextSteps__progressBar'>
                    <ProgressBar
                        current={complete}
                        total={total}
                        basePercentage={4}
                    />
                </div>}
            </div>
        );
    }
}
