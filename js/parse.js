
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

                console.log(type + " " + match);

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

        } while(s.length !== 0 && foundToken);

        return tokens;
    };

    return function(s) {
        var parser = {
            s: s,
            i: 0,

            FUNCTION: function() {
                return tokenizeC(s);
            }
        };

        return parser.FUNCTION();
    };
}();
