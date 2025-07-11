export const Iroh = (function () {
	/**
	 * @param {Class} cls
	 * @param {Array} prot
	 */
	var extend = function (cls, prot) {
		for (var key in prot) {
			if (prot[key] instanceof Function) {
				if (cls.prototype[key] instanceof Function) {
					console.log(
						'Warning: Overwriting ' + cls.name + '.prototype.' + key
					);
				}
				cls.prototype[key] = prot[key];
			}
		}
	};

	var version = '0.3.0';

	// indent factor
	var INDENT_FACTOR = 1;

	// minimal debug commands start with this
	var DEBUG_KEY = '$';

	// temp variable start with this
	var TEMP_VAR_BASE = 'Iroh$$x';

	// log all errors, logs also internal errors

	// clean or minimal debug command related output
	var CLEAN_DEBUG_INJECTION = false;

	// detect environment
	var IS_NODE =
		typeof module !== 'undefined' &&
		module.exports &&
		typeof require !== 'undefined';
	var IS_BROWSER = !IS_NODE;

	var VERSION = version;

	var OP = {};
	var INSTR = {};
	var CATEGORY = {};

	(function () {
		// types
		var ii = 0;
		INSTR.PROGRAM = ii++; // 0

		INSTR.FUNCTION_RETURN = ii++; // 1
		INSTR.FUNCTION_CALL = ii++; // 2
		INSTR.FUNCTION_CALL_END = ii++; // 3
		INSTR.FUNCTION_ENTER = ii++; // 4
		INSTR.FUNCTION_LEAVE = ii++; // 5

		INSTR.LOOP_TEST = ii++; // 6
		INSTR.LOOP_ENTER = ii++; // 7
		INSTR.LOOP_LEAVE = ii++; // 8

		INSTR.BREAK = ii++; // 9
		INSTR.CONTINUE = ii++; // 10

		INSTR.SWITCH_TEST = ii++; // 11
		INSTR.SWITCH_ENTER = ii++; // 12
		INSTR.SWITCH_LEAVE = ii++; // 13

		INSTR.CASE_TEST = ii++; // 14
		INSTR.CASE_ENTER = ii++; // 15
		INSTR.CASE_LEAVE = ii++; // 16

		INSTR.IF_TEST = ii++; // 17
		INSTR.IF_ENTER = ii++; // 18
		INSTR.IF_LEAVE = ii++; // 19

		INSTR.ELSE_ENTER = ii++; // 20
		INSTR.ELSE_LEAVE = ii++; // 21

		INSTR.VAR_INIT = ii++; // 22
		INSTR.VAR_DECLARE = ii++; // 23

		INSTR.OP_NEW = ii++; // 24
		INSTR.OP_NEW_END = ii++; // 25

		INSTR.UNARY = ii++; // 26
		INSTR.UPDATE = ii++; // 27

		INSTR.SUPER = ii++; // 28

		INSTR.THIS = ii++; // 29

		INSTR.LITERAL = ii++; // 30
		INSTR.IDENTIFIER = ii++; // 31

		INSTR.BINARY = ii++; // 32
		INSTR.LOGICAL = ii++; // 33
		INSTR.TERNARY = ii++; // 34
		INSTR.ASSIGN = ii++; // 35

		INSTR.METHOD_ENTER = ii++; // 36
		INSTR.METHOD_LEAVE = ii++; // 37

		INSTR.TRY_ENTER = ii++; // 38
		INSTR.TRY_LEAVE = ii++; // 39

		INSTR.CATCH_ENTER = ii++; // 40
		INSTR.CATCH_LEAVE = ii++; // 41

		INSTR.FINAL_ENTER = ii++; // 42
		INSTR.FINAL_LEAVE = ii++; // 43

		INSTR.ALLOC = ii++; // 44

		INSTR.MEMBER_EXPR = ii++; // 45

		INSTR.BLOCK_ENTER = ii++; // 46
		INSTR.BLOCK_LEAVE = ii++; // 47

		INSTR.PROGRAM_FRAME_VALUE = ii++; // 48
		INSTR.PROGRAM_ENTER = ii++; // 49
		INSTR.PROGRAM_LEAVE = ii++; // 50
	})();

	(function () {
		var ii = 0;
		CATEGORY.THIS = ii++; // 0
		CATEGORY.UNARY = ii++; // 1
		CATEGORY.UPDATE = ii++; // 2
		CATEGORY.BINARY = ii++; // 3
		CATEGORY.LOGICAL = ii++; // 4
		CATEGORY.TERNARY = ii++; // 5
		CATEGORY.ASSIGN = ii++; // 6
		CATEGORY.ALLOC = ii++; // 7
		CATEGORY.MEMBER = ii++; // 8
		CATEGORY.LITERAL = ii++; // 9
		CATEGORY.IDENTIFIER = ii++; // 10
		CATEGORY.TRY = ii++; // 11
		CATEGORY.CATCH = ii++; // 12
		CATEGORY.FINALLY = ii++; // 13
		CATEGORY.OP_NEW = ii++; // 14
		CATEGORY.VAR = ii++; // 15
		CATEGORY.IF = ii++; // 16
		CATEGORY.ELSE = ii++; // 17
		CATEGORY.SWITCH = ii++; // 18
		CATEGORY.CASE = ii++; // 19
		CATEGORY.BREAK = ii++; // 20
		CATEGORY.CONTINUE = ii++; // 21
		CATEGORY.LOOP = ii++; // 22
		CATEGORY.CALL = ii++; // 23
		CATEGORY.FUNCTION = ii++; // 24
		CATEGORY.BLOCK = ii++; // 25
		CATEGORY.PROGRAM = ii++; // 26
		CATEGORY.METHOD = ii++; // 27
		CATEGORY.SUPER = ii++; // 28
	})();

	(function () {
		var ii = 0;
		OP['='] = ii++;
		OP['+'] = ii++;
		OP['-'] = ii++;
		OP['*'] = ii++;
		OP['/'] = ii++;
		OP['%'] = ii++;
		OP['**'] = ii++;
		OP['<<'] = ii++;
		OP['>>'] = ii++;
		OP['>>>'] = ii++;
		OP['&'] = ii++;
		OP['^'] = ii++;
		OP['|'] = ii++;
		OP['!'] = ii++;
		OP['~'] = ii++;
		OP['in'] = ii++;
		OP['void'] = ii++;
		OP['typeof'] = ii++;
		OP['delete'] = ii++;
		OP['instanceof'] = ii++;
		OP['&&'] = ii++;
		OP['||'] = ii++;
		OP['=='] = ii++;
		OP['==='] = ii++;
		OP['!='] = ii++;
		OP['!=='] = ii++;
		OP['>'] = ii++;
		OP['>='] = ii++;
		OP['<'] = ii++;
		OP['<='] = ii++;
		OP['++'] = ii++;
		OP['--'] = ii++;
	})();

	// Reserved word lists for various dialects of the language

	var reservedWords = {
		3: 'abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile',
		5: 'class enum extends super const export import',
		6: 'enum',
		strict: 'implements interface let package private protected public static yield',
		strictBind: 'eval arguments',
	};

	// And the keywords

	var ecma5AndLessKeywords =
		'break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this';

	var keywords$1 = {
		5: ecma5AndLessKeywords,
		6: ecma5AndLessKeywords + ' const class extends export import super',
	};

	// ## Character categories

	// Big ugly regular expressions that match characters in the
	// whitespace, identifier, and identifier-start categories. These
	// are only applied when a character is found to actually have a
	// code point above 128.
	// Generated by `bin/generate-identifier-regex.js`.

	var nonASCIIidentifierStartChars =
		'\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fd5\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc';
	var nonASCIIidentifierChars =
		'\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f';

	var nonASCIIidentifierStart = new RegExp(
		'[' + nonASCIIidentifierStartChars + ']'
	);
	var nonASCIIidentifier = new RegExp(
		'[' + nonASCIIidentifierStartChars + nonASCIIidentifierChars + ']'
	);

	nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

	// These are a run-length and offset encoded representation of the
	// >0xffff code points that are a valid part of identifiers. The
	// offset starts at 0x10000, and each pair of numbers represents an
	// offset to the next range, and then a size of the range. They were
	// generated by bin/generate-identifier-regex.js

	// eslint-disable-next-line comma-spacing
	var astralIdentifierStartCodes = [
		0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4,
		48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35,
		5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1,
		4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1,
		65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21,
		11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27,
		35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2,
		0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0,
		19, 0, 13, 4, 159, 52, 19, 3, 54, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37,
		47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 264, 8, 2, 36, 18,
		0, 50, 29, 881, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634,
		568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67,
		12, 65, 0, 32, 6124, 20, 754, 9486, 1, 3071, 106, 6, 12, 4, 8, 8, 9,
		5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3,
		3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30,
		2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 60,
		67, 1213, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5,
		0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2,
		0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421,
		42710, 42, 4148, 12, 221, 3, 5761, 10591, 541,
	];

	// eslint-disable-next-line comma-spacing
	var astralIdentifierCodes = [
		509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166,
		1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52,
		0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 57, 0,
		2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 87, 19, 13,
		9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423,
		9, 838, 7, 2, 7, 17, 9, 57, 21, 2, 13, 19882, 9, 135, 4, 60, 6, 26, 9,
		1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2,
		1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3,
		6, 2, 1, 2, 4, 2214, 6, 110, 6, 6, 9, 792487, 239,
	];

	// This has a complexity linear to the value of the code. The
	// assumption is that looking up astral identifier characters is
	// rare.
	function isInAstralSet(code, set) {
		var pos = 0x10000;
		for (var i = 0; i < set.length; i += 2) {
			pos += set[i];
			if (pos > code) {
				return false;
			}
			pos += set[i + 1];
			if (pos >= code) {
				return true;
			}
		}
	}

	// Test whether a given character code starts an identifier.

	function isIdentifierStart(code, astral) {
		if (code < 65) {
			return code === 36;
		}
		if (code < 91) {
			return true;
		}
		if (code < 97) {
			return code === 95;
		}
		if (code < 123) {
			return true;
		}
		if (code <= 0xffff) {
			return (
				code >= 0xaa &&
				nonASCIIidentifierStart.test(String.fromCharCode(code))
			);
		}
		if (astral === false) {
			return false;
		}
		return isInAstralSet(code, astralIdentifierStartCodes);
	}

	// Test whether a given character is part of an identifier.

	function isIdentifierChar(code, astral) {
		if (code < 48) {
			return code === 36;
		}
		if (code < 58) {
			return true;
		}
		if (code < 65) {
			return false;
		}
		if (code < 91) {
			return true;
		}
		if (code < 97) {
			return code === 95;
		}
		if (code < 123) {
			return true;
		}
		if (code <= 0xffff) {
			return (
				code >= 0xaa &&
				nonASCIIidentifier.test(String.fromCharCode(code))
			);
		}
		if (astral === false) {
			return false;
		}
		return (
			isInAstralSet(code, astralIdentifierStartCodes) ||
			isInAstralSet(code, astralIdentifierCodes)
		);
	}

	// ## Token types

	// The assignment of fine-grained, information-carrying type objects
	// allows the tokenizer to store the information it has about a
	// token in a way that is very cheap for the parser to look up.

	// All token type variables start with an underscore, to make them
	// easy to recognize.

	// The `beforeExpr` property is used to disambiguate between regular
	// expressions and divisions. It is set on all token types that can
	// be followed by an expression (thus, a slash after them would be a
	// regular expression).
	//
	// The `startsExpr` property is used to check if the token ends a
	// `yield` expression. It is set on all token types that either can
	// directly start an expression (like a quotation mark) or can
	// continue an expression (like the body of a string).
	//
	// `isLoop` marks a keyword as starting a loop, which is important
	// to know when parsing a label, in order to allow or disallow
	// continue jumps to that label.

	var TokenType = function TokenType(label, conf) {
		if (conf === void 0) {
			conf = {};
		}

		this.label = label;
		this.keyword = conf.keyword;
		this.beforeExpr = !!conf.beforeExpr;
		this.startsExpr = !!conf.startsExpr;
		this.isLoop = !!conf.isLoop;
		this.isAssign = !!conf.isAssign;
		this.prefix = !!conf.prefix;
		this.postfix = !!conf.postfix;
		this.binop = conf.binop || null;
		this.updateContext = null;
	};

	function binop(name, prec) {
		return new TokenType(name, { beforeExpr: true, binop: prec });
	}
	var beforeExpr = { beforeExpr: true };
	var startsExpr = { startsExpr: true };

	// Map keyword names to token types.

	var keywords$1$1 = {};

	// Succinct definitions of keyword token types
	function kw(name, options) {
		if (options === void 0) {
			options = {};
		}

		options.keyword = name;
		return (keywords$1$1[name] = new TokenType(name, options));
	}

	var types = {
		num: new TokenType('num', startsExpr),
		regexp: new TokenType('regexp', startsExpr),
		string: new TokenType('string', startsExpr),
		name: new TokenType('name', startsExpr),
		eof: new TokenType('eof'),

		// Punctuation token types.
		bracketL: new TokenType('[', { beforeExpr: true, startsExpr: true }),
		bracketR: new TokenType(']'),
		braceL: new TokenType('{', { beforeExpr: true, startsExpr: true }),
		braceR: new TokenType('}'),
		parenL: new TokenType('(', { beforeExpr: true, startsExpr: true }),
		parenR: new TokenType(')'),
		comma: new TokenType(',', beforeExpr),
		semi: new TokenType(';', beforeExpr),
		colon: new TokenType(':', beforeExpr),
		dot: new TokenType('.'),
		question: new TokenType('?', beforeExpr),
		arrow: new TokenType('=>', beforeExpr),
		template: new TokenType('template'),
		invalidTemplate: new TokenType('invalidTemplate'),
		ellipsis: new TokenType('...', beforeExpr),
		backQuote: new TokenType('`', startsExpr),
		dollarBraceL: new TokenType('${', {
			beforeExpr: true,
			startsExpr: true,
		}),

		// Operators. These carry several kinds of properties to help the
		// parser use them properly (the presence of these properties is
		// what categorizes them as operators).
		//
		// `binop`, when present, specifies that this operator is a binary
		// operator, and will refer to its precedence.
		//
		// `prefix` and `postfix` mark the operator as a prefix or postfix
		// unary operator.
		//
		// `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
		// binary operators with a very low precedence, that should result
		// in AssignmentExpression nodes.

		eq: new TokenType('=', { beforeExpr: true, isAssign: true }),
		assign: new TokenType('_=', { beforeExpr: true, isAssign: true }),
		incDec: new TokenType('++/--', {
			prefix: true,
			postfix: true,
			startsExpr: true,
		}),
		prefix: new TokenType('prefix', {
			beforeExpr: true,
			prefix: true,
			startsExpr: true,
		}),
		logicalOR: binop('||', 1),
		logicalAND: binop('&&', 2),
		bitwiseOR: binop('|', 3),
		bitwiseXOR: binop('^', 4),
		bitwiseAND: binop('&', 5),
		equality: binop('==/!=', 6),
		relational: binop('</>', 7),
		bitShift: binop('<</>>', 8),
		plusMin: new TokenType('+/-', {
			beforeExpr: true,
			binop: 9,
			prefix: true,
			startsExpr: true,
		}),
		modulo: binop('%', 10),
		star: binop('*', 10),
		slash: binop('/', 10),
		starstar: new TokenType('**', { beforeExpr: true }),

		// Keyword token types.
		_break: kw('break'),
		_case: kw('case', beforeExpr),
		_catch: kw('catch'),
		_continue: kw('continue'),
		_debugger: kw('debugger'),
		_default: kw('default', beforeExpr),
		_do: kw('do', { isLoop: true, beforeExpr: true }),
		_else: kw('else', beforeExpr),
		_finally: kw('finally'),
		_for: kw('for', { isLoop: true }),
		_function: kw('function', startsExpr),
		_if: kw('if'),
		_return: kw('return', beforeExpr),
		_switch: kw('switch'),
		_throw: kw('throw', beforeExpr),
		_try: kw('try'),
		_var: kw('var'),
		_const: kw('const'),
		_while: kw('while', { isLoop: true }),
		_with: kw('with'),
		_new: kw('new', { beforeExpr: true, startsExpr: true }),
		_this: kw('this', startsExpr),
		_super: kw('super', startsExpr),
		_class: kw('class', startsExpr),
		_extends: kw('extends', beforeExpr),
		_export: kw('export'),
		_import: kw('import'),
		_null: kw('null', startsExpr),
		_true: kw('true', startsExpr),
		_false: kw('false', startsExpr),
		_in: kw('in', { beforeExpr: true, binop: 7 }),
		_instanceof: kw('instanceof', { beforeExpr: true, binop: 7 }),
		_typeof: kw('typeof', {
			beforeExpr: true,
			prefix: true,
			startsExpr: true,
		}),
		_void: kw('void', { beforeExpr: true, prefix: true, startsExpr: true }),
		_delete: kw('delete', {
			beforeExpr: true,
			prefix: true,
			startsExpr: true,
		}),
	};

	// Matches a whole line break (where CRLF is considered a single
	// line break). Used to count lines.

	var lineBreak = /\r\n?|\n|\u2028|\u2029/;
	var lineBreakG = new RegExp(lineBreak.source, 'g');

	function isNewLine(code) {
		return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
	}

	var nonASCIIwhitespace =
		/[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

	var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

	var ref = Object.prototype;
	var hasOwnProperty = ref.hasOwnProperty;
	var toString = ref.toString;

	// Checks if an object has a property.

	function has(obj, propName) {
		return hasOwnProperty.call(obj, propName);
	}

	var isArray =
		Array.isArray ||
		function (obj) {
			return toString.call(obj) === '[object Array]';
		};

	// These are used when `options.locations` is on, for the
	// `startLoc` and `endLoc` properties.

	var Position = function Position(line, col) {
		this.line = line;
		this.column = col;
	};

	Position.prototype.offset = function offset(n) {
		return new Position(this.line, this.column + n);
	};

	var SourceLocation = function SourceLocation(p, start, end) {
		this.start = start;
		this.end = end;
		if (p.sourceFile !== null) {
			this.source = p.sourceFile;
		}
	};

	// The `getLineInfo` function is mostly useful when the
	// `locations` option is off (for performance reasons) and you
	// want to find the line/column position for a given character
	// offset. `input` should be the code string that the offset refers
	// into.

	function getLineInfo(input, offset) {
		for (var line = 1, cur = 0; ; ) {
			lineBreakG.lastIndex = cur;
			var match = lineBreakG.exec(input);
			if (match && match.index < offset) {
				++line;
				cur = match.index + match[0].length;
			} else {
				return new Position(line, offset - cur);
			}
		}
	}

	// A second optional argument can be given to further configure
	// the parser process. These options are recognized:

	var defaultOptions = {
		// `ecmaVersion` indicates the ECMAScript version to parse. Must
		// be either 3, 5, 6 (2015), 7 (2016), or 8 (2017). This influences support
		// for strict mode, the set of reserved words, and support for
		// new syntax features. The default is 7.
		ecmaVersion: 7,
		// `sourceType` indicates the mode the code should be parsed in.
		// Can be either `"script"` or `"module"`. This influences global
		// strict mode and parsing of `import` and `export` declarations.
		sourceType: 'script',
		// `onInsertedSemicolon` can be a callback that will be called
		// when a semicolon is automatically inserted. It will be passed
		// th position of the comma as an offset, and if `locations` is
		// enabled, it is given the location as a `{line, column}` object
		// as second argument.
		onInsertedSemicolon: null,
		// `onTrailingComma` is similar to `onInsertedSemicolon`, but for
		// trailing commas.
		onTrailingComma: null,
		// By default, reserved words are only enforced if ecmaVersion >= 5.
		// Set `allowReserved` to a boolean value to explicitly turn this on
		// an off. When this option has the value "never", reserved words
		// and keywords can also not be used as property names.
		allowReserved: null,
		// When enabled, a return at the top level is not considered an
		// error.
		allowReturnOutsideFunction: false,
		// When enabled, import/export statements are not constrained to
		// appearing at the top of the program.
		allowImportExportEverywhere: false,
		// When enabled, hashbang directive in the beginning of file
		// is allowed and treated as a line comment.
		allowHashBang: false,
		// When `locations` is on, `loc` properties holding objects with
		// `start` and `end` properties in `{line, column}` form (with
		// line being 1-based and column 0-based) will be attached to the
		// nodes.
		locations: false,
		// A function can be passed as `onToken` option, which will
		// cause Acorn to call that function with object in the same
		// format as tokens returned from `tokenizer().getToken()`. Note
		// that you are not allowed to call the parser from the
		// callback—that will corrupt its internal state.
		onToken: null,
		// A function can be passed as `onComment` option, which will
		// cause Acorn to call that function with `(block, text, start,
		// end)` parameters whenever a comment is skipped. `block` is a
		// boolean indicating whether this is a block (`/* */`) comment,
		// `text` is the content of the comment, and `start` and `end` are
		// character offsets that denote the start and end of the comment.
		// When the `locations` option is on, two more parameters are
		// passed, the full `{line, column}` locations of the start and
		// end of the comments. Note that you are not allowed to call the
		// parser from the callback—that will corrupt its internal state.
		onComment: null,
		// Nodes have their start and end characters offsets recorded in
		// `start` and `end` properties (directly on the node, rather than
		// the `loc` object, which holds line/column data. To also add a
		// [semi-standardized][range] `range` property holding a `[start,
		// end]` array with the same numbers, set the `ranges` option to
		// `true`.
		//
		// [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
		ranges: false,
		// It is possible to parse multiple files into a single AST by
		// passing the tree produced by parsing the first file as
		// `program` option in subsequent parses. This will add the
		// toplevel forms of the parsed file to the `Program` (top) node
		// of an existing parse tree.
		program: null,
		// When `locations` is on, you can pass this to record the source
		// file in every node's `loc` object.
		sourceFile: null,
		// This value, if given, is stored in every node, whether
		// `locations` is on or off.
		directSourceFile: null,
		// When enabled, parenthesized expressions are represented by
		// (non-standard) ParenthesizedExpression nodes
		preserveParens: false,
		plugins: {},
	};

	// Interpret and default an options object

	function getOptions(opts) {
		var options = {};

		for (var opt in defaultOptions) {
			options[opt] =
				opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
		}

		if (options.ecmaVersion >= 2015) {
			options.ecmaVersion -= 2009;
		}

		if (options.allowReserved == null) {
			options.allowReserved = options.ecmaVersion < 5;
		}

		if (isArray(options.onToken)) {
			var tokens = options.onToken;
			options.onToken = function (token) {
				return tokens.push(token);
			};
		}
		if (isArray(options.onComment)) {
			options.onComment = pushComment(options, options.onComment);
		}

		return options;
	}

	function pushComment(options, array) {
		return function (block, text, start, end, startLoc, endLoc) {
			var comment = {
				type: block ? 'Block' : 'Line',
				value: text,
				start: start,
				end: end,
			};
			if (options.locations) {
				comment.loc = new SourceLocation(this, startLoc, endLoc);
			}
			if (options.ranges) {
				comment.range = [start, end];
			}
			array.push(comment);
		};
	}

	// Registered plugins
	var plugins = {};

	function keywordRegexp(words) {
		return new RegExp('^(?:' + words.replace(/ /g, '|') + ')$');
	}

	var Parser = function Parser(options, input, startPos) {
		this.options = options = getOptions(options);
		this.sourceFile = options.sourceFile;
		this.keywords = keywordRegexp(
			keywords$1[options.ecmaVersion >= 6 ? 6 : 5]
		);
		var reserved = '';
		if (!options.allowReserved) {
			for (var v = options.ecmaVersion; ; v--) {
				if ((reserved = reservedWords[v])) {
					break;
				}
			}
			if (options.sourceType == 'module') {
				reserved += ' await';
			}
		}
		this.reservedWords = keywordRegexp(reserved);
		var reservedStrict =
			(reserved ? reserved + ' ' : '') + reservedWords.strict;
		this.reservedWordsStrict = keywordRegexp(reservedStrict);
		this.reservedWordsStrictBind = keywordRegexp(
			reservedStrict + ' ' + reservedWords.strictBind
		);
		this.input = String(input);

		// Used to signal to callers of `readWord1` whether the word
		// contained any escape sequences. This is needed because words with
		// escape sequences must not be interpreted as keywords.
		this.containsEsc = false;

		// Load plugins
		this.loadPlugins(options.plugins);

		// Set up token state

		// The current position of the tokenizer in the input.
		if (startPos) {
			this.pos = startPos;
			this.lineStart = this.input.lastIndexOf('\n', startPos - 1) + 1;
			this.curLine = this.input
				.slice(0, this.lineStart)
				.split(lineBreak).length;
		} else {
			this.pos = this.lineStart = 0;
			this.curLine = 1;
		}

		// Properties of the current token:
		// Its type
		this.type = types.eof;
		// For tokens that include more information than their type, the value
		this.value = null;
		// Its start and end offset
		this.start = this.end = this.pos;
		// And, if locations are used, the {line, column} object
		// corresponding to those offsets
		this.startLoc = this.endLoc = this.curPosition();

		// Position information for the previous token
		this.lastTokEndLoc = this.lastTokStartLoc = null;
		this.lastTokStart = this.lastTokEnd = this.pos;

		// The context stack is used to superficially track syntactic
		// context to predict whether a regular expression is allowed in a
		// given position.
		this.context = this.initialContext();
		this.exprAllowed = true;

		// Figure out if it's a module code.
		this.inModule = options.sourceType === 'module';
		this.strict = this.inModule || this.strictDirective(this.pos);

		// Used to signify the start of a potential arrow function
		this.potentialArrowAt = -1;

		// Flags to track whether we are in a function, a generator, an async function.
		this.inFunction = this.inGenerator = this.inAsync = false;
		// Positions to delayed-check that yield/await does not exist in default parameters.
		this.yieldPos = this.awaitPos = 0;
		// Labels in scope.
		this.labels = [];

		// If enabled, skip leading hashbang line.
		if (
			this.pos === 0 &&
			options.allowHashBang &&
			this.input.slice(0, 2) === '#!'
		) {
			this.skipLineComment(2);
		}

		// Scope tracking for duplicate variable names (see scope.js)
		this.scopeStack = [];
		this.enterFunctionScope();
	};

	// DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
	Parser.prototype.isKeyword = function isKeyword(word) {
		return this.keywords.test(word);
	};
	Parser.prototype.isReservedWord = function isReservedWord(word) {
		return this.reservedWords.test(word);
	};

	Parser.prototype.extend = function extend(name, f) {
		this[name] = f(this[name]);
	};

	Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
		var this$1 = this;

		for (var name in pluginConfigs) {
			var plugin = plugins[name];
			if (!plugin) {
				throw new Error("Plugin '" + name + "' not found");
			}
			plugin(this$1, pluginConfigs[name]);
		}
	};

	Parser.prototype.parse = function parse() {
		var node = this.options.program || this.startNode();
		this.nextToken();
		return this.parseTopLevel(node);
	};

	var pp = Parser.prototype;

	// ## Parser utilities

	var literal = /^(?:'((?:[^']|\.)*)'|"((?:[^"]|\.)*)"|;)/;
	pp.strictDirective = function (start) {
		var this$1 = this;

		for (;;) {
			skipWhiteSpace.lastIndex = start;
			start += skipWhiteSpace.exec(this$1.input)[0].length;
			var match = literal.exec(this$1.input.slice(start));
			if (!match) {
				return false;
			}
			if ((match[1] || match[2]) == 'use strict') {
				return true;
			}
			start += match[0].length;
		}
	};

	// Predicate that tests whether the next token is of the given
	// type, and if yes, consumes it as a side effect.

	pp.eat = function (type) {
		if (this.type === type) {
			this.next();
			return true;
		} else {
			return false;
		}
	};

	// Tests whether parsed token is a contextual keyword.

	pp.isContextual = function (name) {
		return this.type === types.name && this.value === name;
	};

	// Consumes contextual keyword if possible.

	pp.eatContextual = function (name) {
		return this.value === name && this.eat(types.name);
	};

	// Asserts that following token is given contextual keyword.

	pp.expectContextual = function (name) {
		if (!this.eatContextual(name)) {
			this.unexpected();
		}
	};

	// Test whether a semicolon can be inserted at the current position.

	pp.canInsertSemicolon = function () {
		return (
			this.type === types.eof ||
			this.type === types.braceR ||
			lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
		);
	};

	pp.insertSemicolon = function () {
		if (this.canInsertSemicolon()) {
			if (this.options.onInsertedSemicolon) {
				this.options.onInsertedSemicolon(
					this.lastTokEnd,
					this.lastTokEndLoc
				);
			}
			return true;
		}
	};

	// Consume a semicolon, or, failing that, see if we are allowed to
	// pretend that there is a semicolon at this position.

	pp.semicolon = function () {
		if (!this.eat(types.semi) && !this.insertSemicolon()) {
			this.unexpected();
		}
	};

	pp.afterTrailingComma = function (tokType, notNext) {
		if (this.type == tokType) {
			if (this.options.onTrailingComma) {
				this.options.onTrailingComma(
					this.lastTokStart,
					this.lastTokStartLoc
				);
			}
			if (!notNext) {
				this.next();
			}
			return true;
		}
	};

	// Expect a token of a given type. If found, consume it, otherwise,
	// raise an unexpected token error.

	pp.expect = function (type) {
		this.eat(type) || this.unexpected();
	};

	// Raise an unexpected token error.

	pp.unexpected = function (pos) {
		this.raise(pos != null ? pos : this.start, 'Unexpected token');
	};

	function DestructuringErrors() {
		this.shorthandAssign =
			this.trailingComma =
			this.parenthesizedAssign =
			this.parenthesizedBind =
				-1;
	}

	pp.checkPatternErrors = function (refDestructuringErrors, isAssign) {
		if (!refDestructuringErrors) {
			return;
		}
		if (refDestructuringErrors.trailingComma > -1) {
			this.raiseRecoverable(
				refDestructuringErrors.trailingComma,
				'Comma is not permitted after the rest element'
			);
		}
		var parens = isAssign
			? refDestructuringErrors.parenthesizedAssign
			: refDestructuringErrors.parenthesizedBind;
		if (parens > -1) {
			this.raiseRecoverable(parens, 'Parenthesized pattern');
		}
	};

	pp.checkExpressionErrors = function (refDestructuringErrors, andThrow) {
		var pos = refDestructuringErrors
			? refDestructuringErrors.shorthandAssign
			: -1;
		if (!andThrow) {
			return pos >= 0;
		}
		if (pos > -1) {
			this.raise(
				pos,
				'Shorthand property assignments are valid only in destructuring patterns'
			);
		}
	};

	pp.checkYieldAwaitInDefaultParams = function () {
		if (
			this.yieldPos &&
			(!this.awaitPos || this.yieldPos < this.awaitPos)
		) {
			this.raise(
				this.yieldPos,
				'Yield expression cannot be a default value'
			);
		}
		if (this.awaitPos) {
			this.raise(
				this.awaitPos,
				'Await expression cannot be a default value'
			);
		}
	};

	pp.isSimpleAssignTarget = function (expr) {
		if (expr.type === 'ParenthesizedExpression') {
			return this.isSimpleAssignTarget(expr.expression);
		}
		return expr.type === 'Identifier' || expr.type === 'MemberExpression';
	};

	var pp$1 = Parser.prototype;

	// ### Statement parsing

	// Parse a program. Initializes the parser, reads any number of
	// statements, and wraps them in a Program node.  Optionally takes a
	// `program` argument.  If present, the statements will be appended
	// to its body instead of creating a new node.

	pp$1.parseTopLevel = function (node) {
		var this$1 = this;

		var exports = {};
		if (!node.body) {
			node.body = [];
		}
		while (this.type !== types.eof) {
			var stmt = this$1.parseStatement(true, true, exports);
			node.body.push(stmt);
		}
		this.next();
		if (this.options.ecmaVersion >= 6) {
			node.sourceType = this.options.sourceType;
		}
		return this.finishNode(node, 'Program');
	};

	var loopLabel = { kind: 'loop' };
	var switchLabel = { kind: 'switch' };

	pp$1.isLet = function () {
		if (
			this.type !== types.name ||
			this.options.ecmaVersion < 6 ||
			this.value != 'let'
		) {
			return false;
		}
		skipWhiteSpace.lastIndex = this.pos;
		var skip = skipWhiteSpace.exec(this.input);
		var next = this.pos + skip[0].length,
			nextCh = this.input.charCodeAt(next);
		if (nextCh === 91 || nextCh == 123) {
			return true;
		} // '{' and '['
		if (isIdentifierStart(nextCh, true)) {
			var pos = next + 1;
			while (isIdentifierChar(this.input.charCodeAt(pos), true)) {
				++pos;
			}
			var ident = this.input.slice(next, pos);
			if (!this.isKeyword(ident)) {
				return true;
			}
		}
		return false;
	};

	// check 'async [no LineTerminator here] function'
	// - 'async /*foo*/ function' is OK.
	// - 'async /*\n*/ function' is invalid.
	pp$1.isAsyncFunction = function () {
		if (
			this.type !== types.name ||
			this.options.ecmaVersion < 8 ||
			this.value != 'async'
		) {
			return false;
		}

		skipWhiteSpace.lastIndex = this.pos;
		var skip = skipWhiteSpace.exec(this.input);
		var next = this.pos + skip[0].length;
		return (
			!lineBreak.test(this.input.slice(this.pos, next)) &&
			this.input.slice(next, next + 8) === 'function' &&
			(next + 8 == this.input.length ||
				!isIdentifierChar(this.input.charAt(next + 8)))
		);
	};

	// Parse a single statement.
	//
	// If expecting a statement and finding a slash operator, parse a
	// regular expression literal. This is to handle cases like
	// `if (foo) /blah/.exec(foo)`, where looking at the previous token
	// does not help.

	pp$1.parseStatement = function (declaration, topLevel, exports) {
		var starttype = this.type,
			node = this.startNode(),
			kind;

		if (this.isLet()) {
			starttype = types._var;
			kind = 'let';
		}

		// Most types of statements are recognized by the keyword they
		// start with. Many are trivial to parse, some require a bit of
		// complexity.

		switch (starttype) {
			case types._break:
			case types._continue:
				return this.parseBreakContinueStatement(
					node,
					starttype.keyword
				);
			case types._debugger:
				return this.parseDebuggerStatement(node);
			case types._do:
				return this.parseDoStatement(node);
			case types._for:
				return this.parseForStatement(node);
			case types._function:
				if (!declaration && this.options.ecmaVersion >= 6) {
					this.unexpected();
				}
				return this.parseFunctionStatement(node, false);
			case types._class:
				if (!declaration) {
					this.unexpected();
				}
				return this.parseClass(node, true);
			case types._if:
				return this.parseIfStatement(node);
			case types._return:
				return this.parseReturnStatement(node);
			case types._switch:
				return this.parseSwitchStatement(node);
			case types._throw:
				return this.parseThrowStatement(node);
			case types._try:
				return this.parseTryStatement(node);
			case types._const:
			case types._var:
				kind = kind || this.value;
				if (!declaration && kind != 'var') {
					this.unexpected();
				}
				return this.parseVarStatement(node, kind);
			case types._while:
				return this.parseWhileStatement(node);
			case types._with:
				return this.parseWithStatement(node);
			case types.braceL:
				return this.parseBlock();
			case types.semi:
				return this.parseEmptyStatement(node);
			case types._export:
			case types._import:
				if (!this.options.allowImportExportEverywhere) {
					if (!topLevel) {
						this.raise(
							this.start,
							"'import' and 'export' may only appear at the top level"
						);
					}
					if (!this.inModule) {
						this.raise(
							this.start,
							"'import' and 'export' may appear only with 'sourceType: module'"
						);
					}
				}
				return starttype === types._import
					? this.parseImport(node)
					: this.parseExport(node, exports);

			// If the statement does not start with a statement keyword or a
			// brace, it's an ExpressionStatement or LabeledStatement. We
			// simply start parsing an expression, and afterwards, if the
			// next token is a colon and the expression was a simple
			// Identifier node, we switch to interpreting it as a label.
			default:
				if (this.isAsyncFunction() && declaration) {
					this.next();
					return this.parseFunctionStatement(node, true);
				}

				var maybeName = this.value,
					expr = this.parseExpression();
				if (
					starttype === types.name &&
					expr.type === 'Identifier' &&
					this.eat(types.colon)
				) {
					return this.parseLabeledStatement(node, maybeName, expr);
				} else {
					return this.parseExpressionStatement(node, expr);
				}
		}
	};

	pp$1.parseBreakContinueStatement = function (node, keyword) {
		var this$1 = this;

		var isBreak = keyword == 'break';
		this.next();
		if (this.eat(types.semi) || this.insertSemicolon()) {
			node.label = null;
		} else if (this.type !== types.name) {
			this.unexpected();
		} else {
			node.label = this.parseIdent();
			this.semicolon();
		}

		// Verify that there is an actual destination to break or
		// continue to.
		var i = 0;
		for (; i < this.labels.length; ++i) {
			var lab = this$1.labels[i];
			if (node.label == null || lab.name === node.label.name) {
				if (lab.kind != null && (isBreak || lab.kind === 'loop')) {
					break;
				}
				if (node.label && isBreak) {
					break;
				}
			}
		}
		if (i === this.labels.length) {
			this.raise(node.start, 'Unsyntactic ' + keyword);
		}
		return this.finishNode(
			node,
			isBreak ? 'BreakStatement' : 'ContinueStatement'
		);
	};

	pp$1.parseDebuggerStatement = function (node) {
		this.next();
		this.semicolon();
		return this.finishNode(node, 'DebuggerStatement');
	};

	pp$1.parseDoStatement = function (node) {
		this.next();
		this.labels.push(loopLabel);
		node.body = this.parseStatement(false);
		this.labels.pop();
		this.expect(types._while);
		node.test = this.parseParenExpression();
		if (this.options.ecmaVersion >= 6) {
			this.eat(types.semi);
		} else {
			this.semicolon();
		}
		return this.finishNode(node, 'DoWhileStatement');
	};

	// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
	// loop is non-trivial. Basically, we have to parse the init `var`
	// statement or expression, disallowing the `in` operator (see
	// the second parameter to `parseExpression`), and then check
	// whether the next token is `in` or `of`. When there is no init
	// part (semicolon immediately after the opening parenthesis), it
	// is a regular `for` loop.

	pp$1.parseForStatement = function (node) {
		this.next();
		this.labels.push(loopLabel);
		this.enterLexicalScope();
		this.expect(types.parenL);
		if (this.type === types.semi) {
			return this.parseFor(node, null);
		}
		var isLet = this.isLet();
		if (this.type === types._var || this.type === types._const || isLet) {
			var init$1 = this.startNode(),
				kind = isLet ? 'let' : this.value;
			this.next();
			this.parseVar(init$1, true, kind);
			this.finishNode(init$1, 'VariableDeclaration');
			if (
				(this.type === types._in ||
					(this.options.ecmaVersion >= 6 &&
						this.isContextual('of'))) &&
				init$1.declarations.length === 1 &&
				!(kind !== 'var' && init$1.declarations[0].init)
			) {
				return this.parseForIn(node, init$1);
			}
			return this.parseFor(node, init$1);
		}
		var refDestructuringErrors = new DestructuringErrors();
		var init = this.parseExpression(true, refDestructuringErrors);
		if (
			this.type === types._in ||
			(this.options.ecmaVersion >= 6 && this.isContextual('of'))
		) {
			this.toAssignable(init);
			this.checkLVal(init);
			this.checkPatternErrors(refDestructuringErrors, true);
			return this.parseForIn(node, init);
		} else {
			this.checkExpressionErrors(refDestructuringErrors, true);
		}
		return this.parseFor(node, init);
	};

	pp$1.parseFunctionStatement = function (node, isAsync) {
		this.next();
		return this.parseFunction(node, true, false, isAsync);
	};

	pp$1.isFunction = function () {
		return this.type === types._function || this.isAsyncFunction();
	};

	pp$1.parseIfStatement = function (node) {
		this.next();
		node.test = this.parseParenExpression();
		// allow function declarations in branches, but only in non-strict mode
		node.consequent = this.parseStatement(
			!this.strict && this.isFunction()
		);
		node.alternate = this.eat(types._else)
			? this.parseStatement(!this.strict && this.isFunction())
			: null;
		return this.finishNode(node, 'IfStatement');
	};

	pp$1.parseReturnStatement = function (node) {
		if (!this.inFunction && !this.options.allowReturnOutsideFunction) {
			this.raise(this.start, "'return' outside of function");
		}
		this.next();

		// In `return` (and `break`/`continue`), the keywords with
		// optional arguments, we eagerly look for a semicolon or the
		// possibility to insert one.

		if (this.eat(types.semi) || this.insertSemicolon()) {
			node.argument = null;
		} else {
			node.argument = this.parseExpression();
			this.semicolon();
		}
		return this.finishNode(node, 'ReturnStatement');
	};

	pp$1.parseSwitchStatement = function (node) {
		var this$1 = this;

		this.next();
		node.discriminant = this.parseParenExpression();
		node.cases = [];
		this.expect(types.braceL);
		this.labels.push(switchLabel);
		this.enterLexicalScope();

		// Statements under must be grouped (by label) in SwitchCase
		// nodes. `cur` is used to keep the node that we are currently
		// adding statements to.

		var cur;
		for (var sawDefault = false; this.type != types.braceR; ) {
			if (this$1.type === types._case || this$1.type === types._default) {
				var isCase = this$1.type === types._case;
				if (cur) {
					this$1.finishNode(cur, 'SwitchCase');
				}
				node.cases.push((cur = this$1.startNode()));
				cur.consequent = [];
				this$1.next();
				if (isCase) {
					cur.test = this$1.parseExpression();
				} else {
					if (sawDefault) {
						this$1.raiseRecoverable(
							this$1.lastTokStart,
							'Multiple default clauses'
						);
					}
					sawDefault = true;
					cur.test = null;
				}
				this$1.expect(types.colon);
			} else {
				if (!cur) {
					this$1.unexpected();
				}
				cur.consequent.push(this$1.parseStatement(true));
			}
		}
		this.exitLexicalScope();
		if (cur) {
			this.finishNode(cur, 'SwitchCase');
		}
		this.next(); // Closing brace
		this.labels.pop();
		return this.finishNode(node, 'SwitchStatement');
	};

	pp$1.parseThrowStatement = function (node) {
		this.next();
		if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
			this.raise(this.lastTokEnd, 'Illegal newline after throw');
		}
		node.argument = this.parseExpression();
		this.semicolon();
		return this.finishNode(node, 'ThrowStatement');
	};

	// Reused empty array added for node fields that are always empty.

	var empty = [];

	pp$1.parseTryStatement = function (node) {
		this.next();
		node.block = this.parseBlock();
		node.handler = null;
		if (this.type === types._catch) {
			var clause = this.startNode();
			this.next();
			this.expect(types.parenL);
			clause.param = this.parseBindingAtom();
			this.enterLexicalScope();
			this.checkLVal(clause.param, 'let');
			this.expect(types.parenR);
			clause.body = this.parseBlock(false);
			this.exitLexicalScope();
			node.handler = this.finishNode(clause, 'CatchClause');
		}
		node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
		if (!node.handler && !node.finalizer) {
			this.raise(node.start, 'Missing catch or finally clause');
		}
		return this.finishNode(node, 'TryStatement');
	};

	pp$1.parseVarStatement = function (node, kind) {
		this.next();
		this.parseVar(node, false, kind);
		this.semicolon();
		return this.finishNode(node, 'VariableDeclaration');
	};

	pp$1.parseWhileStatement = function (node) {
		this.next();
		node.test = this.parseParenExpression();
		this.labels.push(loopLabel);
		node.body = this.parseStatement(false);
		this.labels.pop();
		return this.finishNode(node, 'WhileStatement');
	};

	pp$1.parseWithStatement = function (node) {
		if (this.strict) {
			this.raise(this.start, "'with' in strict mode");
		}
		this.next();
		node.object = this.parseParenExpression();
		node.body = this.parseStatement(false);
		return this.finishNode(node, 'WithStatement');
	};

	pp$1.parseEmptyStatement = function (node) {
		this.next();
		return this.finishNode(node, 'EmptyStatement');
	};

	pp$1.parseLabeledStatement = function (node, maybeName, expr) {
		var this$1 = this;

		for (var i$1 = 0, list = this$1.labels; i$1 < list.length; i$1 += 1) {
			var label = list[i$1];

			if (label.name === maybeName) {
				this$1.raise(
					expr.start,
					"Label '" + maybeName + "' is already declared"
				);
			}
		}
		var kind = this.type.isLoop
			? 'loop'
			: this.type === types._switch
				? 'switch'
				: null;
		for (var i = this.labels.length - 1; i >= 0; i--) {
			var label$1 = this$1.labels[i];
			if (label$1.statementStart == node.start) {
				label$1.statementStart = this$1.start;
				label$1.kind = kind;
			} else {
				break;
			}
		}
		this.labels.push({
			name: maybeName,
			kind: kind,
			statementStart: this.start,
		});
		node.body = this.parseStatement(true);
		if (
			node.body.type == 'ClassDeclaration' ||
			(node.body.type == 'VariableDeclaration' &&
				node.body.kind != 'var') ||
			(node.body.type == 'FunctionDeclaration' &&
				(this.strict || node.body.generator))
		) {
			this.raiseRecoverable(
				node.body.start,
				'Invalid labeled declaration'
			);
		}
		this.labels.pop();
		node.label = expr;
		return this.finishNode(node, 'LabeledStatement');
	};

	pp$1.parseExpressionStatement = function (node, expr) {
		node.expression = expr;
		this.semicolon();
		return this.finishNode(node, 'ExpressionStatement');
	};

	// Parse a semicolon-enclosed block of statements, handling `"use
	// strict"` declarations when `allowStrict` is true (used for
	// function bodies).

	pp$1.parseBlock = function (createNewLexicalScope) {
		var this$1 = this;
		if (createNewLexicalScope === void 0) {
			createNewLexicalScope = true;
		}

		var node = this.startNode();
		node.body = [];
		this.expect(types.braceL);
		if (createNewLexicalScope) {
			this.enterLexicalScope();
		}
		while (!this.eat(types.braceR)) {
			var stmt = this$1.parseStatement(true);
			node.body.push(stmt);
		}
		if (createNewLexicalScope) {
			this.exitLexicalScope();
		}
		return this.finishNode(node, 'BlockStatement');
	};

	// Parse a regular `for` loop. The disambiguation code in
	// `parseStatement` will already have parsed the init statement or
	// expression.

	pp$1.parseFor = function (node, init) {
		node.init = init;
		this.expect(types.semi);
		node.test = this.type === types.semi ? null : this.parseExpression();
		this.expect(types.semi);
		node.update =
			this.type === types.parenR ? null : this.parseExpression();
		this.expect(types.parenR);
		this.exitLexicalScope();
		node.body = this.parseStatement(false);
		this.labels.pop();
		return this.finishNode(node, 'ForStatement');
	};

	// Parse a `for`/`in` and `for`/`of` loop, which are almost
	// same from parser's perspective.

	pp$1.parseForIn = function (node, init) {
		var type =
			this.type === types._in ? 'ForInStatement' : 'ForOfStatement';
		this.next();
		node.left = init;
		node.right = this.parseExpression();
		this.expect(types.parenR);
		this.exitLexicalScope();
		node.body = this.parseStatement(false);
		this.labels.pop();
		return this.finishNode(node, type);
	};

	// Parse a list of variable declarations.

	pp$1.parseVar = function (node, isFor, kind) {
		var this$1 = this;

		node.declarations = [];
		node.kind = kind;
		for (;;) {
			var decl = this$1.startNode();
			this$1.parseVarId(decl, kind);
			if (this$1.eat(types.eq)) {
				decl.init = this$1.parseMaybeAssign(isFor);
			} else if (
				kind === 'const' &&
				!(
					this$1.type === types._in ||
					(this$1.options.ecmaVersion >= 6 &&
						this$1.isContextual('of'))
				)
			) {
				this$1.unexpected();
			} else if (
				decl.id.type != 'Identifier' &&
				!(
					isFor &&
					(this$1.type === types._in || this$1.isContextual('of'))
				)
			) {
				this$1.raise(
					this$1.lastTokEnd,
					'Complex binding patterns require an initialization value'
				);
			} else {
				decl.init = null;
			}
			node.declarations.push(
				this$1.finishNode(decl, 'VariableDeclarator')
			);
			if (!this$1.eat(types.comma)) {
				break;
			}
		}
		return node;
	};

	pp$1.parseVarId = function (decl, kind) {
		decl.id = this.parseBindingAtom(kind);
		this.checkLVal(decl.id, kind, false);
	};

	// Parse a function declaration or literal (depending on the
	// `isStatement` parameter).

	pp$1.parseFunction = function (
		node,
		isStatement,
		allowExpressionBody,
		isAsync
	) {
		this.initFunction(node);
		if (this.options.ecmaVersion >= 6 && !isAsync) {
			node.generator = this.eat(types.star);
		}
		if (this.options.ecmaVersion >= 8) {
			node.async = !!isAsync;
		}

		if (isStatement) {
			node.id =
				isStatement === 'nullableID' && this.type != types.name
					? null
					: this.parseIdent();
			if (node.id) {
				this.checkLVal(node.id, 'var');
			}
		}

		var oldInGen = this.inGenerator,
			oldInAsync = this.inAsync,
			oldYieldPos = this.yieldPos,
			oldAwaitPos = this.awaitPos,
			oldInFunc = this.inFunction;
		this.inGenerator = node.generator;
		this.inAsync = node.async;
		this.yieldPos = 0;
		this.awaitPos = 0;
		this.inFunction = true;
		this.enterFunctionScope();

		if (!isStatement) {
			node.id = this.type == types.name ? this.parseIdent() : null;
		}

		this.parseFunctionParams(node);
		this.parseFunctionBody(node, allowExpressionBody);

		this.inGenerator = oldInGen;
		this.inAsync = oldInAsync;
		this.yieldPos = oldYieldPos;
		this.awaitPos = oldAwaitPos;
		this.inFunction = oldInFunc;
		return this.finishNode(
			node,
			isStatement ? 'FunctionDeclaration' : 'FunctionExpression'
		);
	};

	pp$1.parseFunctionParams = function (node) {
		this.expect(types.parenL);
		node.params = this.parseBindingList(
			types.parenR,
			false,
			this.options.ecmaVersion >= 8
		);
		this.checkYieldAwaitInDefaultParams();
	};

	// Parse a class declaration or literal (depending on the
	// `isStatement` parameter).

	pp$1.parseClass = function (node, isStatement) {
		var this$1 = this;

		this.next();

		this.parseClassId(node, isStatement);
		this.parseClassSuper(node);
		var classBody = this.startNode();
		var hadConstructor = false;
		classBody.body = [];
		this.expect(types.braceL);
		while (!this.eat(types.braceR)) {
			if (this$1.eat(types.semi)) {
				continue;
			}
			var method = this$1.startNode();
			var isGenerator = this$1.eat(types.star);
			var isAsync = false;
			var isMaybeStatic =
				this$1.type === types.name && this$1.value === 'static';
			this$1.parsePropertyName(method);
			method.static = isMaybeStatic && this$1.type !== types.parenL;
			if (method.static) {
				if (isGenerator) {
					this$1.unexpected();
				}
				isGenerator = this$1.eat(types.star);
				this$1.parsePropertyName(method);
			}
			if (
				this$1.options.ecmaVersion >= 8 &&
				!isGenerator &&
				!method.computed &&
				method.key.type === 'Identifier' &&
				method.key.name === 'async' &&
				this$1.type !== types.parenL &&
				!this$1.canInsertSemicolon()
			) {
				isAsync = true;
				this$1.parsePropertyName(method);
			}
			method.kind = 'method';
			var isGetSet = false;
			if (!method.computed) {
				var key = method.key;
				if (
					!isGenerator &&
					!isAsync &&
					key.type === 'Identifier' &&
					this$1.type !== types.parenL &&
					(key.name === 'get' || key.name === 'set')
				) {
					isGetSet = true;
					method.kind = key.name;
					key = this$1.parsePropertyName(method);
				}
				if (
					!method.static &&
					((key.type === 'Identifier' &&
						key.name === 'constructor') ||
						(key.type === 'Literal' && key.value === 'constructor'))
				) {
					if (hadConstructor) {
						this$1.raise(
							key.start,
							'Duplicate constructor in the same class'
						);
					}
					if (isGetSet) {
						this$1.raise(
							key.start,
							"Constructor can't have get/set modifier"
						);
					}
					if (isGenerator) {
						this$1.raise(
							key.start,
							"Constructor can't be a generator"
						);
					}
					if (isAsync) {
						this$1.raise(
							key.start,
							"Constructor can't be an async method"
						);
					}
					method.kind = 'constructor';
					hadConstructor = true;
				}
			}
			this$1.parseClassMethod(classBody, method, isGenerator, isAsync);
			if (isGetSet) {
				var paramCount = method.kind === 'get' ? 0 : 1;
				if (method.value.params.length !== paramCount) {
					var start = method.value.start;
					if (method.kind === 'get') {
						this$1.raiseRecoverable(
							start,
							'getter should have no params'
						);
					} else {
						this$1.raiseRecoverable(
							start,
							'setter should have exactly one param'
						);
					}
				} else {
					if (
						method.kind === 'set' &&
						method.value.params[0].type === 'RestElement'
					) {
						this$1.raiseRecoverable(
							method.value.params[0].start,
							'Setter cannot use rest params'
						);
					}
				}
			}
		}
		node.body = this.finishNode(classBody, 'ClassBody');
		return this.finishNode(
			node,
			isStatement ? 'ClassDeclaration' : 'ClassExpression'
		);
	};

	pp$1.parseClassMethod = function (classBody, method, isGenerator, isAsync) {
		method.value = this.parseMethod(isGenerator, isAsync);
		classBody.body.push(this.finishNode(method, 'MethodDefinition'));
	};

	pp$1.parseClassId = function (node, isStatement) {
		node.id =
			this.type === types.name
				? this.parseIdent()
				: isStatement === true
					? this.unexpected()
					: null;
	};

	pp$1.parseClassSuper = function (node) {
		node.superClass = this.eat(types._extends)
			? this.parseExprSubscripts()
			: null;
	};

	// Parses module export declaration.

	pp$1.parseExport = function (node, exports) {
		var this$1 = this;

		this.next();
		// export * from '...'
		if (this.eat(types.star)) {
			this.expectContextual('from');
			node.source =
				this.type === types.string
					? this.parseExprAtom()
					: this.unexpected();
			this.semicolon();
			return this.finishNode(node, 'ExportAllDeclaration');
		}
		if (this.eat(types._default)) {
			// export default ...
			this.checkExport(exports, 'default', this.lastTokStart);
			var isAsync;
			if (
				this.type === types._function ||
				(isAsync = this.isAsyncFunction())
			) {
				var fNode = this.startNode();
				this.next();
				if (isAsync) {
					this.next();
				}
				node.declaration = this.parseFunction(
					fNode,
					'nullableID',
					false,
					isAsync
				);
			} else if (this.type === types._class) {
				var cNode = this.startNode();
				node.declaration = this.parseClass(cNode, 'nullableID');
			} else {
				node.declaration = this.parseMaybeAssign();
				this.semicolon();
			}
			return this.finishNode(node, 'ExportDefaultDeclaration');
		}
		// export var|const|let|function|class ...
		if (this.shouldParseExportStatement()) {
			node.declaration = this.parseStatement(true);
			if (node.declaration.type === 'VariableDeclaration') {
				this.checkVariableExport(
					exports,
					node.declaration.declarations
				);
			} else {
				this.checkExport(
					exports,
					node.declaration.id.name,
					node.declaration.id.start
				);
			}
			node.specifiers = [];
			node.source = null;
		} else {
			// export { x, y as z } [from '...']
			node.declaration = null;
			node.specifiers = this.parseExportSpecifiers(exports);
			if (this.eatContextual('from')) {
				node.source =
					this.type === types.string
						? this.parseExprAtom()
						: this.unexpected();
			} else {
				// check for keywords used as local names
				for (
					var i = 0, list = node.specifiers;
					i < list.length;
					i += 1
				) {
					var spec = list[i];

					this$1.checkUnreserved(spec.local);
				}

				node.source = null;
			}
			this.semicolon();
		}
		return this.finishNode(node, 'ExportNamedDeclaration');
	};

	pp$1.checkExport = function (exports, name, pos) {
		if (!exports) {
			return;
		}
		if (has(exports, name)) {
			this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
		}
		exports[name] = true;
	};

	pp$1.checkPatternExport = function (exports, pat) {
		var this$1 = this;

		var type = pat.type;
		if (type == 'Identifier') {
			this.checkExport(exports, pat.name, pat.start);
		} else if (type == 'ObjectPattern') {
			for (var i = 0, list = pat.properties; i < list.length; i += 1) {
				var prop = list[i];

				this$1.checkPatternExport(exports, prop.value);
			}
		} else if (type == 'ArrayPattern') {
			for (
				var i$1 = 0, list$1 = pat.elements;
				i$1 < list$1.length;
				i$1 += 1
			) {
				var elt = list$1[i$1];

				if (elt) {
					this$1.checkPatternExport(exports, elt);
				}
			}
		} else if (type == 'AssignmentPattern') {
			this.checkPatternExport(exports, pat.left);
		} else if (type == 'ParenthesizedExpression') {
			this.checkPatternExport(exports, pat.expression);
		}
	};

	pp$1.checkVariableExport = function (exports, decls) {
		var this$1 = this;

		if (!exports) {
			return;
		}
		for (var i = 0, list = decls; i < list.length; i += 1) {
			var decl = list[i];

			this$1.checkPatternExport(exports, decl.id);
		}
	};

	pp$1.shouldParseExportStatement = function () {
		return (
			this.type.keyword === 'var' ||
			this.type.keyword === 'const' ||
			this.type.keyword === 'class' ||
			this.type.keyword === 'function' ||
			this.isLet() ||
			this.isAsyncFunction()
		);
	};

	// Parses a comma-separated list of module exports.

	pp$1.parseExportSpecifiers = function (exports) {
		var this$1 = this;

		var nodes = [],
			first = true;
		// export { x, y as z } [from '...']
		this.expect(types.braceL);
		while (!this.eat(types.braceR)) {
			if (!first) {
				this$1.expect(types.comma);
				if (this$1.afterTrailingComma(types.braceR)) {
					break;
				}
			} else {
				first = false;
			}

			var node = this$1.startNode();
			node.local = this$1.parseIdent(true);
			node.exported = this$1.eatContextual('as')
				? this$1.parseIdent(true)
				: node.local;
			this$1.checkExport(
				exports,
				node.exported.name,
				node.exported.start
			);
			nodes.push(this$1.finishNode(node, 'ExportSpecifier'));
		}
		return nodes;
	};

	// Parses import declaration.

	pp$1.parseImport = function (node) {
		this.next();
		// import '...'
		if (this.type === types.string) {
			node.specifiers = empty;
			node.source = this.parseExprAtom();
		} else {
			node.specifiers = this.parseImportSpecifiers();
			this.expectContextual('from');
			node.source =
				this.type === types.string
					? this.parseExprAtom()
					: this.unexpected();
		}
		this.semicolon();
		return this.finishNode(node, 'ImportDeclaration');
	};

	// Parses a comma-separated list of module imports.

	pp$1.parseImportSpecifiers = function () {
		var this$1 = this;

		var nodes = [],
			first = true;
		if (this.type === types.name) {
			// import defaultObj, { x, y as z } from '...'
			var node = this.startNode();
			node.local = this.parseIdent();
			this.checkLVal(node.local, 'let');
			nodes.push(this.finishNode(node, 'ImportDefaultSpecifier'));
			if (!this.eat(types.comma)) {
				return nodes;
			}
		}
		if (this.type === types.star) {
			var node$1 = this.startNode();
			this.next();
			this.expectContextual('as');
			node$1.local = this.parseIdent();
			this.checkLVal(node$1.local, 'let');
			nodes.push(this.finishNode(node$1, 'ImportNamespaceSpecifier'));
			return nodes;
		}
		this.expect(types.braceL);
		while (!this.eat(types.braceR)) {
			if (!first) {
				this$1.expect(types.comma);
				if (this$1.afterTrailingComma(types.braceR)) {
					break;
				}
			} else {
				first = false;
			}

			var node$2 = this$1.startNode();
			node$2.imported = this$1.parseIdent(true);
			if (this$1.eatContextual('as')) {
				node$2.local = this$1.parseIdent();
			} else {
				this$1.checkUnreserved(node$2.imported);
				node$2.local = node$2.imported;
			}
			this$1.checkLVal(node$2.local, 'let');
			nodes.push(this$1.finishNode(node$2, 'ImportSpecifier'));
		}
		return nodes;
	};

	var pp$2 = Parser.prototype;

	// Convert existing expression atom to assignable pattern
	// if possible.

	pp$2.toAssignable = function (node, isBinding) {
		var this$1 = this;

		if (this.options.ecmaVersion >= 6 && node) {
			switch (node.type) {
				case 'Identifier':
					if (this.inAsync && node.name === 'await') {
						this.raise(
							node.start,
							"Can not use 'await' as identifier inside an async function"
						);
					}
					break;

				case 'ObjectPattern':
				case 'ArrayPattern':
					break;

				case 'ObjectExpression':
					node.type = 'ObjectPattern';
					for (
						var i = 0, list = node.properties;
						i < list.length;
						i += 1
					) {
						var prop = list[i];

						if (prop.kind !== 'init') {
							this$1.raise(
								prop.key.start,
								"Object pattern can't contain getter or setter"
							);
						}
						this$1.toAssignable(prop.value, isBinding);
					}
					break;

				case 'ArrayExpression':
					node.type = 'ArrayPattern';
					this.toAssignableList(node.elements, isBinding);
					break;

				case 'AssignmentExpression':
					if (node.operator === '=') {
						node.type = 'AssignmentPattern';
						delete node.operator;
						this.toAssignable(node.left, isBinding);
						// falls through to AssignmentPattern
					} else {
						this.raise(
							node.left.end,
							"Only '=' operator can be used for specifying default value."
						);
						break;
					}

				case 'AssignmentPattern':
					break;

				case 'ParenthesizedExpression':
					this.toAssignable(node.expression, isBinding);
					break;

				case 'MemberExpression':
					if (!isBinding) {
						break;
					}

				default:
					this.raise(node.start, 'Assigning to rvalue');
			}
		}
		return node;
	};

	// Convert list of expression atoms to binding list.

	pp$2.toAssignableList = function (exprList, isBinding) {
		var this$1 = this;

		var end = exprList.length;
		if (end) {
			var last = exprList[end - 1];
			if (last && last.type == 'RestElement') {
				--end;
			} else if (last && last.type == 'SpreadElement') {
				last.type = 'RestElement';
				var arg = last.argument;
				this.toAssignable(arg, isBinding);
				--end;
			}

			if (
				this.options.ecmaVersion === 6 &&
				isBinding &&
				last &&
				last.type === 'RestElement' &&
				last.argument.type !== 'Identifier'
			) {
				this.unexpected(last.argument.start);
			}
		}
		for (var i = 0; i < end; i++) {
			var elt = exprList[i];
			if (elt) {
				this$1.toAssignable(elt, isBinding);
			}
		}
		return exprList;
	};

	// Parses spread element.

	pp$2.parseSpread = function (refDestructuringErrors) {
		var node = this.startNode();
		this.next();
		node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
		return this.finishNode(node, 'SpreadElement');
	};

	pp$2.parseRestBinding = function () {
		var node = this.startNode();
		this.next();

		// RestElement inside of a function parameter must be an identifier
		if (this.options.ecmaVersion === 6 && this.type !== types.name) {
			this.unexpected();
		}

		node.argument = this.parseBindingAtom();

		return this.finishNode(node, 'RestElement');
	};

	// Parses lvalue (assignable) atom.

	pp$2.parseBindingAtom = function () {
		if (this.options.ecmaVersion < 6) {
			return this.parseIdent();
		}
		switch (this.type) {
			case types.name:
				return this.parseIdent();

			case types.bracketL:
				var node = this.startNode();
				this.next();
				node.elements = this.parseBindingList(
					types.bracketR,
					true,
					true
				);
				return this.finishNode(node, 'ArrayPattern');

			case types.braceL:
				return this.parseObj(true);

			default:
				this.unexpected();
		}
	};

	pp$2.parseBindingList = function (close, allowEmpty, allowTrailingComma) {
		var this$1 = this;

		var elts = [],
			first = true;
		while (!this.eat(close)) {
			if (first) {
				first = false;
			} else {
				this$1.expect(types.comma);
			}
			if (allowEmpty && this$1.type === types.comma) {
				elts.push(null);
			} else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
				break;
			} else if (this$1.type === types.ellipsis) {
				var rest = this$1.parseRestBinding();
				this$1.parseBindingListItem(rest);
				elts.push(rest);
				if (this$1.type === types.comma) {
					this$1.raise(
						this$1.start,
						'Comma is not permitted after the rest element'
					);
				}
				this$1.expect(close);
				break;
			} else {
				var elem = this$1.parseMaybeDefault(
					this$1.start,
					this$1.startLoc
				);
				this$1.parseBindingListItem(elem);
				elts.push(elem);
			}
		}
		return elts;
	};

	pp$2.parseBindingListItem = function (param) {
		return param;
	};

	// Parses assignment pattern around given atom if possible.

	pp$2.parseMaybeDefault = function (startPos, startLoc, left) {
		left = left || this.parseBindingAtom();
		if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) {
			return left;
		}
		var node = this.startNodeAt(startPos, startLoc);
		node.left = left;
		node.right = this.parseMaybeAssign();
		return this.finishNode(node, 'AssignmentPattern');
	};

	// Verify that a node is an lval — something that can be assigned
	// to.
	// bindingType can be either:
	// 'var' indicating that the lval creates a 'var' binding
	// 'let' indicating that the lval creates a lexical ('let' or 'const') binding
	// 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

	pp$2.checkLVal = function (expr, bindingType, checkClashes) {
		var this$1 = this;

		switch (expr.type) {
			case 'Identifier':
				if (
					this.strict &&
					this.reservedWordsStrictBind.test(expr.name)
				) {
					this.raiseRecoverable(
						expr.start,
						(bindingType ? 'Binding ' : 'Assigning to ') +
							expr.name +
							' in strict mode'
					);
				}
				if (checkClashes) {
					if (has(checkClashes, expr.name)) {
						this.raiseRecoverable(
							expr.start,
							'Argument name clash'
						);
					}
					checkClashes[expr.name] = true;
				}
				if (bindingType && bindingType !== 'none') {
					if (
						(bindingType === 'var' &&
							!this.canDeclareVarName(expr.name)) ||
						(bindingType !== 'var' &&
							!this.canDeclareLexicalName(expr.name))
					) {
						this.raiseRecoverable(
							expr.start,
							"Identifier '" +
								expr.name +
								"' has already been declared"
						);
					}
					if (bindingType === 'var') {
						this.declareVarName(expr.name);
					} else {
						this.declareLexicalName(expr.name);
					}
				}
				break;

			case 'MemberExpression':
				if (bindingType) {
					this.raiseRecoverable(
						expr.start,
						(bindingType ? 'Binding' : 'Assigning to') +
							' member expression'
					);
				}
				break;

			case 'ObjectPattern':
				for (
					var i = 0, list = expr.properties;
					i < list.length;
					i += 1
				) {
					var prop = list[i];

					this$1.checkLVal(prop.value, bindingType, checkClashes);
				}
				break;

			case 'ArrayPattern':
				for (
					var i$1 = 0, list$1 = expr.elements;
					i$1 < list$1.length;
					i$1 += 1
				) {
					var elem = list$1[i$1];

					if (elem) {
						this$1.checkLVal(elem, bindingType, checkClashes);
					}
				}
				break;

			case 'AssignmentPattern':
				this.checkLVal(expr.left, bindingType, checkClashes);
				break;

			case 'RestElement':
				this.checkLVal(expr.argument, bindingType, checkClashes);
				break;

			case 'ParenthesizedExpression':
				this.checkLVal(expr.expression, bindingType, checkClashes);
				break;

			default:
				this.raise(
					expr.start,
					(bindingType ? 'Binding' : 'Assigning to') + ' rvalue'
				);
		}
	};

	// A recursive descent parser operates by defining functions for all
	// syntactic elements, and recursively calling those, each function
	// advancing the input stream and returning an AST node. Precedence
	// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
	// instead of `(!x)[1]` is handled by the fact that the parser
	// function that parses unary prefix operators is called first, and
	// in turn calls the function that parses `[]` subscripts — that
	// way, it'll receive the node for `x[1]` already parsed, and wraps
	// *that* in the unary operator node.
	//
	// Acorn uses an [operator precedence parser][opp] to handle binary
	// operator precedence, because it is much more compact than using
	// the technique outlined above, which uses different, nesting
	// functions to specify precedence, for all of the ten binary
	// precedence levels that JavaScript defines.
	//
	// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

	var pp$3 = Parser.prototype;

	// Check if property name clashes with already added.
	// Object/class getters and setters are not allowed to clash —
	// either with each other or with an init property — and in
	// strict mode, init properties are also not allowed to be repeated.

	pp$3.checkPropClash = function (prop, propHash) {
		if (
			this.options.ecmaVersion >= 6 &&
			(prop.computed || prop.method || prop.shorthand)
		) {
			return;
		}
		var key = prop.key;
		var name;
		switch (key.type) {
			case 'Identifier':
				name = key.name;
				break;
			case 'Literal':
				name = String(key.value);
				break;
			default:
				return;
		}
		var kind = prop.kind;
		if (this.options.ecmaVersion >= 6) {
			if (name === '__proto__' && kind === 'init') {
				if (propHash.proto) {
					this.raiseRecoverable(
						key.start,
						'Redefinition of __proto__ property'
					);
				}
				propHash.proto = true;
			}
			return;
		}
		name = '$' + name;
		var other = propHash[name];
		if (other) {
			var redefinition;
			if (kind === 'init') {
				redefinition =
					(this.strict && other.init) || other.get || other.set;
			} else {
				redefinition = other.init || other[kind];
			}
			if (redefinition) {
				this.raiseRecoverable(key.start, 'Redefinition of property');
			}
		} else {
			other = propHash[name] = {
				init: false,
				get: false,
				set: false,
			};
		}
		other[kind] = true;
	};

	// ### Expression parsing

	// These nest, from the most general expression type at the top to
	// 'atomic', nondivisible expression types at the bottom. Most of
	// the functions will simply let the function(s) below them parse,
	// and, *if* the syntactic construct they handle is present, wrap
	// the AST node that the inner parser gave them in another node.

	// Parse a full expression. The optional arguments are used to
	// forbid the `in` operator (in for loops initalization expressions)
	// and provide reference for storing '=' operator inside shorthand
	// property assignment in contexts where both object expression
	// and object pattern might appear (so it's possible to raise
	// delayed syntax error at correct position).

	pp$3.parseExpression = function (noIn, refDestructuringErrors) {
		var this$1 = this;

		var startPos = this.start,
			startLoc = this.startLoc;
		var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
		if (this.type === types.comma) {
			var node = this.startNodeAt(startPos, startLoc);
			node.expressions = [expr];
			while (this.eat(types.comma)) {
				node.expressions.push(
					this$1.parseMaybeAssign(noIn, refDestructuringErrors)
				);
			}
			return this.finishNode(node, 'SequenceExpression');
		}
		return expr;
	};

	// Parse an assignment expression. This includes applications of
	// operators like `+=`.

	pp$3.parseMaybeAssign = function (
		noIn,
		refDestructuringErrors,
		afterLeftParse
	) {
		if (this.inGenerator && this.isContextual('yield')) {
			return this.parseYield();
		}

		var ownDestructuringErrors = false,
			oldParenAssign = -1,
			oldTrailingComma = -1;
		if (refDestructuringErrors) {
			oldParenAssign = refDestructuringErrors.parenthesizedAssign;
			oldTrailingComma = refDestructuringErrors.trailingComma;
			refDestructuringErrors.parenthesizedAssign =
				refDestructuringErrors.trailingComma = -1;
		} else {
			refDestructuringErrors = new DestructuringErrors();
			ownDestructuringErrors = true;
		}

		var startPos = this.start,
			startLoc = this.startLoc;
		if (this.type == types.parenL || this.type == types.name) {
			this.potentialArrowAt = this.start;
		}
		var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
		if (afterLeftParse) {
			left = afterLeftParse.call(this, left, startPos, startLoc);
		}
		if (this.type.isAssign) {
			this.checkPatternErrors(refDestructuringErrors, true);
			if (!ownDestructuringErrors) {
				DestructuringErrors.call(refDestructuringErrors);
			}
			var node = this.startNodeAt(startPos, startLoc);
			node.operator = this.value;
			node.left = this.type === types.eq ? this.toAssignable(left) : left;
			refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
			this.checkLVal(left);
			this.next();
			node.right = this.parseMaybeAssign(noIn);
			return this.finishNode(node, 'AssignmentExpression');
		} else {
			if (ownDestructuringErrors) {
				this.checkExpressionErrors(refDestructuringErrors, true);
			}
		}
		if (oldParenAssign > -1) {
			refDestructuringErrors.parenthesizedAssign = oldParenAssign;
		}
		if (oldTrailingComma > -1) {
			refDestructuringErrors.trailingComma = oldTrailingComma;
		}
		return left;
	};

	// Parse a ternary conditional (`?:`) operator.

	pp$3.parseMaybeConditional = function (noIn, refDestructuringErrors) {
		var startPos = this.start,
			startLoc = this.startLoc;
		var expr = this.parseExprOps(noIn, refDestructuringErrors);
		if (this.checkExpressionErrors(refDestructuringErrors)) {
			return expr;
		}
		if (this.eat(types.question)) {
			var node = this.startNodeAt(startPos, startLoc);
			node.test = expr;
			node.consequent = this.parseMaybeAssign();
			this.expect(types.colon);
			node.alternate = this.parseMaybeAssign(noIn);
			return this.finishNode(node, 'ConditionalExpression');
		}
		return expr;
	};

	// Start the precedence parser.

	pp$3.parseExprOps = function (noIn, refDestructuringErrors) {
		var startPos = this.start,
			startLoc = this.startLoc;
		var expr = this.parseMaybeUnary(refDestructuringErrors, false);
		if (this.checkExpressionErrors(refDestructuringErrors)) {
			return expr;
		}
		return expr.start == startPos && expr.type === 'ArrowFunctionExpression'
			? expr
			: this.parseExprOp(expr, startPos, startLoc, -1, noIn);
	};

	// Parse binary operators with the operator precedence parsing
	// algorithm. `left` is the left-hand side of the operator.
	// `minPrec` provides context that allows the function to stop and
	// defer further parser to one of its callers when it encounters an
	// operator that has a lower precedence than the set it is parsing.

	pp$3.parseExprOp = function (
		left,
		leftStartPos,
		leftStartLoc,
		minPrec,
		noIn
	) {
		var prec = this.type.binop;
		if (prec != null && (!noIn || this.type !== types._in)) {
			if (prec > minPrec) {
				var logical =
					this.type === types.logicalOR ||
					this.type === types.logicalAND;
				var op = this.value;
				this.next();
				var startPos = this.start,
					startLoc = this.startLoc;
				var right = this.parseExprOp(
					this.parseMaybeUnary(null, false),
					startPos,
					startLoc,
					prec,
					noIn
				);
				var node = this.buildBinary(
					leftStartPos,
					leftStartLoc,
					left,
					right,
					op,
					logical
				);
				return this.parseExprOp(
					node,
					leftStartPos,
					leftStartLoc,
					minPrec,
					noIn
				);
			}
		}
		return left;
	};

	pp$3.buildBinary = function (startPos, startLoc, left, right, op, logical) {
		var node = this.startNodeAt(startPos, startLoc);
		node.left = left;
		node.operator = op;
		node.right = right;
		return this.finishNode(
			node,
			logical ? 'LogicalExpression' : 'BinaryExpression'
		);
	};

	// Parse unary operators, both prefix and postfix.

	pp$3.parseMaybeUnary = function (refDestructuringErrors, sawUnary) {
		var this$1 = this;

		var startPos = this.start,
			startLoc = this.startLoc,
			expr;
		if (this.inAsync && this.isContextual('await')) {
			expr = this.parseAwait(refDestructuringErrors);
			sawUnary = true;
		} else if (this.type.prefix) {
			var node = this.startNode(),
				update = this.type === types.incDec;
			node.operator = this.value;
			node.prefix = true;
			this.next();
			node.argument = this.parseMaybeUnary(null, true);
			this.checkExpressionErrors(refDestructuringErrors, true);
			if (update) {
				this.checkLVal(node.argument);
			} else if (
				this.strict &&
				node.operator === 'delete' &&
				node.argument.type === 'Identifier'
			) {
				this.raiseRecoverable(
					node.start,
					'Deleting local variable in strict mode'
				);
			} else {
				sawUnary = true;
			}
			expr = this.finishNode(
				node,
				update ? 'UpdateExpression' : 'UnaryExpression'
			);
		} else {
			expr = this.parseExprSubscripts(refDestructuringErrors);
			if (this.checkExpressionErrors(refDestructuringErrors)) {
				return expr;
			}
			while (this.type.postfix && !this.canInsertSemicolon()) {
				var node$1 = this$1.startNodeAt(startPos, startLoc);
				node$1.operator = this$1.value;
				node$1.prefix = false;
				node$1.argument = expr;
				this$1.checkLVal(expr);
				this$1.next();
				expr = this$1.finishNode(node$1, 'UpdateExpression');
			}
		}

		if (!sawUnary && this.eat(types.starstar)) {
			return this.buildBinary(
				startPos,
				startLoc,
				expr,
				this.parseMaybeUnary(null, false),
				'**',
				false
			);
		} else {
			return expr;
		}
	};

	// Parse call, dot, and `[]`-subscript expressions.

	pp$3.parseExprSubscripts = function (refDestructuringErrors) {
		var startPos = this.start,
			startLoc = this.startLoc;
		var expr = this.parseExprAtom(refDestructuringErrors);
		var skipArrowSubscripts =
			expr.type === 'ArrowFunctionExpression' &&
			this.input.slice(this.lastTokStart, this.lastTokEnd) !== ')';
		if (
			this.checkExpressionErrors(refDestructuringErrors) ||
			skipArrowSubscripts
		) {
			return expr;
		}
		var result = this.parseSubscripts(expr, startPos, startLoc);
		if (refDestructuringErrors && result.type === 'MemberExpression') {
			if (refDestructuringErrors.parenthesizedAssign >= result.start) {
				refDestructuringErrors.parenthesizedAssign = -1;
			}
			if (refDestructuringErrors.parenthesizedBind >= result.start) {
				refDestructuringErrors.parenthesizedBind = -1;
			}
		}
		return result;
	};

	pp$3.parseSubscripts = function (base, startPos, startLoc, noCalls) {
		var this$1 = this;

		var maybeAsyncArrow =
			this.options.ecmaVersion >= 8 &&
			base.type === 'Identifier' &&
			base.name === 'async' &&
			this.lastTokEnd == base.end &&
			!this.canInsertSemicolon();
		for (var computed = void 0; ; ) {
			if (
				(computed = this$1.eat(types.bracketL)) ||
				this$1.eat(types.dot)
			) {
				var node = this$1.startNodeAt(startPos, startLoc);
				node.object = base;
				node.property = computed
					? this$1.parseExpression()
					: this$1.parseIdent(true);
				node.computed = !!computed;
				if (computed) {
					this$1.expect(types.bracketR);
				}
				base = this$1.finishNode(node, 'MemberExpression');
			} else if (!noCalls && this$1.eat(types.parenL)) {
				var refDestructuringErrors = new DestructuringErrors(),
					oldYieldPos = this$1.yieldPos,
					oldAwaitPos = this$1.awaitPos;
				this$1.yieldPos = 0;
				this$1.awaitPos = 0;
				var exprList = this$1.parseExprList(
					types.parenR,
					this$1.options.ecmaVersion >= 8,
					false,
					refDestructuringErrors
				);
				if (
					maybeAsyncArrow &&
					!this$1.canInsertSemicolon() &&
					this$1.eat(types.arrow)
				) {
					this$1.checkPatternErrors(refDestructuringErrors, false);
					this$1.checkYieldAwaitInDefaultParams();
					this$1.yieldPos = oldYieldPos;
					this$1.awaitPos = oldAwaitPos;
					return this$1.parseArrowExpression(
						this$1.startNodeAt(startPos, startLoc),
						exprList,
						true
					);
				}
				this$1.checkExpressionErrors(refDestructuringErrors, true);
				this$1.yieldPos = oldYieldPos || this$1.yieldPos;
				this$1.awaitPos = oldAwaitPos || this$1.awaitPos;
				var node$1 = this$1.startNodeAt(startPos, startLoc);
				node$1.callee = base;
				node$1.arguments = exprList;
				base = this$1.finishNode(node$1, 'CallExpression');
			} else if (this$1.type === types.backQuote) {
				var node$2 = this$1.startNodeAt(startPos, startLoc);
				node$2.tag = base;
				node$2.quasi = this$1.parseTemplate({ isTagged: true });
				base = this$1.finishNode(node$2, 'TaggedTemplateExpression');
			} else {
				return base;
			}
		}
	};

	// Parse an atomic expression — either a single token that is an
	// expression, an expression started by a keyword like `function` or
	// `new`, or an expression wrapped in punctuation like `()`, `[]`,
	// or `{}`.

	pp$3.parseExprAtom = function (refDestructuringErrors) {
		var node,
			canBeArrow = this.potentialArrowAt == this.start;
		switch (this.type) {
			case types._super:
				if (!this.inFunction) {
					this.raise(
						this.start,
						"'super' outside of function or class"
					);
				}

			case types._this:
				var type =
					this.type === types._this ? 'ThisExpression' : 'Super';
				node = this.startNode();
				this.next();
				return this.finishNode(node, type);

			case types.name:
				var startPos = this.start,
					startLoc = this.startLoc;
				var id = this.parseIdent(this.type !== types.name);
				if (
					this.options.ecmaVersion >= 8 &&
					id.name === 'async' &&
					!this.canInsertSemicolon() &&
					this.eat(types._function)
				) {
					return this.parseFunction(
						this.startNodeAt(startPos, startLoc),
						false,
						false,
						true
					);
				}
				if (canBeArrow && !this.canInsertSemicolon()) {
					if (this.eat(types.arrow)) {
						return this.parseArrowExpression(
							this.startNodeAt(startPos, startLoc),
							[id],
							false
						);
					}
					if (
						this.options.ecmaVersion >= 8 &&
						id.name === 'async' &&
						this.type === types.name
					) {
						id = this.parseIdent();
						if (
							this.canInsertSemicolon() ||
							!this.eat(types.arrow)
						) {
							this.unexpected();
						}
						return this.parseArrowExpression(
							this.startNodeAt(startPos, startLoc),
							[id],
							true
						);
					}
				}
				return id;

			case types.regexp:
				var value = this.value;
				node = this.parseLiteral(value.value);
				node.regex = { pattern: value.pattern, flags: value.flags };
				return node;

			case types.num:
			case types.string:
				return this.parseLiteral(this.value);

			case types._null:
			case types._true:
			case types._false:
				node = this.startNode();
				node.value =
					this.type === types._null
						? null
						: this.type === types._true;
				node.raw = this.type.keyword;
				this.next();
				return this.finishNode(node, 'Literal');

			case types.parenL:
				var start = this.start,
					expr = this.parseParenAndDistinguishExpression(canBeArrow);
				if (refDestructuringErrors) {
					if (
						refDestructuringErrors.parenthesizedAssign < 0 &&
						!this.isSimpleAssignTarget(expr)
					) {
						refDestructuringErrors.parenthesizedAssign = start;
					}
					if (refDestructuringErrors.parenthesizedBind < 0) {
						refDestructuringErrors.parenthesizedBind = start;
					}
				}
				return expr;

			case types.bracketL:
				node = this.startNode();
				this.next();
				node.elements = this.parseExprList(
					types.bracketR,
					true,
					true,
					refDestructuringErrors
				);
				return this.finishNode(node, 'ArrayExpression');

			case types.braceL:
				return this.parseObj(false, refDestructuringErrors);

			case types._function:
				node = this.startNode();
				this.next();
				return this.parseFunction(node, false);

			case types._class:
				return this.parseClass(this.startNode(), false);

			case types._new:
				return this.parseNew();

			case types.backQuote:
				return this.parseTemplate();

			default:
				this.unexpected();
		}
	};

	pp$3.parseLiteral = function (value) {
		var node = this.startNode();
		node.value = value;
		node.raw = this.input.slice(this.start, this.end);
		this.next();
		return this.finishNode(node, 'Literal');
	};

	pp$3.parseParenExpression = function () {
		this.expect(types.parenL);
		var val = this.parseExpression();
		this.expect(types.parenR);
		return val;
	};

	pp$3.parseParenAndDistinguishExpression = function (canBeArrow) {
		var this$1 = this;

		var startPos = this.start,
			startLoc = this.startLoc,
			val,
			allowTrailingComma = this.options.ecmaVersion >= 8;
		if (this.options.ecmaVersion >= 6) {
			this.next();

			var innerStartPos = this.start,
				innerStartLoc = this.startLoc;
			var exprList = [],
				first = true,
				lastIsComma = false;
			var refDestructuringErrors = new DestructuringErrors(),
				oldYieldPos = this.yieldPos,
				oldAwaitPos = this.awaitPos,
				spreadStart,
				innerParenStart;
			this.yieldPos = 0;
			this.awaitPos = 0;
			while (this.type !== types.parenR) {
				first ? (first = false) : this$1.expect(types.comma);
				if (
					allowTrailingComma &&
					this$1.afterTrailingComma(types.parenR, true)
				) {
					lastIsComma = true;
					break;
				} else if (this$1.type === types.ellipsis) {
					spreadStart = this$1.start;
					exprList.push(
						this$1.parseParenItem(this$1.parseRestBinding())
					);
					if (this$1.type === types.comma) {
						this$1.raise(
							this$1.start,
							'Comma is not permitted after the rest element'
						);
					}
					break;
				} else {
					if (this$1.type === types.parenL && !innerParenStart) {
						innerParenStart = this$1.start;
					}
					exprList.push(
						this$1.parseMaybeAssign(
							false,
							refDestructuringErrors,
							this$1.parseParenItem
						)
					);
				}
			}
			var innerEndPos = this.start,
				innerEndLoc = this.startLoc;
			this.expect(types.parenR);

			if (
				canBeArrow &&
				!this.canInsertSemicolon() &&
				this.eat(types.arrow)
			) {
				this.checkPatternErrors(refDestructuringErrors, false);
				this.checkYieldAwaitInDefaultParams();
				if (innerParenStart) {
					this.unexpected(innerParenStart);
				}
				this.yieldPos = oldYieldPos;
				this.awaitPos = oldAwaitPos;
				return this.parseParenArrowList(startPos, startLoc, exprList);
			}

			if (!exprList.length || lastIsComma) {
				this.unexpected(this.lastTokStart);
			}
			if (spreadStart) {
				this.unexpected(spreadStart);
			}
			this.checkExpressionErrors(refDestructuringErrors, true);
			this.yieldPos = oldYieldPos || this.yieldPos;
			this.awaitPos = oldAwaitPos || this.awaitPos;

			if (exprList.length > 1) {
				val = this.startNodeAt(innerStartPos, innerStartLoc);
				val.expressions = exprList;
				this.finishNodeAt(
					val,
					'SequenceExpression',
					innerEndPos,
					innerEndLoc
				);
			} else {
				val = exprList[0];
			}
		} else {
			val = this.parseParenExpression();
		}

		if (this.options.preserveParens) {
			var par = this.startNodeAt(startPos, startLoc);
			par.expression = val;
			return this.finishNode(par, 'ParenthesizedExpression');
		} else {
			return val;
		}
	};

	pp$3.parseParenItem = function (item) {
		return item;
	};

	pp$3.parseParenArrowList = function (startPos, startLoc, exprList) {
		return this.parseArrowExpression(
			this.startNodeAt(startPos, startLoc),
			exprList
		);
	};

	// New's precedence is slightly tricky. It must allow its argument to
	// be a `[]` or dot subscript expression, but not a call — at least,
	// not without wrapping it in parentheses. Thus, it uses the noCalls
	// argument to parseSubscripts to prevent it from consuming the
	// argument list.

	var empty$1 = [];

	pp$3.parseNew = function () {
		var node = this.startNode();
		var meta = this.parseIdent(true);
		if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
			node.meta = meta;
			node.property = this.parseIdent(true);
			if (node.property.name !== 'target') {
				this.raiseRecoverable(
					node.property.start,
					'The only valid meta property for new is new.target'
				);
			}
			if (!this.inFunction) {
				this.raiseRecoverable(
					node.start,
					'new.target can only be used in functions'
				);
			}
			return this.finishNode(node, 'MetaProperty');
		}
		var startPos = this.start,
			startLoc = this.startLoc;
		node.callee = this.parseSubscripts(
			this.parseExprAtom(),
			startPos,
			startLoc,
			true
		);
		if (this.eat(types.parenL)) {
			node.arguments = this.parseExprList(
				types.parenR,
				this.options.ecmaVersion >= 8,
				false
			);
		} else {
			node.arguments = empty$1;
		}
		return this.finishNode(node, 'NewExpression');
	};

	// Parse template expression.

	pp$3.parseTemplateElement = function (ref) {
		var isTagged = ref.isTagged;

		var elem = this.startNode();
		if (this.type === types.invalidTemplate) {
			if (!isTagged) {
				this.raiseRecoverable(
					this.start,
					'Bad escape sequence in untagged template literal'
				);
			}
			elem.value = {
				raw: this.value,
				cooked: null,
			};
		} else {
			elem.value = {
				raw: this.input
					.slice(this.start, this.end)
					.replace(/\r\n?/g, '\n'),
				cooked: this.value,
			};
		}
		this.next();
		elem.tail = this.type === types.backQuote;
		return this.finishNode(elem, 'TemplateElement');
	};

	pp$3.parseTemplate = function (ref) {
		var this$1 = this;
		if (ref === void 0) {
			ref = {};
		}
		var isTagged = ref.isTagged;
		if (isTagged === void 0) {
			isTagged = false;
		}

		var node = this.startNode();
		this.next();
		node.expressions = [];
		var curElt = this.parseTemplateElement({ isTagged: isTagged });
		node.quasis = [curElt];
		while (!curElt.tail) {
			this$1.expect(types.dollarBraceL);
			node.expressions.push(this$1.parseExpression());
			this$1.expect(types.braceR);
			node.quasis.push(
				(curElt = this$1.parseTemplateElement({ isTagged: isTagged }))
			);
		}
		this.next();
		return this.finishNode(node, 'TemplateLiteral');
	};

	// Parse an object literal or binding pattern.

	pp$3.isAsyncProp = function (prop) {
		return (
			!prop.computed &&
			prop.key.type === 'Identifier' &&
			prop.key.name === 'async' &&
			(this.type === types.name ||
				this.type === types.num ||
				this.type === types.string ||
				this.type === types.bracketL) &&
			!lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
		);
	};

	pp$3.parseObj = function (isPattern, refDestructuringErrors) {
		var this$1 = this;

		var node = this.startNode(),
			first = true,
			propHash = {};
		node.properties = [];
		this.next();
		while (!this.eat(types.braceR)) {
			if (!first) {
				this$1.expect(types.comma);
				if (this$1.afterTrailingComma(types.braceR)) {
					break;
				}
			} else {
				first = false;
			}

			var prop = this$1.startNode(),
				isGenerator = void 0,
				isAsync = void 0,
				startPos = void 0,
				startLoc = void 0;
			if (this$1.options.ecmaVersion >= 6) {
				prop.method = false;
				prop.shorthand = false;
				if (isPattern || refDestructuringErrors) {
					startPos = this$1.start;
					startLoc = this$1.startLoc;
				}
				if (!isPattern) {
					isGenerator = this$1.eat(types.star);
				}
			}
			this$1.parsePropertyName(prop);
			if (
				!isPattern &&
				this$1.options.ecmaVersion >= 8 &&
				!isGenerator &&
				this$1.isAsyncProp(prop)
			) {
				isAsync = true;
				this$1.parsePropertyName(prop, refDestructuringErrors);
			} else {
				isAsync = false;
			}
			this$1.parsePropertyValue(
				prop,
				isPattern,
				isGenerator,
				isAsync,
				startPos,
				startLoc,
				refDestructuringErrors
			);
			this$1.checkPropClash(prop, propHash);
			node.properties.push(this$1.finishNode(prop, 'Property'));
		}
		return this.finishNode(
			node,
			isPattern ? 'ObjectPattern' : 'ObjectExpression'
		);
	};

	pp$3.parsePropertyValue = function (
		prop,
		isPattern,
		isGenerator,
		isAsync,
		startPos,
		startLoc,
		refDestructuringErrors
	) {
		if ((isGenerator || isAsync) && this.type === types.colon) {
			this.unexpected();
		}

		if (this.eat(types.colon)) {
			prop.value = isPattern
				? this.parseMaybeDefault(this.start, this.startLoc)
				: this.parseMaybeAssign(false, refDestructuringErrors);
			prop.kind = 'init';
		} else if (
			this.options.ecmaVersion >= 6 &&
			this.type === types.parenL
		) {
			if (isPattern) {
				this.unexpected();
			}
			prop.kind = 'init';
			prop.method = true;
			prop.value = this.parseMethod(isGenerator, isAsync);
		} else if (
			this.options.ecmaVersion >= 5 &&
			!prop.computed &&
			prop.key.type === 'Identifier' &&
			(prop.key.name === 'get' || prop.key.name === 'set') &&
			this.type != types.comma &&
			this.type != types.braceR
		) {
			if (isGenerator || isAsync || isPattern) {
				this.unexpected();
			}
			prop.kind = prop.key.name;
			this.parsePropertyName(prop);
			prop.value = this.parseMethod(false);
			var paramCount = prop.kind === 'get' ? 0 : 1;
			if (prop.value.params.length !== paramCount) {
				var start = prop.value.start;
				if (prop.kind === 'get') {
					this.raiseRecoverable(
						start,
						'getter should have no params'
					);
				} else {
					this.raiseRecoverable(
						start,
						'setter should have exactly one param'
					);
				}
			} else {
				if (
					prop.kind === 'set' &&
					prop.value.params[0].type === 'RestElement'
				) {
					this.raiseRecoverable(
						prop.value.params[0].start,
						'Setter cannot use rest params'
					);
				}
			}
		} else if (
			this.options.ecmaVersion >= 6 &&
			!prop.computed &&
			prop.key.type === 'Identifier'
		) {
			this.checkUnreserved(prop.key);
			prop.kind = 'init';
			if (isPattern) {
				prop.value = this.parseMaybeDefault(
					startPos,
					startLoc,
					prop.key
				);
			} else if (this.type === types.eq && refDestructuringErrors) {
				if (refDestructuringErrors.shorthandAssign < 0) {
					refDestructuringErrors.shorthandAssign = this.start;
				}
				prop.value = this.parseMaybeDefault(
					startPos,
					startLoc,
					prop.key
				);
			} else {
				prop.value = prop.key;
			}
			prop.shorthand = true;
		} else {
			this.unexpected();
		}
	};

	pp$3.parsePropertyName = function (prop) {
		if (this.options.ecmaVersion >= 6) {
			if (this.eat(types.bracketL)) {
				prop.computed = true;
				prop.key = this.parseMaybeAssign();
				this.expect(types.bracketR);
				return prop.key;
			} else {
				prop.computed = false;
			}
		}
		return (prop.key =
			this.type === types.num || this.type === types.string
				? this.parseExprAtom()
				: this.parseIdent(true));
	};

	// Initialize empty function node.

	pp$3.initFunction = function (node) {
		node.id = null;
		if (this.options.ecmaVersion >= 6) {
			node.generator = false;
			node.expression = false;
		}
		if (this.options.ecmaVersion >= 8) {
			node.async = false;
		}
	};

	// Parse object or class method.

	pp$3.parseMethod = function (isGenerator, isAsync) {
		var node = this.startNode(),
			oldInGen = this.inGenerator,
			oldInAsync = this.inAsync,
			oldYieldPos = this.yieldPos,
			oldAwaitPos = this.awaitPos,
			oldInFunc = this.inFunction;

		this.initFunction(node);
		if (this.options.ecmaVersion >= 6) {
			node.generator = isGenerator;
		}
		if (this.options.ecmaVersion >= 8) {
			node.async = !!isAsync;
		}

		this.inGenerator = node.generator;
		this.inAsync = node.async;
		this.yieldPos = 0;
		this.awaitPos = 0;
		this.inFunction = true;
		this.enterFunctionScope();

		this.expect(types.parenL);
		node.params = this.parseBindingList(
			types.parenR,
			false,
			this.options.ecmaVersion >= 8
		);
		this.checkYieldAwaitInDefaultParams();
		this.parseFunctionBody(node, false);

		this.inGenerator = oldInGen;
		this.inAsync = oldInAsync;
		this.yieldPos = oldYieldPos;
		this.awaitPos = oldAwaitPos;
		this.inFunction = oldInFunc;
		return this.finishNode(node, 'FunctionExpression');
	};

	// Parse arrow function expression with given parameters.

	pp$3.parseArrowExpression = function (node, params, isAsync) {
		var oldInGen = this.inGenerator,
			oldInAsync = this.inAsync,
			oldYieldPos = this.yieldPos,
			oldAwaitPos = this.awaitPos,
			oldInFunc = this.inFunction;

		this.enterFunctionScope();
		this.initFunction(node);
		if (this.options.ecmaVersion >= 8) {
			node.async = !!isAsync;
		}

		this.inGenerator = false;
		this.inAsync = node.async;
		this.yieldPos = 0;
		this.awaitPos = 0;
		this.inFunction = true;

		node.params = this.toAssignableList(params, true);
		this.parseFunctionBody(node, true);

		this.inGenerator = oldInGen;
		this.inAsync = oldInAsync;
		this.yieldPos = oldYieldPos;
		this.awaitPos = oldAwaitPos;
		this.inFunction = oldInFunc;
		return this.finishNode(node, 'ArrowFunctionExpression');
	};

	// Parse function body and check parameters.

	pp$3.parseFunctionBody = function (node, isArrowFunction) {
		var isExpression = isArrowFunction && this.type !== types.braceL;
		var oldStrict = this.strict,
			useStrict = false;

		if (isExpression) {
			node.body = this.parseMaybeAssign();
			node.expression = true;
			this.checkParams(node, false);
		} else {
			var nonSimple =
				this.options.ecmaVersion >= 7 &&
				!this.isSimpleParamList(node.params);
			if (!oldStrict || nonSimple) {
				useStrict = this.strictDirective(this.end);
				// If this is a strict mode function, verify that argument names
				// are not repeated, and it does not try to bind the words `eval`
				// or `arguments`.
				if (useStrict && nonSimple) {
					this.raiseRecoverable(
						node.start,
						"Illegal 'use strict' directive in function with non-simple parameter list"
					);
				}
			}
			// Start a new scope with regard to labels and the `inFunction`
			// flag (restore them to their old value afterwards).
			var oldLabels = this.labels;
			this.labels = [];
			if (useStrict) {
				this.strict = true;
			}

			// Add the params to varDeclaredNames to ensure that an error is thrown
			// if a let/const declaration in the function clashes with one of the params.
			this.checkParams(
				node,
				!oldStrict &&
					!useStrict &&
					!isArrowFunction &&
					this.isSimpleParamList(node.params)
			);
			node.body = this.parseBlock(false);
			node.expression = false;
			this.labels = oldLabels;
		}
		this.exitFunctionScope();

		if (this.strict && node.id) {
			// Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
			this.checkLVal(node.id, 'none');
		}
		this.strict = oldStrict;
	};

	pp$3.isSimpleParamList = function (params) {
		for (var i = 0, list = params; i < list.length; i += 1) {
			var param = list[i];

			if (param.type !== 'Identifier') {
				return false;
			}
		}
		return true;
	};

	// Checks function params for various disallowed patterns such as using "eval"
	// or "arguments" and duplicate parameters.

	pp$3.checkParams = function (node, allowDuplicates) {
		var this$1 = this;

		var nameHash = {};
		for (var i = 0, list = node.params; i < list.length; i += 1) {
			var param = list[i];

			this$1.checkLVal(param, 'var', allowDuplicates ? null : nameHash);
		}
	};

	// Parses a comma-separated list of expressions, and returns them as
	// an array. `close` is the token type that ends the list, and
	// `allowEmpty` can be turned on to allow subsequent commas with
	// nothing in between them to be parsed as `null` (which is needed
	// for array literals).

	pp$3.parseExprList = function (
		close,
		allowTrailingComma,
		allowEmpty,
		refDestructuringErrors
	) {
		var this$1 = this;

		var elts = [],
			first = true;
		while (!this.eat(close)) {
			if (!first) {
				this$1.expect(types.comma);
				if (allowTrailingComma && this$1.afterTrailingComma(close)) {
					break;
				}
			} else {
				first = false;
			}

			var elt = void 0;
			if (allowEmpty && this$1.type === types.comma) {
				elt = null;
			} else if (this$1.type === types.ellipsis) {
				elt = this$1.parseSpread(refDestructuringErrors);
				if (
					refDestructuringErrors &&
					this$1.type === types.comma &&
					refDestructuringErrors.trailingComma < 0
				) {
					refDestructuringErrors.trailingComma = this$1.start;
				}
			} else {
				elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
			}
			elts.push(elt);
		}
		return elts;
	};

	// Parse the next token as an identifier. If `liberal` is true (used
	// when parsing properties), it will also convert keywords into
	// identifiers.

	pp$3.checkUnreserved = function (ref) {
		var start = ref.start;
		var end = ref.end;
		var name = ref.name;

		if (this.inGenerator && name === 'yield') {
			this.raiseRecoverable(
				start,
				"Can not use 'yield' as identifier inside a generator"
			);
		}
		if (this.inAsync && name === 'await') {
			this.raiseRecoverable(
				start,
				"Can not use 'await' as identifier inside an async function"
			);
		}
		if (this.isKeyword(name)) {
			this.raise(start, "Unexpected keyword '" + name + "'");
		}
		if (
			this.options.ecmaVersion < 6 &&
			this.input.slice(start, end).indexOf('\\') != -1
		) {
			return;
		}
		var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
		if (re.test(name)) {
			this.raiseRecoverable(
				start,
				"The keyword '" + name + "' is reserved"
			);
		}
	};

	pp$3.parseIdent = function (liberal, isBinding) {
		var node = this.startNode();
		if (liberal && this.options.allowReserved == 'never') {
			liberal = false;
		}
		if (this.type === types.name) {
			node.name = this.value;
		} else if (this.type.keyword) {
			node.name = this.type.keyword;
		} else {
			this.unexpected();
		}
		this.next();
		this.finishNode(node, 'Identifier');
		if (!liberal) {
			this.checkUnreserved(node);
		}
		return node;
	};

	// Parses yield expression inside generator.

	pp$3.parseYield = function () {
		if (!this.yieldPos) {
			this.yieldPos = this.start;
		}

		var node = this.startNode();
		this.next();
		if (
			this.type == types.semi ||
			this.canInsertSemicolon() ||
			(this.type != types.star && !this.type.startsExpr)
		) {
			node.delegate = false;
			node.argument = null;
		} else {
			node.delegate = this.eat(types.star);
			node.argument = this.parseMaybeAssign();
		}
		return this.finishNode(node, 'YieldExpression');
	};

	pp$3.parseAwait = function () {
		if (!this.awaitPos) {
			this.awaitPos = this.start;
		}

		var node = this.startNode();
		this.next();
		node.argument = this.parseMaybeUnary(null, true);
		return this.finishNode(node, 'AwaitExpression');
	};

	var pp$4 = Parser.prototype;

	// This function is used to raise exceptions on parse errors. It
	// takes an offset integer (into the current `input`) to indicate
	// the location of the error, attaches the position to the end
	// of the error message, and then raises a `SyntaxError` with that
	// message.

	pp$4.raise = function (pos, message) {
		var loc = getLineInfo(this.input, pos);
		message += ' (' + loc.line + ':' + loc.column + ')';
		var err = new SyntaxError(message);
		err.pos = pos;
		err.loc = loc;
		err.raisedAt = this.pos;
		throw err;
	};

	pp$4.raiseRecoverable = pp$4.raise;

	pp$4.curPosition = function () {
		if (this.options.locations) {
			return new Position(this.curLine, this.pos - this.lineStart);
		}
	};

	var pp$5 = Parser.prototype;

	// Object.assign polyfill
	var assign =
		Object.assign ||
		function (target) {
			var arguments$1 = arguments;

			var sources = [],
				len = arguments.length - 1;
			while (len-- > 0) {
				sources[len] = arguments$1[len + 1];
			}

			for (var i = 0, list = sources; i < list.length; i += 1) {
				var source = list[i];

				for (var key in source) {
					if (has(source, key)) {
						target[key] = source[key];
					}
				}
			}
			return target;
		};

	// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

	pp$5.enterFunctionScope = function () {
		// var: a hash of var-declared names in the current lexical scope
		// lexical: a hash of lexically-declared names in the current lexical scope
		// childVar: a hash of var-declared names in all child lexical scopes of the current lexical scope (within the current function scope)
		// parentLexical: a hash of lexically-declared names in all parent lexical scopes of the current lexical scope (within the current function scope)
		this.scopeStack.push({
			var: {},
			lexical: {},
			childVar: {},
			parentLexical: {},
		});
	};

	pp$5.exitFunctionScope = function () {
		this.scopeStack.pop();
	};

	pp$5.enterLexicalScope = function () {
		var parentScope = this.scopeStack[this.scopeStack.length - 1];
		var childScope = {
			var: {},
			lexical: {},
			childVar: {},
			parentLexical: {},
		};

		this.scopeStack.push(childScope);
		assign(
			childScope.parentLexical,
			parentScope.lexical,
			parentScope.parentLexical
		);
	};

	pp$5.exitLexicalScope = function () {
		var childScope = this.scopeStack.pop();
		var parentScope = this.scopeStack[this.scopeStack.length - 1];

		assign(parentScope.childVar, childScope.var, childScope.childVar);
	};

	/**
	 * A name can be declared with `var` if there are no variables with the same name declared with `let`/`const`
	 * in the current lexical scope or any of the parent lexical scopes in this function.
	 */
	pp$5.canDeclareVarName = function (name) {
		var currentScope = this.scopeStack[this.scopeStack.length - 1];

		return (
			!has(currentScope.lexical, name) &&
			!has(currentScope.parentLexical, name)
		);
	};

	/**
	 * A name can be declared with `let`/`const` if there are no variables with the same name declared with `let`/`const`
	 * in the current scope, and there are no variables with the same name declared with `var` in the current scope or in
	 * any child lexical scopes in this function.
	 */
	pp$5.canDeclareLexicalName = function (name) {
		var currentScope = this.scopeStack[this.scopeStack.length - 1];

		return (
			!has(currentScope.lexical, name) &&
			!has(currentScope.var, name) &&
			!has(currentScope.childVar, name)
		);
	};

	pp$5.declareVarName = function (name) {
		this.scopeStack[this.scopeStack.length - 1].var[name] = true;
	};

	pp$5.declareLexicalName = function (name) {
		this.scopeStack[this.scopeStack.length - 1].lexical[name] = true;
	};

	var Node = function Node(parser, pos, loc) {
		this.type = '';
		this.start = pos;
		this.end = 0;
		if (parser.options.locations) {
			this.loc = new SourceLocation(parser, loc);
		}
		if (parser.options.directSourceFile) {
			this.sourceFile = parser.options.directSourceFile;
		}
		if (parser.options.ranges) {
			this.range = [pos, 0];
		}
	};

	// Start an AST node, attaching a start offset.

	var pp$6 = Parser.prototype;

	pp$6.startNode = function () {
		return new Node(this, this.start, this.startLoc);
	};

	pp$6.startNodeAt = function (pos, loc) {
		return new Node(this, pos, loc);
	};

	// Finish an AST node, adding `type` and `end` properties.

	function finishNodeAt(node, type, pos, loc) {
		node.type = type;
		node.end = pos;
		if (this.options.locations) {
			node.loc.end = loc;
		}
		if (this.options.ranges) {
			node.range[1] = pos;
		}
		return node;
	}

	pp$6.finishNode = function (node, type) {
		return finishNodeAt.call(
			this,
			node,
			type,
			this.lastTokEnd,
			this.lastTokEndLoc
		);
	};

	// Finish node at given position

	pp$6.finishNodeAt = function (node, type, pos, loc) {
		return finishNodeAt.call(this, node, type, pos, loc);
	};

	// The algorithm used to determine whether a regexp can appear at a
	// given point in the program is loosely based on sweet.js' approach.
	// See https://github.com/mozilla/sweet.js/wiki/design

	var TokContext = function TokContext(
		token,
		isExpr,
		preserveSpace,
		override,
		generator
	) {
		this.token = token;
		this.isExpr = !!isExpr;
		this.preserveSpace = !!preserveSpace;
		this.override = override;
		this.generator = !!generator;
	};

	var types$1 = {
		b_stat: new TokContext('{', false),
		b_expr: new TokContext('{', true),
		b_tmpl: new TokContext('${', false),
		p_stat: new TokContext('(', false),
		p_expr: new TokContext('(', true),
		q_tmpl: new TokContext('`', true, true, function (p) {
			return p.tryReadTemplateToken();
		}),
		f_stat: new TokContext('function', false),
		f_expr: new TokContext('function', true),
		f_expr_gen: new TokContext('function', true, false, null, true),
		f_gen: new TokContext('function', false, false, null, true),
	};

	var pp$7 = Parser.prototype;

	pp$7.initialContext = function () {
		return [types$1.b_stat];
	};

	pp$7.braceIsBlock = function (prevType) {
		var parent = this.curContext();
		if (parent === types$1.f_expr || parent === types$1.f_stat) {
			return true;
		}
		if (
			prevType === types.colon &&
			(parent === types$1.b_stat || parent === types$1.b_expr)
		) {
			return !parent.isExpr;
		}

		// The check for `tt.name && exprAllowed` detects whether we are
		// after a `yield` or `of` construct. See the `updateContext` for
		// `tt.name`.
		if (
			prevType === types._return ||
			(prevType == types.name && this.exprAllowed)
		) {
			return lineBreak.test(
				this.input.slice(this.lastTokEnd, this.start)
			);
		}
		if (
			prevType === types._else ||
			prevType === types.semi ||
			prevType === types.eof ||
			prevType === types.parenR ||
			prevType == types.arrow
		) {
			return true;
		}
		if (prevType == types.braceL) {
			return parent === types$1.b_stat;
		}
		if (prevType == types._var || prevType == types.name) {
			return false;
		}
		return !this.exprAllowed;
	};

	pp$7.inGeneratorContext = function () {
		var this$1 = this;

		for (var i = this.context.length - 1; i >= 1; i--) {
			var context = this$1.context[i];
			if (context.token === 'function') {
				return context.generator;
			}
		}
		return false;
	};

	pp$7.updateContext = function (prevType) {
		var update,
			type = this.type;
		if (type.keyword && prevType == types.dot) {
			this.exprAllowed = false;
		} else if ((update = type.updateContext)) {
			update.call(this, prevType);
		} else {
			this.exprAllowed = type.beforeExpr;
		}
	};

	// Token-specific context update code

	types.parenR.updateContext = types.braceR.updateContext = function () {
		if (this.context.length == 1) {
			this.exprAllowed = true;
			return;
		}
		var out = this.context.pop();
		if (out === types$1.b_stat && this.curContext().token === 'function') {
			out = this.context.pop();
		}
		this.exprAllowed = !out.isExpr;
	};

	types.braceL.updateContext = function (prevType) {
		this.context.push(
			this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr
		);
		this.exprAllowed = true;
	};

	types.dollarBraceL.updateContext = function () {
		this.context.push(types$1.b_tmpl);
		this.exprAllowed = true;
	};

	types.parenL.updateContext = function (prevType) {
		var statementParens =
			prevType === types._if ||
			prevType === types._for ||
			prevType === types._with ||
			prevType === types._while;
		this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
		this.exprAllowed = true;
	};

	types.incDec.updateContext = function () {
		// tokExprAllowed stays unchanged
	};

	types._function.updateContext = types._class.updateContext = function (
		prevType
	) {
		if (
			prevType.beforeExpr &&
			prevType !== types.semi &&
			prevType !== types._else &&
			!(
				(prevType === types.colon || prevType === types.braceL) &&
				this.curContext() === types$1.b_stat
			)
		) {
			this.context.push(types$1.f_expr);
		} else {
			this.context.push(types$1.f_stat);
		}
		this.exprAllowed = false;
	};

	types.backQuote.updateContext = function () {
		if (this.curContext() === types$1.q_tmpl) {
			this.context.pop();
		} else {
			this.context.push(types$1.q_tmpl);
		}
		this.exprAllowed = false;
	};

	types.star.updateContext = function (prevType) {
		if (prevType == types._function) {
			var index = this.context.length - 1;
			if (this.context[index] === types$1.f_expr) {
				this.context[index] = types$1.f_expr_gen;
			} else {
				this.context[index] = types$1.f_gen;
			}
		}
		this.exprAllowed = true;
	};

	types.name.updateContext = function (prevType) {
		var allowed = false;
		if (this.options.ecmaVersion >= 6) {
			if (
				(this.value == 'of' && !this.exprAllowed) ||
				(this.value == 'yield' && this.inGeneratorContext())
			) {
				allowed = true;
			}
		}
		this.exprAllowed = allowed;
	};

	// Object type used to represent tokens. Note that normally, tokens
	// simply exist as properties on the parser object. This is only
	// used for the onToken callback and the external tokenizer.

	var Token = function Token(p) {
		this.type = p.type;
		this.value = p.value;
		this.start = p.start;
		this.end = p.end;
		if (p.options.locations) {
			this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
		}
		if (p.options.ranges) {
			this.range = [p.start, p.end];
		}
	};

	// ## Tokenizer

	var pp$8 = Parser.prototype;

	// Are we running under Rhino?
	var isRhino =
		typeof Packages == 'object' &&
		Object.prototype.toString.call(Packages) == '[object JavaPackage]';

	// Move to the next token

	pp$8.next = function () {
		if (this.options.onToken) {
			this.options.onToken(new Token(this));
		}

		this.lastTokEnd = this.end;
		this.lastTokStart = this.start;
		this.lastTokEndLoc = this.endLoc;
		this.lastTokStartLoc = this.startLoc;
		this.nextToken();
	};

	pp$8.getToken = function () {
		this.next();
		return new Token(this);
	};

	// If we're in an ES6 environment, make parsers iterable
	if (typeof Symbol !== 'undefined') {
		pp$8[Symbol.iterator] = function () {
			var this$1 = this;

			return {
				next: function () {
					var token = this$1.getToken();
					return {
						done: token.type === types.eof,
						value: token,
					};
				},
			};
		};
	}

	// Toggle strict mode. Re-reads the next number or string to please
	// pedantic tests (`"use strict"; 010;` should fail).

	pp$8.curContext = function () {
		return this.context[this.context.length - 1];
	};

	// Read a single token, updating the parser object's token-related
	// properties.

	pp$8.nextToken = function () {
		var curContext = this.curContext();
		if (!curContext || !curContext.preserveSpace) {
			this.skipSpace();
		}

		this.start = this.pos;
		if (this.options.locations) {
			this.startLoc = this.curPosition();
		}
		if (this.pos >= this.input.length) {
			return this.finishToken(types.eof);
		}

		if (curContext.override) {
			return curContext.override(this);
		} else {
			this.readToken(this.fullCharCodeAtPos());
		}
	};

	pp$8.readToken = function (code) {
		// Identifier or keyword. '\uXXXX' sequences are allowed in
		// identifiers, so '\' also dispatches to that.
		if (
			isIdentifierStart(code, this.options.ecmaVersion >= 6) ||
			code === 92 /* '\' */
		) {
			return this.readWord();
		}

		return this.getTokenFromCode(code);
	};

	pp$8.fullCharCodeAtPos = function () {
		var code = this.input.charCodeAt(this.pos);
		if (code <= 0xd7ff || code >= 0xe000) {
			return code;
		}
		var next = this.input.charCodeAt(this.pos + 1);
		return (code << 10) + next - 0x35fdc00;
	};

	pp$8.skipBlockComment = function () {
		var this$1 = this;

		var startLoc = this.options.onComment && this.curPosition();
		var start = this.pos,
			end = this.input.indexOf('*/', (this.pos += 2));
		if (end === -1) {
			this.raise(this.pos - 2, 'Unterminated comment');
		}
		this.pos = end + 2;
		if (this.options.locations) {
			lineBreakG.lastIndex = start;
			var match;
			while (
				(match = lineBreakG.exec(this.input)) &&
				match.index < this.pos
			) {
				++this$1.curLine;
				this$1.lineStart = match.index + match[0].length;
			}
		}
		if (this.options.onComment) {
			this.options.onComment(
				true,
				this.input.slice(start + 2, end),
				start,
				this.pos,
				startLoc,
				this.curPosition()
			);
		}
	};

	pp$8.skipLineComment = function (startSkip) {
		var this$1 = this;

		var start = this.pos;
		var startLoc = this.options.onComment && this.curPosition();
		var ch = this.input.charCodeAt((this.pos += startSkip));
		while (this.pos < this.input.length && !isNewLine(ch)) {
			ch = this$1.input.charCodeAt(++this$1.pos);
		}
		if (this.options.onComment) {
			this.options.onComment(
				false,
				this.input.slice(start + startSkip, this.pos),
				start,
				this.pos,
				startLoc,
				this.curPosition()
			);
		}
	};

	// Called at the start of the parse and after every token. Skips
	// whitespace and comments, and.

	pp$8.skipSpace = function () {
		var this$1 = this;

		loop: while (this.pos < this.input.length) {
			var ch = this$1.input.charCodeAt(this$1.pos);
			switch (ch) {
				case 32:
				case 160: // ' '
					++this$1.pos;
					break;
				case 13:
					if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
						++this$1.pos;
					}
				case 10:
				case 8232:
				case 8233:
					++this$1.pos;
					if (this$1.options.locations) {
						++this$1.curLine;
						this$1.lineStart = this$1.pos;
					}
					break;
				case 47: // '/'
					switch (this$1.input.charCodeAt(this$1.pos + 1)) {
						case 42: // '*'
							this$1.skipBlockComment();
							break;
						case 47:
							this$1.skipLineComment(2);
							break;
						default:
							break loop;
					}
					break;
				default:
					if (
						(ch > 8 && ch < 14) ||
						(ch >= 5760 &&
							nonASCIIwhitespace.test(String.fromCharCode(ch)))
					) {
						++this$1.pos;
					} else {
						break loop;
					}
			}
		}
	};

	// Called at the end of every token. Sets `end`, `val`, and
	// maintains `context` and `exprAllowed`, and skips the space after
	// the token, so that the next one's `start` will point at the
	// right position.

	pp$8.finishToken = function (type, val) {
		this.end = this.pos;
		if (this.options.locations) {
			this.endLoc = this.curPosition();
		}
		var prevType = this.type;
		this.type = type;
		this.value = val;

		this.updateContext(prevType);
	};

	// ### Token reading

	// This is the function that is called to fetch the next token. It
	// is somewhat obscure, because it works in character codes rather
	// than characters, and because operator parsing has been inlined
	// into it.
	//
	// All in the name of speed.
	//
	pp$8.readToken_dot = function () {
		var next = this.input.charCodeAt(this.pos + 1);
		if (next >= 48 && next <= 57) {
			return this.readNumber(true);
		}
		var next2 = this.input.charCodeAt(this.pos + 2);
		if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
			// 46 = dot '.'
			this.pos += 3;
			return this.finishToken(types.ellipsis);
		} else {
			++this.pos;
			return this.finishToken(types.dot);
		}
	};

	pp$8.readToken_slash = function () {
		// '/'
		var next = this.input.charCodeAt(this.pos + 1);
		if (this.exprAllowed) {
			++this.pos;
			return this.readRegexp();
		}
		if (next === 61) {
			return this.finishOp(types.assign, 2);
		}
		return this.finishOp(types.slash, 1);
	};

	pp$8.readToken_mult_modulo_exp = function (code) {
		// '%*'
		var next = this.input.charCodeAt(this.pos + 1);
		var size = 1;
		var tokentype = code === 42 ? types.star : types.modulo;

		// exponentiation operator ** and **=
		if (this.options.ecmaVersion >= 7 && next === 42) {
			++size;
			tokentype = types.starstar;
			next = this.input.charCodeAt(this.pos + 2);
		}

		if (next === 61) {
			return this.finishOp(types.assign, size + 1);
		}
		return this.finishOp(tokentype, size);
	};

	pp$8.readToken_pipe_amp = function (code) {
		// '|&'
		var next = this.input.charCodeAt(this.pos + 1);
		if (next === code) {
			return this.finishOp(
				code === 124 ? types.logicalOR : types.logicalAND,
				2
			);
		}
		if (next === 61) {
			return this.finishOp(types.assign, 2);
		}
		return this.finishOp(
			code === 124 ? types.bitwiseOR : types.bitwiseAND,
			1
		);
	};

	pp$8.readToken_caret = function () {
		// '^'
		var next = this.input.charCodeAt(this.pos + 1);
		if (next === 61) {
			return this.finishOp(types.assign, 2);
		}
		return this.finishOp(types.bitwiseXOR, 1);
	};

	pp$8.readToken_plus_min = function (code) {
		// '+-'
		var next = this.input.charCodeAt(this.pos + 1);
		if (next === code) {
			if (
				next == 45 &&
				this.input.charCodeAt(this.pos + 2) == 62 &&
				(this.lastTokEnd === 0 ||
					lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))
			) {
				// A `-->` line comment
				this.skipLineComment(3);
				this.skipSpace();
				return this.nextToken();
			}
			return this.finishOp(types.incDec, 2);
		}
		if (next === 61) {
			return this.finishOp(types.assign, 2);
		}
		return this.finishOp(types.plusMin, 1);
	};

	pp$8.readToken_lt_gt = function (code) {
		// '<>'
		var next = this.input.charCodeAt(this.pos + 1);
		var size = 1;
		if (next === code) {
			size =
				code === 62 && this.input.charCodeAt(this.pos + 2) === 62
					? 3
					: 2;
			if (this.input.charCodeAt(this.pos + size) === 61) {
				return this.finishOp(types.assign, size + 1);
			}
			return this.finishOp(types.bitShift, size);
		}
		if (
			next == 33 &&
			code == 60 &&
			this.input.charCodeAt(this.pos + 2) == 45 &&
			this.input.charCodeAt(this.pos + 3) == 45
		) {
			if (this.inModule) {
				this.unexpected();
			}
			// `<!--`, an XML-style comment that should be interpreted as a line comment
			this.skipLineComment(4);
			this.skipSpace();
			return this.nextToken();
		}
		if (next === 61) {
			size = 2;
		}
		return this.finishOp(types.relational, size);
	};

	pp$8.readToken_eq_excl = function (code) {
		// '=!'
		var next = this.input.charCodeAt(this.pos + 1);
		if (next === 61) {
			return this.finishOp(
				types.equality,
				this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2
			);
		}
		if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
			// '=>'
			this.pos += 2;
			return this.finishToken(types.arrow);
		}
		return this.finishOp(code === 61 ? types.eq : types.prefix, 1);
	};

	pp$8.getTokenFromCode = function (code) {
		switch (code) {
			// The interpretation of a dot depends on whether it is followed
			// by a digit or another two dots.
			case 46: // '.'
				return this.readToken_dot();

			// Punctuation tokens.
			case 40:
				++this.pos;
				return this.finishToken(types.parenL);
			case 41:
				++this.pos;
				return this.finishToken(types.parenR);
			case 59:
				++this.pos;
				return this.finishToken(types.semi);
			case 44:
				++this.pos;
				return this.finishToken(types.comma);
			case 91:
				++this.pos;
				return this.finishToken(types.bracketL);
			case 93:
				++this.pos;
				return this.finishToken(types.bracketR);
			case 123:
				++this.pos;
				return this.finishToken(types.braceL);
			case 125:
				++this.pos;
				return this.finishToken(types.braceR);
			case 58:
				++this.pos;
				return this.finishToken(types.colon);
			case 63:
				++this.pos;
				return this.finishToken(types.question);

			case 96: // '`'
				if (this.options.ecmaVersion < 6) {
					break;
				}
				++this.pos;
				return this.finishToken(types.backQuote);

			case 48: // '0'
				var next = this.input.charCodeAt(this.pos + 1);
				if (next === 120 || next === 88) {
					return this.readRadixNumber(16);
				} // '0x', '0X' - hex number
				if (this.options.ecmaVersion >= 6) {
					if (next === 111 || next === 79) {
						return this.readRadixNumber(8);
					} // '0o', '0O' - octal number
					if (next === 98 || next === 66) {
						return this.readRadixNumber(2);
					} // '0b', '0B' - binary number
				}
			// Anything else beginning with a digit is an integer, octal
			// number, or float.
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57: // 1-9
				return this.readNumber(false);

			// Quotes produce strings.
			case 34:
			case 39: // '"', "'"
				return this.readString(code);

			// Operators are parsed inline in tiny state machines. '=' (61) is
			// often referred to. `finishOp` simply skips the amount of
			// characters it is given as second argument, and returns a token
			// of the type given by its first argument.

			case 47: // '/'
				return this.readToken_slash();

			case 37:
			case 42: // '%*'
				return this.readToken_mult_modulo_exp(code);

			case 124:
			case 38: // '|&'
				return this.readToken_pipe_amp(code);

			case 94: // '^'
				return this.readToken_caret();

			case 43:
			case 45: // '+-'
				return this.readToken_plus_min(code);

			case 60:
			case 62: // '<>'
				return this.readToken_lt_gt(code);

			case 61:
			case 33: // '=!'
				return this.readToken_eq_excl(code);

			case 126: // '~'
				return this.finishOp(types.prefix, 1);
		}

		this.raise(
			this.pos,
			"Unexpected character '" + codePointToString(code) + "'"
		);
	};

	pp$8.finishOp = function (type, size) {
		var str = this.input.slice(this.pos, this.pos + size);
		this.pos += size;
		return this.finishToken(type, str);
	};

	// Parse a regular expression. Some context-awareness is necessary,
	// since a '/' inside a '[]' set does not end the expression.

	function tryCreateRegexp(src, flags, throwErrorAt, parser) {
		try {
			return new RegExp(src, flags);
		} catch (e) {
			if (throwErrorAt !== undefined) {
				if (e instanceof SyntaxError) {
					parser.raise(
						throwErrorAt,
						'Error parsing regular expression: ' + e.message
					);
				}
				throw e;
			}
		}
	}

	var regexpUnicodeSupport = !!tryCreateRegexp('\uffff', 'u');

	pp$8.readRegexp = function () {
		var this$1 = this;

		var escaped,
			inClass,
			start = this.pos;
		for (;;) {
			if (this$1.pos >= this$1.input.length) {
				this$1.raise(start, 'Unterminated regular expression');
			}
			var ch = this$1.input.charAt(this$1.pos);
			if (lineBreak.test(ch)) {
				this$1.raise(start, 'Unterminated regular expression');
			}
			if (!escaped) {
				if (ch === '[') {
					inClass = true;
				} else if (ch === ']' && inClass) {
					inClass = false;
				} else if (ch === '/' && !inClass) {
					break;
				}
				escaped = ch === '\\';
			} else {
				escaped = false;
			}
			++this$1.pos;
		}
		var content = this.input.slice(start, this.pos);
		++this.pos;
		// Need to use `readWord1` because '\uXXXX' sequences are allowed
		// here (don't ask).
		var mods = this.readWord1();
		var tmp = content,
			tmpFlags = '';
		if (mods) {
			var validFlags = /^[gim]*$/;
			if (this.options.ecmaVersion >= 6) {
				validFlags = /^[gimuy]*$/;
			}
			if (!validFlags.test(mods)) {
				this.raise(start, 'Invalid regular expression flag');
			}
			if (mods.indexOf('u') >= 0) {
				if (regexpUnicodeSupport) {
					tmpFlags = 'u';
				} else {
					// Replace each astral symbol and every Unicode escape sequence that
					// possibly represents an astral symbol or a paired surrogate with a
					// single ASCII symbol to avoid throwing on regular expressions that
					// are only valid in combination with the `/u` flag.
					// Note: replacing with the ASCII symbol `x` might cause false
					// negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
					// perfectly valid pattern that is equivalent to `[a-b]`, but it would
					// be replaced by `[x-b]` which throws an error.
					tmp = tmp.replace(
						/\\u\{([0-9a-fA-F]+)\}/g,
						function (_match, code, offset) {
							code = Number('0x' + code);
							if (code > 0x10ffff) {
								this$1.raise(
									start + offset + 3,
									'Code point out of bounds'
								);
							}
							return 'x';
						}
					);
					tmp = tmp.replace(
						/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
						'x'
					);
					tmpFlags = tmpFlags.replace('u', '');
				}
			}
		}
		// Detect invalid regular expressions.
		var value = null;
		// Rhino's regular expression parser is flaky and throws uncatchable exceptions,
		// so don't do detection if we are running under Rhino
		if (!isRhino) {
			tryCreateRegexp(tmp, tmpFlags, start, this);
			// Get a regular expression object for this pattern-flag pair, or `null` in
			// case the current environment doesn't support the flags it uses.
			value = tryCreateRegexp(content, mods);
		}
		return this.finishToken(types.regexp, {
			pattern: content,
			flags: mods,
			value: value,
		});
	};

	// Read an integer in the given radix. Return null if zero digits
	// were read, the integer value otherwise. When `len` is given, this
	// will return `null` unless the integer has exactly `len` digits.

	pp$8.readInt = function (radix, len) {
		var this$1 = this;

		var start = this.pos,
			total = 0;
		for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
			var code = this$1.input.charCodeAt(this$1.pos),
				val = void 0;
			if (code >= 97) {
				val = code - 97 + 10;
			} // a
			else if (code >= 65) {
				val = code - 65 + 10;
			} // A
			else if (code >= 48 && code <= 57) {
				val = code - 48;
			} // 0-9
			else {
				val = Infinity;
			}
			if (val >= radix) {
				break;
			}
			++this$1.pos;
			total = total * radix + val;
		}
		if (this.pos === start || (len != null && this.pos - start !== len)) {
			return null;
		}

		return total;
	};

	pp$8.readRadixNumber = function (radix) {
		this.pos += 2; // 0x
		var val = this.readInt(radix);
		if (val == null) {
			this.raise(this.start + 2, 'Expected number in radix ' + radix);
		}
		if (isIdentifierStart(this.fullCharCodeAtPos())) {
			this.raise(this.pos, 'Identifier directly after number');
		}
		return this.finishToken(types.num, val);
	};

	// Read an integer, octal integer, or floating-point number.

	pp$8.readNumber = function (startsWithDot) {
		var start = this.pos,
			isFloat = false,
			octal = this.input.charCodeAt(this.pos) === 48;
		if (!startsWithDot && this.readInt(10) === null) {
			this.raise(start, 'Invalid number');
		}
		if (octal && this.pos == start + 1) {
			octal = false;
		}
		var next = this.input.charCodeAt(this.pos);
		if (next === 46 && !octal) {
			// '.'
			++this.pos;
			this.readInt(10);
			isFloat = true;
			next = this.input.charCodeAt(this.pos);
		}
		if ((next === 69 || next === 101) && !octal) {
			// 'eE'
			next = this.input.charCodeAt(++this.pos);
			if (next === 43 || next === 45) {
				++this.pos;
			} // '+-'
			if (this.readInt(10) === null) {
				this.raise(start, 'Invalid number');
			}
			isFloat = true;
		}
		if (isIdentifierStart(this.fullCharCodeAtPos())) {
			this.raise(this.pos, 'Identifier directly after number');
		}

		var str = this.input.slice(start, this.pos),
			val;
		if (isFloat) {
			val = parseFloat(str);
		} else if (!octal || str.length === 1) {
			val = parseInt(str, 10);
		} else if (this.strict) {
			this.raise(start, 'Invalid number');
		} else if (/[89]/.test(str)) {
			val = parseInt(str, 10);
		} else {
			val = parseInt(str, 8);
		}
		return this.finishToken(types.num, val);
	};

	// Read a string value, interpreting backslash-escapes.

	pp$8.readCodePoint = function () {
		var ch = this.input.charCodeAt(this.pos),
			code;

		if (ch === 123) {
			// '{'
			if (this.options.ecmaVersion < 6) {
				this.unexpected();
			}
			var codePos = ++this.pos;
			code = this.readHexChar(
				this.input.indexOf('}', this.pos) - this.pos
			);
			++this.pos;
			if (code > 0x10ffff) {
				this.invalidStringToken(codePos, 'Code point out of bounds');
			}
		} else {
			code = this.readHexChar(4);
		}
		return code;
	};

	function codePointToString(code) {
		// UTF-16 Decoding
		if (code <= 0xffff) {
			return String.fromCharCode(code);
		}
		code -= 0x10000;
		return String.fromCharCode(
			(code >> 10) + 0xd800,
			(code & 1023) + 0xdc00
		);
	}

	pp$8.readString = function (quote) {
		var this$1 = this;

		var out = '',
			chunkStart = ++this.pos;
		for (;;) {
			if (this$1.pos >= this$1.input.length) {
				this$1.raise(this$1.start, 'Unterminated string constant');
			}
			var ch = this$1.input.charCodeAt(this$1.pos);
			if (ch === quote) {
				break;
			}
			if (ch === 92) {
				// '\'
				out += this$1.input.slice(chunkStart, this$1.pos);
				out += this$1.readEscapedChar(false);
				chunkStart = this$1.pos;
			} else {
				if (isNewLine(ch)) {
					this$1.raise(this$1.start, 'Unterminated string constant');
				}
				++this$1.pos;
			}
		}
		out += this.input.slice(chunkStart, this.pos++);
		return this.finishToken(types.string, out);
	};

	// Reads template string tokens.

	var INVALID_TEMPLATE_ESCAPE_ERROR = {};

	pp$8.tryReadTemplateToken = function () {
		this.inTemplateElement = true;
		try {
			this.readTmplToken();
		} catch (err) {
			if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
				this.readInvalidTemplateToken();
			} else {
				throw err;
			}
		}

		this.inTemplateElement = false;
	};

	pp$8.invalidStringToken = function (position, message) {
		if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
			throw INVALID_TEMPLATE_ESCAPE_ERROR;
		} else {
			this.raise(position, message);
		}
	};

	pp$8.readTmplToken = function () {
		var this$1 = this;

		var out = '',
			chunkStart = this.pos;
		for (;;) {
			if (this$1.pos >= this$1.input.length) {
				this$1.raise(this$1.start, 'Unterminated template');
			}
			var ch = this$1.input.charCodeAt(this$1.pos);
			if (
				ch === 96 ||
				(ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123)
			) {
				// '`', '${'
				if (
					this$1.pos === this$1.start &&
					(this$1.type === types.template ||
						this$1.type === types.invalidTemplate)
				) {
					if (ch === 36) {
						this$1.pos += 2;
						return this$1.finishToken(types.dollarBraceL);
					} else {
						++this$1.pos;
						return this$1.finishToken(types.backQuote);
					}
				}
				out += this$1.input.slice(chunkStart, this$1.pos);
				return this$1.finishToken(types.template, out);
			}
			if (ch === 92) {
				// '\'
				out += this$1.input.slice(chunkStart, this$1.pos);
				out += this$1.readEscapedChar(true);
				chunkStart = this$1.pos;
			} else if (isNewLine(ch)) {
				out += this$1.input.slice(chunkStart, this$1.pos);
				++this$1.pos;
				switch (ch) {
					case 13:
						if (this$1.input.charCodeAt(this$1.pos) === 10) {
							++this$1.pos;
						}
					case 10:
						out += '\n';
						break;
					default:
						out += String.fromCharCode(ch);
						break;
				}
				if (this$1.options.locations) {
					++this$1.curLine;
					this$1.lineStart = this$1.pos;
				}
				chunkStart = this$1.pos;
			} else {
				++this$1.pos;
			}
		}
	};

	// Reads a template token to search for the end, without validating any escape sequences
	pp$8.readInvalidTemplateToken = function () {
		var this$1 = this;

		for (; this.pos < this.input.length; this.pos++) {
			switch (this$1.input[this$1.pos]) {
				case '\\':
					++this$1.pos;
					break;

				case '$':
					if (this$1.input[this$1.pos + 1] !== '{') {
						break;
					}
				// falls through

				case '`':
					return this$1.finishToken(
						types.invalidTemplate,
						this$1.input.slice(this$1.start, this$1.pos)
					);

				// no default
			}
		}
		this.raise(this.start, 'Unterminated template');
	};

	// Used to read escaped characters

	pp$8.readEscapedChar = function (inTemplate) {
		var ch = this.input.charCodeAt(++this.pos);
		++this.pos;
		switch (ch) {
			case 110:
				return '\n'; // 'n' -> '\n'
			case 114:
				return '\r'; // 'r' -> '\r'
			case 120:
				return String.fromCharCode(this.readHexChar(2)); // 'x'
			case 117:
				return codePointToString(this.readCodePoint()); // 'u'
			case 116:
				return '\t'; // 't' -> '\t'
			case 98:
				return '\b'; // 'b' -> '\b'
			case 118:
				return '\u000b'; // 'v' -> '\u000b'
			case 102:
				return '\f'; // 'f' -> '\f'
			case 13:
				if (this.input.charCodeAt(this.pos) === 10) {
					++this.pos;
				} // '\r\n'
			case 10: // ' \n'
				if (this.options.locations) {
					this.lineStart = this.pos;
					++this.curLine;
				}
				return '';
			default:
				if (ch >= 48 && ch <= 55) {
					var octalStr = this.input
						.substr(this.pos - 1, 3)
						.match(/^[0-7]+/)[0];
					var octal = parseInt(octalStr, 8);
					if (octal > 255) {
						octalStr = octalStr.slice(0, -1);
						octal = parseInt(octalStr, 8);
					}
					if (octalStr !== '0' && (this.strict || inTemplate)) {
						this.invalidStringToken(
							this.pos - 2,
							'Octal literal in strict mode'
						);
					}
					this.pos += octalStr.length - 1;
					return String.fromCharCode(octal);
				}
				return String.fromCharCode(ch);
		}
	};

	// Used to read character escape sequences ('\x', '\u', '\U').

	pp$8.readHexChar = function (len) {
		var codePos = this.pos;
		var n = this.readInt(16, len);
		if (n === null) {
			this.invalidStringToken(codePos, 'Bad character escape sequence');
		}
		return n;
	};

	// Read an identifier, and return it as a string. Sets `this.containsEsc`
	// to whether the word contained a '\u' escape.
	//
	// Incrementally adds only escaped chars, adding other chunks as-is
	// as a micro-optimization.

	pp$8.readWord1 = function () {
		var this$1 = this;

		this.containsEsc = false;
		var word = '',
			first = true,
			chunkStart = this.pos;
		var astral = this.options.ecmaVersion >= 6;
		while (this.pos < this.input.length) {
			var ch = this$1.fullCharCodeAtPos();
			if (isIdentifierChar(ch, astral)) {
				this$1.pos += ch <= 0xffff ? 1 : 2;
			} else if (ch === 92) {
				// "\"
				this$1.containsEsc = true;
				word += this$1.input.slice(chunkStart, this$1.pos);
				var escStart = this$1.pos;
				if (this$1.input.charCodeAt(++this$1.pos) != 117) {
					// "u"
					this$1.invalidStringToken(
						this$1.pos,
						'Expecting Unicode escape sequence \\uXXXX'
					);
				}
				++this$1.pos;
				var esc = this$1.readCodePoint();
				if (
					!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)
				) {
					this$1.invalidStringToken(
						escStart,
						'Invalid Unicode escape'
					);
				}
				word += codePointToString(esc);
				chunkStart = this$1.pos;
			} else {
				break;
			}
			first = false;
		}
		return word + this.input.slice(chunkStart, this.pos);
	};

	// Read an identifier or keyword token. Will check for reserved
	// words when necessary.

	pp$8.readWord = function () {
		var word = this.readWord1();
		var type = types.name;
		if (this.keywords.test(word)) {
			if (this.containsEsc) {
				this.raiseRecoverable(
					this.start,
					'Escape sequence in keyword ' + word
				);
			}
			type = keywords$1$1[word];
		}
		return this.finishToken(type, word);
	};

	// The main exported interface (under `self.acorn` when in the
	// browser) is a `parse` function that takes a code string and
	// returns an abstract syntax tree as specified by [Mozilla parser
	// API][api].
	//
	// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

	function parse$1(input, options) {
		return new Parser(options, input).parse();
	}

	var commonjsGlobal =
		typeof window !== 'undefined'
			? window
			: typeof global !== 'undefined'
				? global
				: typeof self !== 'undefined'
					? self
					: {};

	function createCommonjsModule(fn, module) {
		return (
			(module = { exports: {} }),
			fn(module, module.exports),
			module.exports
		);
	}

	var astring = createCommonjsModule(function (module, exports) {
		(function (global, factory) {
			if (typeof undefined === 'function' && undefined.amd) {
				undefined(['exports'], factory);
			} else {
				factory(exports);
			}
		})(commonjsGlobal, function (exports) {
			'use strict';

			Object.defineProperty(exports, '__esModule', {
				value: true,
			});
			exports.generate = generate;

			function _classCallCheck(instance, Constructor) {
				if (!(instance instanceof Constructor)) {
					throw new TypeError('Cannot call a class as a function');
				}
			}

			var stringify = JSON.stringify;

			/* istanbul ignore if */
			if (!String.prototype.repeat) {
				/* istanbul ignore next */
				throw new Error(
					'String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation'
				);
			}

			/* istanbul ignore if */
			if (!String.prototype.endsWith) {
				/* istanbul ignore next */
				throw new Error(
					'String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation'
				);
			}

			var OPERATOR_PRECEDENCE = {
				'||': 3,
				'&&': 4,
				'|': 5,
				'^': 6,
				'&': 7,
				'==': 8,
				'!=': 8,
				'===': 8,
				'!==': 8,
				'<': 9,
				'>': 9,
				'<=': 9,
				'>=': 9,
				in: 9,
				instanceof: 9,
				'<<': 10,
				'>>': 10,
				'>>>': 10,
				'+': 11,
				'-': 11,
				'*': 12,
				'%': 12,
				'/': 12,
				'**': 13,

				// Enables parenthesis regardless of precedence
			};
			var NEEDS_PARENTHESES = 17;

			var EXPRESSIONS_PRECEDENCE = {
				// Definitions
				ArrayExpression: 20,
				TaggedTemplateExpression: 20,
				ThisExpression: 20,
				Identifier: 20,
				Literal: 18,
				TemplateLiteral: 20,
				Super: 20,
				SequenceExpression: 20,
				// Operations
				MemberExpression: 19,
				CallExpression: 19,
				NewExpression: 19,
				// Other definitions
				ArrowFunctionExpression: NEEDS_PARENTHESES,
				ClassExpression: NEEDS_PARENTHESES,
				FunctionExpression: NEEDS_PARENTHESES,
				ObjectExpression: NEEDS_PARENTHESES,
				// Other operations
				UpdateExpression: 16,
				UnaryExpression: 15,
				BinaryExpression: 14,
				LogicalExpression: 13,
				ConditionalExpression: 4,
				AssignmentExpression: 3,
				AwaitExpression: 2,
				YieldExpression: 2,
				RestElement: 1,
			};

			function formatSequence(state, nodes) {
				var generator = state.generator;

				state.write('(');
				if (nodes != null && nodes.length > 0) {
					generator[nodes[0].type](nodes[0], state);
					var length = nodes.length;

					for (var i = 1; i < length; i++) {
						var param = nodes[i];
						state.write(', ');
						generator[param.type](param, state);
					}
				}
				state.write(')');
			}

			function expressionNeedsParenthesis(node, parentNode, isRightHand) {
				var nodePrecedence = EXPRESSIONS_PRECEDENCE[node.type];
				if (nodePrecedence === NEEDS_PARENTHESES) {
					return true;
				}
				var parentNodePrecedence =
					EXPRESSIONS_PRECEDENCE[parentNode.type];
				if (nodePrecedence !== parentNodePrecedence) {
					// Different node types
					return nodePrecedence < parentNodePrecedence;
				}
				if (nodePrecedence !== 13 && nodePrecedence !== 14) {
					// Not a `LogicalExpression` or `BinaryExpression`
					return false;
				}
				if (node.operator === '**' && parentNode.operator === '**') {
					// Exponentiation operator has right-to-left associativity
					return !isRightHand;
				}
				if (isRightHand) {
					// Parenthesis are used if both operators have the same precedence
					return (
						OPERATOR_PRECEDENCE[node.operator] <=
						OPERATOR_PRECEDENCE[parentNode.operator]
					);
				}
				return (
					OPERATOR_PRECEDENCE[node.operator] <
					OPERATOR_PRECEDENCE[parentNode.operator]
				);
			}

			function formatBinaryExpressionPart(
				state,
				node,
				parentNode,
				isRightHand
			) {
				var generator = state.generator;

				if (expressionNeedsParenthesis(node, parentNode, isRightHand)) {
					state.write('(');
					generator[node.type](node, state);
					state.write(')');
				} else {
					generator[node.type](node, state);
				}
			}

			function reindent(state, text, indent, lineEnd) {
				/*
        Writes into `state` the `text` string reindented with the provided `indent`.
        */
				var trimmedText = text.trim();
				if (trimmedText === '') {
					return;
				}
				var lines = text.trim().split('\n');
				var length = lines.length;

				for (var i = 0; i < length; i++) {
					state.write(indent + lines[i].trim() + lineEnd);
				}
			}

			function formatComments(state, comments, indent, lineEnd) {
				var length = comments.length;

				for (var i = 0; i < length; i++) {
					var comment = comments[i];
					state.write(indent);
					if (comment.type[0] === 'L') {
						// Line comment
						state.write('// ' + comment.value.trim() + '\n');
					} else {
						// Block comment
						state.write('/*' + lineEnd);
						reindent(state, comment.value, indent, lineEnd);
						state.write(indent + '*/' + lineEnd);
					}
				}
			}

			function hasCallExpression(node) {
				/*
        Returns `true` if the provided `node` contains a call expression and `false` otherwise.
        */
				var currentNode = node;
				while (currentNode != null) {
					var _currentNode = currentNode,
						type = _currentNode.type;

					if (type[0] === 'C' && type[1] === 'a') {
						// Is CallExpression
						return true;
					} else if (
						type[0] === 'M' &&
						type[1] === 'e' &&
						type[2] === 'm'
					) {
						// Is MemberExpression
						currentNode = currentNode.object;
					} else {
						return false;
					}
				}
			}

			function formatVariableDeclaration(state, node) {
				var generator = state.generator;
				var declarations = node.declarations;

				state.write(node.kind + ' ');
				var length = declarations.length;

				if (length > 0) {
					generator.VariableDeclarator(declarations[0], state);
					for (var i = 1; i < length; i++) {
						state.write(', ');
						generator.VariableDeclarator(declarations[i], state);
					}
				}
			}

			var ForInStatement = void 0,
				FunctionDeclaration = void 0,
				RestElement = void 0,
				BinaryExpression = void 0,
				ArrayExpression = void 0,
				BlockStatement = void 0;

			var baseGenerator = (exports.baseGenerator = {
				Program: function Program(node, state) {
					var this$1 = this;

					var indent = state.indent.repeat(state.indentLevel);
					var lineEnd = state.lineEnd,
						writeComments = state.writeComments;

					if (writeComments && node.comments != null) {
						formatComments(state, node.comments, indent, lineEnd);
					}
					var statements = node.body;
					var length = statements.length;

					for (var i = 0; i < length; i++) {
						var statement = statements[i];
						if (writeComments && statement.comments != null) {
							formatComments(
								state,
								statement.comments,
								indent,
								lineEnd
							);
						}
						state.write(indent);
						this$1[statement.type](statement, state);
						state.write(lineEnd);
					}
					if (writeComments && node.trailingComments != null) {
						formatComments(
							state,
							node.trailingComments,
							indent,
							lineEnd
						);
					}
				},

				BlockStatement: (BlockStatement = function BlockStatement(
					node,
					state
				) {
					var this$1 = this;

					var indent = state.indent.repeat(state.indentLevel++);
					var lineEnd = state.lineEnd,
						writeComments = state.writeComments;

					var statementIndent = indent + state.indent;
					state.write('{');
					var statements = node.body;
					if (statements != null && statements.length > 0) {
						state.write(lineEnd);
						if (writeComments && node.comments != null) {
							formatComments(
								state,
								node.comments,
								statementIndent,
								lineEnd
							);
						}
						var length = statements.length;

						for (var i = 0; i < length; i++) {
							var statement = statements[i];
							if (writeComments && statement.comments != null) {
								formatComments(
									state,
									statement.comments,
									statementIndent,
									lineEnd
								);
							}
							state.write(statementIndent);
							this$1[statement.type](statement, state);
							state.write(lineEnd);
						}
						state.write(indent);
					} else {
						if (writeComments && node.comments != null) {
							state.write(lineEnd);
							formatComments(
								state,
								node.comments,
								statementIndent,
								lineEnd
							);
							state.write(indent);
						}
					}
					if (writeComments && node.trailingComments != null) {
						formatComments(
							state,
							node.trailingComments,
							statementIndent,
							lineEnd
						);
					}
					state.write('}');
					state.indentLevel--;
				}),
				ClassBody: BlockStatement,
				EmptyStatement: function EmptyStatement(node, state) {
					state.write(';');
				},
				ExpressionStatement: function ExpressionStatement(node, state) {
					var precedence =
						EXPRESSIONS_PRECEDENCE[node.expression.type];
					if (
						precedence === NEEDS_PARENTHESES ||
						(precedence === 3 &&
							node.expression.left.type[0] === 'O')
					) {
						// Should always have parentheses or is an AssignmentExpression to an ObjectPattern
						state.write('(');
						this[node.expression.type](node.expression, state);
						state.write(')');
					} else {
						this[node.expression.type](node.expression, state);
					}
					state.write(';');
				},
				IfStatement: function IfStatement(node, state) {
					state.write('if (');
					this[node.test.type](node.test, state);
					state.write(') ');
					this[node.consequent.type](node.consequent, state);
					if (node.alternate != null) {
						state.write(' else ');
						this[node.alternate.type](node.alternate, state);
					}
				},
				LabeledStatement: function LabeledStatement(node, state) {
					this[node.label.type](node.label, state);
					state.write(': ');
					this[node.body.type](node.body, state);
				},
				BreakStatement: function BreakStatement(node, state) {
					state.write('break');
					if (node.label != null) {
						state.write(' ');
						this[node.label.type](node.label, state);
					}
					state.write(';');
				},
				ContinueStatement: function ContinueStatement(node, state) {
					state.write('continue');
					if (node.label != null) {
						state.write(' ');
						this[node.label.type](node.label, state);
					}
					state.write(';');
				},
				WithStatement: function WithStatement(node, state) {
					state.write('with (');
					this[node.object.type](node.object, state);
					state.write(') ');
					this[node.body.type](node.body, state);
				},
				SwitchStatement: function SwitchStatement(node, state) {
					var this$1 = this;

					var indent = state.indent.repeat(state.indentLevel++);
					var lineEnd = state.lineEnd,
						writeComments = state.writeComments;

					state.indentLevel++;
					var caseIndent = indent + state.indent;
					var statementIndent = caseIndent + state.indent;
					state.write('switch (');
					this[node.discriminant.type](node.discriminant, state);
					state.write(') {' + lineEnd);
					var occurences = node.cases;
					var occurencesCount = occurences.length;

					for (var i = 0; i < occurencesCount; i++) {
						var occurence = occurences[i];
						if (writeComments && occurence.comments != null) {
							formatComments(
								state,
								occurence.comments,
								caseIndent,
								lineEnd
							);
						}
						if (occurence.test) {
							state.write(caseIndent + 'case ');
							this$1[occurence.test.type](occurence.test, state);
							state.write(':' + lineEnd);
						} else {
							state.write(caseIndent + 'default:' + lineEnd);
						}
						var consequent = occurence.consequent;
						var consequentCount = consequent.length;

						for (var _i = 0; _i < consequentCount; _i++) {
							var statement = consequent[_i];
							if (writeComments && statement.comments != null) {
								formatComments(
									state,
									statement.comments,
									statementIndent,
									lineEnd
								);
							}
							state.write(statementIndent);
							this$1[statement.type](statement, state);
							state.write(lineEnd);
						}
					}
					state.indentLevel -= 2;
					state.write(indent + '}');
				},
				ReturnStatement: function ReturnStatement(node, state) {
					state.write('return');
					if (node.argument) {
						state.write(' ');
						this[node.argument.type](node.argument, state);
					}
					state.write(';');
				},
				ThrowStatement: function ThrowStatement(node, state) {
					state.write('throw ');
					this[node.argument.type](node.argument, state);
					state.write(';');
				},
				TryStatement: function TryStatement(node, state) {
					state.write('try ');
					this[node.block.type](node.block, state);
					if (node.handler) {
						var handler = node.handler;

						state.write(' catch (');
						this[handler.param.type](handler.param, state);
						state.write(') ');
						this[handler.body.type](handler.body, state);
					}
					if (node.finalizer) {
						state.write(' finally ');
						this[node.finalizer.type](node.finalizer, state);
					}
				},
				WhileStatement: function WhileStatement(node, state) {
					state.write('while (');
					this[node.test.type](node.test, state);
					state.write(') ');
					this[node.body.type](node.body, state);
				},
				DoWhileStatement: function DoWhileStatement(node, state) {
					state.write('do ');
					this[node.body.type](node.body, state);
					state.write(' while (');
					this[node.test.type](node.test, state);
					state.write(');');
				},
				ForStatement: function ForStatement(node, state) {
					state.write('for (');
					if (node.init != null) {
						var init = node.init;

						if (init.type[0] === 'V') {
							formatVariableDeclaration(state, init);
						} else {
							this[init.type](init, state);
						}
					}
					state.write('; ');
					if (node.test) {
						this[node.test.type](node.test, state);
					}
					state.write('; ');
					if (node.update) {
						this[node.update.type](node.update, state);
					}
					state.write(') ');
					this[node.body.type](node.body, state);
				},

				ForInStatement: (ForInStatement = function ForInStatement(
					node,
					state
				) {
					state.write('for (');
					var left = node.left;

					if (left.type[0] === 'V') {
						formatVariableDeclaration(state, left);
					} else {
						this[left.type](left, state);
					}
					// Identifying whether node.type is `ForInStatement` or `ForOfStatement`
					state.write(node.type[3] === 'I' ? ' in ' : ' of ');
					this[node.right.type](node.right, state);
					state.write(') ');
					this[node.body.type](node.body, state);
				}),
				ForOfStatement: ForInStatement,
				DebuggerStatement: function DebuggerStatement(node, state) {
					state.write('debugger;' + state.lineEnd);
				},

				FunctionDeclaration: (FunctionDeclaration =
					function FunctionDeclaration(node, state) {
						state.write(
							(node.async ? 'async ' : '') +
								(node.generator ? 'function* ' : 'function ') +
								(node.id ? node.id.name : ''),
							node
						);
						formatSequence(state, node.params);
						state.write(' ');
						this[node.body.type](node.body, state);
					}),
				FunctionExpression: FunctionDeclaration,
				VariableDeclaration: function VariableDeclaration(node, state) {
					formatVariableDeclaration(state, node);
					state.write(';');
				},
				VariableDeclarator: function VariableDeclarator(node, state) {
					this[node.id.type](node.id, state);
					if (node.init != null) {
						state.write(' = ');
						this[node.init.type](node.init, state);
					}
				},
				ClassDeclaration: function ClassDeclaration(node, state) {
					state.write(
						'class ' + (node.id ? node.id.name + ' ' : ''),
						node
					);
					if (node.superClass) {
						state.write('extends ');
						this[node.superClass.type](node.superClass, state);
						state.write(' ');
					}
					this.ClassBody(node.body, state);
				},
				ImportDeclaration: function ImportDeclaration(node, state) {
					state.write('import ');
					var specifiers = node.specifiers;
					var length = specifiers.length;
					// NOTE: Once babili is fixed, put this after condition
					// https://github.com/babel/babili/issues/430

					var i = 0;
					if (length > 0) {
						for (; i < length; ) {
							if (i > 0) {
								state.write(', ');
							}
							var specifier = specifiers[i];
							var type = specifier.type[6];
							if (type === 'D') {
								// ImportDefaultSpecifier
								state.write(specifier.local.name, specifier);
								i++;
							} else if (type === 'N') {
								// ImportNamespaceSpecifier
								state.write(
									'* as ' + specifier.local.name,
									specifier
								);
								i++;
							} else {
								// ImportSpecifier
								break;
							}
						}
						if (i < length) {
							state.write('{');
							for (;;) {
								var _specifier = specifiers[i];
								var name = _specifier.imported.name;

								state.write(name, _specifier);
								if (name !== _specifier.local.name) {
									state.write(' as ' + _specifier.local.name);
								}
								if (++i < length) {
									state.write(', ');
								} else {
									break;
								}
							}
							state.write('}');
						}
						state.write(' from ');
					}
					this.Literal(node.source, state);
					state.write(';');
				},
				ExportDefaultDeclaration: function ExportDefaultDeclaration(
					node,
					state
				) {
					state.write('export default ');
					this[node.declaration.type](node.declaration, state);
					if (
						EXPRESSIONS_PRECEDENCE[node.declaration.type] &&
						node.declaration.type[0] !== 'F'
					) {
						// All expression nodes except `FunctionExpression`
						state.write(';');
					}
				},
				ExportNamedDeclaration: function ExportNamedDeclaration(
					node,
					state
				) {
					state.write('export ');
					if (node.declaration) {
						this[node.declaration.type](node.declaration, state);
					} else {
						state.write('{');
						var specifiers = node.specifiers,
							length = specifiers.length;

						if (length > 0) {
							for (var i = 0; ; ) {
								var specifier = specifiers[i];
								var name = specifier.local.name;

								state.write(name, specifier);
								if (name !== specifier.exported.name) {
									state.write(
										' as ' + specifier.exported.name
									);
								}
								if (++i < length) {
									state.write(', ');
								} else {
									break;
								}
							}
						}
						state.write('}');
						if (node.source) {
							state.write(' from ');
							this.Literal(node.source, state);
						}
						state.write(';');
					}
				},
				ExportAllDeclaration: function ExportAllDeclaration(
					node,
					state
				) {
					state.write('export * from ');
					this.Literal(node.source, state);
					state.write(';');
				},
				MethodDefinition: function MethodDefinition(node, state) {
					if (node.static) {
						state.write('static ');
					}
					var kind = node.kind[0];
					if (kind === 'g' || kind === 's') {
						// Getter or setter
						state.write(node.kind + ' ');
					}
					if (node.value.async) {
						state.write('async ');
					}
					if (node.value.generator) {
						state.write('*');
					}
					if (node.computed) {
						state.write('[');
						this[node.key.type](node.key, state);
						state.write(']');
					} else {
						this[node.key.type](node.key, state);
					}
					formatSequence(state, node.value.params);
					state.write(' ');
					this[node.value.body.type](node.value.body, state);
				},
				ClassExpression: function ClassExpression(node, state) {
					this.ClassDeclaration(node, state);
				},
				ArrowFunctionExpression: function ArrowFunctionExpression(
					node,
					state
				) {
					state.write(node.async ? 'async ' : '', node);
					var params = node.params;

					if (params != null) {
						// Omit parenthesis if only one named parameter
						if (params.length === 1 && params[0].type[0] === 'I') {
							// If params[0].type[0] starts with 'I', it can't be `ImportDeclaration` nor `IfStatement` and thus is `Identifier`
							state.write(params[0].name, params[0]);
						} else {
							formatSequence(state, node.params);
						}
					}
					state.write(' => ');
					if (node.body.type[0] === 'O') {
						// Body is an object expression
						state.write('(');
						this.ObjectExpression(node.body, state);
						state.write(')');
					} else {
						this[node.body.type](node.body, state);
					}
				},
				ThisExpression: function ThisExpression(node, state) {
					state.write('this', node);
				},
				Super: function Super(node, state) {
					state.write('super', node);
				},

				RestElement: (RestElement = function RestElement(node, state) {
					state.write('...');
					this[node.argument.type](node.argument, state);
				}),
				SpreadElement: RestElement,
				YieldExpression: function YieldExpression(node, state) {
					state.write(node.delegate ? 'yield*' : 'yield');
					if (node.argument) {
						state.write(' ');
						this[node.argument.type](node.argument, state);
					}
				},
				AwaitExpression: function AwaitExpression(node, state) {
					state.write('await ');
					if (node.argument) {
						this[node.argument.type](node.argument, state);
					}
				},
				TemplateLiteral: function TemplateLiteral(node, state) {
					var this$1 = this;

					var quasis = node.quasis,
						expressions = node.expressions;

					state.write('`');
					var length = expressions.length;

					for (var i = 0; i < length; i++) {
						var expression = expressions[i];
						state.write(quasis[i].value.raw);
						state.write('${');
						this$1[expression.type](expression, state);
						state.write('}');
					}
					state.write(quasis[quasis.length - 1].value.raw);
					state.write('`');
				},
				TaggedTemplateExpression: function TaggedTemplateExpression(
					node,
					state
				) {
					this[node.tag.type](node.tag, state);
					this[node.quasi.type](node.quasi, state);
				},

				ArrayExpression: (ArrayExpression = function ArrayExpression(
					node,
					state
				) {
					var this$1 = this;

					state.write('[');
					if (node.elements.length > 0) {
						var elements = node.elements,
							length = elements.length;

						for (var i = 0; ; ) {
							var element = elements[i];
							if (element != null) {
								this$1[element.type](element, state);
							}
							if (++i < length) {
								state.write(', ');
							} else {
								if (element == null) {
									state.write(', ');
								}
								break;
							}
						}
					}
					state.write(']');
				}),
				ArrayPattern: ArrayExpression,
				ObjectExpression: function ObjectExpression(node, state) {
					var this$1 = this;

					var indent = state.indent.repeat(state.indentLevel++);
					var lineEnd = state.lineEnd,
						writeComments = state.writeComments;

					var propertyIndent = indent + state.indent;
					state.write('{');
					if (node.properties.length > 0) {
						state.write(lineEnd);
						if (writeComments && node.comments != null) {
							formatComments(
								state,
								node.comments,
								propertyIndent,
								lineEnd
							);
						}
						var comma = ',' + lineEnd;
						var properties = node.properties,
							length = properties.length;

						for (var i = 0; ; ) {
							var property = properties[i];
							if (writeComments && property.comments != null) {
								formatComments(
									state,
									property.comments,
									propertyIndent,
									lineEnd
								);
							}
							state.write(propertyIndent);
							this$1.Property(property, state);
							if (++i < length) {
								state.write(comma);
							} else {
								break;
							}
						}
						state.write(lineEnd);
						if (writeComments && node.trailingComments != null) {
							formatComments(
								state,
								node.trailingComments,
								propertyIndent,
								lineEnd
							);
						}
						state.write(indent + '}');
					} else if (writeComments) {
						if (node.comments != null) {
							state.write(lineEnd);
							formatComments(
								state,
								node.comments,
								propertyIndent,
								lineEnd
							);
							if (node.trailingComments != null) {
								formatComments(
									state,
									node.trailingComments,
									propertyIndent,
									lineEnd
								);
							}
							state.write(indent + '}');
						} else if (node.trailingComments != null) {
							state.write(lineEnd);
							formatComments(
								state,
								node.trailingComments,
								propertyIndent,
								lineEnd
							);
							state.write(indent + '}');
						} else {
							state.write('}');
						}
					} else {
						state.write('}');
					}
					state.indentLevel--;
				},
				Property: function Property(node, state) {
					if (node.method || node.kind[0] !== 'i') {
						// Either a method or of kind `set` or `get` (not `init`)
						this.MethodDefinition(node, state);
					} else {
						if (!node.shorthand) {
							if (node.computed) {
								state.write('[');
								this[node.key.type](node.key, state);
								state.write(']');
							} else {
								this[node.key.type](node.key, state);
							}
							state.write(': ');
						}
						this[node.value.type](node.value, state);
					}
				},
				ObjectPattern: function ObjectPattern(node, state) {
					var this$1 = this;

					state.write('{');
					if (node.properties.length > 0) {
						var properties = node.properties,
							length = properties.length;

						for (var i = 0; ; ) {
							this$1[properties[i].type](properties[i], state);
							if (++i < length) {
								state.write(', ');
							} else {
								break;
							}
						}
					}
					state.write('}');
				},
				SequenceExpression: function SequenceExpression(node, state) {
					formatSequence(state, node.expressions);
				},
				UnaryExpression: function UnaryExpression(node, state) {
					if (node.prefix) {
						state.write(node.operator);
						if (node.operator.length > 1) {
							state.write(' ');
						}
						if (
							EXPRESSIONS_PRECEDENCE[node.argument.type] <
							EXPRESSIONS_PRECEDENCE.UnaryExpression
						) {
							state.write('(');
							this[node.argument.type](node.argument, state);
							state.write(')');
						} else {
							this[node.argument.type](node.argument, state);
						}
					} else {
						// FIXME: This case never occurs
						this[node.argument.type](node.argument, state);
						state.write(node.operator);
					}
				},
				UpdateExpression: function UpdateExpression(node, state) {
					// Always applied to identifiers or members, no parenthesis check needed
					if (node.prefix) {
						state.write(node.operator);
						this[node.argument.type](node.argument, state);
					} else {
						this[node.argument.type](node.argument, state);
						state.write(node.operator);
					}
				},
				AssignmentExpression: function AssignmentExpression(
					node,
					state
				) {
					this[node.left.type](node.left, state);
					state.write(' ' + node.operator + ' ');
					this[node.right.type](node.right, state);
				},
				AssignmentPattern: function AssignmentPattern(node, state) {
					this[node.left.type](node.left, state);
					state.write(' = ');
					this[node.right.type](node.right, state);
				},

				BinaryExpression: (BinaryExpression = function BinaryExpression(
					node,
					state
				) {
					if (node.operator === 'in') {
						// Avoids confusion in `for` loops initializers
						state.write('(');
						formatBinaryExpressionPart(
							state,
							node.left,
							node,
							false
						);
						state.write(' ' + node.operator + ' ');
						formatBinaryExpressionPart(
							state,
							node.right,
							node,
							true
						);
						state.write(')');
					} else {
						formatBinaryExpressionPart(
							state,
							node.left,
							node,
							false
						);
						state.write(' ' + node.operator + ' ');
						formatBinaryExpressionPart(
							state,
							node.right,
							node,
							true
						);
					}
				}),
				LogicalExpression: BinaryExpression,
				ConditionalExpression: function ConditionalExpression(
					node,
					state
				) {
					if (
						EXPRESSIONS_PRECEDENCE[node.test.type] >
						EXPRESSIONS_PRECEDENCE.ConditionalExpression
					) {
						this[node.test.type](node.test, state);
					} else {
						state.write('(');
						this[node.test.type](node.test, state);
						state.write(')');
					}
					state.write(' ? ');
					this[node.consequent.type](node.consequent, state);
					state.write(' : ');
					this[node.alternate.type](node.alternate, state);
				},
				NewExpression: function NewExpression(node, state) {
					state.write('new ');
					if (
						EXPRESSIONS_PRECEDENCE[node.callee.type] <
							EXPRESSIONS_PRECEDENCE.CallExpression ||
						hasCallExpression(node.callee)
					) {
						state.write('(');
						this[node.callee.type](node.callee, state);
						state.write(')');
					} else {
						this[node.callee.type](node.callee, state);
					}
					formatSequence(state, node['arguments']);
				},
				CallExpression: function CallExpression(node, state) {
					if (
						EXPRESSIONS_PRECEDENCE[node.callee.type] <
						EXPRESSIONS_PRECEDENCE.CallExpression
					) {
						state.write('(');
						this[node.callee.type](node.callee, state);
						state.write(')');
					} else {
						this[node.callee.type](node.callee, state);
					}
					formatSequence(state, node['arguments']);
				},
				MemberExpression: function MemberExpression(node, state) {
					if (
						EXPRESSIONS_PRECEDENCE[node.object.type] <
						EXPRESSIONS_PRECEDENCE.MemberExpression
					) {
						state.write('(');
						this[node.object.type](node.object, state);
						state.write(')');
					} else {
						this[node.object.type](node.object, state);
					}
					if (node.computed) {
						state.write('[');
						this[node.property.type](node.property, state);
						state.write(']');
					} else {
						state.write('.');
						this[node.property.type](node.property, state);
					}
				},
				MetaProperty: function MetaProperty(node, state) {
					state.write(
						node.meta.name + '.' + node.property.name,
						node
					);
				},
				Identifier: function Identifier(node, state) {
					state.write(node.name, node);
				},
				Literal: function Literal(node, state) {
					if (node.raw != null) {
						state.write(node.raw, node);
					} else if (node.regex != null) {
						this.RegExpLiteral(node, state);
					} else {
						state.write(stringify(node.value), node);
					}
				},
				RegExpLiteral: function RegExpLiteral(node, state) {
					var regex = node.regex;

					state.write('/' + regex.pattern + '/' + regex.flags, node);
				},
			});

			var EMPTY_OBJECT = {};

			var State = (function () {
				function State(options) {
					_classCallCheck(this, State);

					var setup = options == null ? EMPTY_OBJECT : options;
					this.output = '';
					// Functional options
					if (setup.output != null) {
						this.output = setup.output;
						this.write = this.writeToStream;
					} else {
						this.output = '';
					}
					this.generator =
						setup.generator != null
							? setup.generator
							: baseGenerator;
					// Formating setup
					this.indent = setup.indent != null ? setup.indent : '\t';
					this.lineEnd = setup.lineEnd != null ? setup.lineEnd : '\n';
					this.indentLevel =
						setup.startingIndentLevel != null
							? setup.startingIndentLevel
							: 0;
					this.writeComments = setup.comments
						? setup.comments
						: false;
					// Source map
					if (setup.sourceMap != null) {
						this.write =
							setup.output == null
								? this.writeAndMap
								: this.writeToStreamAndMap;
						this.sourceMap = setup.sourceMap;
						this.line = 1;
						this.column = 0;
						this.lineEndSize = this.lineEnd.split('\n').length - 1;
						this.mapping = {
							original: null,
							generated: this,
							name: undefined,
							source:
								setup.sourceMap.file || setup.sourceMap._file,
						};
					}
				}

				State.prototype.write = function write(code) {
					this.output += code;
				};

				State.prototype.writeToStream = function writeToStream(code) {
					this.output.write(code);
				};

				State.prototype.writeAndMap = function writeAndMap(code, node) {
					this.output += code;
					this.map(code, node);
				};

				State.prototype.writeToStreamAndMap =
					function writeToStreamAndMap(code, node) {
						this.output.write(code);
						this.map(code, node);
					};

				State.prototype.map = function map(code, node) {
					if (node != null && node.loc != null) {
						var mapping = this.mapping;

						mapping.original = node.loc.start;
						mapping.name = node.name;
						this.sourceMap.addMapping(mapping);
					}
					if (code.length > 0) {
						if (this.lineEndSize > 0) {
							if (code.endsWith(this.lineEnd)) {
								this.line += this.lineEndSize;
								this.column = 0;
							} else if (code[code.length - 1] === '\n') {
								// Case of inline comment
								this.line++;
								this.column = 0;
							} else {
								this.column += code.length;
							}
						} else {
							if (code[code.length - 1] === '\n') {
								// Case of inline comment
								this.line++;
								this.column = 0;
							} else {
								this.column += code.length;
							}
						}
					}
				};

				State.prototype.toString = function toString() {
					return this.output;
				};

				return State;
			})();

			function generate(node, options) {
				/*
        Returns a string representing the rendered code of the provided AST `node`.
        The `options` are:
         - `indent`: string to use for indentation (defaults to `\t`)
        - `lineEnd`: string to use for line endings (defaults to `\n`)
        - `startingIndentLevel`: indent level to start from (default to `0`)
        - `comments`: generate comments if `true` (defaults to `false`)
        - `output`: output stream to write the rendered code to (defaults to `null`)
        - `generator`: custom code generator (defaults to `baseGenerator`)
        */
				var state = new State(options);
				// Travel through the AST node and generate the code
				state.generator[node.type](node, state);
				return state.output;
			}
		});
	});

	var astring_1 = astring.generate;

	// unique temporary variable index
	var utvidx = 1;
	function reserveTempVarId() {
		return '' + TEMP_VAR_BASE + utvidx++;
	}

	// general unique index
	var uidx = 1;
	function uid() {
		return uidx++;
	}

	// unique branch index
	var ubidx = 1;
	function uBranchHash() {
		return ubidx++;
	}

	function parse$$1() {
		return parse$1.apply(null, arguments);
	}

	function generate$$1() {
		return astring_1.apply(null, arguments);
	}

	var _utils = Object.freeze({
		reserveTempVarId: reserveTempVarId,
		uid: uid,
		uBranchHash: uBranchHash,
		parse: parse$$1,
		generate: generate$$1,
	});

	var walk = createCommonjsModule(function (module, exports) {
		(function (global, factory) {
			factory(exports);
		})(commonjsGlobal, function (exports) {
			'use strict';

			// AST walker module for Mozilla Parser API compatible trees

			// A simple walk is one where you simply specify callbacks to be
			// called on specific nodes. The last two arguments are optional. A
			// simple use would be
			//
			//     walk.simple(myTree, {
			//         Expression: function(node) { ... }
			//     });
			//
			// to do something with all expressions. All Parser API node types
			// can be used to identify node types, as well as Expression,
			// Statement, and ScopeBody, which denote categories of nodes.
			//
			// The base argument can be used to pass a custom (recursive)
			// walker, and state can be used to give this walked an initial
			// state.

			function simple(node, visitors, base, state, override) {
				if (!base) {
					base = exports.base;
				}
				(function c(node, st, override) {
					var type = override || node.type,
						found = visitors[type];
					base[type](node, st, c);
					if (found) {
						found(node, st);
					}
				})(node, state, override);
			}

			// An ancestor walk keeps an array of ancestor nodes (including the
			// current node) and passes them to the callback as third parameter
			// (and also as state parameter when no other state is present).
			function ancestor(node, visitors, base, state) {
				if (!base) {
					base = exports.base;
				}
				var ancestors = [];
				(function c(node, st, override) {
					var type = override || node.type,
						found = visitors[type];
					var isNew = node != ancestors[ancestors.length - 1];
					if (isNew) {
						ancestors.push(node);
					}
					base[type](node, st, c);
					if (found) {
						found(node, st || ancestors, ancestors);
					}
					if (isNew) {
						ancestors.pop();
					}
				})(node, state);
			}

			// A recursive walk is one where your functions override the default
			// walkers. They can modify and replace the state parameter that's
			// threaded through the walk, and can opt how and whether to walk
			// their child nodes (by calling their third argument on these
			// nodes).
			function recursive(node, state, funcs, base, override) {
				var visitor = funcs ? exports.make(funcs, base) : base;
				(function c(node, st, override) {
					visitor[override || node.type](node, st, c);
				})(node, state, override);
			}

			function makeTest(test) {
				if (typeof test == 'string') {
					return function (type) {
						return type == test;
					};
				} else if (!test) {
					return function () {
						return true;
					};
				} else {
					return test;
				}
			}

			var Found = function Found(node, state) {
				this.node = node;
				this.state = state;
			};

			// A full walk triggers the callback on each node
			function full(node, callback, base, state, override) {
				if (!base) {
					base = exports.base;
				}
				(function c(node, st, override) {
					var type = override || node.type;
					base[type](node, st, c);
					callback(node, st, type);
				})(node, state, override);
			}

			// An fullAncestor walk is like an ancestor walk, but triggers
			// the callback on each node
			function fullAncestor(node, callback, base, state) {
				if (!base) {
					base = exports.base;
				}
				var ancestors = [];
				(function c(node, st, override) {
					var type = override || node.type;
					var isNew = node != ancestors[ancestors.length - 1];
					if (isNew) {
						ancestors.push(node);
					}
					base[type](node, st, c);
					callback(node, st || ancestors, ancestors, type);
					if (isNew) {
						ancestors.pop();
					}
				})(node, state);
			}

			// Find a node with a given start, end, and type (all are optional,
			// null can be used as wildcard). Returns a {node, state} object, or
			// undefined when it doesn't find a matching node.
			function findNodeAt(node, start, end, test, base, state) {
				test = makeTest(test);
				if (!base) {
					base = exports.base;
				}
				try {
					(function c(node, st, override) {
						var type = override || node.type;
						if (
							(start == null || node.start <= start) &&
							(end == null || node.end >= end)
						) {
							base[type](node, st, c);
						}
						if (
							(start == null || node.start == start) &&
							(end == null || node.end == end) &&
							test(type, node)
						) {
							throw new Found(node, st);
						}
					})(node, state);
				} catch (e) {
					if (e instanceof Found) {
						return e;
					}
					throw e;
				}
			}

			// Find the innermost node of a given type that contains the given
			// position. Interface similar to findNodeAt.
			function findNodeAround(node, pos, test, base, state) {
				test = makeTest(test);
				if (!base) {
					base = exports.base;
				}
				try {
					(function c(node, st, override) {
						var type = override || node.type;
						if (node.start > pos || node.end < pos) {
							return;
						}
						base[type](node, st, c);
						if (test(type, node)) {
							throw new Found(node, st);
						}
					})(node, state);
				} catch (e) {
					if (e instanceof Found) {
						return e;
					}
					throw e;
				}
			}

			// Find the outermost matching node after a given position.
			function findNodeAfter(node, pos, test, base, state) {
				test = makeTest(test);
				if (!base) {
					base = exports.base;
				}
				try {
					(function c(node, st, override) {
						if (node.end < pos) {
							return;
						}
						var type = override || node.type;
						if (node.start >= pos && test(type, node)) {
							throw new Found(node, st);
						}
						base[type](node, st, c);
					})(node, state);
				} catch (e) {
					if (e instanceof Found) {
						return e;
					}
					throw e;
				}
			}

			// Find the outermost matching node before a given position.
			function findNodeBefore(node, pos, test, base, state) {
				test = makeTest(test);
				if (!base) {
					base = exports.base;
				}
				var max;
				(function c(node, st, override) {
					if (node.start > pos) {
						return;
					}
					var type = override || node.type;
					if (
						node.end <= pos &&
						(!max || max.node.end < node.end) &&
						test(type, node)
					) {
						max = new Found(node, st);
					}
					base[type](node, st, c);
				})(node, state);
				return max;
			}

			// Fallback to an Object.create polyfill for older environments.
			var create =
				Object.create ||
				function (proto) {
					function Ctor() {}
					Ctor.prototype = proto;
					return new Ctor();
				};

			// Used to create a custom walker. Will fill in all missing node
			// type properties with the defaults.
			function make(funcs, base) {
				if (!base) {
					base = exports.base;
				}
				var visitor = create(base);
				for (var type in funcs) {
					visitor[type] = funcs[type];
				}
				return visitor;
			}

			function skipThrough(node, st, c) {
				c(node, st);
			}
			function ignore(_node, _st, _c) {}

			// Node walkers.

			var base = {};

			base.Program = base.BlockStatement = function (node, st, c) {
				for (var i = 0, list = node.body; i < list.length; i += 1) {
					var stmt = list[i];

					c(stmt, st, 'Statement');
				}
			};
			base.Statement = skipThrough;
			base.EmptyStatement = ignore;
			base.ExpressionStatement = base.ParenthesizedExpression = function (
				node,
				st,
				c
			) {
				return c(node.expression, st, 'Expression');
			};
			base.IfStatement = function (node, st, c) {
				c(node.test, st, 'Expression');
				c(node.consequent, st, 'Statement');
				if (node.alternate) {
					c(node.alternate, st, 'Statement');
				}
			};
			base.LabeledStatement = function (node, st, c) {
				return c(node.body, st, 'Statement');
			};
			base.BreakStatement = base.ContinueStatement = ignore;
			base.WithStatement = function (node, st, c) {
				c(node.object, st, 'Expression');
				c(node.body, st, 'Statement');
			};
			base.SwitchStatement = function (node, st, c) {
				c(node.discriminant, st, 'Expression');
				for (var i = 0, list = node.cases; i < list.length; i += 1) {
					var cs = list[i];

					if (cs.test) {
						c(cs.test, st, 'Expression');
					}
					for (
						var i$1 = 0, list$1 = cs.consequent;
						i$1 < list$1.length;
						i$1 += 1
					) {
						var cons = list$1[i$1];

						c(cons, st, 'Statement');
					}
				}
			};
			base.ReturnStatement =
				base.YieldExpression =
				base.AwaitExpression =
					function (node, st, c) {
						if (node.argument) {
							c(node.argument, st, 'Expression');
						}
					};
			base.ThrowStatement = base.SpreadElement = function (node, st, c) {
				return c(node.argument, st, 'Expression');
			};
			base.TryStatement = function (node, st, c) {
				c(node.block, st, 'Statement');
				if (node.handler) {
					c(node.handler, st);
				}
				if (node.finalizer) {
					c(node.finalizer, st, 'Statement');
				}
			};
			base.CatchClause = function (node, st, c) {
				c(node.param, st, 'Pattern');
				c(node.body, st, 'ScopeBody');
			};
			base.WhileStatement = base.DoWhileStatement = function (
				node,
				st,
				c
			) {
				c(node.test, st, 'Expression');
				c(node.body, st, 'Statement');
			};
			base.ForStatement = function (node, st, c) {
				if (node.init) {
					c(node.init, st, 'ForInit');
				}
				if (node.test) {
					c(node.test, st, 'Expression');
				}
				if (node.update) {
					c(node.update, st, 'Expression');
				}
				c(node.body, st, 'Statement');
			};
			base.ForInStatement = base.ForOfStatement = function (node, st, c) {
				c(node.left, st, 'ForInit');
				c(node.right, st, 'Expression');
				c(node.body, st, 'Statement');
			};
			base.ForInit = function (node, st, c) {
				if (node.type == 'VariableDeclaration') {
					c(node, st);
				} else {
					c(node, st, 'Expression');
				}
			};
			base.DebuggerStatement = ignore;

			base.FunctionDeclaration = function (node, st, c) {
				return c(node, st, 'Function');
			};
			base.VariableDeclaration = function (node, st, c) {
				for (
					var i = 0, list = node.declarations;
					i < list.length;
					i += 1
				) {
					var decl = list[i];

					c(decl, st);
				}
			};
			base.VariableDeclarator = function (node, st, c) {
				c(node.id, st, 'Pattern');
				if (node.init) {
					c(node.init, st, 'Expression');
				}
			};

			base.Function = function (node, st, c) {
				if (node.id) {
					c(node.id, st, 'Pattern');
				}
				for (var i = 0, list = node.params; i < list.length; i += 1) {
					var param = list[i];

					c(param, st, 'Pattern');
				}
				c(
					node.body,
					st,
					node.expression ? 'ScopeExpression' : 'ScopeBody'
				);
			};
			// FIXME drop these node types in next major version
			// (They are awkward, and in ES6 every block can be a scope.)
			base.ScopeBody = function (node, st, c) {
				return c(node, st, 'Statement');
			};
			base.ScopeExpression = function (node, st, c) {
				return c(node, st, 'Expression');
			};

			base.Pattern = function (node, st, c) {
				if (node.type == 'Identifier') {
					c(node, st, 'VariablePattern');
				} else if (node.type == 'MemberExpression') {
					c(node, st, 'MemberPattern');
				} else {
					c(node, st);
				}
			};
			base.VariablePattern = ignore;
			base.MemberPattern = skipThrough;
			base.RestElement = function (node, st, c) {
				return c(node.argument, st, 'Pattern');
			};
			base.ArrayPattern = function (node, st, c) {
				for (var i = 0, list = node.elements; i < list.length; i += 1) {
					var elt = list[i];

					if (elt) {
						c(elt, st, 'Pattern');
					}
				}
			};
			base.ObjectPattern = function (node, st, c) {
				for (
					var i = 0, list = node.properties;
					i < list.length;
					i += 1
				) {
					var prop = list[i];

					c(prop.value, st, 'Pattern');
				}
			};

			base.Expression = skipThrough;
			base.ThisExpression = base.Super = base.MetaProperty = ignore;
			base.ArrayExpression = function (node, st, c) {
				for (var i = 0, list = node.elements; i < list.length; i += 1) {
					var elt = list[i];

					if (elt) {
						c(elt, st, 'Expression');
					}
				}
			};
			base.ObjectExpression = function (node, st, c) {
				for (
					var i = 0, list = node.properties;
					i < list.length;
					i += 1
				) {
					var prop = list[i];

					c(prop, st);
				}
			};
			base.FunctionExpression = base.ArrowFunctionExpression =
				base.FunctionDeclaration;
			base.SequenceExpression = base.TemplateLiteral = function (
				node,
				st,
				c
			) {
				for (
					var i = 0, list = node.expressions;
					i < list.length;
					i += 1
				) {
					var expr = list[i];

					c(expr, st, 'Expression');
				}
			};
			base.UnaryExpression = base.UpdateExpression = function (
				node,
				st,
				c
			) {
				c(node.argument, st, 'Expression');
			};
			base.BinaryExpression = base.LogicalExpression = function (
				node,
				st,
				c
			) {
				c(node.left, st, 'Expression');
				c(node.right, st, 'Expression');
			};
			base.AssignmentExpression = base.AssignmentPattern = function (
				node,
				st,
				c
			) {
				c(node.left, st, 'Pattern');
				c(node.right, st, 'Expression');
			};
			base.ConditionalExpression = function (node, st, c) {
				c(node.test, st, 'Expression');
				c(node.consequent, st, 'Expression');
				c(node.alternate, st, 'Expression');
			};
			base.NewExpression = base.CallExpression = function (node, st, c) {
				c(node.callee, st, 'Expression');
				if (node.arguments) {
					for (
						var i = 0, list = node.arguments;
						i < list.length;
						i += 1
					) {
						var arg = list[i];

						c(arg, st, 'Expression');
					}
				}
			};
			base.MemberExpression = function (node, st, c) {
				c(node.object, st, 'Expression');
				if (node.computed) {
					c(node.property, st, 'Expression');
				}
			};
			base.ExportNamedDeclaration = base.ExportDefaultDeclaration =
				function (node, st, c) {
					if (node.declaration) {
						c(
							node.declaration,
							st,
							node.type == 'ExportNamedDeclaration' ||
								node.declaration.id
								? 'Statement'
								: 'Expression'
						);
					}
					if (node.source) {
						c(node.source, st, 'Expression');
					}
				};
			base.ExportAllDeclaration = function (node, st, c) {
				c(node.source, st, 'Expression');
			};
			base.ImportDeclaration = function (node, st, c) {
				for (
					var i = 0, list = node.specifiers;
					i < list.length;
					i += 1
				) {
					var spec = list[i];

					c(spec, st);
				}
				c(node.source, st, 'Expression');
			};
			base.ImportSpecifier =
				base.ImportDefaultSpecifier =
				base.ImportNamespaceSpecifier =
				base.Identifier =
				base.Literal =
					ignore;

			base.TaggedTemplateExpression = function (node, st, c) {
				c(node.tag, st, 'Expression');
				c(node.quasi, st);
			};
			base.ClassDeclaration = base.ClassExpression = function (
				node,
				st,
				c
			) {
				return c(node, st, 'Class');
			};
			base.Class = function (node, st, c) {
				if (node.id) {
					c(node.id, st, 'Pattern');
				}
				if (node.superClass) {
					c(node.superClass, st, 'Expression');
				}
				for (
					var i = 0, list = node.body.body;
					i < list.length;
					i += 1
				) {
					var item = list[i];

					c(item, st);
				}
			};
			base.MethodDefinition = base.Property = function (node, st, c) {
				if (node.computed) {
					c(node.key, st, 'Expression');
				}
				c(node.value, st, 'Expression');
			};

			exports.simple = simple;
			exports.ancestor = ancestor;
			exports.recursive = recursive;
			exports.full = full;
			exports.fullAncestor = fullAncestor;
			exports.findNodeAt = findNodeAt;
			exports.findNodeAround = findNodeAround;
			exports.findNodeAfter = findNodeAfter;
			exports.findNodeBefore = findNodeBefore;
			exports.make = make;
			exports.base = base;

			Object.defineProperty(exports, '__esModule', { value: true });
		});
	});

	var walk_1 = walk.base;
	var walk_2 = walk.full;
	var walk_3 = walk.recursive;

	function getInheritanceTree(cls) {
		var base = cls;
		var tree = [cls.name];
		while (true) {
			base = Object.getPrototypeOf(base);
			if (base === Function.prototype) {
				break;
			}
			tree.push(base.name);
		}
		return tree;
	}

	function instructionToString(n) {
		for (var key in INSTR) {
			var value = INSTR[key];
			if (value === n) {
				return key;
			}
		}
		console.warn('Unexpected instruction value ' + n);
		return '';
	}

	function injectPatchIntoNode(node, patch, end) {
		var body = null;
		var type = node.type;
		if (type === 'Program') {
			body = node.body;
		} else if (type === 'BlockStatement') {
			body = node.body;
		} else if (type === 'ForStatement') {
			body = node.body.body;
		} else if (isLoopStatement(type)) {
			body = node.body.body;
		} else if (isFunctionNode(type)) {
			body = node.body.body;
		} else {
			console.error('Invalid patch node type ' + type);
		}
		console.assert(body instanceof Array);
		// force patches to be magic
		patch.magic = true;
		if (end) {
			body.push(patch);
		} else {
			body.unshift(patch);
		}
	}

	function resolveCallee(node) {
		var type = node.type;
		if (node.type === 'MemberExpression') {
			return node.object;
		}
		return node;
	}

	function isFunctionNode(type) {
		return (
			type === 'FunctionExpression' ||
			type === 'FunctionDeclaration' ||
			type === 'ArrowFunctionExpression'
		);
	}

	function isStatement(type) {
		return (
			type === 'BlockStatement' ||
			type === 'BreakStatement' ||
			type === 'ContinueStatement' ||
			type === 'DebuggerStatement' ||
			type === 'DoWhileStatement' ||
			type === 'EmptyStatement' ||
			type === 'ExpressionStatement' ||
			type === 'ForInStatement' ||
			type === 'ForStatement' ||
			type === 'IfStatement' ||
			type === 'LabeledStatement' ||
			type === 'ReturnStatement' ||
			type === 'SwitchStatement' ||
			type === 'ThrowStatement' ||
			type === 'TryStatement' ||
			type === 'VariableDeclaration' ||
			type === 'WhileStatement' ||
			type === 'WithStatement'
		);
	}

	function isLoopStatement(type) {
		return (
			type === 'ForStatement' ||
			type === 'ForInStatement' ||
			type === 'ForOfStatement' ||
			type === 'WhileStatement' ||
			type === 'DoWhileStatement'
		);
	}

	function isSwitchStatement(type) {
		return type === 'SwitchStatement';
	}

	function isTryStatement(type) {
		return type === 'TryStatement';
	}

	function isLabeledStatement(type) {
		return type === 'LabeledStatement';
	}

	function isLoopFrameType(type) {
		return type === INSTR.LOOP_ENTER;
	}

	function isSwitchFrameType(type) {
		return type === INSTR.SWITCH_ENTER;
	}

	function isSwitchCaseFrameType(type) {
		return type === INSTR.CASE_ENTER;
	}

	function isFunctionFrameType(type) {
		return type === INSTR.FUNCTION_CALL;
	}

	function isMethodFrameType(type) {
		return type === INSTR.METHOD_ENTER;
	}

	function isReturnableFrameType(type) {
		return isMethodFrameType(type) || isFunctionFrameType(type);
	}

	function isBreakableFrameType(type) {
		return isLoopFrameType(type) || isSwitchFrameType(type);
	}

	function isContinuableFrameType(type) {
		return isLoopFrameType(type);
	}

	function isTryStatementFrameType(type) {
		return type === INSTR.TRY_ENTER;
	}

	function isCatchClauseFrameType(type) {
		return type === INSTR.CATCH_ENTER;
	}

	function isFinalClauseFrameType(type) {
		return type === INSTR.FINAL_ENTER;
	}

	function isInstantiationFrameType(type) {
		return type === INSTR.OP_NEW;
	}

	function isValidFrameInstruction(frame) {
		console.assert(typeof frame.cleanType === 'string');
		var type = frame.cleanType;
		return INSTR[type] >= 0;
	}

	function operatorToString(op) {
		for (var key in OP) {
			if (OP[key] === op) {
				return key;
			}
		}
		return 'undefined';
	}

	function processLabels(node) {
		var labels = [];
		// we can have multiple labels in js
		// *universe collapses*
		while (true) {
			if (node.type === 'LabeledStatement') {
				labels.push(node.label.name);
			} else if (isStatement(node.type)) {
				node.labels = labels;
				break;
			}
			node = node.body;
		}
		return node;
	}

	function getCallee(callee, call) {
		if (call === null) {
			return callee.name;
		}
		return call;
	}

	function indentString(n) {
		return ' '.repeat(n);
	}

	function cloneNode(node) {
		var clone = JSON.parse(JSON.stringify(node));
		return clone;
	}

	function deepMagicPatch(node) {
		// magic patch the whole ast
		walk_2(node, function (child) {
			child.magic = true;
		});
	}

	function parse$2() {
		return parse$1.apply(null, arguments);
	}

	function generate$1() {
		return astring_1.apply(null, arguments);
	}

	function parseExpression(input) {
		var node = parse$2(input);
		var result = node.body[0].expression;
		deepMagicPatch(result);
		return result;
	}

	function parseExpressionStatement(input) {
		var node = parse$2(input);
		var result = node.body[0];
		deepMagicPatch(result);
		return result;
	}

	function getCategoryFromInstruction(type) {
		type = type | 0;
		switch (type) {
			case INSTR.THIS:
				return CATEGORY.THIS | 0;
			case INSTR.UNARY:
				return CATEGORY.UNARY | 0;
			case INSTR.UPDATE:
				return CATEGORY.UPDATE | 0;
			case INSTR.BINARY:
				return CATEGORY.BINARY | 0;
			case INSTR.LOGICAL:
				return CATEGORY.LOGICAL | 0;
			case INSTR.TERNARY:
				return CATEGORY.TERNARY | 0;
			case INSTR.ASSIGN:
				return CATEGORY.ASSIGN | 0;
			case INSTR.ALLOC:
				return CATEGORY.ALLOC | 0;
			case INSTR.MEMBER_EXPR:
				return CATEGORY.MEMBER | 0;
			case INSTR.LITERAL:
				return CATEGORY.LITERAL | 0;
			case INSTR.IDENTIFIER:
				return CATEGORY.IDENTIFIER | 0;
			case INSTR.TRY_ENTER:
			case INSTR.TRY_LEAVE:
				return CATEGORY.TRY | 0;
			case INSTR.CATCH_ENTER:
			case INSTR.CATCH_LEAVE:
				return CATEGORY.CATCH | 0;
			case INSTR.FINAL_ENTER:
			case INSTR.FINAL_LEAVE:
				return CATEGORY.FINALLY | 0;
			case INSTR.OP_NEW:
			case INSTR.OP_NEW_END:
				return CATEGORY.OP_NEW | 0;
			case INSTR.VAR_INIT:
			case INSTR.VAR_DECLARE:
				return CATEGORY.VAR | 0;
			case INSTR.IF_TEST:
			case INSTR.IF_ENTER:
			case INSTR.IF_LEAVE:
				return CATEGORY.IF | 0;
			case INSTR.ELSE_ENTER:
			case INSTR.ELSE_LEAVE:
				return CATEGORY.ELSE | 0;
			case INSTR.SWITCH_TEST:
			case INSTR.SWITCH_ENTER:
			case INSTR.SWITCH_LEAVE:
				return CATEGORY.SWITCH | 0;
			case INSTR.CASE_TEST:
			case INSTR.CASE_ENTER:
			case INSTR.CASE_LEAVE:
				return CATEGORY.CASE | 0;
			case INSTR.BREAK:
				return CATEGORY.BREAK | 0;
			case INSTR.CONTINUE:
				return CATEGORY.CONTINUE | 0;
			case INSTR.LOOP_TEST:
			case INSTR.LOOP_ENTER:
			case INSTR.LOOP_LEAVE:
				return CATEGORY.LOOP | 0;
			case INSTR.FUNCTION_CALL:
			case INSTR.FUNCTION_CALL_END:
				return CATEGORY.CALL | 0;
			case INSTR.FUNCTION_ENTER:
			case INSTR.FUNCTION_LEAVE:
			case INSTR.FUNCTION_RETURN:
				return CATEGORY.FUNCTION | 0;
			case INSTR.BLOCK_ENTER:
			case INSTR.BLOCK_LEAVE:
				return CATEGORY.BLOCK | 0;
			case INSTR.PROGRAM:
			case INSTR.PROGRAM_ENTER:
			case INSTR.PROGRAM_LEAVE:
			case INSTR.PROGRAM_FRAME_VALUE:
				return CATEGORY.PROGRAM | 0;
			case INSTR.METHOD_ENTER:
			case INSTR.METHOD_LEAVE:
				return CATEGORY.METHOD | 0;
			case INSTR.SUPER:
				return CATEGORY.SUPER | 0;
		}
		return -1;
	}

	function forceLoopBodyBlocked(node) {
		if (node.body.type !== 'BlockStatement') {
			node.body = {
				magic: true,
				type: 'BlockStatement',
				body: [node.body],
			};
		}
	}

	var Frame = function Frame(type, hash) {
		this.uid = uid();
		this.hash = hash;
		this.type = type;
		this.isSloppy = false;
		this.isBreakable = false;
		this.isReturnable = false;
		this.isCatchClause = false;
		this.isFinalClause = false;
		this.isTryStatement = false;
		this.isSwitchDefault = false;
		this.isInstantiation = false;
		this.cleanType = instructionToString(type);
		this.parent = null;
		this.values = [];
		this.children = [];
		// apply frame flow kinds
		this.isBreakable = isBreakableFrameType(type);
		this.isSwitchCase = isSwitchCaseFrameType(type);
		this.isReturnable = isReturnableFrameType(type);
		this.isCatchClause = isCatchClauseFrameType(type);
		this.isFinalClause = isFinalClauseFrameType(type);
		this.isContinuable = isContinuableFrameType(type);
		this.isTryStatement = isTryStatementFrameType(type);
		this.isInstantiation = isInstantiationFrameType(type);
	};
	Frame.prototype.isGlobal = function isGlobal() {
		return this.parent === null && this.type === INSTR.PROGRAM;
	};
	Frame.prototype.getGlobal = function getGlobal() {
		var frame = this;
		while (true) {
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		return frame;
	};
	Frame.prototype.getDepth = function getDepth() {
		var depth = 0;
		var frame = this;
		while (true) {
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
			depth++;
		}
		return depth;
	};
	Frame.prototype.equals = function equals(frame) {
		return this.uid === frame.uid;
	};

	var Scope = function Scope(node) {
		this.uid = uid();
		this.isLoop = false;
		this.isReturnable = false;
		if (isFunctionNode(node.type)) {
			this.isReturnable = true;
		} else if (isLoopStatement(node.type)) {
			this.isLoop = true;
		}
		this.node = node;
		this.parent = null;
	};
	Scope.prototype.getReturnContext = function getReturnContext() {
		var ctx = this;
		while (true) {
			if (ctx.isReturnable) {
				break;
			}
			ctx = ctx.parent;
		}
		return ctx;
	};
	Scope.prototype.getLoopContext = function getLoopContext() {
		var ctx = this;
		while (true) {
			if (ctx.isLoop) {
				break;
			}
			ctx = ctx.parent;
		}
		return ctx;
	};

	var STAGE1 = {};

	STAGE1.Program = function (node, patcher) {
		//if (node.magic) return;
		node.magic = true;
		patcher.pushScope(node);
		patcher.stage.BlockStatement(node, patcher, patcher.stage);
		if (patcher.stage === STAGE1) {
			var hash = uBranchHash();
			// create node link
			patcher.nodes[hash] = {
				hash: hash,
				node: cloneNode(node),
			};
			// program frame value id
			var frameValueId = '$$frameValue';
			// patch program frame value debug
			var last = null;
			for (var ii = 0; ii < node.body.length; ++ii) {
				var child = node.body[ii];
				if (child.type === 'ExpressionStatement' && !child.magic) {
					last = child;
				}
			}
			// only patch the very last expr statement
			if (last !== null) {
				last.expression = {
					magic: true,
					type: 'CallExpression',
					callee: {
						magic: true,
						type: 'Identifier',
						name: patcher.instance.getLink(
							'DEBUG_PROGRAM_FRAME_VALUE'
						),
					},
					arguments: [
						{
							magic: true,
							type: 'AssignmentExpression',
							operator: '=',
							left: parseExpression(frameValueId),
							right: last.expression,
						},
					],
				};
			}
			var end = {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_PROGRAM_LEAVE'),
				},
				arguments: [parseExpression(hash)],
			};
			var start = {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_PROGRAM_ENTER'),
				},
				arguments: [parseExpression(hash)],
			};
			var frame = parseExpressionStatement(
				'var ' + frameValueId + ' = void 0;'
			);
			end.arguments.push(parseExpression(frameValueId));
			node.body.push(end);
			node.body.unshift(start);
			node.body.unshift(frame);
			node.body.unshift(
				parseExpressionStatement(
					'const ' +
						patcher.instance.key +
						' = Iroh.stages["' +
						patcher.instance.key +
						'"];'
				)
			);
		}
		patcher.popScope();
	};

	STAGE1.BlockStatement = function (node, patcher) {
		var body = node.body;
		for (var ii = 0; ii < body.length; ++ii) {
			var child = body[ii];
			//if (child.magic) continue;
			patcher.walk(child, patcher, patcher.stage);
		}
	};

	STAGE1.MethodDefinition = function (node, patcher) {
		patcher.pushScope(node);
		patcher.walk(node.key, patcher, patcher.stage);
		patcher.walk(node.value, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.FunctionDeclaration = function (node, patcher) {
		// dont touch
		if (node.magic) {
			patcher.pushScope(node);
			// just walk
			patcher.walk(node.id, patcher, patcher.stage);
			node.params.map(function (param) {
				patcher.walk(param, patcher, patcher.stage);
			});
			patcher.walk(node.body, patcher, patcher.stage);
			patcher.popScope();
			return;
		}
		node.magic = true;
		patcher.pushScope(node);
		var name = node.id.name;
		patcher.symbols[name] = cloneNode(node);
		patcher.walk(node.id, patcher, patcher.stage);
		node.params.map(function (param) {
			patcher.walk(param, patcher, patcher.stage);
		});
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.FunctionExpression = function (node, patcher) {
		// dont touch
		if (node.magic) {
			patcher.pushScope(node);
			// just walk
			if (node.id !== null) {
				patcher.walk(node.id, patcher, patcher.stage);
			}
			node.params.map(function (param) {
				patcher.walk(param, patcher, patcher.stage);
			});
			patcher.walk(node.body, patcher, patcher.stage);
			patcher.popScope();
			return;
		}
		node.magic = true;
		patcher.pushScope(node);
		var name = '$$ANON_' + uid();
		if (node.id === null) {
			node.id = {
				magic: true,
				type: 'Identifier',
				name: name,
			};
		}
		name = node.id.name;
		patcher.symbols[name] = cloneNode(node);
		patcher.walk(node.id, patcher, patcher.stage);
		node.params.map(function (param) {
			patcher.walk(param, patcher, patcher.stage);
		});
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.ArrowFunctionExpression = function (node, patcher) {
		// dont touch
		if (node.magic) {
			// just walk
			patcher.pushScope(node);
			node.params.map(function (param) {
				patcher.walk(param, patcher, patcher.stage);
			});
			patcher.walk(node.body, patcher, patcher.stage);
			patcher.popScope();
			return;
		}
		node.magic = true;
		patcher.pushScope(node);
		var name = '$$ANON_ARROW_' + uid();
		patcher.symbols[name] = cloneNode(node);
		node.id = {
			magic: true,
			type: 'Identifier',
			name: name,
		};
		// arrow fns auto return, inject return record
		if (node.body.type !== 'BlockStatement') {
			var call = {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_FUNCTION_RETURN'),
				},
				arguments: [parseExpression('"' + node.id + '"'), node.body],
			};
			node.argument = call;
		}
		// give a body
		if (node.body.type !== 'BlockStatement') {
			node.expression = false;
			node.body = {
				magic: true,
				type: 'BlockStatement',
				body: [node.body],
			};
		}
		node.params.map(function (param) {
			patcher.walk(param, patcher, patcher.stage);
		});
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
		console.log('patcher', patcher);
	};

	STAGE1.CallExpression = function (node, patcher) {
		// patched in node, ignore
		if (node.magic) {
			patcher.walk(node.callee, patcher, patcher.stage);
			node.arguments.map(function (arg) {
				patcher.walk(arg, patcher, patcher.stage);
			});
			return;
		}
		node.magic = true;
		patcher.walk(node.callee, patcher, patcher.stage);
		node.arguments.map(function (arg) {
			patcher.walk(arg, patcher, patcher.stage);
		});
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var callee = resolveCallee(node.callee);
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_FUNCTION_CALL'),
			},
			arguments: [
				parseExpression(hash),
				parseExpression('this'),
				callee,
				(function () {
					if (node.callee.type === 'MemberExpression') {
						var property = node.callee.property;
						// identifier
						if (property.type === 'Identifier') {
							if (node.callee.computed) {
								return {
									magic: true,
									type: 'Identifier',
									name: property.name,
								};
							}
							return {
								magic: true,
								type: 'Literal',
								value: property.name,
							};
						}
						return property;
					}
					return parseExpression('null');
				})(),
				{
					magic: true,
					type: 'ArrayExpression',
					elements: [].concat(node.arguments),
				},
			],
		};
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.ReturnStatement = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		var arg = cloneNode(node.argument);
		if (arg !== null) {
			patcher.walk(arg, patcher, patcher.stage);
		}
		var scope = patcher.scope.getReturnContext();
		var name = parseExpression('"' + scope.node.id.name + '"');
		node.argument = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_FUNCTION_RETURN'),
			},
			arguments: [parseExpression(hash), name],
		};
		if (arg !== null) {
			node.argument.arguments.push(arg);
		}
	};

	STAGE1.BreakStatement = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var label = parseExpression(
			node.label ? '"' + node.label.name + '"' : 'null'
		);
		var expr = {
			magic: true,
			start: 0,
			end: 0,
			type: 'IfStatement',
			test: {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_BREAK'),
				},
				arguments: [
					parseExpression(hash),
					label,
					parseExpression('this'),
				],
			},
			consequent: {
				magic: true,
				type: 'BreakStatement',
				label: node.label,
			},
			alternate: null,
		};
		for (var key in expr) {
			if (!expr.hasOwnProperty(key)) {
				continue;
			}
			node[key] = expr[key];
		}
		node.magic = true;
	};

	STAGE1.ContinueStatement = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		if (node.label) {
			patcher.walk(node.label, patcher, patcher.stage);
		}
		var label = parseExpression(
			node.label ? '"' + node.label.name + '"' : 'null'
		);
		var expr = {
			magic: true,
			start: 0,
			end: 0,
			type: 'IfStatement',
			test: {
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_CONTINUE'),
				},
				arguments: [
					parseExpression(hash),
					label,
					parseExpression('this'),
				],
			},
			consequent: {
				magic: true,
				type: 'ContinueStatement',
				label: node.label,
			},
			alternate: null,
		};
		for (var key in expr) {
			if (!expr.hasOwnProperty(key)) {
				continue;
			}
			node[key] = expr[key];
		}
		node.magic = true;
	};

	STAGE1.VariableDeclaration = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var ihash = uBranchHash();
		// create node link
		var clone = cloneNode(node);
		patcher.nodes[ihash] = {
			hash: ihash,
			node: clone,
		};
		node.magic = true;
		var decls = node.declarations;
		// walk
		for (var ii = 0; ii < decls.length; ++ii) {
			patcher.walk(decls[ii], patcher, patcher.stage);
		}
		// patch
		for (var ii$1 = 0; ii$1 < decls.length; ++ii$1) {
			var decl = decls[ii$1];
			var declClone = clone.declarations[ii$1];
			if (decl.magic) {
				continue;
			}
			var init = decl.init;
			decl.magic = true;
			var dhash = uBranchHash();
			// create node link
			patcher.nodes[dhash] = {
				hash: dhash,
				node: declClone,
			};
			decl.init = {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_VAR_INIT'),
				},
				arguments: [
					parseExpression(ihash),
					// fire declaration instant by placing a call wrapper around
					// then assign its value afterwards
					{
						magic: true,
						type: 'CallExpression',
						callee: {
							magic: true,
							type: 'Identifier',
							name: patcher.instance.getLink('DEBUG_VAR_DECLARE'),
						},
						arguments: [
							parseExpression(dhash),
							{
								magic: true,
								type: 'Literal',
								value: decl.id.name,
								raw: '"' + decl.id.name + '"',
							},
						],
					},
				],
			};
			if (init !== null) {
				decl.init.arguments.push(init);
			}
		}
	};

	STAGE1.NewExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		node.magic = true;
		patcher.walk(node.callee, patcher, patcher.stage);
		node.arguments.map(function (arg) {
			patcher.walk(arg, patcher, patcher.stage);
		});
		var callee = cloneNode(node.callee);
		var args = [
			callee,
			{
				magic: true,
				type: 'ArrayExpression',
				elements: [].concat(node.arguments),
			},
		];
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};

		node.callee = {
			magic: true,
			type: 'Identifier',
			name: patcher.instance.getLink('DEBUG_OP_NEW_END'),
		};
		node.arguments = [
			parseExpression(hash),
			parseExpression(patcher.instance.key),
			{
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_OP_NEW'),
				},
				arguments: [parseExpression(hash)].concat(args),
			},
		];
	};

	STAGE1.ObjectExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		node.properties.map(function (prop) {
			patcher.walk(prop, patcher, patcher.stage);
		});
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_ALLOC'),
			},
			arguments: [parseExpression(hash), cloneNode(node)],
		};
		delete node.properties;
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.MemberExpression = function (node, patcher) {
		if (node.magic) {
			patcher.walk(node.object, patcher, patcher.stage);
			patcher.walk(node.property, patcher, patcher.stage);
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		patcher.walk(node.object, patcher, patcher.stage);
		patcher.walk(node.property, patcher, patcher.stage);
		var property = node.property;
		if (node.property.type === 'Identifier') {
			property = {
				magic: true,
				type: 'Literal',
				value: property.name,
			};
		}
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_MEMBER_EXPR'),
			},
			arguments: [parseExpression(hash), node.object, property],
		};
		call = {
			magic: true,
			type: 'MemberExpression',
			object: call,
			property: node.property,
		};
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.AssignmentExpression = function (node, patcher) {
		if (node.magic) {
			node.left.magic = true;
			patcher.walk(node.left, patcher, patcher.stage);
			patcher.walk(node.right, patcher, patcher.stage);
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		node.left.magic = true;
		var left = node.left;
		var right = node.right;
		var operator = node.operator;
		if (operator !== '=') {
			operator = operator.substr(0, operator.length - 1);
		}
		// #object assignment
		var object = null;
		var property = null;
		// skip the last property and manually
		// access it inside the debug function
		if (left.type === 'MemberExpression') {
			if (left.property.type === 'Identifier') {
				if (left.computed) {
					property = left.property;
				} else {
					property = {
						magic: true,
						type: 'Literal',
						value: left.property.name,
					};
				}
			} else {
				property = left.property;
			}
			object = left.object;
		}
		// identifier based assignment
		// fixed up below by turning into assign expr again
		else if (left.type === 'Identifier') {
			object = left;
			property = parseExpression(null);
		}
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_ASSIGN'),
			},
			arguments: [
				parseExpression(hash),
				parseExpression(OP[operator]),
				left.type === 'Identifier'
					? parseExpression('"' + left.name + '"')
					: object,
				property,
				right,
			],
		};
		// #identifier assignment
		if (left.type === 'Identifier') {
			call = {
				magic: true,
				type: 'AssignmentExpression',
				operator: node.operator,
				left: object,
				right: call,
			};
		}
		patcher.walk(node.left, patcher, patcher.stage);
		patcher.walk(node.right, patcher, patcher.stage);
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.UpdateExpression = function (node, patcher) {
		if (node.magic) {
			patcher.walk(node.argument, patcher, patcher.stage);
			return;
		}
		node.magic = true;
		patcher.walk(node.argument, patcher, patcher.stage);
		var hash = uBranchHash();
		// create node link
		var clone = cloneNode(node);
		patcher.nodes[hash] = {
			hash: hash,
			node: clone,
		};
		var arg = node.argument;
		var operator = node.operator;
		// #object assignment
		var object = null;
		var property = null;
		// skip the last property and manually
		// access it inside the debug function
		if (arg.type === 'MemberExpression') {
			if (arg.property.type === 'Identifier') {
				if (arg.computed) {
					property = arg.property;
				} else {
					property = {
						magic: true,
						type: 'Literal',
						value: arg.property.name,
					};
				}
			} else {
				property = arg.property;
			}
			object = arg.object;
		}
		// identifier based assignment
		// fixed up below by turning into assign expr again
		else if (arg.type === 'Identifier') {
			object = arg;
			property = parseExpression(null);
		}
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_UPDATE'),
			},
			arguments: [
				parseExpression(hash),
				parseExpression(OP[operator]),
				clone,
				parseExpression(node.prefix),
			],
		};
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.ArrayExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		node.elements.map(function (el) {
			if (el !== null) {
				patcher.walk(el, patcher, patcher.stage);
			}
		});
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_ALLOC'),
			},
			arguments: [parseExpression(hash), cloneNode(node)],
		};
		delete node.elements;
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.Literal = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		var clone = cloneNode(node);
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: clone,
		};
		node.magic = true;
		var call = {
			magic: true,
			type: 'CallExpression',
			callee: {
				magic: true,
				type: 'Identifier',
				name: patcher.instance.getLink('DEBUG_LITERAL'),
			},
			arguments: [parseExpression(hash), clone],
		};
		for (var key in call) {
			if (!call.hasOwnProperty(key)) {
				continue;
			}
			node[key] = call[key];
		}
	};

	STAGE1.ForStatement = function (node, patcher) {
		if (!node.hasOwnProperty('labels')) {
			node.labels = [];
		}
		patcher.pushScope(node);
		if (node.test) {
			patcher.walk(node.test, patcher, patcher.stage);
		}
		if (node.init) {
			patcher.walk(node.init, patcher, patcher.stage);
		}
		if (node.update) {
			patcher.walk(node.update, patcher, patcher.stage);
		}
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.ForInStatement = function (node, patcher) {
		node.left.magic = true;
		patcher.pushScope(node);
		patcher.walk(node.left, patcher, patcher.stage);
		patcher.walk(node.right, patcher, patcher.stage);
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.ForOfStatement = function (node, patcher) {
		node.left.magic = true;
		patcher.pushScope(node);
		patcher.walk(node.left, patcher, patcher.stage);
		patcher.walk(node.right, patcher, patcher.stage);
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.WhileStatement = function (node, patcher) {
		patcher.pushScope(node);
		if (node.test) {
			patcher.walk(node.test, patcher, patcher.stage);
		}
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE1.DoWhileStatement = function (node, patcher) {
		patcher.pushScope(node);
		if (node.test) {
			patcher.walk(node.test, patcher, patcher.stage);
		}
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	var STAGE2 = {};

	STAGE2.IfStatement = function (node, patcher) {
		if (node.magic) {
			patcher.walk(node.test, patcher, patcher.stage);
			patcher.walk(node.consequent, patcher, patcher.stage);
			if (node.alternate) {
				patcher.walk(node.alternate, patcher, patcher.stage);
			}
			return;
		}
		node.magic = true;

		var test = cloneNode(node.test);
		// branch hash
		var elseHash = uBranchHash();
		var isElse = node.alternate && node.alternate.type !== 'IfStatement';
		var isBlockedElse = isElse && node.alternate.body === 'BlockStatement';

		if (isElse) {
			// create node link
			var link = {
				hash: elseHash,
				node: null,
			};
			patcher.nodes[elseHash] = link;
			link.node = cloneNode(node.alternate);
			if (!isBlockedElse) {
				// force else to be blocked
				var alternate = node.alternate;
				node.alternate = parseExpressionStatement('{}');
				node.alternate.body.push(alternate);
			}
		}

		// branch hash
		var ifHash = uBranchHash();
		// create node link
		patcher.nodes[ifHash] = {
			hash: ifHash,
			node: cloneNode(node),
		};

		patcher.walk(node.test, patcher, patcher.stage);
		patcher.walk(node.consequent, patcher, patcher.stage);
		if (node.alternate) {
			patcher.walk(node.alternate, patcher, patcher.stage);
		}

		var id = reserveTempVarId();
		var patch = parseExpressionStatement('var ' + id + ';');
		injectPatchIntoNode(patcher.scope.node, patch);

		// debug if test
		node.test = {
			magic: true,
			type: 'AssignmentExpression',
			operator: '=',
			left: parseExpression(id),
			right: {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_IF_TEST'),
				},
				arguments: [parseExpression(ifHash), node.test],
			},
		};

		// patch else enter, leave
		if (isElse) {
			var end$1 = parseExpressionStatement(
				patcher.instance.getLinkCall('DEBUG_ELSE_LEAVE')
			);
			var start$1 = parseExpressionStatement(
				patcher.instance.getLinkCall('DEBUG_ELSE_ENTER')
			);
			end$1.expression.arguments.push(parseExpression(elseHash));
			start$1.expression.arguments.push(parseExpression(elseHash));
			node.alternate.body.unshift(start$1);
			node.alternate.body.push(end$1);
		}

		// debug if body enter, leave
		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_IF_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_IF_ENTER')
		);
		// branch hash
		end.expression.arguments.push(parseExpression(ifHash));
		// branch hash
		start.expression.arguments.push(parseExpression(ifHash));
		// pass in condition result into if enter
		start.expression.arguments.push(parseExpression(id));
		if (node.consequent.type === 'BlockStatement') {
			node.consequent.body.unshift(start);
			node.consequent.body.push(end);
		} else {
			node.consequent = {
				type: 'BlockStatement',
				body: [start, node.consequent, end],
			};
		}
	};

	STAGE2.Program = STAGE1.Program;
	STAGE2.BlockStatement = STAGE1.BlockStatement;
	STAGE2.MethodDefinition = STAGE1.MethodDefinition;
	STAGE2.FunctionDeclaration = STAGE1.FunctionDeclaration;
	STAGE2.FunctionExpression = STAGE1.FunctionExpression;
	STAGE2.ArrowFunctionExpression = STAGE1.ArrowFunctionExpression;

	var STAGE3 = {};

	STAGE3.BlockStatement = function (node, patcher) {
		var body = node.body;
		// transform try, switch and labels here
		for (var ii = 0; ii < body.length; ++ii) {
			var child = body[ii];
			//if (child.magic) continue;
			// labeled statement
			var isLabeledStmt = isLabeledStatement(child.type);
			if (isLabeledStmt) {
				child = processLabels(child);
			}
			var isTryStmt = isTryStatement(child.type);
			var isSwitchStmt = isSwitchStatement(child.type);
			var hash = -1;
			var isHashBranch = isTryStmt || isSwitchStmt;
			// only generate hash if necessary
			if (isHashBranch) {
				hash = uBranchHash();
			}
			// #ENTER
			if (isHashBranch) {
				var link = patcher.instance.getLinkCall(
					isTryStmt
						? 'DEBUG_TRY_ENTER'
						: isSwitchStmt
							? 'DEBUG_SWITCH_ENTER'
							: '' // throws error
				);
				var start = parseExpressionStatement(link);
				patcher.nodes[hash] = {
					hash: hash,
					node: cloneNode(child),
				};
				start.expression.arguments.push(parseExpression(hash));
				body.splice(ii, 0, start);
				ii++;
			}
			// switch test
			if (isSwitchStmt) {
				var test = {
					magic: true,
					type: 'CallExpression',
					callee: {
						magic: true,
						type: 'Identifier',
						name: patcher.instance.getLink('DEBUG_SWITCH_TEST'),
					},
					arguments: [parseExpression(hash), child.discriminant],
				};
				child.discriminant = test;
			}
			patcher.walk(child, patcher, patcher.stage);
			// #LEAVE
			if (isHashBranch) {
				var link$1 = patcher.instance.getLinkCall(
					isTryStmt
						? 'DEBUG_TRY_LEAVE'
						: isSwitchStmt
							? 'DEBUG_SWITCH_LEAVE'
							: '' // throws error
				);
				var end = parseExpressionStatement(link$1);
				end.expression.arguments.push(parseExpression(hash));
				body.splice(ii + 1, 0, end);
				ii++;
				if (isTryStmt) {
					if (child.finalizer) {
						STAGE3.FinalClause(child.finalizer, patcher);
					}
				}
			}
		}
	};

	STAGE3.CatchClause = function (node, patcher) {
		if (node.magic) {
			return;
		}
		patcher.pushScope(node);
		patcher.walk(node.param, patcher, patcher.stage);
		patcher.walk(node.body, patcher, patcher.stage);

		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var hashExpr = parseExpression(hash);
		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_CATCH_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_CATCH_ENTER')
		);
		end.expression.arguments.push(hashExpr);
		start.expression.arguments.push(hashExpr);
		node.body.body.unshift(start);
		node.body.body.push(end);

		patcher.popScope();
	};

	STAGE3.FinalClause = function (node, patcher) {
		if (node.magic) {
			return;
		}
		patcher.pushScope(node);
		patcher.walk(node, patcher, patcher.stage);

		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var hashExpr = parseExpression(hash);
		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FINAL_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FINAL_ENTER')
		);
		end.expression.arguments.push(hashExpr);
		start.expression.arguments.push(hashExpr);
		node.body.unshift(start);
		node.body.push(end);

		patcher.popScope();
	};

	STAGE3.Program = STAGE1.Program;
	STAGE3.MethodDefinition = STAGE1.MethodDefinition;
	STAGE3.FunctionDeclaration = STAGE1.FunctionDeclaration;
	STAGE3.FunctionExpression = STAGE1.FunctionExpression;
	STAGE3.ArrowFunctionExpression = STAGE1.ArrowFunctionExpression;

	var STAGE4 = {};

	STAGE4.SwitchStatement = function (node, patcher) {
		if (node.magic) {
			patcher.walk(node.discriminant, patcher, patcher.stage);
			node.cases.map(function (cs) {
				patcher.walk(cs, patcher, patcher.stage);
			});
			return;
		}
		node.magic = true;

		var hash = uBranchHash();
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};

		patcher.walk(node.discriminant, patcher, patcher.stage);
		node.cases.map(function (cs) {
			patcher.walk(cs, patcher, patcher.stage);
		});

		var id = reserveTempVarId();
		var patch = parseExpressionStatement('var ' + id + ';');
		injectPatchIntoNode(patcher.scope.node, patch);

		// debug if test
		node.discriminant = {
			magic: true,
			type: 'AssignmentExpression',
			operator: '=',
			left: parseExpression(id),
			right: node.discriminant,
		};
	};

	STAGE4.SwitchCase = function (node, patcher) {
		if (node.magic) {
			if (node.test) {
				patcher.walk(node.test, patcher, patcher.stage);
			}
			node.consequent.map(function (cons) {
				patcher.walk(cons, patcher, patcher.stage);
			});
			return;
		}
		node.magic = true;

		var hash = uBranchHash();

		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};

		var test = null;
		if (node.test) {
			var id = reserveTempVarId();
			var patch = parseExpressionStatement('var ' + id + ';');
			injectPatchIntoNode(patcher.scope.node, patch);
			test = parseExpression(id);
			// debug if test
			node.test = {
				magic: true,
				type: 'AssignmentExpression',
				operator: '=',
				left: test,
				right: node.test,
			};
			node.test = {
				magic: true,
				type: 'CallExpression',
				callee: {
					magic: true,
					type: 'Identifier',
					name: patcher.instance.getLink('DEBUG_CASE_TEST'),
				},
				arguments: [parseExpression(hash), node.test],
			};
		}

		// default or case
		var type = test !== null ? test : parseExpression('null');

		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_CASE_ENTER')
		);
		// pass case test result
		start.expression.arguments.push(parseExpression(hash));
		// pass case value
		start.expression.arguments.push(test || parseExpression(null));
		// trace default case
		start.expression.arguments.push(parseExpression(test === null));
		node.consequent.splice(0, 0, start);

		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_CASE_LEAVE')
		);
		end.expression.arguments.push(parseExpression(hash));
		node.consequent.splice(node.consequent.length, 0, end);
	};

	STAGE4.Program = STAGE1.Program;
	STAGE4.BlockStatement = STAGE1.BlockStatement;
	STAGE4.MethodDefinition = STAGE1.MethodDefinition;
	STAGE4.FunctionDeclaration = STAGE1.FunctionDeclaration;
	STAGE4.FunctionExpression = STAGE1.FunctionExpression;
	STAGE4.ArrowFunctionExpression = STAGE1.ArrowFunctionExpression;

	var STAGE5 = {};

	STAGE5.ClassDeclaration = function (node, patcher) {
		patcher.pushScope(node);
		patcher.walk(node.id, patcher, patcher.stage);
		patcher.walk(node.body, patcher, patcher.stage);
		patcher.popScope();
	};

	STAGE5.MethodDefinition = function (node, patcher) {
		if (node.magic) {
			patcher.pushScope(node);
			patcher.walk(node.key, patcher, patcher.stage);
			patcher.walk(node.value, patcher, patcher.stage);
			patcher.popScope();
			return;
		}

		var scope = patcher.scope;
		// branch hash
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};

		node.magic = true;
		node.value.superIndex = -1;
		node.value.superNode = null;
		patcher.pushScope(node);
		patcher.walk(node.key, patcher, patcher.stage);
		patcher.walk(node.value, patcher, patcher.stage);

		var isConstructor = node.kind === 'constructor';

		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_METHOD_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_METHOD_ENTER')
		);
		var body = node.value.body.body;

		start.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(parseExpression('arguments'));

		// patch constructor
		if (isConstructor) {
			if (node.value.superNode !== null) {
				// only function expressions supported for now
				console.assert(node.value.type === 'FunctionExpression');
				// find super class call
				// patch in ctor enter, leave afterwards
				var index = node.value.superIndex;
				body.splice(index + 1, 0, start);
				body.splice(index + body.length, 0, end);
			} else {
				body.splice(0, 0, start);
				body.splice(body.length, 0, end);
			}
		} else {
			body.splice(0, 0, start);
			body.splice(body.length, 0, end);
		}

		// constructor state
		end.expression.arguments.unshift(parseExpression(isConstructor));
		start.expression.arguments.unshift(parseExpression(isConstructor));

		// class name
		end.expression.arguments.unshift(scope.node.id);
		start.expression.arguments.unshift(scope.node.id);

		// hash
		end.expression.arguments.unshift(parseExpression(hash));
		start.expression.arguments.unshift(parseExpression(hash));

		patcher.popScope();
	};

	STAGE5.CallExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		// dont patch super class calls
		if (node.callee && node.callee.type === 'Super') {
			var scope = patcher.scope.node;
			var index = -1;
			console.assert(scope.type === 'FunctionExpression');
			scope.body.body.map(function (child, idx) {
				console.assert(child.type === 'ExpressionStatement');
				if (child.expression === node) {
					index = idx;
				}
			});
			console.assert(index !== -1);
			scope.superIndex = index;
			scope.superNode = node;

			// patch debug super
			node.arguments = [
				{
					magic: true,
					type: 'CallExpression',
					callee: {
						magic: true,
						type: 'Identifier',
						name: patcher.instance.getLink('DEBUG_SUPER'),
					},
					arguments: [
						// class ctor
						patcher.scope.parent.parent.node.id,
						{
							magic: true,
							type: 'SpreadElement',
							argument: {
								magic: true,
								type: 'ArrayExpression',
								elements: node.arguments,
							},
						},
					],
				},
			];
		}
	};

	STAGE5.Program = STAGE1.Program;
	STAGE5.BlockStatement = STAGE1.BlockStatement;
	STAGE5.FunctionDeclaration = STAGE1.FunctionDeclaration;
	STAGE5.FunctionExpression = STAGE1.FunctionExpression;
	STAGE5.ArrowFunctionExpression = STAGE1.ArrowFunctionExpression;

	var STAGE6 = {};

	STAGE6.FunctionDeclaration = function (node, patcher) {
		patcher.pushScope(node);
		patcher.walk(node.id, patcher, patcher.stage);
		node.params.map(function (param) {
			patcher.walk(param, patcher, patcher.stage);
		});
		patcher.walk(node.body, patcher, patcher.stage);

		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var hashExpr = parseExpression(hash);
		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FUNCTION_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FUNCTION_ENTER')
		);
		end.expression.arguments.push(hashExpr);
		end.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(hashExpr);
		start.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(parseExpression(node.id.name));
		start.expression.arguments.push(parseExpression('arguments'));
		node.body.body.unshift(start);
		node.body.body.push(end);

		patcher.popScope();
	};

	STAGE6.FunctionExpression = function (node, patcher) {
		if (patcher.scope.node.type === 'MethodDefinition') {
			return;
		}
		patcher.pushScope(node);
		patcher.walk(node.id, patcher, patcher.stage);
		node.params.map(function (param) {
			patcher.walk(param, patcher, patcher.stage);
		});
		patcher.walk(node.body, patcher, patcher.stage);

		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var hashExpr = parseExpression(hash);
		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FUNCTION_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FUNCTION_ENTER')
		);
		end.expression.arguments.push(hashExpr);
		end.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(hashExpr);
		start.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(parseExpression(node.id.name));
		start.expression.arguments.push(parseExpression('arguments'));
		node.body.body.unshift(start);
		node.body.body.push(end);

		patcher.popScope();
	};

	STAGE6.ArrowFunctionExpression = function (node, patcher) {
		patcher.pushScope(node);
		node.params.map(function (param) {
			patcher.walk(param, patcher, patcher.stage);
		});
		patcher.walk(node.body, patcher, patcher.stage);

		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		var hashExpr = parseExpression(hash);
		var end = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FUNCTION_LEAVE')
		);
		var start = parseExpressionStatement(
			patcher.instance.getLinkCall('DEBUG_FUNCTION_ENTER')
		);
		end.expression.arguments.push(hashExpr);
		end.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(hashExpr);
		start.expression.arguments.push(parseExpression('this'));
		start.expression.arguments.push(parseExpression(node.id.name));
		var args = {
			magic: true,
			type: 'ArrayExpression',
			elements: [],
		};
		node.params.map(function (param) {
			args.elements.push(param);
		});
		start.expression.arguments.push(args);
		node.body.body.unshift(start);
		node.body.body.push(end);

		patcher.popScope();
	};

	STAGE6.Program = STAGE1.Program;
	STAGE6.BlockStatement = STAGE1.BlockStatement;
	STAGE6.MethodDefinition = STAGE1.MethodDefinition;

	var STAGE7 = {};

	STAGE7.BlockStatement = function (node, patcher) {
		var body = node.body;
		for (var ii = 0; ii < body.length; ++ii) {
			var child = body[ii];
			//if (child.magic) continue;
			//child.magic = true;

			// labeled statement
			var isLabeledStmt = isLabeledStatement(child.type);
			if (isLabeledStmt) {
				child = processLabels(child);
			}

			var isLazyBlock = child.type === 'BlockStatement';
			var isLoopStmt = isLoopStatement(child.type);
			var isSwitchStmt = isSwitchStatement(child.type);
			var isHashBranch = isLoopStmt || isLazyBlock;
			var hash = -1;
			var id = null;
			if (isHashBranch) {
				// generate hash
				hash = uBranchHash();
				id = reserveTempVarId();
				patcher.nodes[hash] = {
					hash: hash,
					node: cloneNode(child),
				};
			}

			if (isLazyBlock) {
				var start = {
					magic: true,
					type: 'ExpressionStatement',
					expression: {
						magic: true,
						type: 'CallExpression',
						callee: {
							magic: true,
							type: 'Identifier',
							name: patcher.instance.getLink('DEBUG_BLOCK_ENTER'),
						},
						arguments: [parseExpression(hash)],
					},
				};
				var end = {
					magic: true,
					type: 'ExpressionStatement',
					expression: {
						magic: true,
						type: 'CallExpression',
						callee: {
							magic: true,
							type: 'Identifier',
							name: patcher.instance.getLink('DEBUG_BLOCK_LEAVE'),
						},
						arguments: [parseExpression(hash)],
					},
				};
				child.body.unshift(start);
				child.body.push(end);
				patcher.walk(child, patcher, patcher.stage);
				continue;
			}

			if (isLoopStmt) {
				forceLoopBodyBlocked(child);
				console.assert(child.body.type === 'BlockStatement');

				var patch = parseExpressionStatement('var ' + id + ' = 0;');
				body.splice(ii, 0, patch);
				ii++;

				var test = {
					magic: true,
					type: 'CallExpression',
					callee: {
						magic: true,
						type: 'Identifier',
						name: patcher.instance.getLink('DEBUG_LOOP_TEST'),
					},
					arguments: [
						parseExpression(hash),
						child.test
							? child.test
							: // empty for test means infinite
								child.type === 'ForStatement'
								? parseExpression(true)
								: '', // throws error
						parseExpression('"' + child.type + '"'),
					],
				};
				child.test = test;

				var start$1 = {
					magic: true,
					type: 'IfStatement',
					test: parseExpression(id + ' === 0'),
					alternate: null,
					consequent: {
						magic: true,
						type: 'ExpressionStatement',
						expression: {
							magic: true,
							type: 'CallExpression',
							callee: {
								magic: true,
								type: 'Identifier',
								name: patcher.instance.getLink(
									'DEBUG_LOOP_ENTER'
								),
							},
							arguments: [
								parseExpression(hash),
								// set the loop enter state to fullfilled
								parseExpression(id + ' = 1'),
								parseExpression('"' + child.type + '"'),
							],
						},
					},
				};
				child.body.body.unshift(start$1);
			}
			patcher.walk(child, patcher, patcher.stage);
			if (isLoopStmt) {
				var end$1 = {
					magic: true,
					type: 'ExpressionStatement',
					expression: {
						magic: true,
						type: 'CallExpression',
						callee: {
							magic: true,
							type: 'Identifier',
							name: patcher.instance.getLink('DEBUG_LOOP_LEAVE'),
						},
						arguments: [
							parseExpression(hash),
							parseExpression(id),
							parseExpression('"' + child.type + '"'),
						],
					},
				};
				body.splice(ii + 1, 0, end$1);
				ii++;
			}
		}
	};

	STAGE7.Program = STAGE1.Program;
	STAGE7.MethodDefinition = STAGE1.MethodDefinition;
	STAGE7.FunctionDeclaration = STAGE1.FunctionDeclaration;
	STAGE7.FunctionExpression = STAGE1.FunctionExpression;
	STAGE7.ArrowFunctionExpression = STAGE1.ArrowFunctionExpression;

	var STAGE8 = {};

	STAGE8.ThisExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		node.type = 'CallExpression';
		node.callee = {
			magic: true,
			type: 'Identifier',
			name: patcher.instance.getLink('DEBUG_THIS'),
		};
		node.arguments = [parseExpression(hash), parseExpression('this')];
	};

	STAGE8.BinaryExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		patcher.walk(node.left, patcher, patcher.stage);
		patcher.walk(node.right, patcher, patcher.stage);
		node.magic = true;
		node.type = 'CallExpression';
		node.callee = {
			magic: true,
			type: 'Identifier',
			name: patcher.instance.getLink('DEBUG_BINARY'),
		};
		node.arguments = [
			parseExpression(hash),
			parseExpression(OP[node.operator]),
			node.left,
			node.right,
		];
	};

	STAGE8.LogicalExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		patcher.walk(node.left, patcher, patcher.stage);
		patcher.walk(node.right, patcher, patcher.stage);
		node.magic = true;
		node.type = 'CallExpression';
		node.callee = {
			magic: true,
			type: 'Identifier',
			name: patcher.instance.getLink('DEBUG_LOGICAL'),
		};
		var right = parseExpression('(function() { }).bind(this)');
		// enter bind expression to get the binded function
		var fn = right.callee.object;
		fn.body.body.push({
			magic: true,
			type: 'ReturnStatement',
			argument: node.right,
		});
		node.arguments = [
			parseExpression(hash),
			parseExpression(OP[node.operator]),
			node.left,
			right,
		];
	};

	STAGE8.UnaryExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		patcher.walk(node.argument, patcher, patcher.stage);
		node.type = 'CallExpression';
		node.callee = {
			magic: true,
			type: 'Identifier',
			name: patcher.instance.getLink('DEBUG_UNARY'),
		};
		var argument = node.argument;
		// non-trackable yet FIXME
		if (node.operator === 'delete') {
			argument = {
				magic: true,
				type: 'UnaryExpression',
				operator: node.operator,
				prefix: true,
				argument: argument,
			};
		}
		node.arguments = [
			parseExpression(hash),
			parseExpression(OP[node.operator]),
			parseExpression('this'),
			parseExpression(false),
			argument,
		];
		// typeof fixup
		// typeof is a weirdo
		if (node.operator === 'typeof' && argument.type === 'Identifier') {
			var id = reserveTempVarId();
			var patch = parseExpressionStatement('var ' + id + ';');
			injectPatchIntoNode(patcher.scope.node, patch);
			var name = argument.name;
			// heute sind wir räudig
			var critical = parseExpression(
				'(function() { try { ' +
					name +
					'; } catch(e) { ' +
					id +
					' = "undefined"; return true; } ' +
					id +
					' = ' +
					name +
					'; return false; }).bind(this)()'
			);
			node.arguments = [
				parseExpression(hash),
				parseExpression(OP[node.operator]),
				parseExpression('this'),
				critical,
				parseExpression(id),
			];
		}
	};

	STAGE8.ConditionalExpression = function (node, patcher) {
		if (node.magic) {
			return;
		}
		var hash = uBranchHash();
		// create node link
		patcher.nodes[hash] = {
			hash: hash,
			node: cloneNode(node),
		};
		node.magic = true;
		patcher.walk(node.test, patcher, patcher.stage);
		patcher.walk(node.consequent, patcher, patcher.stage);
		patcher.walk(node.alternate, patcher, patcher.stage);

		var cons = parseExpression('(function() { }).bind(this)');
		cons.callee.object.body.body.push({
			magic: true,
			type: 'ReturnStatement',
			argument: node.consequent,
		});
		var alt = parseExpression('(function() { }).bind(this)');
		alt.callee.object.body.body.push({
			magic: true,
			type: 'ReturnStatement',
			argument: node.alternate,
		});

		node.type = 'CallExpression';
		node.callee = {
			magic: true,
			type: 'Identifier',
			name: patcher.instance.getLink('DEBUG_TERNARY'),
		};
		node.arguments = [parseExpression(hash), node.test, cons, alt];
	};

	/*
    STAGE8.Literal = function(node) {
      if (node.magic) return;
      let clone = Iroh.cloneNode(node);
      node.magic = true;
      node.type = "CallExpression";
      node.callee = {
        magic: true,
        type: "Identifier",
        name: Iroh.getLink("DEBUG_LITERAL")
      };
      node.arguments = [
        clone
      ];
    };
    
    STAGE8.Identifier = function(node) {
      if (node.magic) return;
      node.magic = true;
      let clone = Iroh.cloneNode(node);
      node.type = "CallExpression";
      node.callee = {
        magic: true,
        type: "Identifier",
        name: Iroh.getLink("DEBUG_IDENTIFIER")
      };
      node.arguments = [
        Iroh.parseExpression(`"${node.name}"`),
        clone
      ];
    };
    */

	STAGE8.Program = STAGE1.Program;
	STAGE8.BlockStatement = STAGE1.BlockStatement;
	STAGE8.MethodDefinition = STAGE1.MethodDefinition;
	STAGE8.FunctionDeclaration = STAGE1.FunctionDeclaration;
	STAGE8.FunctionExpression = STAGE1.FunctionExpression;
	STAGE8.ArrowFunctionExpression = STAGE1.ArrowFunctionExpression;

	var Patcher = function Patcher(instance) {
		this.uid = uid();
		// patch AST scope
		this.scope = null;
		// patch stage
		this.stage = null;
		// patch state
		this.state = null;
		// node symbols
		this.symbols = {};
		// node clones
		this.nodes = {};
		// stage instance
		this.instance = instance;
	};

	Patcher.prototype.walk = function (ast, state, visitors) {
		return walk_3(ast, state, visitors, walk_1);
	};

	Patcher.prototype.pushScope = function (node) {
		var tmp = this.scope;
		this.scope = new Scope(node);
		this.scope.parent = tmp;
	};

	Patcher.prototype.popScope = function (node) {
		this.scope = this.scope.parent;
	};

	Patcher.prototype.applyStagePatch = function (ast, stage) {
		this.stage = stage;
		this.walk(ast, this, this.stage);
	};

	Patcher.prototype.applyPatches = function (ast) {
		this.applyStagePatch(ast, STAGE2);
		this.applyStagePatch(ast, STAGE7);
		this.applyStagePatch(ast, STAGE4);
		this.applyStagePatch(ast, STAGE5);
		this.applyStagePatch(ast, STAGE1);
		this.applyStagePatch(ast, STAGE3);
		this.applyStagePatch(ast, STAGE6);
		this.applyStagePatch(ast, STAGE8);
	};

	var RuntimeEvent = function RuntimeEvent(type, instance) {
		this.type = type;
		this.category = getCategoryFromInstruction(type);
		// base properties
		this.hash = -1;
		this.indent = -1;
		this.node = null;
		this.location = null;
		this.instance = instance;
		// TODO
		// turn all events into seperate classes
		// so we can save a lot memory
	};
	RuntimeEvent.prototype.trigger = function trigger(trigger$1) {
		// trigger all attached listeners
		this.instance.triggerListeners(this, trigger$1);
	};
	RuntimeEvent.prototype.getASTNode = function getASTNode() {
		var node = this.instance.nodes[this.hash].node;
		return node;
	};
	RuntimeEvent.prototype.getPosition = function getPosition() {
		var node = this.getASTNode();
		return {
			end: node.end,
			start: node.start,
		};
	};
	RuntimeEvent.prototype.getLocation = function getLocation() {
		var node = this.getASTNode();
		return node.loc;
	};
	RuntimeEvent.prototype.getSource = function getSource() {
		var loc = this.getPosition();
		var input = this.instance.input;
		var output = input.substr(loc.start, loc.end - loc.start);
		return output;
	};

	var RuntimeListenerEvent = function RuntimeListenerEvent(type, callback) {
		this.type = type;
		this.callback = callback;
	};

	var RuntimeListener = function RuntimeListener(category) {
		this.category = category;
		this.triggers = {};
	};
	RuntimeListener.prototype.on = function on(type, callback) {
		var event = new RuntimeListenerEvent(type, callback);
		// not registered yet
		if (this.triggers[type] === void 0) {
			this.triggers[type] = [];
		}
		this.triggers[type].push(event);
		// allow stream calls
		return this;
	};
	RuntimeListener.prototype.trigger = function trigger(event, trigger$1) {
		// any triggers registered?
		if (!this.triggers.hasOwnProperty(trigger$1)) {
			return;
		}
		var triggers = this.triggers[trigger$1];
		for (var ii = 0; ii < triggers.length; ++ii) {
			triggers[ii].callback(event);
		}
	};

	function evalUnaryExpression(op, ctx, a) {
		switch (op) {
			case OP['+']:
				return +a;
			case OP['-']:
				return -a;
			case OP['!']:
				return !a;
			case OP['~']:
				return ~a;
			case OP['void']:
				return void a;
			case OP['typeof']:
				return typeof a;
			// handled outside
			case OP['delete']:
				return a;
			default:
				throw new Error('Invalid operator ' + op);
				break;
		}
	}

	function evalBinaryExpression(op, a, b) {
		switch (op) {
			case OP['+']:
				return a + b;
			case OP['-']:
				return a - b;
			case OP['*']:
				return a * b;
			case OP['/']:
				return a / b;
			case OP['%']:
				return a % b;
			case OP['**']:
				return Math.pow(a, b);
			case OP['<<']:
				return a << b;
			case OP['>>']:
				return a >> b;
			case OP['>>>']:
				return a >>> b;
			case OP['&']:
				return a & b;
			case OP['^']:
				return a ^ b;
			case OP['|']:
				return a | b;
			case OP['in']:
				return a in b;
			case OP['==']:
				return a == b;
			case OP['===']:
				return a === b;
			case OP['!=']:
				return a != b;
			case OP['!==']:
				return a !== b;
			case OP['>']:
				return a > b;
			case OP['>=']:
				return a >= b;
			case OP['<']:
				return a < b;
			case OP['<=']:
				return a <= b;
			case OP['instanceof']:
				return a instanceof b;
			default:
				throw new Error('Invalid operator ' + op);
				break;
		}
	}

	function evalObjectAssignmentExpression(op, obj, prop, value) {
		switch (op) {
			case OP['=']:
				return (obj[prop] = value);
			case OP['+']:
				return (obj[prop] += value);
			case OP['-']:
				return (obj[prop] -= value);
			case OP['*']:
				return (obj[prop] *= value);
			case OP['/']:
				return (obj[prop] /= value);
			case OP['%']:
				return (obj[prop] %= value);
			case OP['**']:
				return (obj[prop] = Math.pow(obj[prop], value));
			case OP['<<']:
				return (obj[prop] <<= value);
			case OP['>>']:
				return (obj[prop] >>= value);
			case OP['>>>']:
				return (obj[prop] >>>= value);
			case OP['&']:
				return (obj[prop] &= value);
			case OP['^']:
				return (obj[prop] ^= value);
			case OP['|']:
				return (obj[prop] |= value);
			default:
				throw new Error('Invalid operator ' + op);
				break;
		}
	}

	// #IF
	function DEBUG_IF_TEST(hash, value) {
		// API
		var event = this.createEvent(INSTR.IF_TEST);
		event.hash = hash;
		event.value = value;
		event.indent = this.indent;
		event.trigger('test');
		// API END
		return event.value;
	}
	function DEBUG_IF_ENTER(hash, value) {
		//console.log(indentString(this.indent) + "if");
		// FRAME
		var frame = this.pushFrame(INSTR.IF_ENTER, hash);
		frame.values = [hash, value];
		// FRAME END
		// API
		var event = this.createEvent(INSTR.IF_ENTER);
		event.hash = hash;
		event.value = value;
		event.indent = this.indent;
		event.trigger('enter');
		// API END
		this.indent += INDENT_FACTOR;
	}
	function DEBUG_IF_LEAVE(hash) {
		this.indent -= INDENT_FACTOR;
		// API
		var event = this.createEvent(INSTR.IF_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('leave');
		// API END
		//console.log(indentString(this.indent) + "if end");
		// FRAME
		this.popFrame();
		// FRAME END
	}

	// #ELSE
	function DEBUG_ELSE_ENTER(hash) {
		// API
		var event = this.createEvent(INSTR.ELSE_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('enter');
		// API END
		//console.log(indentString(this.indent) + "else");
		// FRAME
		var frame = this.pushFrame(INSTR.ELSE_ENTER, hash);
		frame.values = [hash];
		// FRAME END
		this.indent += INDENT_FACTOR;
	}
	function DEBUG_ELSE_LEAVE(hash) {
		this.indent -= INDENT_FACTOR;
		// API
		var event = this.createEvent(INSTR.ELSE_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('leave');
		// API END
		//console.log(indentString(this.indent) + "else end");
		// FRAME
		this.popFrame();
		// FRAME END
	}

	// #LOOPS
	function DEBUG_LOOP_TEST(hash, value, kind) {
		// API
		var event = this.createEvent(INSTR.LOOP_TEST);
		event.hash = hash;
		event.indent = this.indent;
		event.value = value;
		event.kind = kind;
		event.trigger('test');
		// API END
		return event.value;
	}
	function DEBUG_LOOP_ENTER(hash, id, kind) {
		// API
		var event = this.createEvent(INSTR.LOOP_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.kind = kind;
		event.trigger('enter');
		// API END
		//console.log(indentString(this.indent) + "loop", hash);
		// FRAME
		var frame = this.pushFrame(INSTR.LOOP_ENTER, hash);
		frame.values = [hash, 1];
		// FRAME END
		this.indent += INDENT_FACTOR;
	}
	function DEBUG_LOOP_LEAVE(hash, entered, kind) {
		// loop never entered, so dont leave it
		if (entered === 0) {
			return;
		}
		this.indent -= INDENT_FACTOR;
		// API
		var event = this.createEvent(INSTR.LOOP_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.kind = kind;
		event.trigger('leave');
		// API END
		//console.log(indentString(this.indent) + "loop end", hash);
		// FRAME
		this.popFrame();
		// FRAME END
	}

	// #FLOW
	function DEBUG_BREAK(hash, label, ctx) {
		// API
		var event = this.createEvent(INSTR.BREAK);
		event.hash = hash;
		event.value = true;
		event.label = label;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		//console.log(indentString(this.indent) + "break", label ? label : "");
		// FRAME
		var expect = this.resolveBreakFrame(this.frame, label);
		this.leaveFrameUntil(expect);
		// FRAME END
		return event.value;
	}
	function DEBUG_CONTINUE(hash, label, ctx) {
		// API
		var event = this.createEvent(INSTR.CONTINUE);
		event.hash = hash;
		event.value = true;
		event.label = label;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		//console.log(indentString(this.indent) + "continue", label ? label : "");
		// FRAME
		var expect = this.resolveBreakFrame(this.frame, label);
		this.leaveFrameUntil(expect);
		// FRAME END
		return event.value;
	}

	// # SWITCH
	function DEBUG_SWITCH_TEST(hash, value) {
		// API
		var event = this.createEvent(INSTR.SWITCH_TEST);
		event.hash = hash;
		event.value = value;
		event.indent = this.indent;
		event.trigger('test');
		// API END
		return event.value;
	}
	function DEBUG_SWITCH_ENTER(hash) {
		// API
		var event = this.createEvent(INSTR.SWITCH_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('enter');
		// API END
		//console.log(indentString(this.indent) + "switch");
		// FRAME
		var frame = this.pushFrame(INSTR.SWITCH_ENTER, hash);
		frame.values = [hash];
		// FRAME END
		this.indent += INDENT_FACTOR;
	}
	function DEBUG_SWITCH_LEAVE(hash) {
		this.indent -= INDENT_FACTOR;
		// API
		var event = this.createEvent(INSTR.SWITCH_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('leave');
		// API END
		//console.log(indentString(this.indent) + "switch end");
		// FRAME
		this.popFrame();
		// FRAME END
	}

	// #CASE
	function DEBUG_CASE_TEST(hash, value) {
		// API
		var event = this.createEvent(INSTR.CASE_TEST);
		event.hash = hash;
		event.value = value;
		event.indent = this.indent;
		event.trigger('test');
		// API END
		return event.value;
	}
	function DEBUG_CASE_ENTER(hash, value, isDefault) {
		// API
		var event = this.createEvent(INSTR.CASE_ENTER);
		event.hash = hash;
		event.value = value;
		event.default = isDefault;
		event.indent = this.indent;
		event.trigger('enter');
		// API END
		//console.log(indentString(this.indent) + (isDefault ? "default" : "case"));
		// FRAME
		var frame = this.pushFrame(INSTR.CASE_ENTER, hash);
		frame.values = [hash, value, isDefault];
		this.frame.isSwitchDefault = isDefault;
		// FRAME END
		this.indent += INDENT_FACTOR;
	}
	function DEBUG_CASE_LEAVE(hash) {
		this.indent -= INDENT_FACTOR;
		var isDefault = this.resolveCaseFrame(this.frame).isSwitchDefault;
		// API
		var event = this.createEvent(INSTR.CASE_LEAVE);
		event.hash = hash;
		event.isDefault = isDefault;
		event.indent = this.indent;
		event.trigger('leave');
		// API END
		//console.log(indentString(this.indent) + (isDefault ? "default" : "case") + " end");
		// FRAME
		this.popFrame();
		// FRAME END
	}

	// #CALL
	function DEBUG_FUNCTION_CALL(hash, ctx, object, call, args) {
		var ctor = object.constructor.prototype;
		var callee = getCallee(object, call);
		var previous = this.$$frameHash;
		var value = null;
		var root = null;
		var name = null;
		var proto = null;

		// create function
		if (call !== null) {
			root = object[call];
			proto = object;
		} else {
			root = object;
			proto = null;
		}
		name = root.name;

		var node = this.nodes[hash].node;
		// external functions are traced as sloppy
		var isSloppy = this.symbols[name] === void 0;

		node.isSloppy = isSloppy;

		// API
		var before = this.createEvent(INSTR.FUNCTION_CALL);
		before.hash = hash;
		before.context = ctx;
		before.object = proto;
		before.callee = call;
		before.name = callee;
		before.call = root;
		before.arguments = args;
		before.external = isSloppy;
		before.indent = this.indent;
		before.trigger('before');
		// API END

		// FRAME
		var frame = this.pushFrame(INSTR.FUNCTION_CALL, hash);
		frame.values = [
			hash,
			ctx,
			before.object,
			before.callee,
			before.arguments,
		];
		this.$$frameHash = Math.abs(hash);
		// FRAME END

		this.indent += INDENT_FACTOR;
		// evaluate function bully protected
		try {
			value = before.call.apply(before.object, before.arguments);
		} catch (e) {
			var tryFrame = this.resolveTryFrame(this.frame, true);
			// error isn't try-catch wrapped
			if (tryFrame === null) {
				this.reset();
				throw e;
				// error is try-catch wrapped
			} else {
				var catchFrame = this.resolveCatchClauseFrame(this.frame, true);
				var finalFrame = this.resolveFinalClauseFrame(this.frame, true);
				// something failed inside the catch frame
				if (catchFrame !== null || finalFrame !== null) {
					this.reset();
					throw e;
				}
			}
		}
		this.indent -= INDENT_FACTOR;

		// API
		var after = this.createEvent(INSTR.FUNCTION_CALL_END);
		after.hash = hash;
		after.context = before.context;
		after.object = before.object;
		after.callee = before.callee;
		after.name = callee;
		after.call = root;
		after.arguments = before.arguments;
		after.return = value;
		after.external = isSloppy;
		after.indent = this.indent;
		after.trigger('after');
		// API END

		// FRAME
		this.popFrame();
		this.$$frameHash = previous;
		// FRAME END

		return after.return;
	}

	// #FUNCTION
	function DEBUG_FUNCTION_ENTER(hash, ctx, scope, args) {
		this.previousScope = this.currentScope;
		this.currentScope = scope;
		// function sloppy since called with invalid call hash
		var isSloppy =
			this.$$frameHash <= 0 || this.nodes[this.$$frameHash].node.isSloppy;

		// API
		var event = this.createEvent(INSTR.FUNCTION_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.scope = scope;
		event.sloppy = isSloppy;
		event.arguments = args;
		event.name = this.nodes[hash].node.id.name;
		event.trigger('enter');
		// API END

		if (isSloppy) {
			//console.log(indentString(this.indent) + "call", name, "#sloppy", "(", args, ")");
			this.indent += INDENT_FACTOR;
		}
	}
	function DEBUG_FUNCTION_LEAVE(hash, ctx) {
		this.currentScope = this.previousScope;
		var isSloppy =
			this.$$frameHash <= 0 || this.nodes[this.$$frameHash].node.isSloppy;

		// API
		var event = this.createEvent(INSTR.FUNCTION_LEAVE);
		event.hash = hash;
		event.indent = this.indent - (isSloppy ? INDENT_FACTOR : 0);
		event.sloppy = isSloppy;
		event.name = this.nodes[hash].node.id.name;
		event.trigger('leave');
		// API END

		if (isSloppy) {
			this.indent -= INDENT_FACTOR;
			//console.log(indentString(this.indent) + "call", name, "end #sloppy", "->", [void 0]);
		}
	}
	function DEBUG_FUNCTION_RETURN(hash, name, value) {
		var isSloppy =
			this.$$frameHash <= 0 || this.nodes[this.$$frameHash].node.isSloppy;

		// API
		var event = this.createEvent(INSTR.FUNCTION_RETURN);
		event.hash = hash;
		event.name = name;
		event.return = value;
		event.indent = this.indent - (isSloppy ? INDENT_FACTOR : 0);
		event.sloppy = isSloppy;
		event.trigger('return');
		// API END

		// FRAME
		var expect = this.resolveReturnFrame(this.frame);
		this.leaveFrameUntil(expect);
		// FRAME END
		this.currentScope = this.previousScope;

		if (isSloppy) {
			this.indent -= INDENT_FACTOR;
			//console.log(indentString(this.indent) + "call", name, "end #sloppy", "->", [value]);
		}
		return event.return;
	}

	// # DECLS
	function DEBUG_VAR_DECLARE(hash, name) {
		//console.log(indentString(this.indent) + "▶️ Declare " + name);

		// API
		var event = this.createEvent(INSTR.VAR_DECLARE);
		event.hash = hash;
		event.name = name;
		event.indent = this.indent;
		event.trigger('before');
		// API END

		return name;
	}
	function DEBUG_VAR_INIT(hash, name, value) {
		//console.log(indentString(this.indent) + "⏩ Initialise " + name + "::" + value);

		// API
		var event = this.createEvent(INSTR.VAR_INIT);
		event.hash = hash;
		event.name = name;
		event.value = value;
		event.indent = this.indent;
		event.trigger('after');
		// API END

		return event.value;
	}

	// #NEW
	function DEBUG_OP_NEW(hash, ctor, args) {
		// API
		var event = this.createEvent(INSTR.OP_NEW);
		event.hash = hash;
		event.ctor = ctor;
		event.name = ctor.name || ctor.constructor.name;
		event.arguments = args;
		event.indent = this.indent;
		event.trigger('before');
		// API END

		//console.log(indentString(this.indent) + "new " + ctor.name);

		this.indent += INDENT_FACTOR;

		// FRAME
		var frame = this.pushFrame(INSTR.OP_NEW, hash);
		frame.values = [hash, event.ctor, event.arguments];
		// FRAME END

		return new (Function.prototype.bind.apply(
			event.ctor,
			[null].concat(event.arguments)
		))();
	}
	function DEBUG_OP_NEW_END(hash, self, ret) {
		self.indent -= INDENT_FACTOR;

		// FRAME
		self.popFrame();
		// FRAME END

		// API
		var event = self.createEvent(INSTR.OP_NEW_END);
		event.hash = hash;
		event.return = ret;
		event.indent = self.indent;
		event.trigger('after');
		// API END

		//console.log(indentString(self.indent) + "new end");

		return event.return;
	}

	// #SUPER
	function DEBUG_SUPER(cls, args) {
		// API TODO
		return args;
	}
	// method enter not available before super
	// super_fix is injected after super
	function DEBUG_SUPER_FIX(ctx) {
		// API TODO
	}

	// # CLASS METHOD
	function DEBUG_METHOD_ENTER(hash, cls, isConstructor, args) {
		// API TODO
		if (isConstructor) {
			var tree = getInheritanceTree(cls);
			console.log(indentString(this.indent) + 'ctor', tree.join('->'));
		} else {
			console.log(indentString(this.indent) + 'method');
		}
		this.indent += INDENT_FACTOR;
		var frame = this.pushFrame(INSTR.METHOD_ENTER, hash);
		frame.values = [hash, cls, isConstructor, args];
	}
	function DEBUG_METHOD_LEAVE(hash, cls, isConstructor) {
		// API TODO
		this.indent -= INDENT_FACTOR;
		console.log(
			indentString(this.indent) +
				(isConstructor ? 'ctor' : 'method') +
				' end'
		);
		this.popFrame();
	}

	// #TRY
	function DEBUG_TRY_ENTER(hash) {
		//console.log(indentString(this.indent) + "try");

		// API
		var event = this.createEvent(INSTR.TRY_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('enter');
		// API END

		this.indent += INDENT_FACTOR;
		// FRAME
		var frame = this.pushFrame(INSTR.TRY_ENTER, hash);
		frame.values = [hash];
		// FRAME END
	}
	function DEBUG_TRY_LEAVE(hash) {
		// FRAME
		// fix up missing left frames until try_leave
		// e.g. a call inside try, but never finished because it failed
		if (this.frame.type !== INSTR.TRY_ENTER) {
			var expect = this.resolveTryFrame(this.frame);
			this.leaveFrameUntil(expect);
		}
		this.popFrame();
		// FRAME END

		this.indent -= INDENT_FACTOR;

		// API
		var event = this.createEvent(INSTR.TRY_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('leave');
		// API END

		//console.log(indentString(this.indent) + "try end");
	}

	// #CATCH
	function DEBUG_CATCH_ENTER(hash) {
		// API
		var event = this.createEvent(INSTR.CATCH_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('enter');
		// API END

		this.indent += INDENT_FACTOR;
		// FRAME
		var frame = this.pushFrame(INSTR.CATCH_ENTER, hash);
		frame.values = [hash];
		// FRAME END
	}
	function DEBUG_CATCH_LEAVE(hash) {
		this.indent -= INDENT_FACTOR;

		// API
		var event = this.createEvent(INSTR.CATCH_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('leave');
		// API END

		this.popFrame();
		// FRAME END
	}

	// #FINALLY
	function DEBUG_FINAL_ENTER(hash) {
		// API
		var event = this.createEvent(INSTR.FINAL_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('enter');
		// API END

		this.indent += INDENT_FACTOR;
		// FRAME
		var frame = this.pushFrame(INSTR.FINAL_ENTER, hash);
		frame.values = [hash];
		// FRAME END
	}
	function DEBUG_FINAL_LEAVE(hash) {
		this.indent -= INDENT_FACTOR;

		// API
		var event = this.createEvent(INSTR.FINAL_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('leave');
		// API END

		this.popFrame();
		// FRAME END
	}

	// #ALLOC
	function DEBUG_ALLOC(hash, value) {
		//console.log(indentString(this.indent) + "#Allocated", value);

		// API
		var event = this.createEvent(INSTR.ALLOC);
		event.hash = hash;
		event.value = value;
		event.indent = this.indent;
		event.trigger('fire');
		// API END

		return event.value;
	}

	// #MEMBER
	function DEBUG_MEMBER_EXPR(hash, object, property) {
		//console.log(indentString(this.indent), object, "[" + property + "]");

		// API
		var event = this.createEvent(INSTR.MEMBER_EXPR);
		event.hash = hash;
		event.object = object;
		event.property = property;
		event.indent = this.indent;
		event.trigger('fire');
		// API END

		return event.object;
	}

	// fix for lazy blocks
	function DEBUG_BLOCK_ENTER(hash) {
		var frame = this.pushFrame(INSTR.BLOCK_ENTER, hash);
		frame.values = [hash];
	}
	function DEBUG_BLOCK_LEAVE(hash) {
		this.popFrame();
	}

	// #THIS
	function DEBUG_THIS(hash, ctx) {
		// API
		var event = this.createEvent(INSTR.THIS);
		event.hash = hash;
		event.context = ctx;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.context;
	}

	// #LITERAL
	function DEBUG_LITERAL(hash, value) {
		// API
		var event = this.createEvent(INSTR.LITERAL);
		event.hash = hash;
		event.value = value;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.value;
	}

	// #EXPRESSIONS
	function DEBUG_ASSIGN(hash, op, obj, prop, value) {
		var result = null;
		// API: add before, after
		if (prop === null) {
			if (op === OP['=']) {
				result = value;
			} else {
				result = value;
			}
		} else {
			result = evalObjectAssignmentExpression(op, obj, prop, value);
		}
		// API
		var event = this.createEvent(INSTR.ASSIGN);
		event.op = operatorToString(op) + '=';
		event.hash = hash;
		event.object = obj;
		event.property = prop;
		event.value = value;
		event.result = result;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.result;
	}

	function DEBUG_TERNARY(hash, test, truthy, falsy) {
		var result = null;
		// API: add before, after
		if (test) {
			result = truthy();
		} else {
			result = falsy();
		}
		// API
		var event = this.createEvent(INSTR.TERNARY);
		event.hash = hash;
		event.test = test;
		event.falsy = falsy;
		event.truthy = truthy;
		event.result = result;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.result;
	}

	function DEBUG_LOGICAL(hash, op, a, b) {
		var result = null;
		// API: add before, after
		switch (op) {
			case OP['&&']:
				result = a ? b() : a;
				break;
			case OP['||']:
				result = a ? a : b();
				break;
		}
		// API
		var event = this.createEvent(INSTR.LOGICAL);
		event.op = operatorToString(op);
		event.hash = hash;
		event.left = a;
		event.right = b;
		event.result = result;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.result;
	}

	function DEBUG_BINARY(hash, op, a, b) {
		var result = evalBinaryExpression(op, a, b);
		// API
		var event = this.createEvent(INSTR.BINARY);
		event.op = operatorToString(op);
		event.hash = hash;
		event.left = a;
		event.right = b;
		event.result = result;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.result;
	}

	function DEBUG_UNARY(hash, op, ctx, critical, value) {
		var result = null;
		// typeof argument is not defined
		if (op === OP['typeof'] && critical) {
			result = value;
		} else {
			result = evalUnaryExpression(op, ctx, value);
		}
		// API
		var event = this.createEvent(INSTR.UNARY);
		event.op = operatorToString(op);
		event.hash = hash;
		event.value = value;
		event.result = result;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		//console.log(indentString(this.indent) + operatorToString(op), value, "->", result, critical);
		return event.result;
	}

	function DEBUG_UPDATE(hash, op, value, prefix) {
		var result = value;
		// API
		var event = this.createEvent(INSTR.UPDATE);
		event.op = operatorToString(op);
		event.result = result;
		event.hash = hash;
		event.prefix = prefix;
		event.indent = this.indent;
		event.trigger('fire');
		// API END
		return event.result;
	}

	// deprecated
	/*
    export function DEBUG_LITERAL = function(value) {
      console.log("Literal:", value);
      return value;
    };
    export function DEBUG_IDENTIFIER = function(id, value) {
      console.log("Identifier:", id, value);
      return value;
    };*/

	function DEBUG_PROGRAM_ENTER(hash) {
		//console.log(indentString(this.indent) + "Program");
		// API
		var event = this.createEvent(INSTR.PROGRAM_ENTER);
		event.hash = hash;
		event.indent = this.indent;
		event.trigger('enter');
		// API END
		this.indent += INDENT_FACTOR;
	}
	function DEBUG_PROGRAM_LEAVE(hash, ret) {
		this.indent -= INDENT_FACTOR;
		//console.log(indentString(this.indent) + "Program end ->", ret);
		// API
		var event = this.createEvent(INSTR.PROGRAM_LEAVE);
		event.hash = hash;
		event.indent = this.indent;
		event.return = ret;
		event.trigger('leave');
		// API END
		return event.return;
	}
	function DEBUG_PROGRAM_FRAME_VALUE(value) {
		//console.log(value);
	}

	var _debug = Object.freeze({
		DEBUG_IF_TEST: DEBUG_IF_TEST,
		DEBUG_IF_ENTER: DEBUG_IF_ENTER,
		DEBUG_IF_LEAVE: DEBUG_IF_LEAVE,
		DEBUG_ELSE_ENTER: DEBUG_ELSE_ENTER,
		DEBUG_ELSE_LEAVE: DEBUG_ELSE_LEAVE,
		DEBUG_LOOP_TEST: DEBUG_LOOP_TEST,
		DEBUG_LOOP_ENTER: DEBUG_LOOP_ENTER,
		DEBUG_LOOP_LEAVE: DEBUG_LOOP_LEAVE,
		DEBUG_BREAK: DEBUG_BREAK,
		DEBUG_CONTINUE: DEBUG_CONTINUE,
		DEBUG_SWITCH_TEST: DEBUG_SWITCH_TEST,
		DEBUG_SWITCH_ENTER: DEBUG_SWITCH_ENTER,
		DEBUG_SWITCH_LEAVE: DEBUG_SWITCH_LEAVE,
		DEBUG_CASE_TEST: DEBUG_CASE_TEST,
		DEBUG_CASE_ENTER: DEBUG_CASE_ENTER,
		DEBUG_CASE_LEAVE: DEBUG_CASE_LEAVE,
		DEBUG_FUNCTION_CALL: DEBUG_FUNCTION_CALL,
		DEBUG_FUNCTION_ENTER: DEBUG_FUNCTION_ENTER,
		DEBUG_FUNCTION_LEAVE: DEBUG_FUNCTION_LEAVE,
		DEBUG_FUNCTION_RETURN: DEBUG_FUNCTION_RETURN,
		DEBUG_VAR_DECLARE: DEBUG_VAR_DECLARE,
		DEBUG_VAR_INIT: DEBUG_VAR_INIT,
		DEBUG_OP_NEW: DEBUG_OP_NEW,
		DEBUG_OP_NEW_END: DEBUG_OP_NEW_END,
		DEBUG_SUPER: DEBUG_SUPER,
		DEBUG_SUPER_FIX: DEBUG_SUPER_FIX,
		DEBUG_METHOD_ENTER: DEBUG_METHOD_ENTER,
		DEBUG_METHOD_LEAVE: DEBUG_METHOD_LEAVE,
		DEBUG_TRY_ENTER: DEBUG_TRY_ENTER,
		DEBUG_TRY_LEAVE: DEBUG_TRY_LEAVE,
		DEBUG_CATCH_ENTER: DEBUG_CATCH_ENTER,
		DEBUG_CATCH_LEAVE: DEBUG_CATCH_LEAVE,
		DEBUG_FINAL_ENTER: DEBUG_FINAL_ENTER,
		DEBUG_FINAL_LEAVE: DEBUG_FINAL_LEAVE,
		DEBUG_ALLOC: DEBUG_ALLOC,
		DEBUG_MEMBER_EXPR: DEBUG_MEMBER_EXPR,
		DEBUG_BLOCK_ENTER: DEBUG_BLOCK_ENTER,
		DEBUG_BLOCK_LEAVE: DEBUG_BLOCK_LEAVE,
		DEBUG_THIS: DEBUG_THIS,
		DEBUG_LITERAL: DEBUG_LITERAL,
		DEBUG_ASSIGN: DEBUG_ASSIGN,
		DEBUG_TERNARY: DEBUG_TERNARY,
		DEBUG_LOGICAL: DEBUG_LOGICAL,
		DEBUG_BINARY: DEBUG_BINARY,
		DEBUG_UNARY: DEBUG_UNARY,
		DEBUG_UPDATE: DEBUG_UPDATE,
		DEBUG_PROGRAM_ENTER: DEBUG_PROGRAM_ENTER,
		DEBUG_PROGRAM_LEAVE: DEBUG_PROGRAM_LEAVE,
		DEBUG_PROGRAM_FRAME_VALUE: DEBUG_PROGRAM_FRAME_VALUE,
	});

	var Stage = function Stage(input, opt) {
		if (opt === void 0) opt = {};

		// validate
		if (typeof input !== 'string') {
			throw new Error(
				'Expected input type string, but got ' + typeof input
			);
		}
		this.input = input;
		// unique session key
		this.key = '$$STx' + uid();
		this.links = {};
		this.nodes = null;
		this.symbols = null;
		this.options = {};
		this.indent = 0;
		this.frame = null;
		this.$$frameHash = 0;
		this.currentScope = null;
		this.previousScope = null;
		this.listeners = {};
		this.generateLinks();
		this.generateListeners();
		this.script = this.patch(input);
	};

	extend(Stage, _debug);

	Stage.prototype.reset = function () {
		this.indent = 0;
	};

	Stage.prototype.triggerListeners = function (event, trigger) {
		var type = event.type;
		var category = event.category;
		// invalid listener
		if (!this.listeners.hasOwnProperty(category)) {
			console.error('Unexpected trigger category ' + category);
			return;
		}
		var listeners = this.listeners[category];
		// no listeners are attached
		if (listeners.length <= 0) {
			return;
		}
		for (var ii = 0; ii < listeners.length; ++ii) {
			var listener = listeners[ii];
			listener.trigger(event, trigger);
		}
	};

	Stage.prototype.createEvent = function (type) {
		var event = new RuntimeEvent(type, this);
		return event;
	};

	Stage.prototype.addListener = function (category) {
		// validate
		if (!this.listeners.hasOwnProperty(category)) {
			console.error('Unexpected listener category');
			return null;
		}
		var listener = new RuntimeListener(category);
		this.listeners[category].push(listener);
		return listener;
	};

	Stage.prototype.generateListeners = function () {
		var this$1 = this;

		for (var key in CATEGORY) {
			var bit = CATEGORY[key];
			this$1.listeners[bit] = [];
		}
	};

	Stage.prototype.generateLinks = function () {
		var this$1 = this;

		var ihdx = 0;
		for (var callee in INSTR) {
			if (!INSTR.hasOwnProperty(callee)) {
				continue;
			}
			var name = '$DEBUG_' + callee;
			var key = DEBUG_KEY + ihdx++;
			this$1.links[name] = {
				// link function, escape dollar sign
				fn: this$1[name.substr(1, name.length)],
				key: key,
			};
			if (CLEAN_DEBUG_INJECTION) {
				this$1[name] = this$1.links[name].fn;
			} else {
				this$1[key] = this$1.links[name].fn;
			}
		}
	};

	Stage.prototype.getLink = function (name) {
		name = '$' + name;
		if (CLEAN_DEBUG_INJECTION) {
			return this.key + '.' + name;
		}
		var key = this.links[name].key;
		return this.key + '.' + key;
	};

	Stage.prototype.getLinkCall = function (name) {
		return this.getLink(name) + '()';
	};

	Stage.prototype.getFunctionNodeByName = function (name) {
		return this.symbols[name] || null;
	};

	Stage.prototype.getInverseInstruction = function (frame) {
		var type = frame.type;
		var links = this.links;
		switch (type) {
			case INSTR.FUNCTION_ENTER:
				return links.$DEBUG_FUNCTION_LEAVE.fn;
			case INSTR.IF_ENTER:
				return links.$DEBUG_IF_LEAVE.fn;
			case INSTR.ELSE_ENTER:
				return links.$DEBUG_ELSE_LEAVE.fn;
			case INSTR.LOOP_ENTER:
				return links.$DEBUG_LOOP_LEAVE.fn;
			case INSTR.SWITCH_ENTER:
				return links.$DEBUG_SWITCH_LEAVE.fn;
			case INSTR.CASE_ENTER:
				return links.$DEBUG_CASE_LEAVE.fn;
			case INSTR.METHOD_ENTER:
				return links.$DEBUG_METHOD_LEAVE.fn;
			case INSTR.OP_NEW:
				return links.$DEBUG_OP_NEW_END.fn;
			case INSTR.TRY_ENTER:
				return links.$DEBUG_TRY_LEAVE.fn;
			case INSTR.CATCH_ENTER:
				return links.$DEBUG_CATCH_LEAVE.fn;
			case INSTR.FINAL_ENTER:
				return links.$DEBUG_FINAL_LEAVE.fn;
			case INSTR.BLOCK_ENTER:
				return links.$DEBUG_BLOCK_LEAVE.fn;
			default:
				throw new Error('Unexpected frame type ' + frame.cleanType);
				break;
		}
		return null;
	};

	Stage.prototype.manuallyLeaveFrame = function (frame) {
		console.assert(isValidFrameInstruction(frame));
		var args = frame.values;
		//console.log("Manually leaving", frame.cleanType);
		var inverse = this.getInverseInstruction(frame);
		inverse.apply(this, args);
	};

	Stage.prototype.leaveFrameUntil = function (target) {
		var this$1 = this;

		while (true) {
			if (this$1.frame.equals(target)) {
				break;
			}
			this$1.manuallyLeaveFrame(this$1.frame);
		}
	};

	Stage.prototype.leaveFrameUntilHash = function (hash) {
		var this$1 = this;

		while (true) {
			if (this$1.frame.hash === hash) {
				break;
			}
			this$1.manuallyLeaveFrame(this$1.frame);
		}
	};

	Stage.prototype.pushFrame = function (type, hash) {
		var parent = this.frame;
		var frame = new Frame(type, hash);
		frame.parent = parent;
		frame.node = this.nodes[hash].node;
		frame.location = frame.node.loc;
		this.frame = frame;
		return frame;
	};

	Stage.prototype.popFrame = function () {
		// out of bounds check
		console.assert(this.frame !== null);
		this.frame = this.frame.parent;
	};

	Stage.prototype.resolveBreakFrame = function (frm, label) {
		var this$1 = this;

		var frame = frm;
		while (true) {
			// TODO: isContinuable stable?
			if (frame.isBreakable || frame.isContinuable) {
				if (label !== null) {
					var node = this$1.nodes[frame.hash].node;
					if (
						node.labels !== void 0 &&
						node.labels.indexOf(label) > -1
					) {
						break;
					}
				} else {
					break;
				}
			} else if (label !== null) {
				var node$1 = this$1.nodes[frame.hash].node;
				if (
					node$1.labels !== void 0 &&
					node$1.labels.indexOf(label) > -1
				) {
					break;
				}
			}
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		console.assert(isBreakableFrameType(frame.type));
		return frame;
	};

	Stage.prototype.resolveReturnFrame = function (frm) {
		var frame = frm;
		while (true) {
			// break on instantiation calls
			if (frame.isInstantiation) {
				break;
			}
			// break on function call frames
			if (frame.isReturnable) {
				break;
			}
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		if (
			!isReturnableFrameType(frame.type) &&
			!isInstantiationFrameType(frame.type)
		) {
			// only beef if frame hashes doesn't match
			if (frame.hash !== this.$$frameHash) {
				console.error(frame);
			}
		}
		return frame;
	};

	Stage.prototype.resolveCaseFrame = function (frm) {
		var frame = frm;
		while (true) {
			if (frame.isSwitchCase) {
				break;
			}
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		console.assert(frame.type === INSTR.CASE_ENTER);
		return frame;
	};

	Stage.prototype.resolveTryFrame = function (frm, silent) {
		var frame = frm;
		while (true) {
			if (frame.isTryStatement) {
				break;
			}
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		if (silent) {
			return frame.type === INSTR.TRY_ENTER ? frame : null;
		}
		console.assert(frame.type === INSTR.TRY_ENTER);
		return frame;
	};

	Stage.prototype.resolveCatchClauseFrame = function (frm, silent) {
		var frame = frm;
		while (true) {
			if (frame.isCatchClause) {
				break;
			}
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		if (silent) {
			return frame.type === INSTR.CATCH_ENTER ? frame : null;
		}
		console.assert(frame.type === INSTR.CATCH_ENTER);
		return frame;
	};

	Stage.prototype.resolveFinalClauseFrame = function (frm, silent) {
		var frame = frm;
		while (true) {
			if (frame.isFinalClause) {
				break;
			}
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		if (silent) {
			return frame.type === INSTR.FINAL_ENTER ? frame : null;
		}
		console.assert(frame.type === INSTR.FINAL_ENTER);
		return frame;
	};

	Stage.prototype.resolveProgramFrame = function (frm) {
		var frame = frm;
		while (true) {
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		console.assert(frame.type === INSTR.PROGRAM);
		return frame;
	};

	Stage.prototype.resolveLeftFrames = function (frm) {
		var frame = frm;
		while (true) {
			// break on instantiation calls
			if (frame.isInstantiation) {
				break;
			}
			// break on function call frames
			if (frame.isReturnable) {
				break;
			}
			// frame is super sloppy (possibly async), break out of everything
			if (frame.isGlobal()) {
				break;
			}
			frame = frame.parent;
		}
		return frame;
	};

	Stage.prototype.getFrameByHashFrom = function (frm, hash) {
		var frame = frm;
		while (true) {
			if (frame.hash === hash) {
				break;
			}
			if (frame.isGlobal()) {
				return null;
			}
			frame = frame.parent;
		}
		return frame;
	};

	Stage.prototype.patch = function (input) {
		var patcher = new Patcher(this);
		var ast = parse$2(input, { locations: true });
		this.frame = new Frame(INSTR.PROGRAM, this.$$frameHash);
		patcher.applyPatches(ast);
		// link walk things to stage
		this.nodes = patcher.nodes;
		this.symbols = patcher.symbols;
		return generate$1(ast, {
			format: {
				indent: {
					style: '  ',
				},
			},
		});
	};

	function setup() {
		this.generateCategoryBits();
	}

	function generateCategoryBits() {
		var this$1 = this;

		for (var key in CATEGORY) {
			this$1[key] = CATEGORY[key] | 0;
		}
	}

	function greet() {
		if (
			IS_BROWSER &&
			typeof navigator !== 'undefined' &&
			navigator.userAgent.toLowerCase().indexOf('chrome') > -1
		) {
			console.log(
				'%c ☕ Iroh.js - ' + VERSION + ' ',
				'background: #2e0801; color: #fff; padding:1px 0;'
			);
		}
	}

	var _setup = Object.freeze({
		setup: setup,
		generateCategoryBits: generateCategoryBits,
		greet: greet,
	});

	var Iroh = function Iroh() {
		// patch AST scope
		this.scope = null;
		// patch stage
		this.stage = null;
		// patch state
		this.state = null;
		// stage instance
		this.instance = null;
		// container for all stages
		this.stages = {};
		// enter setup phase
		this.setup();
		// say hello
		this.greet();
	};

	// link methods to main class
	extend(Iroh, _utils);
	extend(Iroh, _setup);

	var iroh = new Iroh();

	// intercept Stage instantiations
	var _Stage = function () {
		var i = arguments.length,
			argsArray = Array(i);
		while (i--) argsArray[i] = arguments[i];

		var stage = new (Function.prototype.bind.apply(
			Stage,
			[null].concat(argsArray)
		))();
		// register stage to iroh stages
		// so we can keep track of it
		iroh.stages[stage.key] = stage;
		return stage;
	};
	_Stage.prototype = Object.create(Stage.prototype);
	iroh.Stage = _Stage;

	// link to outer space
	if (typeof window !== 'undefined') {
		window.Iroh = iroh;
	}

	return iroh;
})();
