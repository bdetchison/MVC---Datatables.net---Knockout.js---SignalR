/// <reference path="knockout-1.3.0beta.debug.js" />
/// <reference path="knockout.mapping-latest.js" />
/// <reference path="jquery-1.5.2-vsdoc.js" />

/**
* A KnockoutJs binding handler that creates a Radio Button List or a Check Box List Control that is bound by knockout in a similar way 
* to Drop Down or List Box controls.  
*
* File:         cog.knockout.radiochecklist.js
* Version:      0.1
* Author:       Lucas Martin
* License:      Creative Commons Attribution 3.0 Unported License. http://creativecommons.org/licenses/by/3.0/ 
* 
* Copyright 2011, All Rights Reserved, Cognitive Shift http://www.cogshift.com  
*
* For more information about KnockoutJs or DataTables, see http://www.knockoutjs.com and http://www.datatables.com for details.                    
*/
(function () {
    var selectedOptionsInit = ko.bindingHandlers.selectedOptions.init;
    var selectedOptionsUpdate = ko.bindingHandlers.selectedOptions.update;
    var optionsUpdate = ko.bindingHandlers.options.update;
    var valueInit = ko.bindingHandlers.value.init;
    var valueUpdate = ko.bindingHandlers.value.update;

    var checkListCss = 'cog-checklist';
    var radioListCss = 'cog-radiolist';
    var processedKey = 'IsProcessed';
    var controlIdPrefix = "ctrl_group_";
    var controlCounter = 0;

    ko.bindingHandlers.value = $.extend(ko.bindingHandlers.value,
    // Adds support for the Value binding to the RadioButtonList control.
    {
    // Responsible for setting up a click listener on each input in the list control that propogates any 
    // selection back to the view model
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var valueObservable = valueAccessor();
        var control = $(element);

        if (isRadioButtonListControl(element)) {
            control.delegate('input', 'click', function (e) {
                var input = $(this);
                var value = input.attr('value');
                var isChecked = input.attr('checked');

                if (isChecked)
                    valueObservable(value);

                // Prevent the click event from bubbling up through the DOM.  This is important because when this click event handler is finished,
                // other handlers after this one will execute.  If the input that invoked this handler is deleted in the "options" binding, then
                // this may cause havock with other javascript libraries.  In particular, not calling stopPropagation() here will cause issues with
                // jQuery validation when the library goes searching for the form the input belongs to after the input has been deleted.
                e.stopPropagation();
            });
        } else if (!isPlaceholder(element) && !isListControl(element)) {
            valueInit(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        }
    },
    // Responsible for propogating any selection changes in the view model back to the list control
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var valueObservable = valueAccessor();
        var control = $(element);

        if (isRadioButtonListControl(element)) {
            var value = ko.utils.unwrapObservable(valueObservable);
            var inputs = control.find('input');

            // Reset all radiobuttons to unchecked.
            inputs.attr('checked', false);

            inputs.filter('[value="' + value + '"]').attr('checked', true);

        } else if (!isPlaceholder(element) && !isListControl(element)) {
            valueUpdate(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        }
    }
});

ko.bindingHandlers.selectedOptions = $.extend(ko.bindingHandlers.selectedOptions,
// Adds support for the selectedOptions binding to the CheckBoxList control.
        {
        // Responsible for setting up a click listener on each input in the list control that propogates any 
        // selection back to the view model
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var selectedOptionsObservable = valueAccessor();
            var control = $(element);

            // Add a on click handler here for pushing selected values to an array.
            if (isCheckBoxListControl(element)) {
                ko.utils.registerEventHandler

                control.delegate('input', 'click', function (e) {
                    // Retrieve the current value and checked state of the input that has been clicked.
                    var input = $(this);
                    var value = $(this).attr("value");
                    var isChecked = input.attr("checked");
                    var selectedOptionsValue = ko.utils.unwrapObservable(selectedOptionsObservable);

                    if (!(selectedOptionsValue instanceof Array))
                        throw new 'Bound selectedOptions observable is not an array.'

                    // If the input has been checked on, then push the value of the input to the selectedOptions array if it doesn't already exist.
                    if (isChecked && selectedOptionsObservable.indexOf(value) === -1)
                        selectedOptionsObservable(getSelectedInputValues(element));
                    else
                    // If the input has been checked off, remove the value from the selectedOptions array.
                        ko.utils.arrayRemoveItem(selectedOptionsObservable, value);

                    // Prevent the click event from bubbling up through the DOM.  This is important because when this click event handler is finished,
                    // other handlers after this one will execute.  If the input that invoked this handler is deleted in the "options" binding, then
                    // this may cause havock with other javascript libraries.  In particular, not calling stopPropagation() here will cause issues with
                    // jQuery validation when the library goes searching for the form the input belongs to after the input has been deleted.
                    e.stopPropagation();
                });
            } else if (!isPlaceholder(element) && !isListControl(element)) {
                selectedOptionsInit(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            }
        },
        // Responsible for propogating any selection changes in the view model back to the list control
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var selectedOptionsObservable = valueAccessor();
            var control = $(element);

            // Set the selections of the check / radio list control here...
            if (isCheckBoxListControl(element)) {
                var selectedOptionsValue = ko.utils.unwrapObservable(selectedOptionsObservable);

                // Reset all checkboxes to unchecked.
                var inputs = control.find('input');
                inputs.attr('checked', false);

                // Return if we're dealing with a null or non Array observable here.
                if (!(selectedOptionsValue instanceof Array))
                    return;

                // Apply selected values to control.
                selectInputs(control, selectedOptionsValue);

            } else if (!isPlaceholder(element) && !isListControl(element)) {
                selectedOptionsUpdate(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            }
        }
    });

ko.bindingHandlers.options = $.extend(ko.bindingHandlers.options,
// Adds support for the Options binding to provide options for selection in the RadioButtonList and CheckBoxList controls.
    {
    // Responsible for replacing the placeholder input control with a DIV that forms the basis for the List control.
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var optionsObservable = valueAccessor();

        // If the bound element is the placeholder control...
        if (isPlaceholder(element)) {
            var jqElement = $(element);
            var id = jqElement.attr("id");
            var name = jqElement.attr("name");
            var type = jqElement.attr("type");
            var css = (type == "checkbox" ? checkListCss : radioListCss);

            // Create a new control that will form the actual checkbox / radio list control.
            var control = $("<div></div>");
            // Copy attributes across from the placeholder to the actual control.
            copyAttributes(jqElement, control);
            control.addClass(css);
            // Replace the placeholder control with the actual control.
            jqElement.replaceWith(control);
            // Clean jquery element of all jquery events, etc.
            jqElement.remove();
            // Unregister placeholder with knockout.
            ko.cleanNode(element);

            ko.applyBindingsToNode(control[0], allBindingsAccessor(), bindingContext.$data);
        }
    },
    // Responsible for updating the CheckBoxList and RadioButtonList control with new check box or radio button items when the options
    // for the control changes.
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var allBindings = allBindingsAccessor();
        var optionsObservable = valueAccessor();
        var textFieldName = allBindings.optionsText;
        var valueFieldName = allBindings.optionsValue;

        if (isListControl(element)) {
            var optionsValue = ko.utils.unwrapObservable(optionsObservable)

            // Return if we're dealing with a null or non Array observable here.
            if (!(optionsValue instanceof Array))
                return;

            var previouslySelectedValues = getSelectedInputValues(element);

            var control = $(element);
            var controlGroupId = nextControlId();
            // ** Clear the Control **
            // Clear the control of input elements.
            control.empty();

            // ** Recreate the Control **
            // Create a new list for the control.
            var list = $("<ul></ul>");
            control.append(list);

            // Populate the control with input elements.
            ko.utils.arrayForEach(optionsValue, function (option) {
                option = ko.utils.unwrapObservable(option);
                var text = ko.utils.unwrapObservable(textFieldName ? option[textFieldName] : option);
                var value = ko.utils.unwrapObservable(valueFieldName ? option[valueFieldName] : option);

                if (!text)
                    throw new 'Invalid text field.';
                if (!value)
                    throw new 'Invalid value field.';

                // Create the input control.
                var input = $("<input />")

                // If we're dealing with a check list control...
                if (control.hasClass(checkListCss)) {
                    // Mark the input as a checkbox input.
                    input.attr("type", "checkbox");
                }
                // Else, we're dealing with a radio list control...
                else if (control.hasClass(radioListCss)) {
                    // Mark the input as a radio button input.
                    input.attr("type", "radio");
                }

                input.attr("name", controlGroupId);
                input.attr("value", value);

                // Create list item and label to wrap the input.
                var item = $("<li><label></label></li>");

                item.find('label')
                        .append(input)
                        .append(text || value);

                // Add the label and input to the list control.
                list.append(item);
            });

            // Apply previous selections to control.
            if (allBindings.selectedOptions)
                selectInputs(control, ko.utils.unwrapObservable(allBindings.selectedOptions));
            else if (allBindings.value)
                selectInputs(control, ko.utils.unwrapObservable(allBindings.value));

        } else if (!isPlaceholder(element) && !isListControl(element)) {
            optionsUpdate(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        }
    }
});

function nextControlId() {
    return controlIdPrefix + (controlCounter++);
}

function isPlaceholder(element) {
    return element.tagName == 'INPUT' && (element.getAttribute('type') == 'checkbox' || element.getAttribute('type') == 'radio');
}

function isListControl(element) {
    return isCheckBoxListControl(element) || isRadioButtonListControl(element);
}

function isCheckBoxListControl(element) {
    return element.tagName == 'DIV' && $(element).hasClass(checkListCss);
}

function isRadioButtonListControl(element) {
    return element.tagName == 'DIV' && $(element).hasClass(radioListCss);
}

function selectInputs(control, selectedValues) {
    var inputs = $(control).find('input');

    if (!(selectedValues instanceof Array))
        selectedValues = [selectedValues];

    $.each(selectedValues, function (i, selectedValue) {
        var input = inputs.filter('[value="' + selectedValue + '"]');
        input.attr("checked", true);
    });
}


function getSelectedInputValues(element) {
    var values = [];
    var control = $(element);
    var inputs = control.find('input').filter('[checked=true]');

    $.each(inputs, function (i, input) {
        values.push($(input).attr('value'));
    });

    return values;
}


function copyAttributes(srcElement, destElement) {

    for (var i = 0, attributes = srcElement.get(0).attributes; i < attributes.length; i++) {

        var name = attributes[i].name;
        var value = attributes[i].value;

        // Exclude certain attributes from the copy.
        if (name != 'type' && name != 'value') {
            destElement.attr(name, value);
        }
    }
}


})();