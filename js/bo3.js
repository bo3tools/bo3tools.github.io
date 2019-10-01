var bo3 = (function(){
    var self = this;

    var parseProperty = function(keyValue) {
        return {
            key: keyValue[0].trim().toLowerCase(),
            value: keyValue[1].trim()
        };
    };

    self.read = function(source) {
        var lines = source.split("\n");
        var ln = lines.length;

        var data = {
            props: [],
            errors: [],
            functions: []
        };

        for (var i = 0; i < ln; i++) {
            var line = lines[i];

            // Empty line
            if (line.trim().length == 0) {
                continue;
            }

            // Comment
            if (line.charAt(0) == "#" || line.charAt(0) == "<") {
                continue;
            }

            var colonIndex = line.indexOf(":");
            var bracketIndex = line.indexOf("(");
            var hasColon = (colonIndex !== -1);
            var hasBracket = (bracketIndex !== -1);
            var isKeyValueLike = (line.indexOf("=") !== -1);

            // Property or function
            if (hasColon || hasBracket) {

                // Function
                if (hasBracket && (!hasColon || bracketIndex < colonIndex)) {
                    line = line.trim();

                    var bracketEndIndex = line.indexOf(")");

                    // Function missing closing bracket
                    if (bracketEndIndex === -1) {
                        data.errors.push({
                            text: "No closing bracket found in function-like expression",
                            source: line,
                            line: i
                        });
                        continue;
                    }

                    var functionName = line.slice(0, bracketIndex).toLowerCase();
                    var functionArgs = [];
                    var commaSeparated = line.slice(bracketIndex + 1, bracketEndIndex).split(",");
                    

                    for (var p = 0; p < commaSeparated.length; p++) {
                        functionArgs.push(commaSeparated[p].trim());
                    }

                    data.functions.push({
                        name: functionName,
                        args: functionArgs
                    });
                }

                // Property
                else {
                    var property = parseProperty(line.split(":", 2));

                    if (!property.key) {
                        data.errors.push({
                            text: "Empty property key",
                            source: line,
                            line: i
                        });
                        continue;
                    }

                    data.props.push({
                        key: property.key,
                        value: property.value
                    });
                }
            }

            // Legacy property
            else if (isKeyValueLike) {
                var property = parseProperty(line.split("=", 2));

                if (!property.key) {
                    data.errors.push({
                        text: "Empty legacy property key",
                        source: line,
                        line: i
                    });
                    continue;
                }

                data.props.push({
                    key: property.key,
                    value: property.value
                });
            }

            // Unknown
            else {
                data.errors.push({
                    text: "Unknown expression",
                    source: line,
                    line: i
                });
                continue;
            }
        }

        return data;
    };

    self.parse = function(source) {
        var blocks = [];
        var ln = source.functions.length;

        for (var i = 0; i < ln; i++) {
            var fn = source.functions[i];

            if (fn.name == "b" || fn.name == "block" || fn.name == "rb" || fn.name == "randomblock") {
                blocks.push({
                    x: parseInt(fn.args[0]),
                    y: parseInt(fn.args[1]),
                    z: parseInt(fn.args[2]),
                    block: fn.args[3]
                });
            }
        }

        blocks.sort(function(a, b) {
            return a.x + a.y + a.z > b.x + b.y + b.z;
        });

        return blocks;
    };

    return self;
})();