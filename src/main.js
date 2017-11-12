require('./main.css')

var OTHER_GROUP_NAME = 'Other';
var GET_VALS_FUNC_KEY = 'pg.getValues';
var pgIdSequence = 0;

/**
 * Generates the property grid
 * @param {object} obj - The object whose properties we want to display
 * @param {JQPropertyGridOptions} options - Options object for the component
 */

$.fn.jqPropertyGrid = function(obj, options) {
	// Check if the user called the 'get' function (to get the values back from the grid).
	if (typeof obj === 'string' && obj === 'get') {
		if (typeof this.data(GET_VALS_FUNC_KEY) === 'function') {
			return this.data(GET_VALS_FUNC_KEY)();
		}

		return null;
	} else if (typeof obj !== 'object' || obj === null) {
		console.error('jqPropertyGrid 1st parameter must be a JS data object to initialize the grid.');
		return;
	} else if (typeof options !== 'object' || options === null) {
		console.error('jqPropertyGrid 2nd parameter must be a JS object defining the grid display options.');
		return;
	}

	// Normalize options
	options.customTypes = options.customTypes || {};
	options.types = {};
	var meta = options.meta;

	// LOAD ALL files in the "types" folder as a custom type named the same as the base filename
	var allTypes = require.context("./types", true, /\.js$/)
	for (var typeFilename of allTypes.keys()) {
		var regex = new RegExp("^\.\/(.*?)\.js$");
		var match = regex.exec(typeFilename);
		if (match !== null) {
			var typeName = match[1];
			options.types[typeName] = allTypes(typeFilename)
		}
	}

	// Seems like we are ok to create the grid
	var groupHTML = {};
	var postCreateInitFuncs = [];
	var getValueFuncs = {};
	var pgId = 'pg' + (pgIdSequence++);

	// LOOP through all properties in the DATA OBJECT
	for (var prop in obj) {
		// Skip if this is not a direct property, a function, or its meta says it's non browsable
		if (!obj.hasOwnProperty(prop) || typeof obj[prop] === 'function' || (meta[prop] && meta[prop].browsable === false)) {
			continue;
		}

		// If this is the first time we run into this group create the group row
		var currGroup = (meta[prop] && meta[prop].group) || OTHER_GROUP_NAME;
		if (groupHTML[currGroup] === undefined) {
			groupHTML[currGroup] = getGroupHeaderRowHtml(currGroup);
		}

		// Append the current cell html into the group html
		groupHTML[currGroup] += getPropertyRowHtml(pgId, prop, obj[prop], meta[prop], postCreateInitFuncs, getValueFuncs, options);
	}

	// Now we have all the html we need, just assemble it
	var innerHTML = '<table class="pgTable">';
	for (var group in groupHTML) {
		if (group == OTHER_GROUP_NAME) continue;
		innerHTML += groupHTML[group];
	}

	// Finally add the "Other" group to the end
	if (groupHTML[OTHER_GROUP_NAME]) {
		innerHTML += groupHTML[OTHER_GROUP_NAME];
	}

	// Close the table and apply it to the div
	innerHTML += '</table>';
	this.html(innerHTML);

	// Now that HTML is in the DOM, run any post-init functions
	for (var i = 0; i < postCreateInitFuncs.length; ++i) {
		if (typeof postCreateInitFuncs[i] === 'function') {
			postCreateInitFuncs[i]();
		}
	}

	// Create a function that will return the values back from the property grid
	this.data(GET_VALS_FUNC_KEY, function() {
		var result = {};
		for (var prop in getValueFuncs) {
			if (typeof getValueFuncs[prop] !== 'function') continue;
			result[prop] = getValueFuncs[prop]();
		}
		return result;
	});
};

/**
 * Gets the html of a group header row
 * @param {string} displayName - The group display name
 */
function getGroupHeaderRowHtml(displayName) {
	return '<tr class="pgGroupRow"><td colspan="2" class="pgGroupCell">' + displayName + '</td></tr>';
}

/**
 * Gets the html of a specific property row
 * @param {string} pgId - The property-grid id being rendered
 * @param {string} name - The property name
 * @param {*} value - The current property value
 * @param {object} meta - A metadata object describing this property
 * @param {function[]} [postCreateInitFuncs] - An array to fill with functions to run after the grid was created
 * @param {object.<string, function>} [getValueFuncs] - A dictionary where the key is the property name and the value is a function to retrieve the property selected value
 * @param {object} options - The global options object
 */
function getPropertyRowHtml(pgId, name, value, meta, postCreateInitFuncs, getValueFuncs, options) {
	meta = meta || {};
	var displayName = meta.name || name;
	var type = meta.type || '';
	var elemId = pgId + name;
	var valueHTML;

	// if type not passed, infer type based on value...
	if (type === '') {
		if (typeof value === 'boolean') {
			type = 'boolean';
		} else if (typeof value === 'number') {
			type = 'number';
		}
	}

	// if jquery UI components aren't loaded fall back to plain inputs
	if (type === 'number' && typeof $.fn.spinner !== 'function') {
		type = 'input';
	} else if (type === 'color' && typeof $.fn.spectrum !== 'function') {
		type = 'input';
	}

	// check if type is registered in customTypes, or standard types, otherwise default to INPUT
	var thisType = options.customTypes[type] || options.types[type] || options.types['input'];
	valueHTML = thisType.html(elemId, name, value, meta);
	getValueFuncs[name] = thisType.valueFunction(elemId, name, value, meta);
	if (thisType.hasOwnProperty('postCreateInitFunction')) {
		postCreateInitFuncs.push(thisType.postCreateInitFunction(elemId, name, value, meta));
	}

	// Now create the label HTML for column 1
	var helpIcon = '[?]';
	if (options.useFontAwesome) {
		helpIcon = '<i class="fa fa-question-circle-o"></i>';
	}
	if (typeof meta.description === 'string' && meta.description &&
		(typeof meta.showHelp === 'undefined' || meta.showHelp)) {
		displayName += '<span class="pgTooltip" title="' + meta.description + '">' + helpIcon + '</span>';
	}

	// Now create the TR which has 1 column for the label and 1 column for the INPUT
	if (meta.colspan2) {
		return '<tr class="pgRow"><td colspan="2" class="pgCell">' + valueHTML + '</td></tr>';
	} else {
		return '<tr class="pgRow"><td class="pgCell">' + displayName + '</td><td class="pgCell">' + valueHTML + '</td></tr>';
	}
}

