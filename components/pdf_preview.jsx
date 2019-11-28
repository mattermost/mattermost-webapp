// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import PDFJS from 'pdfjs-dist';
import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import FileInfoPreview from 'components/file_info_preview';

const MAX_PDF_PAGES = 5;

export default class PDFPreview extends React.PureComponent {
    static propTypes = {

        /**
        * Compare file types
        */
        fileInfo: PropTypes.object.isRequired,

        /**
        *  URL of pdf file to output and compare to update props url
        */
        fileUrl: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);

        this.pdfPagesRendered = {};

        this.state = {
            pdf: null,
            pdfPages: {},
            pdfPagesLoaded: {},
            numPages: 0,
            loading: true,
            success: false,
        };
    }

    componentDidMount() {
        this.updateStateFromProps(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.fileUrl !== nextProps.fileUrl) {
            this.updateStateFromProps(nextProps);
            this.pdfPagesRendered = {};
        }
    }

    componentDidUpdate() {
        if (this.state.success) {
            for (let i = 0; i < this.state.numPages; i++) {
                this.renderPDFPage(i);
            }
        }
    }

    renderPDFPage = (pageIndex) => {
        if (this.pdfPagesRendered[pageIndex] || !this.state.pdfPagesLoaded[pageIndex]) {
            return;
        }

        const canvas = this.refs['pdfCanvas' + pageIndex];
        const context = canvas.getContext('2d');
        const viewport = this.state.pdfPages[pageIndex].getViewport(1);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport,
        };

        this.state.pdfPages[pageIndex].render(renderContext);
        this.pdfPagesRendered[pageIndex] = true;
    }

    updateStateFromProps = (props) => {
        this.setState({
            pdf: null,
            pdfPages: {},
            pdfPagesLoaded: {},
            numPages: 0,
            loading: true,
            success: false,
        });

        PDFJS.getDocument(props.fileUrl).then(this.onDocumentLoad, this.onDocumentLoadError);
    }

    onDocumentLoad = (pdf) => {
        const numPages = pdf.numPages <= MAX_PDF_PAGES ? pdf.numPages : MAX_PDF_PAGES;
        this.setState({pdf, numPages});
        for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(this.onPageLoad);
        }
    }

    onDocumentLoadError = (reason) => {
        console.log('Unable to load PDF preview: ' + reason); //eslint-disable-line no-console
        this.setState({loading: false, success: false});
    }

    onPageLoad = (page) => {
        const pdfPages = Object.assign({}, this.state.pdfPages);
        pdfPages[page.pageIndex] = page;

        const pdfPagesLoaded = Object.assign({}, this.state.pdfPagesLoaded);
        pdfPagesLoaded[page.pageIndex] = true;

        this.setState({pdfPages, pdfPagesLoaded});

        if (page.pageIndex === 0) {
            this.setState({success: true, loading: false});
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <div className='view-image__loading'>
                    <LoadingSpinner/>
                </div>
            );
        }

        if (!this.state.success) {
            return (
                <FileInfoPreview
                    fileInfo={this.props.fileInfo}
                    fileUrl={this.props.fileUrl}
                />
            );
        }

        const pdfCanvases = [];
        for (let i = 0; i < this.state.numPages; i++) {
            pdfCanvases.push(
                <canvas
                    ref={'pdfCanvas' + i}
                    key={'previewpdfcanvas' + i}
                />
            );

            if (i < this.state.numPages - 1 && this.state.numPages > 1) {
                pdfCanvases.push(
                    <div
                        key={'previewpdfspacer' + i}
                        className='pdf-preview-spacer'
                    />
                );
            }
        }

        if (this.state.pdf.numPages > MAX_PDF_PAGES) {
            const fileDownloadUrl = this.props.fileInfo.link || getFileDownloadUrl(this.props.fileInfo.id);

            pdfCanvases.push(
                <a
                    key='previewpdfmorepages'
                    href={fileDownloadUrl}
                    className='pdf-max-pages'
                >
                    <FormattedMessage
                        id='pdf_preview.max_pages'
                        defaultMessage='Download to read more pages'
                    />
                </a>
            );
        }

        return (
            <div className='post-code'>
                {pdfCanvases}
            </div>
        );
    }
}
