module.exports = {
  html (elemId, name, value, meta) {
    var html = '<input type="checkbox" id="' + elemId + '" value="' + name + '"';
    html += (value) ? ' checked' : '';
    html += ' />';
    return html;
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).prop('checked');
    }
  }
}
