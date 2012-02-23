/// <reference path="jquery-1.5.1-vsdoc.js" />

/**
* Contains a number of useful utiity methods for javascript.
*
* File:         cog.utils.js
* Version:      0.1
* Author:       Lucas Martin
* License:      Creative Commons Attribution 3.0 Unported License. http://creativecommons.org/licenses/by/3.0/ 
* 
* Copyright 2011, All Rights Reserved, Cognitive Shift http://www.cogshift.com  
*/



var cog = new function () {
    this.string = new function () {
        this.format = function () {
            var s = arguments[0];
            for (var i = 0; i < arguments.length - 1; i++) {
                var reg = new RegExp("\\{" + i + "\\}", "gm");
                s = s.replace(reg, arguments[i + 1]);
            }

            return s;
        };

        this.endsWith = function (string, suffix) {
            return (string.substr(string.length - suffix.length) === suffix);
        };

        this.startsWith = function (string, prefix) {
            return (string.substr(0, prefix.length) === prefix);
        };

        this.trimEnd = function (string, chars) {
            if (this.endsWith(string, chars))
                return string.substring(0, string.length - chars.length);

            return string;
        };

        this.trimStart = function (string, chars) {
            if (this.startsWith(string, chars))
                return string.substring(chars.length, string.length);

            return string;
        };
    };
};