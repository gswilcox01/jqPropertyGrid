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
	loadStandardTypes(options);
	options.customTypes = options.customTypes || {};
	var meta = options.meta;

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
 * Uses webpack to load all the standard types from the types folder into the global options.types object
 * @param {object} options - The global options object
 */
function loadStandardTypes(options) {
	options.types = {};
	var allTypes = require.context("./types", true, /\.js$/)
	for (var typeFilename of allTypes.keys()) {
		var regex = new RegExp("^\.\/(.*?)\.js$");
		var match = regex.exec(typeFilename);
		if (match !== null) {
			var typeName = match[1];
			options.types[typeName] = allTypes(typeFilename)
		}
	}
}

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
function getPropertyRowHtml(pgId, name, value, originalMeta, postCreateInitFuncs, getValueFuncs, options) {
	var meta = $.extend(true, {}, originalMeta);
	var type = meta.type || '';
	var elemId = pgId + name;

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

	// Create "jquery form validator" html to be used later when generating INPUT HTML
	if (meta.validation) {
		meta.validationHTML = 'data-validation="' + meta.validation.rules + '"';
		$.each(meta.validation, function(key, value) {
			if (key === 'rules') {
				return true;
			} else if (key.startsWith('sanitize')) {
				var htmlAttribute = key.replace(/_/g, "-");
				meta.validationHTML += ' data-' + htmlAttribute + '="' + value + '"';
			} else {
				var htmlAttribute = key.replace(/_/g, "-");
				meta.validationHTML += ' data-validation-' + htmlAttribute + '="' + value + '"';
			}
		});
	} else {
		meta.validationHTML = '';
	}

	// Lookup the type or default to 'input'
	// Create the input HTML
	var thisType = options.customTypes[type] || options.types[type] || options.types['input'];
	var inputHTML = thisType.html(elemId, name, value, meta);

	// Create the label HTML
	var labelHTML = meta.name || name;
	var helpIcon = (options.useFontAwesome) ? '<i class="fa fa-question-circle-o"></i>' : '[?]';
	if (typeof meta.description === 'string' && meta.description &&
		(typeof meta.showHelp === 'undefined' || meta.showHelp === true)) {
			labelHTML +='<span class="pgTooltip" title="' + meta.description + '">' + helpIcon + '</span>';
	}

	// Create post-DOM init functions & getValue functions
	if (thisType.hasOwnProperty('postCreateInitFunction')) {
		postCreateInitFuncs.push(thisType.postCreateInitFunction(elemId, name, value, meta));
	}
	if (thisType.hasOwnProperty('valueFunction')) {
		getValueFuncs[name] = thisType.valueFunction(elemId, name, value, meta);
	}

	// Finally assemble the HTML into 1 or 2 columns in a TR
	if (meta.colspan2 === true) {
		return '<tr class="pgRow"><td colspan="2" class="pgCell">' + inputHTML + '</td></tr>';
	} else {
		return '<tr class="pgRow"><td class="pgCell">' + labelHTML + '</td><td class="pgCell">' + inputHTML + '</td></tr>';
	}
}

