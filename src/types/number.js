module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="text" id="' + elemId + '" value="' + value + '" style="width:50px" />';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      if (typeof $.fn.spinner === 'function') {
        return $('#' + elemId).spinner('value');
      } else {
        return $('#' + elemId).val();
      }
    }
  },

  postCreateInitFunction (elemId, name, value, meta) {
    if (typeof $.fn.spinner === 'function') {
      var opts = $.extend({}, meta.options);
      // Add a handler to the change event to verify the min/max (only if not provided by the user)
      opts.change = typeof opts.change === 'undefined' ? onSpinnerChange : opts.change;
      
      return function () {
        $('#' + elemId).spinner(opts);
      };
    } else {
      return null;
    }
  }
};

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
