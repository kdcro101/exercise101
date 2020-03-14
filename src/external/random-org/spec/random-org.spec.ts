import axios from "axios";

import "jasmine";
import { RandomOrg } from "../random-org";
import { mockGenerateGaussiansResponse, mockGenerateUUIDsResponse } from "./response-templates";

describe("Random.org API Client Tests", () => {

    const randomOrgKey = process.env["RANDOM_ORG"];
    let random: RandomOrg = null;

    beforeAll((done) => {
        random = new RandomOrg(randomOrgKey);
        done();
    });

    it(`Should have valid RandomOrg class instantiated`, () => {
        expect(random).not.toBeNull();
    });

    it(`Should return valid UUIDS from generateUUIDs`, () => {

        const count = 3;

        const spy = spyOn(axios, "post").and.returnValue(
            Promise.resolve({
                data: mockGenerateUUIDsResponse(count),
            }),
        );

        random.generateUUIDs(count).then((data) => {

            const test = data.map((item) =>
                item.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) != null);
            const valids = test.filter((item) => item === true);

            expect(valids.length).toEqual(count);

        });
    });
    it(`Should return valid numbers from generateGaussians`, (done) => {

        const count = 3;

        const spy = spyOn(axios, "post").and.returnValue(
            Promise.resolve({
                data: mockGenerateGaussiansResponse(count),
            }),
        );

        random.generateGaussians(count).then((data) => {

            const test = data.map((item) => isNaN(item) !== true && typeof item === "number");

            const valids = test.filter((item) => item === true);

            expect(valids.length).toEqual(count);
            done();

        });
    });
    it(`Should fail when calling generateUUIDs and API call fails`, (done) => {
        const error = "Mocked Error";

        const spy = spyOn(axios, "post").and.returnValue(
            Promise.reject(error),
        );

        random.generateUUIDs(1).then(() => {
            // done();
        }).catch((e) => {
            expect(e).toEqual(error);
            done();
        });

    });
    it(`Should fail when calling generateGaussians and API call fails`, (done) => {
        const error = "Mocked Error";

        const spy = spyOn(axios, "post").and.returnValue(
            Promise.reject(error),
        );

        random.generateGaussians(1).then(() => {
            // done();
        }).catch((e) => {
            expect(e).toEqual(error);
            done();
        });

    });
    it(`Should resolve empty array when generateGaussians is called with n=0`, (done) => {

        random.generateGaussians(0).then((data) => {
            expect(data.length).toEqual(0);
            done();
        });
    });
    it(`Should resolve empty array when generateUUIDs is called with n=0`, (done) => {

        random.generateUUIDs(0).then((data) => {
            expect(data.length).toEqual(0);
            done();
        });
    });

});
