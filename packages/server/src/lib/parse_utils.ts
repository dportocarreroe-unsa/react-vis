import {
	BlockStatement,
	Expression,
	JSXElement,
	JSXFragment,
	JSXText,
	JSXExpressionContainer,
	JSXSpreadChild,
	ReturnStatement,
} from "@babel/types";
import { parse } from "@babel/parser";
import ReactComponentTree from "./react_component_tree";

export type IJSX =
	| JSXElement
	| JSXFragment
	| JSXText
	| JSXExpressionContainer
	| JSXSpreadChild;

export const getASTFromSource = (source: string) => {
	const AST = parse(source, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
	});
	return AST;
};

export const getJSXChildrensFromArrowFunction = (
	body: BlockStatement | Expression
): IJSX[] | null => {
	// if body of arrow function has type property
	// it means it is a expression
	if ("type" in body) {
		const expression = body as Expression;
		if (expression.type === "JSXElement") {
			return expression.children;
		}
	}

	// if body of arrow function is a block statement
	// find its return statement
	const block = body as BlockStatement;
	if (!block.body) {
		return null;
	}
	const returnStatement = block.body.find(
		(statement) => statement.type === "ReturnStatement"
	) as ReturnStatement;
    
	// if return data type is of type JSX
	// return its children
	if (returnStatement && returnStatement.argument?.type === "JSXElement") {
		return returnStatement.argument.children;
	}
	return null;
};

export const getChildComponents = (
	children: IJSX[] | null,
	_this: ReactComponentTree
): string[] => {
	let childComponents: string[] = [];
	if (children && children.length > 0) {
		for (const child of children) {
			if (child.type === "JSXElement") {
				const jsxElement = child as JSXElement;
				if (jsxElement.openingElement.name.type === "JSXIdentifier") {
					childComponents = childComponents.concat(
						jsxElement.openingElement.name.name
					);
					_this.addParentComponent(
						jsxElement.children,
						jsxElement.openingElement.name.name
					);
				}
			} else if (child.type === "JSXExpressionContainer") {
				const jsxExpression = child as JSXExpressionContainer;
				if (jsxExpression.expression.type === "CallExpression") {
					if (jsxExpression.expression.callee.type === "Identifier") {
						// this functions must return jsx since they are inside JSXExpressionContainer
						// thus we add them as react child components
						childComponents = childComponents.concat(
							jsxExpression.expression.callee.name
						);
					}
				}
			}
		}
	}
	return childComponents;
};
