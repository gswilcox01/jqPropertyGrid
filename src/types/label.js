module.exports = {
  html (elemId, name, value, meta) {
    if (typeof meta.description === 'string' && meta.description) {
			return '<label for="' + elemId + '" title="' + meta.description + '">' + value + '</label>';
		} else {
			return '<label for="' + elemId + '">' + value + '</label>';
		}
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return value;
    }
  }
}