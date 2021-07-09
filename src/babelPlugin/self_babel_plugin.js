module.exports = function (babel) {
    return {
        visitor: {
            BinaryExpression (path, statas) {
                const { node } = path
                const { types: t } = babel
                if (node.operator && node.operator.codePointAt() === 36) {
                    const {left: {name: leftName, value: leftValue}} = node
                    const {right: {name: rightName, value: rightValue}} = node 
                    const leftNode = t.binaryExpression("+", leftName ? t.identifier(leftName) : t.numericLiteral(leftValue), rightName ? t.identifier(rightName) : t.numericLiteral(rightValue));
                    const rightNode = t.binaryExpression("-", leftName ? t.identifier(leftName) : t.numericLiteral(leftValue), rightName ? t.identifier(rightName) : t.numericLiteral(rightValue));
                    node.operator = '*'
                    node.left = leftNode
                    node.right = rightNode
                }
            }
        }
    }
}