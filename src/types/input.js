module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="text" class="form-control" id="' + elemId + '" value="' + value + '" ' + meta.validationHTML + ' />';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).val();
    }
  }
}