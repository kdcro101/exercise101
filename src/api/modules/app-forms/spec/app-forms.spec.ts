import axios from "axios";
import "jasmine";
import { RandomOrg } from "../../../../external/random-org/random-org";
import { AppFormsModuleStats, ApplicationFormResponse } from "../../../../types/index";
import { AppServer } from "../../../server/server";
import { ApplicationFormResponseInvalid } from "./../../../../types/index";
import { formInvalidAddress, formInvalidDob, formInvalidName, formInvalidOccupation, maxLenForm, minLenForm } from "./form-templates";

const FAKE_UUID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const ADDRESS = "127.0.0.1";
const PORT = 54123;
const MAX_FORMS_PER_POST = 10;
const BASE_URL = `http://${ADDRESS}:${PORT}`;

describe("Microservice test", () => {

    let server: AppServer = null;

    const mockRandomOrg = (n: number, gaussianValue: number= 1) => {

        const gaussians = [...Array(n).keys()].map(() => gaussianValue);
        const uuids = [...Array(n).keys()].map(() => FAKE_UUID);

        const spy1 = spyOn(RandomOrg.prototype, "generateGaussians").and.returnValue(Promise.resolve(gaussians));
        const spy2 = spyOn(RandomOrg.prototype, "generateUUIDs").and.returnValue(Promise.resolve(uuids));

        return [spy1, spy2];
    };
    beforeEach((done) => {
        server = new AppServer(FAKE_UUID, ADDRESS, PORT, MAX_FORMS_PER_POST);
        server.start().then(() => done());

    });
    afterEach((done) => {
        server.stop().then(() => {
            done();
        }).catch(() => {
            done();
        });
    });

    it(`Should return stats with zeros`, (done) => {
        axios.get(`/api/forms/stats`,
            { baseURL: BASE_URL })
            .then((res) => {
                const data: AppFormsModuleStats = res.data;

                expect(data.cummulative_risk_score).toEqual(0);
                expect(data.forms_invalid).toEqual(0);
                expect(data.forms_valid).toEqual(0);
                expect(data.failures).toEqual(0);
                expect(data.stored).toEqual(0);

                done();
            });
    });
    it(`Should fail because of disconnected socket due to flood protection`, (done) => {
        const c = MAX_FORMS_PER_POST + 2;
        const forms = [...Array(c).keys()].map(() => maxLenForm);

        const spies = mockRandomOrg(c);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .catch((e) => {
                expect(e).not.toBeNull();
                done();
            });

    });

    it(`Should fail because of number of forms excedes maximum`, (done) => {
        const count = MAX_FORMS_PER_POST + 1;
        const forms = [...Array(count).keys()].map(() => minLenForm);

        const spies = mockRandomOrg(count);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .catch((e) => {
                expect(e).not.toBeNull();
                done();
            });

    });
    it(`Should succeed to post maximum number of forms`, (done) => {
        const forms = [...Array(MAX_FORMS_PER_POST).keys()].map(() => maxLenForm);

        const spies = mockRandomOrg(MAX_FORMS_PER_POST);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);

                expect(valids.length).toEqual(MAX_FORMS_PER_POST);
                done();
            });

    });

    it(`Should display correct stats when posting maximum amount of valid forms`, (done) => {

        const forms = [...Array(MAX_FORMS_PER_POST).keys()].map(() => maxLenForm);

        const spies = mockRandomOrg(MAX_FORMS_PER_POST);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);
                expect(valids.length).toEqual(MAX_FORMS_PER_POST);

                axios.get(`/api/forms/stats`,
                    { baseURL: BASE_URL })
                    .then((resStats) => {
                        const stats: AppFormsModuleStats = resStats.data;
                        expect(stats.forms_valid).toEqual(MAX_FORMS_PER_POST);
                        expect(stats.stored).toEqual(MAX_FORMS_PER_POST);
                        done();
                    });

            });

    });
    it(`Should display correct stats when posting maximum amount of invalid forms`, (done) => {

        const forms = [...Array(MAX_FORMS_PER_POST).keys()].map(() => formInvalidDob);

        const spies = mockRandomOrg(MAX_FORMS_PER_POST);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const invalids = data.filter((item) => item.success === false);
                expect(invalids.length).toEqual(MAX_FORMS_PER_POST);

                axios.get(`/api/forms/stats`,
                    { baseURL: BASE_URL })
                    .then((resStats) => {
                        const stats: AppFormsModuleStats = resStats.data;
                        expect(stats.cummulative_risk_score).toEqual(0);
                        expect(stats.forms_valid).toEqual(0);
                        expect(stats.forms_invalid).toEqual(MAX_FORMS_PER_POST);
                        expect(stats.stored).toEqual(0);
                        done();
                    });

            });

    });
    it(`Should display correct stats when posting valid and invalid forms`, (done) => {

        const forms1 = [...Array(2).keys()].map(() => maxLenForm);
        const forms2 = [...Array(2).keys()].map(() => formInvalidDob);
        const forms = forms1.concat(forms2);

        const spies = mockRandomOrg(4);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);
                const invalids = data.filter((item) => item.success === false);

                expect(valids.length).toEqual(2);
                expect(invalids.length).toEqual(2);

                axios.get(`/api/forms/stats`,
                    { baseURL: BASE_URL })
                    .then((resStats) => {
                        const stats: AppFormsModuleStats = resStats.data;
                        expect(stats.forms_valid).toEqual(2);
                        expect(stats.forms_invalid).toEqual(2);
                        expect(stats.stored).toEqual(2);
                        done();
                    });

            });

    });
    it(`Should display correct stats when server responds with error`, (done) => {
        const count = MAX_FORMS_PER_POST + 1;
        const forms = [...Array(count).keys()].map(() => minLenForm);

        const spies = mockRandomOrg(count);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .catch((e) => {
                expect(e).not.toBeNull();

                axios.get(`/api/forms/stats`,
                { baseURL: BASE_URL })
                .then((resStats) => {
                    const stats: AppFormsModuleStats = resStats.data;
                    expect(stats.forms_valid).toEqual(0);
                    expect(stats.forms_invalid).toEqual(0);
                    expect(stats.stored).toEqual(0);
                    expect(stats.failures).toEqual(1);
                    done();
                });

            });
    });

    it(`Should properly calculate cummulative score #1`, (done) => {
        const forms = [...Array(2).keys()].map(() => maxLenForm);

        const spies = mockRandomOrg(2, 1);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);

                expect(valids.length).toEqual(2);
                expect(spies[0]).toHaveBeenCalledTimes(1);
                expect(spies[1]).toHaveBeenCalledTimes(1);

                axios.get(`/api/forms/stats`,
                    { baseURL: BASE_URL })
                    .then((resStats) => {
                        const stats: AppFormsModuleStats = resStats.data;
                        expect(stats.forms_valid).toEqual(2);
                        expect(stats.forms_invalid).toEqual(0);
                        expect(stats.stored).toEqual(2);
                        expect(stats.cummulative_risk_score).toEqual(180);
                        done();
                    });

            });

    });
    it(`Should properly calculate cummulative score #2`, (done) => {

        const forms = [...Array(2).keys()].map(() => maxLenForm);
        const spies = mockRandomOrg(2, 2);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);

                expect(valids.length).toEqual(2);
                expect(spies[0]).toHaveBeenCalledTimes(1);
                expect(spies[1]).toHaveBeenCalledTimes(1);

                axios.get(`/api/forms/stats`,
                    { baseURL: BASE_URL })
                    .then((resStats) => {
                        const stats: AppFormsModuleStats = resStats.data;
                        expect(stats.forms_valid).toEqual(2);
                        expect(stats.forms_invalid).toEqual(0);
                        expect(stats.stored).toEqual(2);
                        expect(stats.cummulative_risk_score).toEqual(360);
                        done();
                    });

            });

    });
    it(`Should properly calculate cummulative score #3`, (done) => {

        const forms = [...Array(2).keys()].map(() => maxLenForm);

        const spies = mockRandomOrg(2, -1);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);

                expect(valids.length).toEqual(2);
                expect(spies[0]).toHaveBeenCalledTimes(1);
                expect(spies[1]).toHaveBeenCalledTimes(1);

                axios.get(`/api/forms/stats`,
                    { baseURL: BASE_URL })
                    .then((resStats) => {
                        const stats: AppFormsModuleStats = resStats.data;
                        expect(stats.forms_valid).toEqual(2);
                        expect(stats.forms_invalid).toEqual(0);
                        expect(stats.stored).toEqual(2);
                        expect(stats.cummulative_risk_score).toEqual(-180);
                        done();
                    });

            });

    });
    it(`Should properly report invalid fields for each invalid form`, (done) => {

        const forms = [formInvalidDob, formInvalidName, formInvalidOccupation, formInvalidAddress];
        const spies = mockRandomOrg(forms.length);

        axios.post(`/api/forms/new`, forms,
            { baseURL: BASE_URL })
            .then((res) => {
                const data = res.data as ApplicationFormResponse;
                const valids = data.filter((item) => item.success === true);
                const invalids = data.filter((item) => item.success === false);

                expect(valids.length).toEqual(0);
                expect(invalids.length).toEqual(4);

                expect(spies[0]).toHaveBeenCalledTimes(1);
                expect(spies[1]).toHaveBeenCalledTimes(1);

                expect((invalids[0] as ApplicationFormResponseInvalid).invalid_fields.length).toEqual(1);
                expect((invalids[1] as ApplicationFormResponseInvalid).invalid_fields.length).toEqual(1);
                expect((invalids[2] as ApplicationFormResponseInvalid).invalid_fields.length).toEqual(1);
                expect((invalids[3] as ApplicationFormResponseInvalid).invalid_fields.length).toEqual(1);

                expect((invalids[0] as ApplicationFormResponseInvalid).invalid_fields[0]).toEqual("dob");
                expect((invalids[1] as ApplicationFormResponseInvalid).invalid_fields[0]).toEqual("name");
                expect((invalids[2] as ApplicationFormResponseInvalid).invalid_fields[0]).toEqual("occupation");
                expect((invalids[3] as ApplicationFormResponseInvalid).invalid_fields[0]).toEqual("address");

                done();

            });

    });
});
