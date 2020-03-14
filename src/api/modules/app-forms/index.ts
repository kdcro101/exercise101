import express from "express";
import {
    ApiPostRequestProcessed,
    AppFormsModuleStats,
    AppFormsStatsData,
    ApplicationFormResponse,
    ApplicationFormResponseValid,
} from "../../../types/index";
import { ApiModuleBase } from "../../base/api-module-base";
import { ApplicationFormResponseInvalid } from "./../../../types/index";
import { AppFormsProcessor } from "./models/app-forms-processor";
import { AppFormsStats } from "./models/app-forms-stats";
import { AppFormsStore } from "./models/app-forms-store";
import { maxLenForm } from "./spec/form-templates";

export class ApiAppForms extends ApiModuleBase {

    private store = new AppFormsStore();
    private stats = new AppFormsStats();
    private processor: AppFormsProcessor;

    private postSizeLimit = 0;

    constructor(private randomOrgApiKey: string, private maxFormsPerPost: number = 10) {
        super();
        // calculate maximum post data size according to maximum number of forms posted
        this.postSizeLimit = JSON.stringify(
            [...Array(maxFormsPerPost).keys()].map(() => maxLenForm),
        ).length;

        this.processor = new AppFormsProcessor(this.randomOrgApiKey);
    }

    public attachModule(app: express.Application): ApiAppForms {

        app.post(`/api/forms/new`,
            this.mwCaptureResponseFinish,
            this.mwFloodLimitText(this.postSizeLimit), // Flood protection - reusable
            this.mwProcessInput,
            this.onFormsNew,
        );

        app.get(`/api/forms/stats`, this.onStatsGet);

        return this;
    }

    private mwCaptureResponseFinish = (req: express.Request, res: express.Response, next: () => void): void => {

        res.on("finish", () => this.onResponseFinish(req, res));
        next();

    }
    private mwProcessInput = (req: ApiPostRequestProcessed, res: express.Response, next: () => void): void => {

        this.processor.validate(req.postData).then((data) => {

            req.processingData = data;

            if (data.length > this.maxFormsPerPost) {
                // form count is larger than max!
                this.respondError(res, 413);
                return;
            }

            next();

        }).catch((e) => {

            this.respondError(res, 500);

        });

    }
    private onFormsNew = (req: ApiPostRequestProcessed,
                          res: express.Response,
                          next: () => void) => {
        try {

            const data = req.processingData;
            const countValid = data.filter((item) => item.valid).length;
            const countInvalid = data.filter((item) => !item.valid).length;
            const sumRiskScore = data.reduce((memo, curr, i) => memo + curr.risk_score, 0);

            this.stats.modify("forms_valid", countValid);
            this.stats.modify("forms_invalid", countInvalid);
            this.stats.modify("cummulative_risk_score", sumRiskScore);

            const output: ApplicationFormResponse = data.map((item, i) => {

                if (item.valid) {
                    const valid: ApplicationFormResponseValid = {
                        success: true,
                        id: item.form.id,
                    };

                    this.store.append(item.form);

                    return valid;
                } else {
                    const invalid: ApplicationFormResponseInvalid = {
                        success: false,
                        invalid_fields: item.invalid_fields,
                    };
                    return invalid;
                }

            });

            this.respondSuccess<ApplicationFormResponse>(res, output);
        } catch {
            this.respondError(res, 500);
        }

    }
    private onStatsGet = (req: express.Request, res: express.Response, next: () => void): void => {
        try {

            const stats = this.stats.stats as AppFormsModuleStats;
            stats.stored = this.store.len;
            this.respondSuccess<AppFormsStatsData>(res, stats);

        } catch {
            this.respondError(res, 500);
        }

    }
    private onResponseFinish(req: express.Request, res: express.Response) {

        if (res.statusCode !== 200) {
            this.stats.modify("failures", 1);
        }
    }
}
