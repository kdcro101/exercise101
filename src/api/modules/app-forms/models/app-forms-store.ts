import { ApplicationForm } from "../../../../types/index";

/**
 * Naive implementation of in-memory storage
 */
export class AppFormsStore {

    private store: ApplicationForm[] = [];

    public append(item: ApplicationForm) {
        this.store.push(item);
    }
    public get(index: number) {
        return this.store[index];
    }
    public get len() {
        return this.store.length;
    }
}
