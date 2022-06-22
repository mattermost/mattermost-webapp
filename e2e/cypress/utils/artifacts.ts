// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console,consistent-return */

import fs from 'fs';

import path from 'path';

import async from 'async';
import AWS from 'aws-sdk';
import mime from 'mime-types';
import readdir from 'recursive-readdir';

import {MOCHAWESOME_REPORT_DIR} from './constants';

import dotenv from 'dotenv';
dotenv.config();

const {
    AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    BUILD_ID,
    BRANCH,
    BUILD_TAG,
} = process.env;

const s3 = new AWS.S3({
    signatureVersion: 'v4',
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

function getFiles(dirPath: string) {
    return fs.existsSync(dirPath) ? readdir(dirPath) : [];
}

export async function saveArtifacts(): Promise<{success: boolean, reportLink?: string}> {
    if (!AWS_S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        console.log('No AWS credentials found. Test artifacts not uploaded to S3.');

        return;
    }

    const s3Folder = `${BUILD_ID}-${BRANCH}-${BUILD_TAG}`.replace(/\./g, '-');
    const uploadPath = path.resolve(__dirname, `../${MOCHAWESOME_REPORT_DIR}`);
    const filesToUpload = await getFiles(uploadPath);

    return new Promise((resolve, reject) => {
        async.eachOfLimit(
            filesToUpload,
            10,
            async.asyncify(async (file: string) => {
                const Key = file.replace(uploadPath, s3Folder);
                const contentType = mime.lookup(file) as string;
                const charset = mime.charset(contentType);

                return new Promise((res, rej) => {
                    s3.upload(
                        {
                            Key,
                            Bucket: AWS_S3_BUCKET,
                            Body: fs.readFileSync(file),
                            ContentType: `${contentType}${charset ? '; charset=' + charset : ''}`,
                        },
                        (err) => {
                            if (err) {
                                console.log('Failed to upload artifact:', file);
                                return rej(new Error(err.message));
                            }
                            res({success: true});
                        },
                    );
                });
            }),
            (err) => {
                if (err) {
                    console.log('Failed to upload artifacts');
                    return reject(new Error(err.message));
                }

                const reportLink = `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${s3Folder}/mochawesome.html`;
                resolve({success: true, reportLink});
            },
        );
    });
}
