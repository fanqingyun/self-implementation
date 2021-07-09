const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

const path = require('path')
const fs = require('fs')
const content = fs.readFileSync(path.join(__dirname, 'test.js'), 'utf-8')
const ast = parser.parse(content, { sourceType: 'module'})
traverse(ast, { // 这一步其实就是我们要写的插件
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
})
// console.log(ast)

const { code } = babel.transformFromAstSync(ast, null, {
    // presets:["@babel/preset-env"]
})
console.log(code)