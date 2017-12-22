
var parseExpression = function() {
    var tokenTypes = {
        WS: /^[ \t\r\n]+/,
        ID: /^[a-zA-Z]+/,
        INTEGER: /^-?[0-9]+/,
        OPEN_PAREN: /^\(/,
        CLOSE_PAREN: /^\)/,
        COMPARE_OP: /^([><]=?|==)/,
        AND_OP: /^&&/,
        OR_OP: /^\|\|/,
    };

    var tokenizeExpression = function(s) {
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
                            text: match[0]
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
            tokens: tokenizeExpression(s),
            i: 0,

            error: "",

            EXPRESSION: function() {
                return this.tokens;

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

        return parser.EXPRESSION();
    };
}();
