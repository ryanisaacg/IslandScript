compiler = {}
//startWith is ES6, and some versions of Node don't support it yet
String.prototype.startsWith = function(substr) {
	return this.lastIndexOf(substr, 0) === 0
}
//Counts the number of indents that lead the line
compiler.num_indent = function(line, indent_string) {
	var amt = 0;
	var index = 0;
	while (line.substring(index, index + indent_string.length) == indent_string) {
		amt += 1;
		index += indent_string.length;
	}
	return amt;
}
compiler.compile = function(string, indent_string) {
	string = string.replace(/\r/g, '');
	var lines = string.split('\n');
	var current = 0;
	var result = "";
	var previous_indent = 0, indent, expected_indent = false;
	for(current = 0; current < lines.length; current += 1) {
		//Used this instead of compiler to allow for alternate implementations
		indent = this.num_indent(lines[current], indent_string);
		//Unexpected indent
		if(indent > previous_indent && !expected_indent)
			throw "Unexpected indent at line " + current;
		//Lack of necessary indent
		if(indent < previous_indent && expected_indent)
			throw "Expected indent at line " + current;
		if(indent < previous_indent)
			result += "}\n";
		previous_indent = indent;
		//Remove excess whitespace and comments
		var line = lines[current].trim().replace(/#.*\n/g, '');
		for(var i = 0; i < indent; i++)
			result += indent_string
		//Function declaration
		if(line.startsWith('func')) {
			var name = "", parameters = "";
			//Extract function name
			name = /^func ([A-Za-z_$][A-Za-z0-9_$]*)/.exec(line);
			if(!name || !name[1]) throw "Illegal function name at line " + current;
			name= name[1]
			//Extract function parameters
			parameters = /^func [A-Za-z_$][A-Za-z0-9_$]*[\t ]*[(](.*)[)]/.exec(line)
			if(!parameters) throw "Illegal parameter construction at line " + current;
			parameters = parameters[1]
			parameters = parameters.replace(/:[A-Za-z_$][A-Za-z_$0-9]/g, '');
			result += "function " + name + " (" + parameters + ") {\n";
			expected_indent = true;
		} else {
			result += line + '\n';
			expected_indent = false;
		}
	}
	return result;
}
//Quick testing code
var fs = require('fs');
var contents = fs.readFileSync('test.is', 'utf8');
var compiled = compiler.compile(contents, '\t');
fs.writeFileSync('test.js', compiled, 'utf8')
