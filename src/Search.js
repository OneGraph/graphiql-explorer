import React from 'react';
import Autosuggest from 'react-autosuggest';
import {getPath} from './utils';
import Highlighter from 'react-highlight-words';

const renderSuggestion = (search, suggestion) => (
  <div>
    {false ? '\u2605' : '\u2606'} - {suggestion.name}
    <hr className="result-title" />
    <pre className="suggestion-preview">
      <Highlighter
        highlightClassName="highlighted-match"
        searchWords={[search]}
        autoEscape={true}
        textToHighlight={suggestion.truncatedMatch}
      />
    </pre>
  </div>
);

const truncateMatch = (needle, haystacks) => {
  let match = haystacks
    .filter(value => !!value)
    .map(value => value.match(needle))
    .filter(value => !!value)[0];
  let buffer = 50;
  let leftTruncation = match.index - buffer < 0 ? '' : '...';
  let rightTruncation =
    match.index + buffer > match.input.length + 3 ? '' : '...';
  let range = [
    Math.max(0, match.index - buffer),
    Math.min(match.input.length, match.index + buffer),
  ];
  return `${leftTruncation}${match.input.substring(range[0], range[1])}${
    rightTruncation
  }`;
};

class Example extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
    };
  }

  onChange = (event, {newValue}) => {
    this.setState({
      value: newValue,
    });
  };

  onSuggestionsFetchRequested = ({value}) =>
    this.props.getSuggestions(value, results => {
      if (value === this.state.value) {
        const suggestions =
          getPath(results, ['data', 'oneGraph', 'searchQueries']) || [];
        const annotatedSuggestions = suggestions.map(suggestion => {
          const truncatedMatch = truncateMatch(value, [
            suggestion.body,
            suggestion.description,
            suggestion.name,
          ]);
          return {...suggestion, truncatedMatch};
        });
        this.setState({
          suggestions: annotatedSuggestions,
        });
      } else {
        console.log('results invalidated because query changed, dropping');
      }
    });

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const {value, suggestions} = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: this.props.placeholder,
      value,
      onChange: this.onChange,
    };

    // Finally, render it!
    return (
      <Autosuggest
        placeholder={this.props.placeholder}
        onSuggestionSelected={this.props.onSuggestionSelected}
        shouldRenderSuggestions={_ => {
          const show = this.state.value && this.state.value.length > 3;
          return show;
        }}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={_ => this.state.value}
        renderSuggestion={suggestion =>
          renderSuggestion(this.state.value, suggestion)
        }
        inputProps={inputProps}
      />
    );
  }
}

export default Example;
