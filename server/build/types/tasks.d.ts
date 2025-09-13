export declare enum Statuses {
    New = "New",
    InProgress = "InProgress",
    Resolved = "Resolved"
}
export declare enum Priority {
    Critical = "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439",
    Major = "\u0412\u044B\u0441\u043E\u043A\u0438\u0439",
    Moderate = "\u0421\u0440\u0435\u0434\u043D\u0438\u0439",
    Minor = "\u041D\u0438\u0437\u043A\u0438\u0439"
}
export declare enum Types {
    Hardware = "\u041E\u0442\u043A\u0430\u0437 \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u044F",
    Quality = "\u041D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430",
    Supply = "\u041F\u0435\u0440\u0435\u0440\u044B\u0432 \u043F\u043E\u0434\u0430\u0447\u0438",
    Contamination = "\u0417\u0430\u0433\u0440\u044F\u0437\u043D\u0435\u043D\u0438\u0435",
    Maintance = "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435"
}
export interface ITask {
    _id: string;
    status: Statuses;
    priority: Priority;
    type: Types;
    adress: string;
    title: string;
    message: string;
    assigned_to: string;
    createdAt: Date;
    UpdatetAt: Date;
}
