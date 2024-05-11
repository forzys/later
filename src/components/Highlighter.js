import React from 'react';
import { Text as RNText, TouchableWithoutFeedback } from 'react-native';
import { regex } from '@/common/common'

const { 
    mentionRegex,
    mentionRegexTester,
    hashtagRegex,
    hashtagRegexTester,
    emailRegex,
    emailRegexTester,
    urlRegex,
    urlRegexTester
} = regex


export const splitText = ({ text,  highlights, caseSensitive, hashtags, mentions, emails, links }) => {
  const highlightRegex = [];
  highlights && highlights.forEach((item) => { highlightRegex.push(...item.regexSource) });
  hashtags && highlightRegex.push(`(${hashtagRegex.source})`);
  mentions && highlightRegex.push(`(${mentionRegex.source})`);
  emails && highlightRegex.push(`(${emailRegex.source})`);
  links && highlightRegex.push(`(${urlRegex.source})`);

  const finalRegex = new RegExp(
    highlightRegex.join('|'),
    caseSensitive ? 'gm' : 'gmi'
  );

  const parts =
    text && highlightRegex.length > 0
      ? text.split(finalRegex).filter((i) => i !== undefined && i !== '')
      : text
      ? [text]
      : [];
  return parts;
};

export const formatedHtml = ({
    text,
    highlights,
    caseSensitive,
    hashtags,
    hashtagClassName,
    hashtagUrl,
    mentions,
    mentionClassName,
    mentionUrl,
    emails,
    emailClassName,
    emailUrl,
    links,
    linkClassName,
}) => {
    const chunks = splitText({
        text,
        highlights,
        caseSensitive,
        hashtags,
        mentions,
        emails,
        links,
    });

    let html = '';
    chunks.map((chunk) => {
        let keyword = null;
        if (highlights) {
            highlights.map((item) => {
                const itemRegex = new RegExp(
                    `^${item.regexSource.join('|')}$`,
                    caseSensitive ? 'gm' : 'gmi'
                );

                if (itemRegex.test(chunk)) {
                    keyword = `<span class=${item.className}>${chunk}</span>`;
                }
            });
        }
        if (keyword) {
            html += keyword;
        } else if (hashtagRegexTester.test(chunk)) {
            html += hashtagUrl
            ? `<a class=${hashtagClassName || ''} href=${hashtagUrl(chunk)}>${chunk}</a>`
            : `<span class=${hashtagClassName || ''}>${chunk}</span>`;
        } else if (mentionRegexTester.test(chunk)) {
            html += mentionUrl
            ? `<a class=${mentionClassName || ''} href=${mentionUrl(chunk)}>${chunk}</a>`
            : `<span class=${mentionClassName || ''}>${chunk}</span>`;
        } else if (emailRegexTester.test(chunk)) {
            html += emailUrl
            ? `<a class=${emailClassName || ''} href=${emailUrl(chunk)}>${chunk}</a>`
            : `<span class=${emailClassName || ''}>${chunk}</span>`;
        } else if (urlRegexTester.test(chunk)) {
            html += `<a class=${linkClassName || ''} href=${chunk}>${chunk}</a>`;
        } else html += `<span>${chunk}</span>`;
    });
    return html;
};

export class Highlight {
    constructor({ keywords = [], style = {}, onPress = () => {},  className = '' }) {
        this.keywords = keywords;
        this.style = style;
        this.onPress = onPress;
        this.className = className;
        this.regexSource = keywords.map((keyword) => `(${keyword.replace(/"/g, '').trim()})` );
    }
}

const HighlightedText = ({
    children,
    highlights,
    caseSensitive,
    hashtags,
    hashtagStyle = { color: 'blue' },
    onHashtagPress = () => {},
    mentions,
    mentionStyle = { color: 'blue' },
    onMentionPress = () => {},
    emails,
    emailStyle = { color: 'blue' },
    onEmailPress = () => {},
    links,
    linkStyle = { color: 'blue' },
    onLinkPress = () => {},
    TextComponent = RNText,
    ...props
}) => {
    let text = '';
    React.Children.map(children, (child) => {
        if (typeof child === 'string') {
            text += child;
        }
    });
    const chunks = splitText({
        text,
        highlights,
        caseSensitive,
        hashtags,
        mentions,
        emails,
        links,
    });

  return (
    <RNText {...props}>
      {chunks.map((chunk, index) => {
        let keyword  = null;
        if (highlights) {
            highlights.map((item) => {
            const itemRegex =
                item.regexSource.length > 0
                ? new RegExp(`^${item.regexSource.join('|')}$`,caseSensitive ? 'gm' : 'gmi' )
                : null;

                if (itemRegex && itemRegex.test(chunk)) {
                    keyword = (
                        <TouchableWithoutFeedback
                            key={index}
                            onPress={(e) => item.onPress(chunk, e)}
                        >
                            <TextComponent style={item.style}>{chunk}</TextComponent>
                        </TouchableWithoutFeedback> 
                    );
                }
            });
        }
        if (hashtags && hashtagRegexTester.test(chunk)) {
            return (
                <TouchableWithoutFeedback
                    key={index}
                    onPress={() => onHashtagPress(chunk)}
                >
                    <TextComponent style={hashtagStyle}>{chunk}</TextComponent>
                </TouchableWithoutFeedback>
            );
        }
        if (mentions && mentionRegexTester.test(chunk)) {
            return (
                <TouchableWithoutFeedback
                    key={index}
                    onPress={() => onMentionPress(chunk)}
                >
                    <TextComponent style={mentionStyle}>{chunk}</TextComponent>
                </TouchableWithoutFeedback>
            );
        }
        if (emails && emailRegexTester.test(chunk)) {
            return (
                <TouchableWithoutFeedback
                    key={index}
                    onPress={() => onEmailPress(chunk)}
                >
                    <TextComponent style={emailStyle}>{chunk}</TextComponent>
                </TouchableWithoutFeedback>
            );
        }
        if (links && urlRegexTester.test(chunk)) {
            return (
                <TouchableWithoutFeedback
                    key={index}
                    onPress={() => onLinkPress(chunk)}
                >
                    <TextComponent style={linkStyle}>{chunk}</TextComponent>
                </TouchableWithoutFeedback>
            );
        }
        if (keyword) {
            return  <TextComponent key={index}>{keyword}</TextComponent>;
        }
        return <TextComponent key={index}>{chunk}</TextComponent>;
      })}
    </RNText>
  );
};

export default HighlightedText;