
var parseExpression = function() {
    var tokenTypes = {
        WS: /^[ \t\r\n]+/,
        ID: /^[a-zA-Z]+/,
        INTEGER: /^-?[0-9]+/,
        OPEN_PAREN: /^\(/,
        CLOSE_PAREN: /^\)/,
        COMPARE_OP: /^([><]=?|==)/,
        AND_OP: /^&&/,
        OR_OP: /^\|\|/
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
        var tokens = tokenizeExpression(s);

        if(tokens.length === 0) {
            return {
                emptyExpression: true
            };
        }

        var parser = {
            tokens: tokens,
            i: 0,

            error: "",

            parseJustToken: function(type) {
                var token = this.tokens[this.i++];

                if(token === undefined || (type !== undefined && token.type !== type)) {
                    this.i -= 1;

                    return null;
                }

                return token;
            },

            parseExpression: function() {
                var iOld = this.i;

                var leftOp = this.parseAnd();

                if(leftOp === null) {
                    this.i = iOld;

                    return null;
                }

                var op = this.parseJustToken('OR_OP');

                if(op === null) {
                    this.i = iOld;

                    return this.parseAnd();
                }

                var rightOp = this.parseAnd();

                if(rightOp === null) {
                    this.i = iOld;

                    return null;
                }

                return {
                    kind: 'logic',
                    op: 'or',
                    left: leftOp,
                    right: rightOp
                }
            },

            parseAnd: function() {
                var iOld = this.i;

                var leftOp = this.parseCompare();

                if(leftOp === null) {
                    this.i = iOld;

                    return null;
                }

                if(!this.parseJustToken('AND_OP')) {
                    this.i = iOld;

                    return this.parseCompare();
                }

                var rightOp = this.parseCompare();

                if(rightOp === null) {
                    this.i = iOld;

                    return null;
                }

                return {
                    kind: 'logic',
                    op: 'and',
                    left: leftOp,
                    right: rightOp
                }
            },

            parseCompare: function() {
                var iOld = this.i;

                var leftOp = this.parseAtomic();

                if(leftOp === null) {
                    this.i = iOld;

                    return null;
                }

                var op = this.parseJustToken('COMPARE_OP');

                if(op === null) {
                    this.i = iOld;

                    return this.parseAtomic();
                }

                var rightOp = this.parseAtomic();

                if(rightOp === null) {
                    this.i = iOld;

                    return null;
                }

                return {
                    kind: 'compare',
                    op: op.text,
                    left: leftOp,
                    right: rightOp
                }
            },

            parseAtomic: function() {
                var iOld = this.i;

                var tok = this.parseJustToken();

                if(tok === null) {
                    return null;
                }

                if(tok.type === 'INTEGER') {
                    return {
                        kind: 'atomicInt',
                        value: parseInt(tok.text)
                    };
                }
                else if(tok.type === 'ID') {
                    return {
                        kind: 'atomicId',
                        value: tok.text
                    };
                }
                else if(tok.type === 'OPEN_PAREN') {
                    var expression = this.parseExpression();

                    if(expression === null || !this.parseJustToken('CLOSE_PAREN')) {
                        this.i = iOld;

                        return null;
                    }

                    return expression;
                }

                return null;
            }
        };

        return parser.parseExpression();
    };
}();
