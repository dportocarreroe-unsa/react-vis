import React from "react";

const CounterComponent: React.FunctionComponent<number> = () => {
	const [counter, setCounter] = useState(0);
	return <div>{counter}</div>;
};

