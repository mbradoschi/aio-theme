/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, { useRef, useEffect, useState, createRef } from 'react';
import { css } from '@emotion/core';
import classNames from 'classnames';
import '@spectrum-css/vars/dist/spectrum-dark.css';
import PropTypes from 'prop-types';
import '@spectrum-css/tabs';
import { Picker } from './Picker';
import { ActionButton } from './ActionButton';

const CodeBlock = ({ theme = 'dark', ...props }) => {
  const [tabs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState({
    tab: 0,
    language: 0
  });
  const selectedTabIndicator = useRef(null);

  const positionSelectedTabIndicator = (index = selectedIndex.tab) => {
    const selectedTab = tabs.filter((tab) => tab.current)[index];
    selectedTabIndicator.current.style.transform = `translate(${selectedTab.current.offsetLeft}px, 0px)`;
    selectedTabIndicator.current.style.width = `${selectedTab.current.offsetWidth}px`;
  };

  useEffect(() => {
    positionSelectedTabIndicator();

    // Font affects positioning of the Tab indicator
    document.fonts.ready.then(() => {
      positionSelectedTabIndicator();
    });
  }, [tabs]);

  const codeBlocks = [];
  const filteredCodeProps = Object.keys(props).filter((key) => key.startsWith('code'));
  const filteredHeadingProps = Object.keys(props).filter((key) => key.startsWith('heading'));
  const languages = props.languages.split(',').map((language) => language.trim());

  const ignoredHeadings = [];
  filteredHeadingProps.forEach((headingI, i) => {
    if (ignoredHeadings.indexOf(headingI) === -1) {
      codeBlocks.push({
        heading: headingI,
        code: [filteredCodeProps[i]],
        languages: [languages[i]]
      });

      const headingTextI = props[headingI].props.children;

      filteredHeadingProps.forEach((headingK, k) => {
        if (headingI !== headingK) {
          const headingTextK = props[headingK].props.children;

          if (headingTextI === headingTextK) {
            const block = codeBlocks.find((block) => block.heading === headingI);
            if (block) {
              block.code.push(filteredCodeProps[k]);
              block.languages.push(languages[k]);
              ignoredHeadings.push(headingK);
            }
          }
        }
      });
    }
  });

  const backgroundColor = `background-color: var(--spectrum-global-color-gray-${theme === 'light' ? '200' : '50'});`;

  return (
    <div
      className={`spectrum--${theme}`}
      css={css`
        ${backgroundColor}
        margin: var(--spectrum-global-dimension-static-size-400) 0;
        border-top-left-radius: var(--spectrum-global-dimension-static-size-50);
        border-top-right-radius: var(--spectrum-global-dimension-static-size-50);
      `}>
      <div
        css={css`
          display: flex;
          width: 100%;
          height: var(--spectrum-global-dimension-static-size-600);
        `}>
        <div
          css={css`
            padding-left: var(--spectrum-global-dimension-static-size-200);
            box-sizing: border-box;
          `}
          className="spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--quiet"
          role="tabs">
          {codeBlocks.map((block, index) => {
            const ref = createRef();
            tabs.push(ref);

            const isSelected = selectedIndex.tab === index;

            return (
              <div
                key={index}
                ref={ref}
                className={classNames('spectrum-Tabs-item', { 'is-selected': isSelected })}
                aria-selected={isSelected}
                tabIndex="0"
                onClick={() => {
                  const index = tabs.filter((tab) => tab.current).indexOf(ref);
                  setSelectedIndex({
                    tab: index,
                    language: 0
                  });
                  positionSelectedTabIndicator(index);
                }}>
                <span className="spectrum-Tabs-itemLabel">{props[block.heading].props.children}</span>
              </div>
            );
          })}
          <div
            ref={selectedTabIndicator}
            css={css`
              transition-property: transform, width;
            `}
            className="spectrum-Tabs-selectionIndicator"></div>
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            margin-left: auto;
            padding-right: var(--spectrum-global-dimension-static-size-200);
          `}>
          {codeBlocks.map(
            (block, i) =>
              selectedIndex.tab === i && (
                <Picker
                  key={i}
                  isQuiet
                  items={codeBlocks[i].languages.map((language, k) => ({
                    title: language,
                    selected: k === selectedIndex.language
                  }))}
                  onChange={(index) => {
                    setSelectedIndex({
                      tab: selectedIndex.tab,
                      language: index
                    });
                  }}
                />
              )
          )}
        </div>
      </div>
      {codeBlocks.map((block, i) =>
        block.code.map((code, k) => {
          const textarea = createRef();

          return (
            <div
              key={k}
              hidden={!(selectedIndex.tab === i && selectedIndex.language === k)}
              css={css`
                position: relative;
              `}>
              <div
                css={css`
                  & pre {
                    margin-top: 0;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                  }
                `}>
                {props[code]}
                <textarea
                  readOnly={true}
                  aria-hidden="true"
                  css={css`
                    position: fixed;
                    left: -999px;
                    opacity: 0;
                  `}
                  ref={textarea}
                  value={props[code].props.children.props.children}></textarea>
              </div>
              <ActionButton
                onClick={() => {
                  textarea.current.select();
                  document.execCommand('copy');
                }}
                css={css`
                  position: absolute;
                  top: var(--spectrum-global-dimension-static-size-200);
                  right: var(--spectrum-global-dimension-static-size-200);
                `}>
                Copy
              </ActionButton>
            </div>
          );
        })
      )}
    </div>
  );
};

CodeBlock.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']),
  heading: PropTypes.element,
  code: PropTypes.element
};

export { CodeBlock };
