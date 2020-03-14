import { GenerateGaussiansResponse, GenerateUUIDsResponse } from "./../random-org";

export const mockGenerateUUIDsResponse = (n: number): GenerateUUIDsResponse => {

    const uuids = [...Array(n).keys()].map(() => "11111111-1111-1111-1111-111111111111");

    const out: GenerateUUIDsResponse = {
        id: 1,
        jsonrpc: "",
        result: {
            bitsLeft: 0,
            bitsUsed: 0,
            requestsLeft: 0,
            advisoryDelay: 0,
            random: {
                completionTime: "0",
                data: [
                    ...uuids,
                ],

            },
        },
    };

    return out;

};

export const mockGenerateGaussiansResponse = (n: number): GenerateGaussiansResponse => {

    // generate random numbers between -10 and 10
    const rands = [...Array(n).keys()].map(() => Math.random() * (10 - -10) + -10);

    const out: GenerateGaussiansResponse = {
        id: 1,
        jsonrpc: "",
        result: {
            bitsLeft: 0,
            bitsUsed: 0,
            requestsLeft: 0,
            advisoryDelay: 0,
            random: {
                completionTime: "0",
                data: [
                    ...rands,
                ],

            },
        },
    };

    return out;

};
