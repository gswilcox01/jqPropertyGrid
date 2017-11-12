module.exports = {
  html (elemId, name, value, meta) {
    selectedValue = value || '';
    options = meta.options || [];
  
    var html = '<select id="' + elemId + '">';
    for (var i = 0; i < options.length; i++) {
      var optionValue = typeof options[i] === 'object' ? options[i].value : options[i];
      var text = typeof options[i] === 'object' ? options[i].text : options[i];
  
      html += '<option value="' + optionValue + '"';
      html += (selectedValue === optionValue) ? ' selected>' : '>';
      html += text + '</option>';
    }
    html += '</select>';
    return html;
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).val();
    }
  }
};
