// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import './cloud_table.scss';

type CloudTableProps = {
    header?: React.ReactElement[];
    list: React.ReactElement[][];
}

const CloudTable: React.FC<CloudTableProps> = (props: CloudTableProps) => (
    <table className='CloudTable'>
        <thead>
            {props.header && <tr className='CloudTable__table-header'>
                {props.header.map((headerElement: any, index: number) => {
                    return (
                        <th key={index.toString()}>
                            {headerElement}
                        </th>
                    );
                })}
            </tr>}
        </thead>
        <tbody>
            {props.list && props.list.map((row: any, index: number) => {
                return (
                    <tr
                        className='CloudTable__table-row'
                        key={index.toString()}
                    >
                        {row.map((cell: any) => {
                            return (<td key={cell.key}>
                                {cell}
                            </td>);
                        })}
                    </tr>
                );
            })}
        </tbody>
    </table>
);

export default CloudTable;
