// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionResult} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {ProductComponent} from 'types/store/plugins';

import {Preferences, TutorialSteps, TopLevelProducts} from 'utils/constants';

import TutorialTip from 'components/tutorial/tutorial_tip';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

function checkHasPlaybooks(products: ProductComponent[]): boolean {
    return products.some((x) => x.switcherText === TopLevelProducts.PLAYBOOKS);
}

function checkHasBoards(products: ProductComponent[]): boolean {
    return products.some((x) => x.switcherText === TopLevelProducts.BOARDS);
}

export interface Props {
    currentUserId: string;
    products?: ProductComponent[];
    step: number;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    };
}

// We track skippedBecauseIrrelevant because we only want to fire the action once
interface State {
    skippedBecauseIrrelevant: boolean;
}

const screens = [
    <div key='first-screen'>
        <h4>
            <FormattedMessage
                id='sidebar.tutorialProductSwitcher.title'
                defaultMessage='Try Boards and Playbooks'
            />
        </h4>
        <p>
            <FormattedMarkdownMessage
                id='sidebar.tutorialProductSwitcher.switchProducts'
                defaultMessage={'Launch other Mattermost products from here, including **Boards** and **Playbooks**.'}
            />
        </p>
        <p>
            <FormattedMarkdownMessage
                id='sidebar.tutorialProductSwitcher.admin'
                defaultMessage={'System Admins can also configure and customize Mattermost using the **System Console** and install Mattermost Apps from the **Marketplace**.'}
            />
        </p>
    </div>,
];

export class ProductSwitcherTip extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            skippedBecauseIrrelevant: false,
        };
    }

    // Checking in both componentDidMount and componentDidUpdate protects against changes in data load & component render order.
    componentDidMount() {
        this.skipIfIrrelevant();
    }

    componentDidUpdate() {
        this.skipIfIrrelevant();
    }

    checkRelevance() {
    }

    skipIfIrrelevant() {
        // We check this at the component level because we want to wait until
        // global header is visible to the user.
        // Otherwise, it could happen that a user on a mattermost instance
        // 1) completes the prior tip
        // 2) doesn't have both Boards & Playbooks installed & enabled
        // 3) The tip is skipped
        // 4) Boards and Playbooks get installed & enabled.
        // 5) User turns on global header or it gets enabled for all users.
        // 6. The user misses seeing this tip.

        if (this.state.skippedBecauseIrrelevant || (this.props.step !== TutorialSteps.PRODUCT_SWITCHER)) {
            return;
        }

        const userHasProducts = this.props.products && checkHasPlaybooks(this.props.products) && checkHasBoards(this.props.products);
        if (userHasProducts) {
            return;
        }

        // If user does not have access to these products, we do not want to show them the tutorial.
        this.setState({skippedBecauseIrrelevant: true}, () => {
            this.props.actions.savePreferences(
                this.props.currentUserId,
                [{
                    user_id: this.props.currentUserId,
                    category: Preferences.TUTORIAL_STEP,
                    name: this.props.currentUserId,
                    value: (TutorialSteps.PRODUCT_SWITCHER + 1).toString(),
                }],
            );
        });
    }

    render() {
        const tipIsRelevant = (this.props.step === TutorialSteps.PRODUCT_SWITCHER) && !this.state.skippedBecauseIrrelevant && this.props.products && checkHasPlaybooks(this.props.products) && checkHasBoards(this.props.products);
        if (!tipIsRelevant) {
            return null;
        }

        return (
            <TutorialTip
                placement='right'
                screens={screens}
                overlayClass='tip-overlay--product-switcher'
                telemetryTag='tutorial_tip_product_switcher'
            />
        );
    }
}
