import moment from "moment";
import { RandomOrg } from "../../../../external/random-org/random-org";
import {
    ApplicationForm,
    ApplicationFormProcessingResult,
    ApplicationFormRaw,
    KeysOfApplicationFormRaw,
} from "../../../../types/index";

export class AppFormsProcessor {

    private randomOrg: RandomOrg;

    constructor(randomOrgApiKey: string) {
        this.randomOrg = new RandomOrg(randomOrgApiKey);
    }
    public validate(list: ApplicationFormRaw[]): Promise<ApplicationFormProcessingResult[]> {

        return new Promise((resolve, reject) => {

            const processed: ApplicationFormProcessingResult[] = list.map((item, i) => {
                return this.validateItem(item);
            }).map((fields, i) => {

                if (fields.length === 0) {

                    const valid: ApplicationFormProcessingResult = {
                        form: null,
                        invalid_fields: fields,
                        risk_score: 0,
                        valid: true,
                    };

                    return valid;

                } else {

                    const invalid: ApplicationFormProcessingResult = {
                        form: null,
                        invalid_fields: fields,
                        risk_score: 0,
                        valid: false,
                    };

                    return invalid;

                }

            });

            const validLen = processed.filter((item) => item.valid).length;
            const validIndices = processed.reduce((memo, curr, i) => {
                if (processed[i].valid === true) {
                    memo.push(i);
                }
                return memo;
            }, []);

            Promise.all([this.randomOrg.generateUUIDs(validLen),
                this.randomOrg.generateGaussians(validLen)]).then((data) => {
                const uuids = data[0];
                const rands = data[1];

                validIndices.forEach((iv, i) => {
                    const score = this.calculateRiskScore(list[iv], rands[i]);
                    const form = this.finalizeForm(list[iv], uuids[i]);

                    processed[iv].risk_score = score;
                    processed[iv].form = form;

                });

                resolve(processed);

            }).catch((e) => {
                reject(e);
            });

        });
    }
    private finalizeForm(item: ApplicationFormRaw, uuid: string): ApplicationForm {
        const momDate = moment(item.dob, "YYYY/MM/DD", true);

        const final: ApplicationForm = {
            id: uuid,
            name: item.name,
            dob: momDate.toDate(),
            address: item.address,
            occupation: item.occupation,
            created_at: new Date(),

        };

        return final;
    }
    private calculateRiskScore(item: ApplicationFormRaw, random: number) {

        const keys = Object.keys(item);
        const sum = keys.reduce((memo, curr, i) => {
            const len = item[curr as KeysOfApplicationFormRaw].length;
            memo = memo + len;
            return memo;
        }, 0);

        return sum * random;

    }
    private validateItem(item: ApplicationFormRaw): KeysOfApplicationFormRaw[] {
        const invalids: KeysOfApplicationFormRaw[] = [];

        if (item == null) {
            // if null report all as missing/invalid
            return ["address", "dob", "name", "occupation"];
        }

        if (!this.checkField("name", item.name)) {
            invalids.push("name");
        }

        if (!this.checkField("dob", item.dob)) {
            invalids.push("dob");
        }

        if (!this.checkField("address", item.address)) {
            invalids.push("address");
        }

        if (!this.checkField("occupation", item.occupation)) {
            invalids.push("occupation");
        }

        return invalids;
    }

    private checkField(field: KeysOfApplicationFormRaw, input: string) {
        let result = false;
        let rx: RegExp = null;

        if (input == null || typeof input !== "string") {
            return false;
        }

        switch (field) {
            case "name":
                rx = RegExp(/^[A-Za-z ]{3,20}$/, "i");
                if (input.match(rx)) {
                    result = true;
                }
                break;
            case "address":
                rx = RegExp(/^[A-Za-z0-9 ]{10,40}$/, "i");
                if (input.match(rx)) {
                    result = true;
                }
                break;
            case "occupation":
                rx = RegExp(/^[A-Za-z0-9 ]{5,20}$/, "i");
                if (input.match(rx)) {
                    result = true;
                }
                break;
            case "dob":
                rx = RegExp(/^\d{4}\/\d{2}\/\d{2}$/, "i");
                if (input.match(rx)) {
                    // matches regex
                    // try to parse using moment
                    const md = moment(input, "YYYY/MM/DD", true);
                    // format again using momemnt and same format -- if they are the same it's ok!
                    if (input === md.format("YYYY/MM/DD")) {
                        result = true;
                    } else {
                        result = false;
                    }

                } else {

                    result = false;
                }
                break;
        }

        return result;
    }

}
