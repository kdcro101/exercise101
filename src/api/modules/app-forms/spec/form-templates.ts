import { ApplicationFormRaw } from "../../../../types/index";

export const maxLenForm: ApplicationFormRaw = {
    name: "x".repeat(20),
    address: "x".repeat(40),
    dob: "1980/03/06",
    occupation: "x".repeat(20),
};
export const minLenForm: ApplicationFormRaw = {
    name: "x".repeat(3),
    address: "x".repeat(10),
    dob: "1980/03/06",
    occupation: "x".repeat(5),
};

export const formInvalidDob: ApplicationFormRaw = {
    name: "x".repeat(20),
    address: "x".repeat(40),
    dob: "1980/33/33",
    occupation: "x".repeat(20),
};

export const formInvalidName: ApplicationFormRaw = {
    name: "x".repeat(50),
    address: "x".repeat(40),
    dob: "1980/06/03",
    occupation: "x".repeat(20),
};

export const formInvalidOccupation: ApplicationFormRaw = {
    name: "x".repeat(20),
    address: "x".repeat(40),
    dob: "1980/06/03",
    occupation: "x".repeat(50),
};

export const formInvalidAddress: ApplicationFormRaw = {
    name: "x".repeat(20),
    address: "x".repeat(70),
    dob: "1980/03/06",
    occupation: "x".repeat(20),
};
