// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {ProductComponent} from 'types/store/plugins';

import {Preferences, TutorialSteps, TopLevelProducts} from 'utils/constants';

import TutorialTip from 'components/tutorial/tutorial_tip';
import {useMeasurePunchouts} from 'components/tutorial/tutorial_tip/hooks';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {Props} from './index';

function checkHasPlaybooks(products: ProductComponent[]): boolean {
    return products.some((x) => x.switcherText === TopLevelProducts.PLAYBOOKS);
}

function checkHasBoards(products: ProductComponent[]): boolean {
    return products.some((x) => x.switcherText === TopLevelProducts.BOARDS);
}
const title = (
    <FormattedMessage
        id='sidebar.tutorialProductSwitcher.title'
        defaultMessage='Try Boards and Playbooks'
    />
);
const screen = (
    <>
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
    </>
);

const ProductMenuTip = ({
    products = [],
    currentUserId,
    step,
    isAnnouncementBarOpen,
    actions,
}: Props): JSX.Element | null => {
    const [skippedBecauseIrrelevant, setSkippedBecauseIrrelevant] = useState(false);
    const tipIsRelevant = (step === TutorialSteps.PRODUCT_SWITCHER) && !skippedBecauseIrrelevant && products && checkHasPlaybooks(products) && checkHasBoards(products);

    const punchOut = useMeasurePunchouts(['global-header'], [isAnnouncementBarOpen]);
    useEffect(() => {
        // We check this at the component level because we want to wait until
        // global header is visible to the user.
        // Otherwise, it could happen that a user on a mattermost instance
        // 1) completes the prior tip
        // 2) doesn't have both Boards & Playbooks installed & enabled
        // 3) The tip is skipped
        // 4) Boards and Playbooks get installed & enabled.
        // 5) User turns on global header or it gets enabled for all users.
        // 6) The user misses seeing this tip.

        if (skippedBecauseIrrelevant || (step !== TutorialSteps.PRODUCT_SWITCHER)) {
            return;
        }

        const userHasProducts = products && checkHasPlaybooks(products) && checkHasBoards(products);
        if (userHasProducts) {
            return;
        }

        // If user does not have access to these products, we do not want to show them the tutorial.
        actions.savePreferences(
            currentUserId,
            [{
                user_id: currentUserId,
                category: Preferences.TUTORIAL_STEP,
                name: currentUserId,
                value: (TutorialSteps.PRODUCT_SWITCHER + 1).toString(),
            }],
        ).then(() => setSkippedBecauseIrrelevant(true));
    }, [skippedBecauseIrrelevant, step, products, currentUserId]);

    if (!tipIsRelevant) {
        return null;
    }

    return (
        <TutorialTip
            title={title}
            showOptOut={true}
            placement='bottom'
            screen={screen}
            step={TutorialSteps.PRODUCT_SWITCHER}
            stopPropagation={true}
            overlayClass='tip-overlay--product-switcher'
            telemetryTag='tutorial_tip_product_switcher'
            punchOut={punchOut}
        />
    );
};

export default ProductMenuTip;
