
var parseC = function() {
    var tokenTypes = {
        WS: /^[ \t\r\n]+/,
        ID: /^[a-zA-Z]+/,
        INTEGER: /^-?[0-9]+/,
        OPEN_PAREN: /^\(/,
        CLOSE_PAREN: /^\)/,
        OPEN_BRACE: /^{/,
        CLOSE_BRACE: /^}/,
        COMMA: /^,/,
        COMPARE_OP: /^([><]=?|==)/,
        ASSIGN_OP: /^(=|\+=|-=|\*=|\/=)/,
        AND_OP: /^&&/,
        OR_OP: /^\|\|/,
        SEMICOLON: /^;/
    };

    var tokenizeC = function(s) {
        var tokens = [];

        var foundToken;

        do {
            foundToken = false;

            for(var type in tokenTypes) {
                var match = tokenTypes[type].exec(s);

                if(match) {
                    if(type !== 'WS') {
                        tokens.push({
                            type: type,
                            s: match[0]
                        });
                    }

                    s = s.substr(match[0].length);

                    foundToken = true;
                    break;
                }
            }

            // TODO: error messages
        } while(s.length !== 0 && foundToken);

        return tokens;
    };

    return function(s) {
        var parser = {
            tokens: tokenizeC(s),
            i: 0,

            error: "",

            FUNCTION: function() {
                // TODO: error messages

                var iOld = this.i;

                if(!this.JUST_TOKEN('ID')) {
                    this.i = iOld;

                    return null;
                }

                if(!this.JUST_TOKEN('ID')) {
                    this.i = iOld;

                    return null;
                }

                if(!this.JUST_TOKEN('OPEN_PAREN')) {
                    this.i = iOld;

                    return null;
                }

                var params = this.PARAMS();

                if(!this.JUST_TOKEN('CLOSE_PAREN')) {
                    this.i = iOld;

                    return null;
                }

                var block = this.BLOCK();

                if(block === null) {
                    // this.i = iOld;
                    //
                    // return null;
                }

                return {
                    params: params,
                    expressions: block,
                    theRest: this.tokens.splice(this.i)
                };
            },

            JUST_TOKEN: function(type) {
                return this.tokens[this.i++].type === type;
            },

            PARAMS: function() {
                var iOld = this.i;

                var firstParam = this.PARAM();

                if(firstParam === null) {
                    return [];
                }

                var params = [firstParam.id];

                while(true) {
                    if(!this.JUST_TOKEN('COMMA')) {
                        this.i -= 1;
                        break;
                    }

                    var nextParam = this.PARAM();

                    if(nextParam === null) {
                        this.i = iOld;
                        return null;
                    }

                    params.push(nextParam.id);
                }

                return params;
            },

            PARAM: function() {
                var iOld = this.i;

                var varType = this.tokens[this.i++];

                if(varType.type !== 'ID') {
                    this.i = iOld;
                    return null;
                }

                var varId = this.tokens[this.i++];

                if(varId.type !== 'ID') {
                    this.i = iOld;
                    return null;
                }

                return {
                    type: varType.s,
                    id: varId.s
                }
            },

            BLOCK: function() {
                var iOld = this.i;

                if(!this.JUST_TOKEN('OPEN_BRACE')) {
                    this.i = iOld;

                    return null;
                }

                var ifStatements = [];

                while(true) {
                    var ifStatement = this.IF_STATEMENT();

                    if(ifStatement !== null) {
                        ifStatements.push(ifStatement);

                        console.log(ifStatements);

                        continue;
                    }

                    var junkStatement = this.JUNK_STATEMENT();

                    if(junkStatement !== null) {
                        console.log("junk");

                        continue;
                    }

                    break;
                }

                if(!this.JUST_TOKEN('CLOSE_BRACE')) {
                    this.i = iOld;

                    return null;
                }

                return ifStatements;
            },

            IF_STATEMENT: function() {
                var iOld = this.i;

                var ifKeyword = this.tokens[this.i++];

                if(ifKeyword.type !== 'ID' || ifKeyword.s !== 'if') {
                    this.i = iOld;

                    return null;
                }

                console.log("10");

                if(!this.JUST_TOKEN('OPEN_PAREN')) {
                    this.i = iOld;

                    return null;
                }

                console.log("10");

                var expression = this.EXPRESSION();

                if(expression === null) {
                    this.i = iOld;

                    return null;
                }

                console.log("10");

                if(!this.JUST_TOKEN('CLOSE_PAREN')) {
                    console.log(this.tokens[this.i - 1]);

                    this.i = iOld;

                    return null;
                }

                console.log("10");

                var junkBlock = this.BLOCK();

                if(junkBlock === null) {
                    this.i = iOld;

                    return null;
                }

                return expression;
            },

            EXPRESSION: function() {
                var expression = this.OR_EXPRESSION();

                if(expression !== null) {
                    return expression;
                }

                expression = this.AND_EXPRESSION();

                if(expression !== null) {
                    return expression;
                }

                expression = this.COMPARE_EXPRESSION();

                if(expression !== null) {
                    return expression;
                }

                expression = this.ATOMIC_EXPRESSION();

                if(expression !== null) {
                    return expression;
                }

                return null;
            },

            OR_EXPRESSION: function() {
                var iOld = this.i;

                var leftOp = this.AND_EXPRESSION();

                if(leftOp === null) {
                    this.i = iOld;

                    return null;
                }

                var op = this.tokens[this.i++];

                if(op.type !== 'OR_OP') {
                    this.i = iOld;

                    return this.AND_EXPRESSION();
                }

                var rightOp = this.AND_EXPRESSION();

                if(rightOp === null) {
                    this.i = iOld;

                    return null;
                }

                return {
                    op: 'or',
                    left: leftOp,
                    right: rightOp
                }
            },

            AND_EXPRESSION: function() {
                var iOld = this.i;

                var leftOp = this.COMPARE_EXPRESSION();

                if(leftOp === null) {
                    this.i = iOld;

                    return null;
                }

                var op = this.tokens[this.i++];

                if(op.type !== 'AND_OP') {
                    this.i = iOld;

                    return this.COMPARE_EXPRESSION();
                }

                var rightOp = this.COMPARE_EXPRESSION();

                if(rightOp === null) {
                    this.i = iOld;

                    return null;
                }

                return {
                    op: 'and',
                    left: leftOp,
                    right: rightOp
                }
            },

            COMPARE_EXPRESSION: function() {
                var iOld = this.i;

                var leftOp = this.ATOMIC_EXPRESSION();

                if(leftOp === null) {
                    this.i = iOld;

                    return null;
                }

                var op = this.tokens[this.i++];

                console.log(this.tokens[this.i - 2]);

                if(op.type !== 'COMPARE_OP') {
                    this.i = iOld;

                    return this.ATOMIC_EXPRESSION();
                }

                var rightOp = this.ATOMIC_EXPRESSION();

                if(rightOp === null) {
                    this.i = iOld;

                    return null;
                }

                return {
                    op: op.s,
                    left: leftOp,
                    right: rightOp
                }
            },

            ATOMIC_EXPRESSION: function() {
                var iOld = this.i;

                var tok = this.tokens[this.i++];

                if(tok.type === 'INTEGER') {
                    return parseInt(tok.s);
                }
                else if(tok.type === 'ID') {
                    return tok.s;
                }
                else {
                    this.i = iOld;
                }

                if(!this.JUST_TOKEN('OPEN_PAREN')) {
                    this.i = iOld;

                    return null;
                }

                var expr = this.EXPRESSION();

                if(expr === null) {
                    this.i = iOld;

                    return null;
                }

                if(!this.JUST_TOKEN('CLOSE_PAREN')) {
                    this.i = iOld;

                    return null;
                }
            },

            JUNK_STATEMENT: function() {
                var iOld = this.i;

                var returnStmt = this.RETURN_STATEMENT();

                if(returnStmt !== null) {
                    return returnStmt;
                }

                if(this.tokens[this.i++].type !== 'ID') {
                    this.i = iOld;

                    return null;
                }

                if(this.tokens[this.i].type === 'ID') {
                    this.i += 1;
                }

                if(this.tokens[this.i++].type !== 'ASSIGN_OP') {
                    this.i = iOld;

                    console.log(this.tokens[this.i]);

                    return null;
                }

                if(this.ATOMIC_EXPRESSION() === null) {
                    this.i = iOld;

                    return null;
                }

                if(this.tokens[this.i++].type !== 'SEMICOLON') {
                    this.i = iOld;

                    return null;
                }

                return true;
            },

            RETURN_STATEMENT: function() {
                var iOld = this.i;

                var tok = this.tokens[this.i++];

                if(tok.type !== 'ID' || tok.s !== 'return') {
                    this.i = iOld;

                    return null;
                }

                var expression = this.EXPRESSION();

                if(expression === null) {
                    this.i = iOld;

                    return null;
                }

                if(this.tokens[this.i++].type !== 'SEMICOLON') {
                    this.i = iOld;

                    return null;
                }

                return true;
            }
        };

        return parser.FUNCTION();
    };
}();
