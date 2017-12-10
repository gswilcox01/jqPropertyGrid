# jqPropertyGrid
A small and simple property grid in JS to view/edit POJOs, excellent if you have a "settings" object you want to give the user to edit (that's why I have created it).

### Dependencies
* jQuery - This is mandatory
* jQueryUI - If jQueryUI is loaded so properties that are defined as `number` would be displayed using the jQueryUI spinner widget
* spectrum - A very cool Color Picker that will be used (if loaded) on properties that are defined as `color` [see spectrum on GitHub](https://github.com/bgrins/spectrum)

### Usage
The property grid needs a `div` to live in, then just initialize it by calling to the `jqPropertyGrid` method on it:

The html part:
```html
<script src='jqPropertyGrid.js'></script>
<link rel='stylesheet' href='jqPropertyGrid.css' />

<div id='propGrid'></div>
```

The Javascript part:
``` javascript
// This is our target object
var dataObject = {
  font: 'Consolas',
  fontSize: 14,
  fontColor: '#a3ac03',
  jQuery: true,
  modernizr: false,
  framework: 'angular',
  iHaveNoMeta: 'Never mind...',
  iAmReadOnly: 'I am a label which is not editable'
};

// This is the metadata object that describes the target object properties (optional)
var formDesignMeta = {
    // Since string is the default no nees to specify type
    font: { group: 'Editor', name: 'Font', description: 'The font editor to use'},
    // The "options" would be passed to jQueryUI as its options
    fontSize: { group: 'Editor', name: 'Font size', type: 'number', options: { min: 0, max: 20, step: 2 }},
    // The "options" would be passed to Spectrum as its options
    fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' }},
    // since typeof jQuery is boolean no need to specify type, also since "jQuery" is also the display text no need to specify name
    jQuery: { group: 'Plugins', description: 'Whether or not to include jQuery on the page' },
    // We can specify type boolean if we want...
    modernizr: {group: 'Plugins', type: 'boolean', description: 'Whether or not to include modernizr on the page'},
    framework: {name: 'Framework', group: 'Plugins', type: 'options', options: ['None', {text:'AngularJS', value: 'angular'}, {text:'Backbone.js', value: 'backbone'}], description: 'Whether to include any additional framework'},
    iAmReadOnly: { name: 'I am read only', type: 'label', description: 'Label types use a label tag for read-only properties', showHelp: false }
};

// This is the customTypes object that describes additionnal types, and their renderers (optional)
var theCustomTypes = {
    icon: {
        html: function(elemId, name, value, meta) { // custom renderer for type (required)
            return '<i class="fa fa-' + value + '"></i>';
        },
        valueFunction: function(elemId, name, value, meta) {  // custom getter for current value (required)
            return function () {
                return value;
            }
        },
        postCreateInitFunction: function(elemId, name, value, meta) {  // custom post-DOM init function (optional)
            return function () {
                console.log('no postCreateInitFunction for icon type');
            }
        }
    }
};

// Options object
var options = {
	meta: formDesignMeta,
	customTypes: theCustomTypes
};

// Create the grid
$('#propGrid').jqPropertyGrid(dataObject, options);

// In order to get back the modified values:
var theNewObj = $('#propGrid').jqPropertyGrid('get');
```

### The metadata object
As seen from the example above the metadata object **can** be used (it's optional) in order to describe the object properties.

Each property in the metadata object could have the following:
* group - The group this property belongs to
* name - The display name of the property in the grid
* type - The type of the property, supported are:
    * boolean - A checkbox will be used
    * number - A jqueryui spinner will be used
    * color - A Spectrum Color Picker will be used
    * options - A dropdown list will be used --- options 
    * label - A read-only label will be used
    * input - A normal text input control will be used
    * autonumeric - An autonumeric input will be used
    * mask - A jquery masked.input will be used
* browsable - Whether this property should be included in the grid (default is true)
* useFontAwesome - Whether a font awesome icon should be used instead of the text [?] for tooltips
* colspan2 - Whether this property should span both columns and have no label (default is false)
* options - An extra options object per type:
    * If the type is `number` : options will be passed to jqueryui spinner as it's options
    * If the type is `color` : options will be passed to Spectrum as it's options
    * If the type is `mask` : options will be passed to Masked.Input as it's options
    * If the type is `autonumeric` : options will be passed to AutoNumeric as it's options
    * If the type is `options` : options should be an array of choices to display in the dropdown/select component.  Each element of the array should be either a string, or an object like { text: 'display name', value: 'option_code' }
* description - A description of the property, will be used as tooltip next to the property name
* showHelp - If set to false will display description as a tooltip over value, instead of on the "[?]" part of label
* validation - An object with jquery-form-validator values to apply to INPUT control types (input, autonumeric, mask)
    * "rules" - will populate directly into the "data-validation" attribute on the <input>
    * "sanitize*" - anything starting with sanitize will have "data-" prepended then added as an attribute
    * "*" - anything else will will have "data-validation" prepended then added as an attribute
    * "*_*" - anything with an underscore in the name will have it replaced with a "-" for the attribute name

### Live example
See : https://gswilcox01.github.io/jqPropertyGrid/

## Local Setup
To install dev dependencies & run locally in webpack-dev-server with hot-reload
```
yarn install
npm start
```

## Building a distribution
Build output is in the /dist/ folder and should be checked in with the project
```
npm run build
__then__ git add, push, etc., ALL CHANGES
npm version minor
```

## Contributing
You are welcome to send pull requests that will make this module better. Before you send your PR please make sure that:

1. There are no `eslint` errors
2. If you are adding a new feature make sure to update the `README` accordingly
3. Thx !
