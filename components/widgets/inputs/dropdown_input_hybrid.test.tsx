// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { shallow } from "enzyme";
import React, { useState } from "react";

import DropdownInputHybrid from "./dropdown_input_hybrid";

describe("components/widgets/inputs/DropdownInputHybrid", () => {
  test("should match snapshot", () => {
    const wrapper = shallow(
      <DropdownInputHybrid
        onDropdownChange={jest.fn()}
        onInputChange={jest.fn()}
        value={{ value: "forever", label: "Keep Forever" }}
        inputValue={""}
        width={90}
        exceptionToInput={["forever"]}
        defaultValue={{ value: "forever", label: "Keep Forever" }}
        options={[
          { value: "days", label: "Days" },
          { value: "months", label: "Months" },
          { value: "years", label: "Years" },
          { value: "forever", label: "Keep Forever" },
        ]}
        legend={"Channel Message Retention"}
        placeholder={"Channel Message Retention"}
        name={"channel_message_retention"}
      />
    );
    expect(wrapper).toMatchInlineSnapshot(`
      <div
        className="DropdownInput hybrid_container"
        style={
          Object {
            "width": "100%",
          }
        }
      >
        <fieldset
          className="Input_fieldset Input_fieldset___legend"
        >
          <legend
            className="Input_legend Input_legend___focus"
          >
            Channel Message Retention
          </legend>
          <div
            className="Input_wrapper input_hybrid_wrapper"
            onBlur={[Function]}
            onFocus={[Function]}
            style={
              Object {
                "width": "0%",
              }
            }
          >
            <input
              className="Input form-control"
              name="Input_channel_message_retention"
              onChange={[MockFunction]}
              placeholder="Channel Message Retention"
              required={false}
              type="text"
              value=""
            />
          </div>
          <div
            className="Input_wrapper dropdown_hybrid_wrapper showInput"
            onBlur={[Function]}
            onFocus={[Function]}
            style={
              Object {
                "width": "100%",
              }
            }
          >
            <StateManager
              className="Input Input__focus"
              classNamePrefix="DropDown"
              components={
                Object {
                  "Control": [Function],
                  "IndicatorsContainer": [Function],
                  "Option": [Function],
                }
              }
              defaultInputValue=""
              defaultMenuIsOpen={false}
              defaultValue={null}
              hideSelectedOptions={true}
              id="DropdownInput_channel_message_retention"
              isSearchable={false}
              menuPortalTarget={<body />}
              onChange={[Function]}
              options={
                Array [
                  Object {
                    "label": "Days",
                    "value": "days",
                  },
                  Object {
                    "label": "Months",
                    "value": "months",
                  },
                  Object {
                    "label": "Years",
                    "value": "years",
                  },
                  Object {
                    "label": "Keep Forever",
                    "value": "forever",
                  },
                ]
              }
              placeholder="Channel Message Retention"
              styles={
                Object {
                  "control": [Function],
                  "indicatorSeparator": [Function],
                  "input": [Function],
                  "menuPortal": [Function],
                }
              }
              value={
                Object {
                  "label": "Keep Forever",
                  "value": "forever",
                }
              }
            />
          </div>
        </fieldset>
      </div>
    `);
  });
});
