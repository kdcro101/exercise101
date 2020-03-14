import axios from "axios";

export interface GenerateUUIDsRequest {
    "jsonrpc": string;
    "method": string;
    "params": {
        "apiKey": string;
        "n": number;
    };
    "id": number;
}
export interface GenerateUUIDsResponse {
    "jsonrpc": string;
    "result": {
        "random": {
            "data": string[],
            "completionTime": string;
        },
        "bitsUsed": number;
        "bitsLeft": number;
        "requestsLeft": number;
        "advisoryDelay": number;
    };
    "id": number;
}

export interface GenerateGaussiansRequest {
    "jsonrpc": string;
    "method": string;
    "params": {
        "apiKey": string;
        "n": number;
        "mean": number;
        "standardDeviation": number;
        "significantDigits": number;
    };
    "id": number;
}

export interface GenerateGaussiansResponse {
    "jsonrpc": string;
    "result": {
        "random": {
            "data": number[];
            "completionTime": string;
        },
        "bitsUsed": number;
        "bitsLeft": number;
        "requestsLeft": number;
        "advisoryDelay": number;
    };
    "id": number;
}

export class RandomOrg {

    public static checkApiKey(key: string): boolean {
        if (key == null) {
            return false;
        }

        const m = key.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

        if (m == null) {
            return false;
        }

        return true;
    }

    constructor(private apiKey: string) { }

    public generateUUIDs(n: number = 10): Promise<string[]> {
        if (n === 0) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {

            const params: GenerateUUIDsRequest = {
                jsonrpc: "2.0",
                method: "generateUUIDs",
                params: {
                    apiKey: this.apiKey,
                    n,
                },
                id: this.generateId(),
            };

            axios.post("/json-rpc/2/invoke", params, { baseURL: `https://api.random.org` })
            .then((res) => {
                const response: GenerateUUIDsResponse = res.data;
                resolve(response.result.random.data);
            }).catch((e) => {
                reject(e);
            });

        });

    }
    public generateGaussians(n: number = 10): Promise<number[]> {
        if (n === 0) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {

            const params: GenerateGaussiansRequest = {
                jsonrpc: "2.0",
                method: "generateGaussians",
                params: {
                    apiKey: this.apiKey,
                    n,
                    mean: 0.0,
                    standardDeviation: 1.0,
                    significantDigits: 8,
                },
                id: this.generateId(),
            };

            axios.post("/json-rpc/2/invoke", params, { baseURL: `https://api.random.org` })
            .then((res) => {
                const response: GenerateGaussiansResponse = res.data;
                resolve(response.result.random.data);
            }).catch((e) => {
                reject(e);
            });

        });

    }

    private generateId(): number {
        return Math.round(Math.random() * 10 ** 8);

    }
}
