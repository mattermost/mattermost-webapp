// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TutorialTip from 'components/tutorial/tutorial_tip';
import {ProductComponent} from 'types/store/plugins';
import {TutorialSteps, TopLevelProducts} from 'utils/constants';

import {makeProduct} from '../test_helpers';

import {Props, ProductSwitcherTip} from './product_switcher_tip';

let props: Props = {
    currentUserId: '',
    step: 0,
    actions: {
        savePreferences: jest.fn(),
    },
};

describe('components/product_switcher/product_switcher_tip', () => {
    beforeEach(() => {
        props = {
            currentUserId: '',
            products: [
                makeProduct(TopLevelProducts.BOARDS) as ProductComponent,
                makeProduct(TopLevelProducts.PLAYBOOKS) as ProductComponent,
            ],
            step: TutorialSteps.PRODUCT_SWITCHER,
            actions: {
                savePreferences: jest.fn(),
            },
        };
    });

    it('shows tutorial tip when it should', () => {
        const wrapper = shallow(<ProductSwitcherTip {...props}/>);

        expect(wrapper.find(TutorialTip)).toHaveLength(1);
        expect(props.actions.savePreferences).not.toHaveBeenCalled();
    });

    it('does not show tutorial tip when tutorial step does not match', () => {
        props.step = TutorialSteps.PRODUCT_SWITCHER - 1;
        const wrapper = shallow(<ProductSwitcherTip {...props}/>);

        expect(wrapper.find(TutorialTip)).toHaveLength(0);
    });

    it('does not skip tutorial tip when tutorial step does not match and a product is missing', () => {
        props.step = TutorialSteps.PRODUCT_SWITCHER - 1;
        props.products = [
            makeProduct(TopLevelProducts.BOARDS) as ProductComponent,
        ];
        shallow(<ProductSwitcherTip {...props}/>);
        expect(props.actions.savePreferences).not.toHaveBeenCalled();
    });

    it('does not show tutorial tip when playbooks is missing', () => {
        props.products = [
            makeProduct(TopLevelProducts.BOARDS) as ProductComponent,
        ];

        expect(props.actions.savePreferences).not.toHaveBeenCalled();
        const wrapper = shallow(<ProductSwitcherTip {...props}/>);
        expect(props.actions.savePreferences).toHaveBeenCalled();

        expect(wrapper.find(TutorialTip)).toHaveLength(0);
    });

    it('does not show tutorial tip when boards is missing', () => {
        props.products = [
            makeProduct(TopLevelProducts.PLAYBOOKS) as ProductComponent,
        ];
        expect(props.actions.savePreferences).not.toHaveBeenCalled();
        const wrapper = shallow(<ProductSwitcherTip {...props}/>);
        expect(props.actions.savePreferences).toHaveBeenCalled();

        expect(wrapper.find(TutorialTip)).toHaveLength(0);
    });

    it('does not show tutorial tip if there are no products', () => {
        delete props.products;
        expect(props.actions.savePreferences).not.toHaveBeenCalled();
        const wrapper = shallow(<ProductSwitcherTip {...props}/>);
        expect(props.actions.savePreferences).toHaveBeenCalled();

        expect(wrapper.find(TutorialTip)).toHaveLength(0);
    });
});
