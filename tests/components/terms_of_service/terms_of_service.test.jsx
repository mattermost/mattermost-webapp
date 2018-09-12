// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TermsOfService from 'components/terms_of_service/terms_of_service.jsx';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import {updateServiceTermsStatus} from 'actions/user_actions.jsx';

jest.mock('actions/global_actions.jsx', () => ({
    emitUserLoggedOutEvent: jest.fn(),
}));

jest.mock('actions/user_actions.jsx', () => ({
    updateServiceTermsStatus: jest.fn(),
}));

describe('components/select_team/SelectTeam', () => {
    const baseProps = {
        config: {
            AboutLink: 'https://about.mattermost.com/default-about/',
            PrivacyPolicyLink: 'https://about.mattermost.com/default-privacy-policy/',
            SiteName: 'Mattermost',
            CustomServiceTermsEnabled: true,
            CustomServiceTermsText: '\n## Nisi hoc aquarum litor\n\n0.Una addidit inatten? Non *surge* uterque ```falsa Agamemnona ecce;``` miliaque de\nqua. Leviter __bracchia__ lacrimarum aversum ~~depositum~~ parva @abc pectine emicat, fugam\nquid et gurgite tristis sine dextra, Nec aevo indoluit. Vulnera viam mendacia\nconiugis raptae, **itque**, pocula cum paterni solus.\n\n1. Toto freta habent\n2. Refert et ferat ardescunt piasti ego pro\n3. Concidere ulli cum redunco tulit ego\n4. Divae tantum intervenit Atlante ortus exempla iacet\n5. Se corpus genitis\n6. Fera tantum quod latebra maximus\n\nFreta ira dedisset mundi. Una elige recepto **se cantu Ianthe** duasque\npallidiora: sic respicit, est. *Fit quadripedis furta* ponensque quoque,\ninpellitur evinctus antro hunc. Obmutuit virgo accipienda adhuc, ab parentis\nmarem ducere cruentae?\n\nAnimam cornum flexile rauca caestibus ut cetera miratur exemplo damnosasque\nipse. Tangit concha [interea](http://cecropios.com/quodcuperet.html). Ignibus\ncarchesia, *inplicet tu parte* retices totiens\n[emeritis](http://quid-natus.org/necsidera.html) Aeneae geminaverat parte\naquosis curre. Recumbis poterunt perfringit porrigit, ense nil constitit! Equus\ndura hokjhkhkmini, mihi graves colubrae conferat suis avari conplevit carinae nomine!\n\nConspexit putavi, visceribus fecit; et modo freta mallet agunt? Et ignarus!',
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on loading agree', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        wrapper.setState({loadingAgree: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on loading disagree', () => {
        const props = {...baseProps};
        const wrapper = shallow(<TermsOfService {...props}/>);
        wrapper.setState({loadingDisagree: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call updateServiceTermsStatus on registerUserAction', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().registerUserAction({accepted: 'true', success: jest.fn()});
        expect(updateServiceTermsStatus).toHaveBeenCalledTimes(1);
    });

    test('should match state and call updateServiceTermsStatus on handleAcceptTerms', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().handleAcceptTerms();
        expect(wrapper.state('loadingAgree')).toEqual(true);
        expect(wrapper.state('serverError')).toEqual(null);
        expect(updateServiceTermsStatus).toHaveBeenCalledTimes(1);
    });

    test('should match state and call updateServiceTermsStatus on handleRejectTerms', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().handleRejectTerms();
        expect(wrapper.state('loadingDisagree')).toEqual(true);
        expect(wrapper.state('serverError')).toEqual(null);
        expect(updateServiceTermsStatus).toHaveBeenCalledTimes(1);
    });

    test('should call emitUserLoggedOutEvent on handleLogoutClick', () => {
        const wrapper = shallow(<TermsOfService {...baseProps}/>);
        wrapper.instance().handleLogoutClick({preventDefault: jest.fn()});
        expect(emitUserLoggedOutEvent).toHaveBeenCalledTimes(1);
        expect(emitUserLoggedOutEvent).toHaveBeenCalledWith('/login');
    });
});
