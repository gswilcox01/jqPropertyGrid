module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="text" id="' + elemId + '" value="' + value + '"</input>';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).val();
    }
  }
}