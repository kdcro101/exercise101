import { AppFormsStatsData } from "../../../../types/index";

/**
 * Stats storing class
 */
export class AppFormsStats {

    private data: AppFormsStatsData = null;

    constructor() {
        this.reset();
    }

    public reset() {
        this.data = {
            cummulative_risk_score: 0,
            failures: 0,
            forms_invalid: 0,
            forms_valid: 0,
        };

    }
    /**
     *
     * @param prop Key of AppFormsStatsData
     * @param amount positive or negative
     */
    public modify<T extends keyof AppFormsStatsData>(prop: T, amount: number) {

        if (isNaN(amount)) {
            throw new Error("Invalid increment value");
        }

        this.data[prop] = this.data[prop] != null ? this.data[prop] + amount : amount;

    }

    public get stats() {

        return this.data;

    }

}
