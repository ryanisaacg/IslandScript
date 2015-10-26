compiler = {}
//startWith is ES6, and some versions of Node don't support it yet
function startsWith (substr) {
	return this.lastIndexOf(substr, 0) === 0
}
String.prototype.startsWith = startsWith
//Counts the number of indents that lead the line
function num_indent (line, indent_string) {
	var amt = 0;
	var index = 0;
	while (line.substring(index, index + indent_string.length) == indent_string) {
		amt += 1;
		index += indent_string.length;
	}
	return amt;
}
compiler.num_indent = num_indent
function multiply_string (string, amt) {
	var result = "";
	for (var i = 0;i < amt;i++) {
		result += string;
	}
	return result;
}
function compile (string, indent_string) {
	string = string.replace(/\r/g, '').replace(/\\\n/g, '\\\r');
	var lines = string.split('\n');
	var current = 0;
	var result = "";
	var previous_indent = 0, indent, expected_indent = false, sublines = 0;
	var file_line = 1; //The line this code appears in for the source file
	for (current = 0;current < lines.length;current += 1) {
		//Used this instead of compiler to allow for alternate implementations
		indent = this.num_indent(lines[current], indent_string);
		//Unexpected indent
		if (indent > previous_indent && !expected_indent) {
			throw "Unexpected indent at line " + file_line;
		}
		//Lack of necessary indent
		if (indent <= previous_indent && expected_indent) {
			throw "Expected indent at line " + file_line;
		}
		for (var i = 0;i < previous_indent - indent;i++) {
			result += multiply_string('\t', indent - i) + "}\n";
		}
		previous_indent = indent;
		//Remove excess whitespace and comments
		var line = lines[current].trim().replace(/\\.*\n/g, '');
		sublines = 0;
		while (line.indexOf('\\\r') > 0) {
			sublines += 1;
			line = line.replace('\\\r', '');
		}
		result += multiply_string(indent_string, indent);
		//Function declaration
		if (line.startsWith('func')) {
			var name = "", parameters = "";
			//Extract name
			name = /^func ([A-Za-z_$][A-Za-z0-9_$]*)/.exec(line);
			if (!name || !name[1]) {
				throw "Illegal function name at line " + file_line;
			}
			name= name[1]
			//Extract parameters
			parameters = /^func [A-Za-z_$][A-Za-z0-9_$]*[\t ]*[(](.*)[)]/.exec(line)
			if (!parameters) {
				throw "Illegal parameter construction at line " + file_line;
			}
			parameters = parameters[1]
			parameters = parameters.replace(/:[A-Za-z_$][A-Za-z_$0-9]/g, '');
			result += "function " + name + " (" + parameters + ") {\n";
			expected_indent = true;
		}
		else if (line.startsWith('if')) {
			var clause = /if[\t ]+(.+)/.exec(line);
			if (!clause) {
				throw "malformed if statement at line " + file_line;
			}
			result += "if (" + clause[1] + ") {\n"
			expected_indent = true;
		}
		else if (line.startsWith('else')) {
			result += " else {\n";
			expected_indent = true;
		}
		else if (line.startsWith('elif')) {
			var clause = /elif[\t ]+(.+)/.exec(line);
			if (!clause) {
				throw "malformed elif statement at line " + file_line;
			}
			result += "else if (" + clause[1] + ") {\n"
			expected_indent = true;
		}
		else if (line.startsWith('while')) {
			var clause = /while[\t ]+(.+)/.exec(line);
			if (!clause) {
				throw "Malformed while statement at line " + file_line;
			}
			result += "while (" + clause[1] + ") {\n"
			expected_indent = true;
		}
		else if (line.startsWith('for')) {
			var params = /for[\t ]+([^;]+);[\t ]*([^;]+);[\t ]*([^;]+)/.exec(line);
			if (!params) {
				throw "Malformed for statement at line " + file_line;
			}
			result += "for (" + params[1] + ";" + params[2] + ";" + params[3] + ") {\n";
			expected_indent = true;
		}
		 else {
			result += line + '\n';
			expected_indent = false;
		}
		file_line += 1 + sublines;
	}
	return result;
}
compiler.compile = compile
function isle_eval (string) {
	eval(this.compile(string))
}
compiler.eval = isle_eval
//Quick testing code
var fs = require('fs');
var contents = fs.readFileSync('src/compiler.is', 'utf8');
var compiled = compiler.compile(contents, '\t');
fs.writeFileSync('../compiler.js', compiled, 'utf8')

