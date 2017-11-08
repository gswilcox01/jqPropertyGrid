module.exports = {
  html: function (elemId, name, value, meta) {
    var html = '<textarea id="' + elemId + '" rows=6 style="white-space: nowrap; overflow-x: auto; width:100%">';
    if (value instanceof Array) {
      html += value.join("\n");
    }
    html += '</textarea>';
    return html;
  },
  valueFunction: function (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).val().split('\n');
    }
  }
}