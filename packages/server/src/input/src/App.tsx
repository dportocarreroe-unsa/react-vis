import React from "react";

const App: React.FunctionComponent<number> = () => {
	const returnText = <h1>hello returnText</h1>;
	const functionReturn = () => {
		return <h1>hello functionReturn</h1>;
	};
    function normalFunction () {
        return <h2>normal function</h2>
    }
    const arrowFunction = () => <h1>arrow return expression</h1>
	const counter = 0;
	return (
		<div>
			{" "}
			hello world {counter}
			<CounterComponent><div></div></CounterComponent>
            <h1><div></div></h1>
            <h2></h2>
            <img></img>
			{returnText}
			{functionReturn()}
            {normalFunction()}
		</div>
	);
};
