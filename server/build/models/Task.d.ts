import mongoose from "mongoose";
import type { ITask } from "../types/tasks.ts";
declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, mongoose.DefaultSchemaOptions> & ITask & Required<{
    _id: string;
}> & {
    __v: number;
}, mongoose.Schema<ITask, mongoose.Model<ITask, any, any, any, mongoose.Document<unknown, any, ITask, any, {}> & ITask & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITask, mongoose.Document<unknown, {}, mongoose.FlatRecord<ITask>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ITask> & Required<{
    _id: string;
}> & {
    __v: number;
}>>;
export default Task;
