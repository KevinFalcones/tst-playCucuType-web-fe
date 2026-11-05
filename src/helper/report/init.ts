//This file clean "test-results" folder before each execution
import * as fs from "fs-extra";

try {
    fs.ensureDir("test-results");
    fs.emptyDir("test-results");
} catch (error) {
    console.log("The folder test-results cannot be cleaned: " + error);
}