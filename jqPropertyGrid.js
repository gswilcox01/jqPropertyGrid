/**
 * jqPropertyGrid
 * https://github.com/ValYouW/jqPropertyGrid
 * Author: YuvalW (ValYouW)
 * License: MIT
 */

/**
 * @typedef {object} JQPropertyGridOptions
 * @property {object} meta - A metadata object describing the obj properties
 */

/* jshint -W089 */
(function($) {// jscs:ignore requireNamedUnassignedFunctions
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
			console.error('jqPropertyGrid 1st parameter must get a JS data object to initialize the grid.');
			return;
		} else if (typeof options !== 'object' || options === null) {
			console.error('jqPropertyGrid 2nd parameter must be a JS object defining the form design and grid options.');
			return;
		}

		// Normalize options
		options.customTypes = options.customTypes || {};
		var meta = options.meta;

		// Seems like we are ok to create the grid
		var propertyRowsHTML = {OTHER_GROUP_NAME: ''};
		var groupsHeaderRowHTML = {};
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
			if (groupsHeaderRowHTML[currGroup] === undefined) {
				groupsHeaderRowHTML[currGroup] = getGroupHeaderRowHtml(currGroup);
				propertyRowsHTML[currGroup] = '';
			}

			// Append the current cell html into the group html
			propertyRowsHTML[currGroup] += getPropertyRowHtml(pgId, prop, obj[prop], meta[prop], postCreateInitFuncs, getValueFuncs, options);
		}

		// Now we have all the html we need, just assemble it
		var innerHTML = '<table class="pgTable">';
		for (var group in groupsHeaderRowHTML) {
			// Skip the "Other" group, it always comes last
			if (group == OTHER_GROUP_NAME) continue;

			innerHTML += groupsHeaderRowHTML[group];
			innerHTML += propertyRowsHTML[group];
		}

		// Finally add the "Other" group to the end
		if (propertyRowsHTML[OTHER_GROUP_NAME]) {
			innerHTML += groupsHeaderRowHTML[OTHER_GROUP_NAME];
			innerHTML += propertyRowsHTML[OTHER_GROUP_NAME];
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
		var getValues = function() {
			var result = {};
			for (var prop in getValueFuncs) {
				if (typeof getValueFuncs[prop] !== 'function') {
					continue;
				}
				result[prop] = getValueFuncs[prop]();
			}

			return result;
		};

		this.data(GET_VALS_FUNC_KEY, getValues);
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

		// check if type is registered in customTypes
		var customType = options.customTypes[type]
		if (customType) {
			valueHTML = customType.html(elemId, name, value, meta);
			getValueFuncs[name] = customType.valueFunction(elemId, name, value, meta);
			if (customType.hasOwnProperty('postCreateInitFunction')) {
				postCreateInitFuncs.push(customType.postCreateInitFunction(elemId, name, value, meta));
			}
		}

		// If boolean create checkbox
		else if (type === 'boolean' || (type === '' && typeof value === 'boolean')) {
			valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + name + '"' + (value ? ' checked' : '') + ' />';
			getValueFuncs[name] = function() {
				return $('#' + elemId).prop('checked');
			};
		}

		// If options create drop-down list
		else if (type === 'options' && Array.isArray(meta.options)) {
			valueHTML = getSelectOptionHtml(elemId, value, meta.options);
			getValueFuncs[name] = function() {
				return $('#' + elemId).val();
			};
		}

		// If number and a jqueryUI spinner is loaded use it
		else if (typeof $.fn.spinner === 'function' && (type === 'number' || (type === '' && typeof value === 'number'))) {
			valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '" style="width:50px" />';
			postCreateInitFuncs.push(initSpinner(elemId, meta.options));
			getValueFuncs[name] = function() {
				return $('#' + elemId).spinner('value');
			};
		}

		// If color and we have the spectrum color picker use it
		else if (type === 'color' && typeof $.fn.spectrum === 'function') {
			valueHTML = '<input type="text" id="' + elemId + '" />';
			postCreateInitFuncs.push(initColorPicker(elemId, value, meta.options));
			getValueFuncs[name] = function() {
				return $('#' + elemId).spectrum('get').toHexString();
			};
		}

		// If label (for read-only)
		else if (type === 'label') {
			if (typeof meta.description === 'string' && meta.description) {
				valueHTML = '<label for="' + elemId + '" title="' + meta.description + '">' + value + '</label>';
			} else {
				valueHTML = '<label for="' + elemId + '">' + value + '</label>';
			}
			getValueFuncs[name] = function() {
				return value;
			};
		}

		// Default is textbox
		else {
			valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"</input>';
			getValueFuncs[name] = function() {
				return $('#' + elemId).val();
			};
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

	/**
	 * Gets a select-option (dropdown) html
	 * @param {string} id - The select element id
	 * @param {string} [selectedValue] - The current selected value
	 * @param {*[]} options - An array of option. An element can be an object with value/text pairs, or just a string which is both the value and text
	 * @returns {string} The select element html
	 */
	function getSelectOptionHtml(id, selectedValue, options) {
		selectedValue = selectedValue || '';
		options = options || [];

		var html = '<select id="' + id + '">';
		for (var i = 0; i < options.length; i++) {
			var value = typeof options[i] === 'object' ? options[i].value : options[i];
			var text = typeof options[i] === 'object' ? options[i].text : options[i];

			html += '<option value="' + value + '"';
			html += (selectedValue === value) ? ' selected>' : '>';
			html += text + '</option>';
		}
		html += '</select>';
		return html;
	}

	/**
	 * Gets an init function to a number textbox
	 * @param {string} id - The number textbox id
	 * @param {object} [options] - The spinner options
	 * @returns {function}
	 */
	function initSpinner(id, options) {
		// Copy the options so we won't change the user "copy"
		var opts = $.extend({}, options);

		// Add a handler to the change event to verify the min/max (only if not provided by the user)
		opts.change = typeof opts.change === 'undefined' ? onSpinnerChange : opts.change;

		return function onSpinnerInit() {
			$('#' + id).spinner(opts);
		};
	}

	/**
	 * Gets an init function to a color textbox
	 * @param {string} id - The color textbox id
	 * @param {string} [color] - The current color (e.g #000000)
	 * @param {object} [options] - The color picker options
	 * @returns {function}
	 */
	function initColorPicker(id, color, options) {
		var opts = $.extend({}, options);
		if (typeof color === 'string') {
			opts.color = color;
		}

		return function onColorPickerInit() {
			$('#' + id).spectrum(opts);
		};
	}

	/**
	 * Handler for the spinner change event
	 */
	function onSpinnerChange() {
		var $spinner = $(this);
		var value = $spinner.spinner('value');

		// If the value is null and the real value in the textbox is string we empty the textbox
		if (value === null && typeof $spinner.val() === 'string') {
			$spinner.val('');
			return;
		}

		// Now check that the number is in the min/max range.
		var min = $spinner.spinner('option', 'min');
		var max = $spinner.spinner('option', 'max');
		if (typeof min === 'number' && this.value < min) {
			this.value = min;
			return;
		}

		if (typeof max === 'number' && this.value > max) {
			this.value = max;
		}
	}
})(window.$);
