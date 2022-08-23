// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import * as useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import * as useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import * as useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

import AtPlanMention from './index';

describe('components/AtPlanMention', () => {
    it('should open pricing modal when plan mentioned is trial', () => {
        const openPricingModal = jest.fn();
        const openCloudPurchaseModal = jest.fn();
        const openSalesLink = jest.fn();
        jest.spyOn(useOpenPricingModal, 'default').mockImplementation(() => openPricingModal);
        jest.spyOn(useOpenCloudPurchaseModal, 'default').mockImplementation(() => openCloudPurchaseModal);
        jest.spyOn(useOpenSalesLink, 'default').mockImplementation(() => openSalesLink);

        const wrapper = shallow(<AtPlanMention plan='Enterprise trial'/>);
        wrapper.find('a').simulate('click', {
            preventDefault: () => {
            },
        });

        expect(openPricingModal).toHaveBeenCalledTimes(1);
        expect(openCloudPurchaseModal).toHaveBeenCalledTimes(0);
        expect(openSalesLink).toHaveBeenCalledTimes(0);
    });

    it('should open pricing modal when plan mentioned is Enterprise', () => {
        const openPricingModal = jest.fn();
        const openCloudPurchaseModal = jest.fn();
        const openSalesLink = jest.fn();
        jest.spyOn(useOpenPricingModal, 'default').mockImplementation(() => openPricingModal);
        jest.spyOn(useOpenCloudPurchaseModal, 'default').mockImplementation(() => openCloudPurchaseModal);
        jest.spyOn(useOpenSalesLink, 'default').mockImplementation(() => openSalesLink);

        const wrapper = shallow(<AtPlanMention plan='Enterprise plan'/>);
        wrapper.find('a').simulate('click', {
            preventDefault: () => {
            },
        });

        expect(openPricingModal).toHaveBeenCalledTimes(0);
        expect(openCloudPurchaseModal).toHaveBeenCalledTimes(0);
        expect(openSalesLink).toHaveBeenCalledTimes(1);
    });

    it('should open purchase modal when plan mentioned is professional', () => {
        const openPricingModal = jest.fn();
        const openCloudPurchaseModal = jest.fn();
        const openSalesLink = jest.fn();
        jest.spyOn(useOpenPricingModal, 'default').mockImplementation(() => openPricingModal);
        jest.spyOn(useOpenCloudPurchaseModal, 'default').mockImplementation(() => openCloudPurchaseModal);
        jest.spyOn(useOpenSalesLink, 'default').mockImplementation(() => openSalesLink);

        const wrapper = shallow(<AtPlanMention plan='Professional plan'/>);
        wrapper.find('a').simulate('click', {
            preventDefault: () => {
            },
        });

        expect(openPricingModal).toHaveBeenCalledTimes(0);
        expect(openCloudPurchaseModal).toHaveBeenCalledTimes(1);
        expect(openSalesLink).toHaveBeenCalledTimes(0);
    });
});
