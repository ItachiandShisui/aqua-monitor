"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Types = exports.Priority = exports.Statuses = void 0;
var Statuses;
(function (Statuses) {
    Statuses["New"] = "New";
    Statuses["InProgress"] = "InProgress";
    Statuses["Resolved"] = "Resolved";
})(Statuses || (exports.Statuses = Statuses = {}));
var Priority;
(function (Priority) {
    Priority["Critical"] = "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439";
    Priority["Major"] = "\u0412\u044B\u0441\u043E\u043A\u0438\u0439";
    Priority["Moderate"] = "\u0421\u0440\u0435\u0434\u043D\u0438\u0439";
    Priority["Minor"] = "\u041D\u0438\u0437\u043A\u0438\u0439";
})(Priority || (exports.Priority = Priority = {}));
var Types;
(function (Types) {
    Types["Hardware"] = "\u041E\u0442\u043A\u0430\u0437 \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u044F";
    Types["Quality"] = "\u041D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430";
    Types["Supply"] = "\u041F\u0435\u0440\u0435\u0440\u044B\u0432 \u043F\u043E\u0434\u0430\u0447\u0438";
    Types["Contamination"] = "\u0417\u0430\u0433\u0440\u044F\u0437\u043D\u0435\u043D\u0438\u0435";
    Types["Maintance"] = "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435";
})(Types || (exports.Types = Types = {}));
