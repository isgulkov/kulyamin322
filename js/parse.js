
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
        LOGIC_OP: /^(&&|\|\|)/,
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

                if(!this.JUST_TOKEN('OPEN_BRACE')) {
                    this.i = iOld;

                    return null;
                }

                return {
                    params: params,
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
            }
        };

        return parser.FUNCTION();
    };
}();
