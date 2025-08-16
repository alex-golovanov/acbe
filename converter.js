// usage: node converter.js <csv file path>
// This script reads a CSV file and converts it to multiple JSON files for locales.
// The first column of the CSV file is used as the key for the JSON object.
// Each column after the first is converted to a separate JSON file.
// The JSON file name is the column header.

// CSV file example:
/*
attribute_name,message to translate from (en),"message for ""el""","message for ""hu""","message for  ""da""","message for ""th""","message for  ""cs""","message for ""ro"""
country_ac,Ascension Island,Νησί της Ανάληψης,Ascension-sziget,Ascension Island,เกาะแอสเซนชัน,Ostrov Ascension,Insula Ascensiunii
country_ad,Andorra,Ανδόρα,Andorra,Andorra,อันดอร์รา,Andorra,Andorra
country_ae,United Arab Emirates,Ηνωμένα Αραβικά Εμιράτα,Egyesült Arab Emírségek,Forenede Arabiske Emirater,สหรัฐอาหรับเอมิเรตส์,Spojené arabské emiráty,Emiratele Arabe Unite
country_af,Afghanistan,Αφγανιστάν,Afganisztán,Afghanistan,อัฟกานิสถาน,Afghánistán,Afganistan
*/
const fs = require('fs');
const csv = require('csv-parser');

// Function to convert CSV to JSON files
function convertCSVToJSON(csvFilePath) {
    const dataMap = {};

    // Read the CSV file
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            // Extract key from the first column
            const key = row[Object.keys(row)[0]];

            // For each column after the first, create a JSON object
            for (let i = 1; i < Object.keys(row).length; i++) {
                const columnHeader = Object.keys(row)[i];
                const value = row[columnHeader];

                // If the JSON object for the column does not exist, create it
                if (!dataMap[columnHeader]) {
                    dataMap[columnHeader] = {};
                }

                // Assign the value to the corresponding key
                dataMap[columnHeader][key] = {
                  "message": value,
                  "description": ""
              };
            }
        })
        .on('end', () => {
            // Write each JSON object to separate file
            Object.keys(dataMap).forEach(columnHeader => {
                const jsonFilePath = `${columnHeader}.json`;
                fs.writeFileSync(jsonFilePath, JSON.stringify(dataMap[columnHeader], null, 2));
                console.log(`Converted ${csvFilePath} to ${jsonFilePath}`);
            });
            console.log('Conversion complete.');
        })
        .on('error', (error) => {
            console.error('Error occurred during conversion:', error);
        });
}

// Usage: node script.js <csvFilePath>
const csvFilePath = process.argv[2];
if (!csvFilePath) {
    console.error('Please provide the path to the CSV file.');
} else {
    convertCSVToJSON(csvFilePath);
}
