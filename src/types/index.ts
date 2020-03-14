import express from "express";

export interface PostDataFields {
    [key: string]: any;
}

export interface ApiPostRequest extends express.Request {
    postData?: ApplicationFormRaw[];
}
export interface ApiPostRequestProcessed extends ApiPostRequest {
    processingData?: ApplicationFormProcessingResult[];
}

export interface ApiResponse {
    success: boolean;
    error?: string;
}

export interface ApplicationFormRaw {
    name: string;
    dob: string;
    address: string;
    occupation: string;
}

export interface ApplicationForm extends Omit<ApplicationFormRaw, "dob"> {
    id: string;
    created_at: Date;
    dob: Date;
}

export type KeysOfApplicationFormRaw = keyof ApplicationFormRaw;

export interface ApplicationFormProcessingResult {
        valid: boolean;
        risk_score: number;
        form: ApplicationForm;
        invalid_fields: string[];
}

export interface ApplicationFormResponseValid {
    success: true;
    id: string;
}

export interface ApplicationFormResponseInvalid {
    success: false;
    invalid_fields: string[];
}
export type ApplicationFormResponse = Array<ApplicationFormResponseValid | ApplicationFormResponseInvalid>;

export interface AppFormsStatsData {
    forms_invalid: number;
    forms_valid: number;
    failures: number;
    cummulative_risk_score: number;
}
export interface AppFormsModuleStats extends AppFormsStatsData {
    stored: number;
}
