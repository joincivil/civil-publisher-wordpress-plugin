const { registerPlugin } = window.wp.plugins;
import * as React from "react";

class CredibilityIndicators extends React.Component {
  public render(): JSX.Element {
    console.log('whatevers');
    return (
      <React.Fragment>
        <div>Testing</div>
      </React.Fragment>
    );
  }
}

registerPlugin("civil-credibility-indicators", {
  render: () => new CredibilityIndicators({}).render(),
});
