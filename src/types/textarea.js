module.exports = {
  html (elemId, name, value, meta) {
    var html = '<textarea id="' + elemId;
    if (value instanceof Array) {
      html += '" rows=6 style="white-space: nowrap; overflow-x: auto; width:100%">';
      html += value.join("\n");
    } else {
      html += '" rows=6 style="overflow-x: auto; width:100%">';
      html += value;
    }
    html += '</textarea>';
    return html;
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      if (value instanceof Array) {
        return $('#' + elemId).val().split('\n');
      } else {
        return $('#' + elemId).val()
      }
    }
  }
}