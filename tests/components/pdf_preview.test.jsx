import React from 'react';

import {shallow} from 'enzyme';

import PDFPreview from 'components/pdf_preview.jsx';

jest.mock('pdfjs-dist', () => ({
    getDocument: () => Promise.resolve()
}));

describe('component/PDFPreview', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    test('should match snapshot success file loading', () => {
        const wrraper = shallow(
            <PDFPreview
                fileInfo={{extension: 'pdf'}}
                fileUrl={'http://www.test/api/v4/files/fzf6j6j18jgizngsb43wg1k4na'}
            />
        );
        expect(wrraper).toMatchSnapshot();
    });
});