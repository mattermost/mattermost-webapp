// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PDFPreview from 'components/pdf_preview.jsx';

jest.mock('pdfjs-dist', () => ({
    getDocument: () => Promise.resolve({
        numPages: 3,
        getPage: (i) => Promise.resolve({
            pageIndex: i,
            getContext: (s) => Promise.resolve({s}),
        }),
    }),
}));

describe('component/PDFPreview', () => {
    const requiredProps = {
        fileInfo: {extension: 'pdf'},
        fileUrl: 'https://pre-release.mattermost.com/api/v4/files/ips59w4w9jnfbrs3o94m1dbdie',
    };

    test('should match snapshot, loading', () => {
        const wrapper = shallow(
            <PDFPreview {...requiredProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, not successful', () => {
        const wrapper = shallow(
            <PDFPreview {...requiredProps}/>
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should return correct state when updateStateFromProps is called', () => {
        const wrapper = shallow(
            <PDFPreview {...requiredProps}/>
        );

        wrapper.instance().updateStateFromProps(requiredProps);
        expect(wrapper.state('pdf')).toBe(null);
        expect(wrapper.state('pdfPages')).toEqual({});
        expect(wrapper.state('pdfPagesLoaded')).toEqual({});
        expect(wrapper.state('numPages')).toEqual(0);
        expect(wrapper.state('loading')).toBe(true);
        expect(wrapper.state('success')).toBe(false);
    });

    test('should return correct state when onDocumentLoad is called', () => {
        const wrapper = shallow(
            <PDFPreview {...requiredProps}/>
        );

        let pdf = {numPages: 0};
        wrapper.instance().onDocumentLoad(pdf);
        expect(wrapper.state('pdf')).toEqual(pdf);
        expect(wrapper.state('numPages')).toEqual(pdf.numPages);

        const MAX_PDF_PAGES = 5;
        pdf = {
            numPages: 6,
            getPage: (i) => Promise.resolve(i),
        };
        wrapper.instance().onDocumentLoad(pdf);
        expect(wrapper.state('pdf')).toEqual(pdf);
        expect(wrapper.state('numPages')).toEqual(MAX_PDF_PAGES);
    });
});
