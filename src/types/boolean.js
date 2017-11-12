module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="checkbox" id="' + elemId + '" value="' + name + '"' + (value ? ' checked' : '') + ' />';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).prop('checked');
    }
  }
};
