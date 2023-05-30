"use strict";

//---------- ©2018 e-consulting ----------//
if (typeof (econsulting) == "undefined") {
    var econsulting = {__namespace: true}
}
if (typeof (econsulting.webres) == "undefined") {
    econsulting.webres = {__namespace: true}
}
if (typeof (econsulting.webres.GL) == "undefined") {
    econsulting.webres.GL = {__namespace: true}
}
if (typeof (econsulting.webres.AM) == "undefined") {
    econsulting.webres.AM = {__namespace: true}
}

var webConstantsObj = {
    eo_dmmsb_accountServiceUrl: "",
    eo_dmmsb_contactServiceUrl: "",
    eo_dmmsb_accountFormID: "",
    eo_dmmsb_contactFormID: ""
};

var currentUserRuCode = "";

// Xrm.Page.ui.formSelector.getCurrentItem().getId()
// !!! CHECK CONSTANTS AFTER MIGRATION TO ANOTHER CRM (next are only for the Global) !!!
// var webConstantsObj = {
//     eo_dmmsb_accountServiceUrl: "https://mmsbdev.crm.oschadbank.ua/api/SearchAccount/FindAccounts",
//     eo_dmmsb_contactServiceUrl: "https://mmsbdev.crm.oschadbank.ua/api/SearchAccount/FindContacts",
//     eo_dmmsb_accountFormID: "32dc26ca-828d-4f2a-80b1-e3fcb6a41762",
//     eo_dmmsb_contactFormID: "fbf06416-7011-4696-97d0-8c5e250fec3d"
// };

var messagesObj = {
    noWebConstantsMsg: "Відсутні параметри звернення до сервісів CRM. Зверніться до адміністратора!",
    noCurrentUserRuCode: "Не вдалося встановити РУ поточного користувача. Зверніться до адміністратора!",
    noResults: "Записів по заданим параметрам не знайдено,  будь ласка, змініть інформацію " +
        "в полях з критеріями пошуку або створіть новий запис клієнта.",
    initAccount: "Для проведення пошуку, будь ласка, внесіть дані Юридичної особи в форму пошуку",
    initContact: "Для проведення пошуку, будь ласка, внесіть дані ФОП/НПД/КДП/ФО в формі пошуку",
    noValidateAccount: "Не вказаний жодний із параметрів пошуку Юридичної особи. <br>" +
        "Для пошуку заповніть наступні групи полів: <br>" +
        "або / та Код клієнта <br>" +
        "або / та Найменування <br>" +
        "або / та РНК <br>" +
        "або / та Номер телефону <br>" +
        "або / та Номер рахунку <br>" +
        "Також є можливість одразу заповнити декілька полів.",
    noValidateContact: "Не вказаний жодний із параметрів пошуку Клієнтів ММСБ ФОП/НПД/КДП/ФО. <br>" +
        "Для пошуку заповніть один або кілька наступних параметрів пошуку: <br>" +
        "або / та ІПН <br>" +
        "або / та РНК <br>" +
        "або / та Номер телефону <br>" +
        "або / та Номер рахунку <br>" +
        "або / та Прізвище та Ім’я (за бажанням) <br>" +
        "або / та Серія (за бажанням) та Номер паспорту  <br>" +
        "або / та ID паспорт"
};


var formTabs = $(".form-tabs li"),
    forms = $(".forms .form"),
    formSearchBtns = $(".forms .form .btn-submit"),
    formCreateBtns = $(".forms .form .btn-create"),
    formClearBtns = $(".forms .form .btn-clear"),
    gridConts = $(".table-wrapper .grid-cont"),
    gridTableAccount = $("#grid-account")[0],
    gridTableContact = $("#grid-contact")[0];

var generalRegExp = /^[а-яА-ЯёЁa-zA-ZІіЇїЄєҐґ0-9*"'«»;:,.`№\s\-]{2,}$/,
    telRegExp = /^[0-9)(_\s]{5,}$/,
    accountRegExp = /^[0-9]{5,}$/,

    clientCodeRegExp = /^[а-яА-ЯёЁa-zA-ZІіЇїЄєҐґ0-9\s\-]{2,}$/,
    rnkRegExp = /^[0-9]{2,}$/,

    contactNamingRegExp = /^[а-яА-ЯёЁa-zA-ZІіЇїЄєҐґ0-9"'«»;:,.`№\s\-]{2,}$/,
    ipnRegExp = /^[0-9]{1,}$/,
    seriesPassportRegExp = /^[а-яА-ЯёЁa-zA-ZІіЇїЄєҐґ0-9\s\-]{1,}$/,
    numberPassportRegExp = /^[а-яА-ЯёЁa-zA-ZІіЇїЄєҐґ0-9\s\-]{2,}$/;

var arrayInputFieldsAccount = [
        {id: "account-client-code", regExp: clientCodeRegExp, maxLength: 10},
        {id: "account-name", regExp: generalRegExp, maxLength: 250},
        {id: "account-rnk", regExp: rnkRegExp, maxLength: 32},
        {id: "account-phone", regExp: telRegExp, maxLength: 50},
        {id: "account-account", regExp: accountRegExp, maxLength: 100}
    ],
    arrayInputFieldsContact = [
        {id: "contact-ipn", regExp: ipnRegExp, maxLength: 10},
        {id: "contact-rnk", regExp: rnkRegExp, maxLength: 32},
        {id: "contact-surname", regExp: contactNamingRegExp, maxLength: 200},
        {id: "contact-name", regExp: contactNamingRegExp, maxLength: 50, relatedFields: ["contact-surname"]},
        {
            id: "contact-series-passport",
            regExp: seriesPassportRegExp,
            maxLength: 23,
            relatedFields: ["contact-number-passport"]
        },
        {id: "contact-number-passport", regExp: numberPassportRegExp, maxLength: 20},
        {id: "contact-account", regExp: accountRegExp, maxLength: 100},
        {id: "contact-phone", regExp: telRegExp, maxLength: 50}
    ]
;

//------------------START-----------------//

$(function () {
    // econsulting.webres.GL.hideCrmRibbonButtons();

    econsulting.webres.GL.topJQueryInit();
    econsulting.webres.GL.dialogWindowInit();
    econsulting.webres.GL.getWebConstantsFetchRequest();
    econsulting.webres.GL.getcurrentUserRuCodeFetchRequest();

    econsulting.webres.GL.formsInit();
    econsulting.webres.GL.formBtnsInit();
    econsulting.webres.GL.telephoneInputFieldInitState($(".telephone-mask"));

    econsulting.webres.GL.gridsInitState();
    econsulting.webres.GL.gridInit(gridTableAccount);
    econsulting.webres.GL.gridInit(gridTableContact);

    econsulting.webres.GL.registerFormInputHandlers(arrayInputFieldsAccount);
    econsulting.webres.GL.registerFormInputHandlers(arrayInputFieldsContact);

    econsulting.webres.GL.registerFormBtnHandlers(forms[0]);
    econsulting.webres.GL.registerFormBtnHandlers(forms[1]);
    econsulting.webres.GL.registerFormTabBtnHandlers();
});

econsulting.webres.GL.hideCrmRibbonButtons = function () {
    parent.$("#crmContentPanel").css("top", "50px");
    parent.$("#crmTopBar").css("display", "none");
};

econsulting.webres.GL.fetchRequest = function (fetchXML, entityName, callbackFunc) {
    var fetchStatus;

    if (parent.Xrm) {
        // econsulting.webres.GL.pageLoader.show("Завантаження");
        var encodedFetchXML = encodeURIComponent(fetchXML);

        var req = new XMLHttpRequest();
        req.open("GET", parent.Xrm.Page.context.getClientUrl() + "/api/data/v8.1/" + entityName + "?fetchXml=" + encodedFetchXML, true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"OData.Community.Display.V1.FormattedValue\"");
        req.send();

        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var fetchResult = JSON.parse(this.response);
                    fetchStatus = true;

                    if (callbackFunc != undefined) {
                        callbackFunc(fetchResult);
                    }
                } else {
                    fetchStatus = false;
                    console.log(this.statusText);
                }
            }
        };
    } else {
        console.log("No Xrm API in this scope!");
        fetchStatus = false;
    }
};

econsulting.webres.GL.getWebConstantsFetchRequest = function () {
    var status;

    var fetchXML = [
        '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">',
        '<entity name="new_constant">',
        '<attribute name="new_name" />',
        '<attribute name="createdon" />',
        '<attribute name="new_description" />',
        '<attribute name="new_constantid" />',
        '<attribute name="new_nvarchar" />',
        '<order attribute="new_name" descending="false" />',
        '<filter type="and">',
        '<filter type="or">',
        '<condition attribute="new_name" operator="eq" value="eo_dmmsb_contactFormID" />',
        '<condition attribute="new_name" operator="eq" value="eo_dmmsb_accountFormID" />',
        '<condition attribute="new_name" operator="eq" value="eo_dmmsb_accountServiceUrl" />',
        '<condition attribute="new_name" operator="eq" value="eo_dmmsb_contactServiceUrl" />',
        '</filter>',
        '</filter>',
        '</entity>',
        '</fetch>'].join('');

    econsulting.webres.GL.fetchRequest(fetchXML, "new_constants", function (result) {
        if (result && result.value && result.value.length === 4) {
            result.value.forEach(function (item, i, arr) {
                webConstantsObj[item["new_name"]] = item["new_nvarchar"];
            });
            status = true;
        } else {
            econsulting.webres.GL.dialogWindow.showMsg(messagesObj.noWebConstantsMsg);
            status = false;
        }
    });
};

econsulting.webres.GL.getcurrentUserRuCodeFetchRequest = function () {
    var status;

    var fetchXML = [
        '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">',
        '<entity name="systemuser">',
        '<attribute name="fullname" />',
        '<attribute name="systemuserid" />',
        '<order attribute="fullname" descending="false" />',
        '<filter type="and">',
        '<condition attribute="systemuserid" operator="eq-userid" />',
        '</filter>',
        '<link-entity name="businessunit" from="businessunitid" to="businessunitid" visible="false" link-type="outer" alias="ru">',
        '<attribute name="prime_ru" />',
        '</link-entity>',
        '</entity>',
        '</fetch>'].join('');

    econsulting.webres.GL.fetchRequest(fetchXML, "systemusers", function (result) {
        if (result && result.value) {
            var tempUserRu = result.value[0]["ru_x002e_prime_ru"];
            currentUserRuCode = tempUserRu ? tempUserRu : "";
            status = true;
        } else {
            console.log(messagesObj.noCurrentUserRuCode);
            status = false;
        }
    });
};

econsulting.webres.GL.topJQueryInit = function () {
    this.getWindow = function (a) {
        function c(a, d) {
            if (!a) var a = window.top;
            if (d.selector) {
                if (a.$ && a.$(d.selector) && a.$(d.selector).length > 0) return void (b = a)
            } else if (d.property && a[d.property]) return void (b = a);
            if (a.frames.length > 0) for (var e = 0; e < a.frames.length; e++) a.frames[e] && c(a.frames[e].window, d)
        }

        var b;
        return c(null, a), b
    };

    this.topJQuery = this.getWindow({selector: "#crmTopBar"}) ?
        this.getWindow({selector: "#crmTopBar"}).$ :
        this.getWindow({selector: "body"}).$;
};

econsulting.webres.GL.dialogWindowInit = function () {
    var dialogInnerStyles = document.getElementById("dialog-inner-styles"),
        dialogWindow = document.getElementById("error-message"),
        dialogText = dialogWindow.querySelector(".dialog-container .dialog-text-cont .dialog-text"),
        dialogCloseBtns = dialogWindow.querySelectorAll(".dialog-container .close-btn");

    if (dialogInnerStyles && dialogWindow && dialogText && dialogCloseBtns) {
        this.dialogWindow = (function () {
            return {
                showMsg: function (msgHTML, callback) {
                    $(dialogText).html(msgHTML || "");

                    if (callback) {
                        callback(dialogWindow)
                    }
                    $(dialogWindow).show();
                },
                off: function () {
                    $(dialogWindow).hide();
                },
                prepend: function () {
                    econsulting.webres.GL.topJQuery('body').prepend(dialogWindow);
                    econsulting.webres.GL.topJQuery('body').prepend(dialogInnerStyles);
                }
            }
        })();

        this.dialogWindow.prepend();
        this.dialogWindow.off();

        (function (context) {
            $(dialogCloseBtns).on("click", function () {
                context.dialogWindow.off();
            });
        })(this);
    } else {
        console.log("Can not to init dialog window. Please, check the mark up!");
    }
};

econsulting.webres.GL.formsInit = function () {
    $(formTabs).removeClass("active");
    $(formTabs[0]).addClass("active");
    $(forms).removeClass("active");
    $(forms[0]).addClass("active");
    $(gridConts).removeClass("active");
    $(gridConts[0]).addClass("active");
};

econsulting.webres.GL.telephoneInputFieldInitState = function (telField) {
    $(telField).val("38");
    $(telField).mask("99 999 999 9999? 9999 9999 9999 9999 9999 9999 9999 9999 9999 99", {
        autoclear: false,
        placeholder: " "
    });
};

econsulting.webres.GL.formReset = function (formElem) {
    // jQuery has no reset() method; but native JavaScript does. So, convert the jQuery element to a JavaScript object
    $(formElem)[0].reset();
    econsulting.webres.GL.telephoneInputFieldInitState($(formElem).find(".telephone-mask"));
    $(formElem).find(".input-cont .input-col.error").removeClass("error");
    $(formElem).find(".input-cont .input-col .error-msg").removeClass("active");
};

econsulting.webres.GL.formBtnsInit = function () {
    econsulting.webres.GL.setBtnState(formSearchBtns, "active", "enabled");
    econsulting.webres.GL.setBtnState(formCreateBtns, "inactive", "disabled");
    econsulting.webres.GL.setBtnState(formClearBtns, "active", "enabled");
};

econsulting.webres.GL.gridsInitState = function () {
    gridTableAccount.isFirstInit = true;
    gridTableAccount.messageStr = messagesObj.initAccount;
    gridTableContact.isFirstInit = true;
    gridTableContact.messageStr = messagesObj.initContact;
};

econsulting.webres.GL.gridClear = function (gridElem) {
    var activeForm = $(".forms .form.active")[0],
        activeCreateBtn = $(activeForm).find(".btn-create")[0];

    // if (!gridElem.isFirstInit) {
    //     $(gridElem).bootgrid("clear");
    // }

    econsulting.webres.GL.setBtnState($(activeCreateBtn), "inactive", "disabled");
    $(gridElem).data()[".rs.jquery.bootgrid"].options.hasMore = false;
    $(gridElem).bootgrid("clear");
};

econsulting.webres.GL.gridInit = function (elem) {
    $(elem).bootgrid({
        ajax: false,
        navigation: 2,
        rowCount: [5],
        searchable: false,
        labels: {
            all: "All",
            infos: "{{ctx.start}} - 3 з {{ctx.total}} записів",
            loading: "Loading...",
            noResults: messagesObj.noResults,
            refresh: "Refresh",
            // search: "Search"
        },
        css: {
            iconUp: "crm-icon-up",
            iconDown: "crm-icon-down",
            pagination: "pagination",

        },
        sorting: true,
        multiSort: false,
        formatters: {
            "link": function (column, row) {
                return "<span data-id=" + row.Id + " class=\"link\">" + (row.Name ? row.Name : row.FullName) + "</span>";
            },
            "isCurrentUserRuCode": function (column, row) {
                var rowData = (row[column.id] == null || row[column.id] === "") ? "&nbsp;" : row[column.id],
                    rowUserRuCode = (row.RUCode ? row.RUCode : "");

                if (currentUserRuCode && rowUserRuCode && currentUserRuCode == rowUserRuCode) {
                    return "<span class=\"current-user-ru\">" + rowData + "</span>";
                } else {
                    return "<span>" + rowData + "</span>";
                }
            },
            "ukdate": function (column, row) {
                var currentDateStr = row[column.id],
                    convertedDate;

                if (currentDateStr) {
                    var convertedDateStr = currentDateStr.slice(6, 10) + "." + currentDateStr.slice(3, 5) + "." + currentDateStr.slice(0, 2);
                    var tempDate = new Date(convertedDateStr);
                    convertedDate = moment.utc(tempDate).format('DD MM YYYY')
                } else {
                    convertedDate = "";
                }

                return convertedDate;
            }
        },
        converters: {
            'datetime': {
                from: function (value) {
                    return moment(value);
                },
                to: function (value) {
                    return moment(value).format("DD MMMM YYYY");
                }
            }
        }
    }).on("loaded.rs.jquery.bootgrid", function () {
        econsulting.webres.GL.showGridMessage(elem, elem.messageStr);
        econsulting.webres.GL.registerOpenUserLinksHandler();
        let paginationHtml = $(elem).closest(".grid-cont").find(".bootgrid-footer").html();
        console.log(paginationHtml);
        let topPagination = $(elem).closest(".grid-cont").find(".bootgrid-header");
        topPagination.html(paginationHtml);


    }).on("cleared.rs.jquery.bootgrid", function () {
        /* Executes after data is loaded and rendered */
        econsulting.webres.GL.showGridMessage(elem, elem.messageStr);

    });

    console.log("getTotalRowCount", $(elem).bootgrid("getTotalRowCount"));
    console.log("getRowCount", $(elem).bootgrid("getRowCount"));
    console.log("getCurrentRows", $(elem).bootgrid("getCurrentRows"));

};

econsulting.webres.GL.gridFiller = function (gridElem, nodes, hasMore) {
    if ($(gridElem).find("tbody").children().length != 0) {
        $(gridElem).bootgrid("clear");
    }
    $(gridElem).data()[".rs.jquery.bootgrid"].options.hasMore = hasMore;
    $(gridElem).bootgrid('append', nodes);
};

econsulting.webres.GL.preloaderOn = function () {
    $(".preloader").addClass("active");
};

econsulting.webres.GL.preloaderOff = function (func) {
    setTimeout(function () {
        $(".preloader").removeClass("active");
        if (func != "undefined") {
            func();
        }
    }, 500);
};

econsulting.webres.GL.showGridMessage = function (gridElem, msg) {
    var noResultField = $(gridElem).find(".no-results");

    if (noResultField.length) {
        $(noResultField).html(msg);
    }
};

econsulting.webres.GL.setBtnState = function (btnElem, isActive, isDisabled) {
    if (isActive == "active") {
        $(btnElem).addClass("active");
    } else if (isActive == "inactive") {
        $(btnElem).removeClass("active");
    }

    if (isDisabled == "disabled") {
        $(btnElem).addClass("disabled");
    } else if (isDisabled == "enabled") {
        $(btnElem).removeClass("disabled");
    }
};

/**
 * Формирует объект с данными для отправки в сервис поиска
 * @param {string} formElem - селектор формы
 */
econsulting.webres.GL.objectCreator = function (formElem) {
    var inputFields = $(formElem).find(".input-cont input"),
        itemVal,
        telRegExpToExclude = /[^0-9]/g,
        resultObj = {};

    $(inputFields).each(function (i, item) {
        itemVal = $(item).val();

        if ($(item).hasClass("telephone-mask")) {
            itemVal = itemVal.replace(telRegExpToExclude, "");
            if (itemVal.length < 5) {
                itemVal = "";
            }
        }

        resultObj[$(item).attr("name")] = itemVal;
    });

    return resultObj;
};

econsulting.webres.GL.transformDataWithEmptyFields = function (inputArrayObj) {
    var resultArrayObj;

    resultArrayObj = inputArrayObj.map(function (obj) {
        var tempObj = {};
        for (var key in obj) {
            if (obj[key]) {
                tempObj[key] = obj[key];
            } else {
                tempObj[key] = "";
            }
        }
        return tempObj;
    });

    return resultArrayObj;
};

econsulting.webres.GL.deleteNoValidSymbolsInField = function (inputFieldObj) {
    var inputElem = document.getElementById(inputFieldObj.id),
        inputElemValue = inputElem.value,
        regExpToExclude = String(inputFieldObj.regExp),
        startIndex,
        stopIndex;

    startIndex = regExpToExclude.indexOf("[");
    stopIndex = regExpToExclude.lastIndexOf("]");
    regExpToExclude = regExpToExclude.slice(startIndex, stopIndex + 1);
    regExpToExclude = regExpToExclude.slice(0, 1) + "^" + regExpToExclude.slice(1);
    regExpToExclude = new RegExp(regExpToExclude, "g");

    if (inputElemValue.length > 0) {
        var flagTest = !inputFieldObj.regExp.test(inputElem.value),
            flagMax = inputElem.value.length > inputFieldObj.maxLength,
            tempStr = inputElemValue;

        if (flagTest || flagMax) {
            if (flagTest) {
                tempStr = inputElemValue.replace(regExpToExclude, "");
            }
            if (flagMax) {
                tempStr = tempStr.slice(0, inputFieldObj.maxLength);
            }
            // show tooltip without error border
            inputElem.nextElementSibling.classList.add("active");
            inputElem.value = tempStr;
        } else {
            inputElem.nextElementSibling.classList.remove("active");
        }
    }
};

econsulting.webres.GL.validatorField = function (inputFieldObj) {
    var inputElem = document.getElementById(inputFieldObj.id),
        inputElemValue = inputElem.value,
        statusObj = {isValid: null, isEmpty: null},
        telRegExpToExclude = /[^0-9]/g;

    if (inputElem.classList.contains("telephone-mask")) {
        inputElemValue = inputElemValue.replace(telRegExpToExclude, "");
    }

    if ((inputElemValue.length > 0 && !inputElem.classList.contains("telephone-mask")) ||
        (inputElemValue.length > 2 && inputElem.classList.contains("telephone-mask"))
    ) {
        statusObj.isEmpty = false;
        if (!inputFieldObj.regExp.test(inputElemValue) || (inputElemValue.length > inputFieldObj.maxLength)
        ) {
            inputElem.parentElement.classList.add("error");
            statusObj.isValid = false;
        } else {
            if (inputElem.parentElement.classList.contains("error")) {
                inputElem.parentElement.classList.remove("error");
            }
            statusObj.isValid = true;
        }
    } else {
        if (inputElem.parentElement.classList.contains("error")) {
            inputElem.parentElement.classList.remove("error");
        }
        statusObj.isEmpty = true;
        statusObj.isValid = false;
    }

    return statusObj;
};

econsulting.webres.GL.fullValidator = function (formElem) {
    var currentArrayInputFields,
        flagsArrayObj = {},
        fieldsAllCnt = 0,
        fieldsNotEnteredCnt = 0,
        tempFlag,
        resultFlag = true,
        resultErrorMsg = "";

    // {id: "contact-name", regExp: generalRegExp, maxLength: 50, relatedFields: ["contact-surname"]}

    if ($(formElem).attr("name") == "account") {
        currentArrayInputFields = arrayInputFieldsAccount;
    } else if ($(formElem).attr("name") == "contact") {
        currentArrayInputFields = arrayInputFieldsContact;
    }

    $(currentArrayInputFields).each(function (i, itemObj) {
        flagsArrayObj[itemObj.id] = econsulting.webres.GL.validatorField(itemObj);
    });

    // individual validation
    for (var key in flagsArrayObj) {
        if (flagsArrayObj[key]["isEmpty"]) {
            fieldsNotEnteredCnt++;
        }
        fieldsAllCnt++;

        tempFlag = flagsArrayObj[key]["isEmpty"] || flagsArrayObj[key]["isValid"];
        resultFlag = resultFlag && tempFlag;

        if (!flagsArrayObj[key]["isEmpty"] && !flagsArrayObj[key]["isValid"]) {
            var inputElem = document.getElementById(key),
                inputElemLabel = inputElem.parentElement.previousElementSibling.innerText;

            resultErrorMsg += "Необхідно коректно заповнити поле " + inputElemLabel + ".<br>";
        }
    }

    if (fieldsNotEnteredCnt == fieldsAllCnt) {
        resultFlag = -1;
        resultErrorMsg = $(formElem).attr("name") == "account" ? messagesObj.noValidateAccount : messagesObj.noValidateContact;
    } else {
        // group validation
        $(currentArrayInputFields).each(function (i, itemObj) {
            if (itemObj.relatedFields != undefined && !flagsArrayObj[itemObj.id]["isEmpty"]) {
                $(itemObj.relatedFields).each(function (i, relatedItemName) {
                    var inputElem = document.getElementById(relatedItemName),
                        inputElemLabel = inputElem.parentElement.previousElementSibling.innerText;

                    tempFlag = !flagsArrayObj[relatedItemName]["isEmpty"] && flagsArrayObj[relatedItemName]["isValid"];
                    if (!tempFlag) {
                        inputElem.parentElement.classList.add("error");
                        resultErrorMsg += "Необхідно коректно заповнити зв'язне поле " + inputElemLabel + ".<br>";
                    } else {
                        if (inputElem.parentElement.classList.contains("error")) {
                            inputElem.parentElement.classList.remove("error");
                        }
                    }
                });
            }
        });
    }

    if (resultFlag != -1 && resultErrorMsg == "") {
        resultErrorMsg = "success";
    }

    return resultErrorMsg;
};

econsulting.webres.GL.registerFormInputHandlers = function (arrayInputFieldsObj) {
    $(arrayInputFieldsObj).each(function (i, itemObj) {
        var inputElem = document.getElementById(itemObj.id);

        // onChange handlers
        $(inputElem).on("change", function () {
            var activeForm = $(".forms .form.active")[0];
            // econsulting.webres.GL.validatorField(itemObj);
            econsulting.webres.GL.fullValidator(activeForm);
            inputElem.nextElementSibling.classList.remove("active");
        });

        // onFocus handlers
        $(inputElem).on("focus", function () {
            inputElem.parentElement.classList.remove("error");
        });

        // onBlur handlers
        $(inputElem).on("blur", function () {
            var activeForm = $(".forms .form.active")[0];

            econsulting.webres.GL.fullValidator(activeForm);
            inputElem.nextElementSibling.classList.remove("active");
        });

        // onInput handlers
        $(inputElem).on("input", function () {
            inputElem.parentElement.classList.remove("error");
            econsulting.webres.GL.deleteNoValidSymbolsInField(itemObj);
        });
    });
};

econsulting.webres.GL.registerFormTabBtnHandlers = function () {
    $(formTabs).on("click", function () {
        if (!$(this).hasClass("active") && !$(formSearchBtns).hasClass("disabled")) {
            $(formTabs).toggleClass("active");
            $(forms).toggleClass("active");
            $(gridConts).toggleClass("active");
            econsulting.webres.GL.gridsInitState();
        }
    });
};

econsulting.webres.GL.registerOpenUserLinksHandler = function () {
    $(".grid-cont.active .link").on("click", function () {
        var activeForm = $(".forms .form.active")[0],
            activeFormName = $(activeForm).attr("name");
        var currentFormId = activeFormName === "account" ? webConstantsObj.eo_dmmsb_accountFormID : webConstantsObj.eo_dmmsb_contactFormID;

        if (currentFormId) {
            if (parent.Xrm) {
                parent.Xrm.Utility.openEntityForm(
                    activeFormName,
                    $(this).attr("data-id"),
                    {formid: currentFormId},
                    {openInNewWindow: true}
                );
            } else {
                console.log("No Xrm API in this scope!");
            }
        } else {
            econsulting.webres.GL.dialogWindow.showMsg(messagesObj.noWebConstantsMsg);
        }
    });

    $(".grid-cont.active .table tbody > tr[data-row-id]").on("dblclick", function () {
        var activeForm = $(".forms .form.active")[0],
            activeFormName = $(activeForm).attr("name");
        var currentFormId = activeFormName === "account" ? webConstantsObj.eo_dmmsb_accountFormID : webConstantsObj.eo_dmmsb_contactFormID;

        if (currentFormId) {
            if (parent.Xrm) {
                parent.Xrm.Utility.openEntityForm(
                    activeFormName,
                    $(this).attr("data-row-id"),
                    {formid: currentFormId},
                    {openInNewWindow: true}
                );
            } else {
                console.log("No Xrm API in this scope!");
            }
        } else {
            econsulting.webres.GL.dialogWindow.showMsg(messagesObj.noWebConstantsMsg);
        }
    });
};

econsulting.webres.GL.registerFormBtnHandlers = function (formElem) {
    // register ajax request
    $(formElem).find(".btn-submit").on("click", function (event) {
        event.preventDefault();

        var activeGridTable = $(".table-wrapper .grid-cont.active .table")[0],
            activeForm = $(".forms .form.active")[0],
            activeSubmitBtn = $(activeForm).find(".btn-submit")[0],
            activeCreateBtn = $(activeForm).find(".btn-create")[0],
            validatorStatus = econsulting.webres.GL.fullValidator(formElem),
            activeFormName = $(formElem).attr("name"),
            currentServiceUrl = activeFormName === "account" ? webConstantsObj.eo_dmmsb_accountServiceUrl : webConstantsObj.eo_dmmsb_contactServiceUrl;

        if (!$(this).hasClass("disabled")) {
            econsulting.webres.GL.gridClear(activeGridTable);

            if (validatorStatus == "success") {
                if (currentServiceUrl) {
                    var data = econsulting.webres.GL.objectCreator(formElem),
                        dataJSON = JSON.stringify(data);

                    econsulting.webres.GL.preloaderOn();
                    econsulting.webres.GL.setBtnState($(activeSubmitBtn), "active", "disabled");
                    econsulting.webres.GL.setBtnState($(activeCreateBtn), "inactive", "disabled");

                    $.ajax({
                        url: currentServiceUrl,
                        method: "POST",
                        data: dataJSON,
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data, status, xhr) {
                            console.log("success! data: ", data);

                            var transformedData = econsulting.webres.GL.transformDataWithEmptyFields(data.Result.Collection);
                            econsulting.webres.GL.gridFiller(activeGridTable, transformedData, data.Result.HasMoreRecords);

                            econsulting.webres.GL.preloaderOff(function () {
                                econsulting.webres.GL.setBtnState($(activeSubmitBtn), "active", "enabled");
                                econsulting.webres.GL.setBtnState($(activeCreateBtn), "active", "enabled");

                                if (!data.Result.Collection.length) {
                                    econsulting.webres.GL.showGridMessage(activeGridTable, messagesObj.noResults);
                                }
                            });
                        },
                        error: function (xhr, status, error) {
                            console.log("error! ", xhr, status, error);
                            econsulting.webres.GL.dialogWindow.showMsg("Помилка серверу. Зверніться до адміністратора.");

                            econsulting.webres.GL.preloaderOff(function () {
                                econsulting.webres.GL.setBtnState($(activeSubmitBtn), "active", "enabled");
                            });
                        }
                    });
                } else {
                    econsulting.webres.GL.dialogWindow.showMsg(messagesObj.noWebConstantsMsg);
                }
            } else {
                // econsulting.webres.GL.gridClear(activeGridTable);
                setTimeout(function () {
                    econsulting.webres.GL.dialogWindow.showMsg(validatorStatus);
                }, 10);
            }
        }
    });

    // open entity form in blank window
    $(formElem).find(".btn-create").on("click", function (event) {
        event.preventDefault();

        if (!$(this).hasClass("disabled")) {
            var activeFormName = $(formElem).attr("name");
            var currentFormId = activeFormName === "account" ? webConstantsObj.eo_dmmsb_accountFormID : webConstantsObj.eo_dmmsb_contactFormID;
            var templateDialogChoseSubtypeClient = $("#dialogChoseSubtypeClient").html();

            if (currentFormId) {
                if (parent.Xrm) {
                    if (activeFormName === "contact") {
                        econsulting.webres.GL.dialogWindow.showMsg(templateDialogChoseSubtypeClient, function (ctx) {
                            let dialogWrapper = $(ctx);
                            dialogWrapper.find('.dialog-header').text('Створення Клієнта ММСБ');
                            dialogWrapper.find('.dialog-buttons-cont .close-btn')
                                .css({
                                    marginLeft: '0',
                                    marginRight: 'auto',
                                })
                                .text('Відхилити');

                            if (!dialogWrapper.find('.dialog-buttons-cont .next-btn').length) {
                                dialogWrapper.find('.dialog-buttons-cont').append('<button class="btn next-btn">Продовжити</button>');
                            }
                            dialogWrapper.find('.dialog-buttons-cont .next-btn').off('click.newclient');
                            dialogWrapper.find('.dialog-buttons-cont .next-btn').on('click.newclient', function () {
                                const subtypeClient = dialogWrapper.find("[name=SubtypeClient]").val();
                                if (subtypeClient) {
                                    parent.Xrm.Utility.openEntityForm(activeFormName, null, {
                                            formid: currentFormId,
                                            usd_subtype: subtypeClient
                                        },
                                        {openInNewWindow: true}
                                    );
                                    econsulting.webres.GL.dialogWindow.off();
                                } else {
                                    console.log('Ошибка типа клиента');
                                }
                            })
                        });
                    } else {
                        parent.Xrm.Utility.openEntityForm(activeFormName, null, {formid: currentFormId}, {openInNewWindow: true});
                    }
                } else {
                    console.log("No Xrm API in this scope!");
                }
            } else {
                econsulting.webres.GL.dialogWindow.showMsg(messagesObj.noWebConstantsMsg);
            }
        }
    });

    // clear form fields and grid
    $(formElem).find(".btn-clear").on("click", function (event) {
        event.preventDefault();

        if (!$(this).hasClass("disabled")) {
            var activeFormName = $(formElem).attr("name"),
                activeForm = $(".forms .form.active")[0],
                activeGridTable = $(".table-wrapper .grid-cont.active .table")[0];

            econsulting.webres.GL.formReset(activeForm);
            econsulting.webres.GL.gridClear(activeGridTable);
        }
    });
};