const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');

async function wordInArrEl(word, arr) {
  for (let wrd of arr) {
    if (wrd.includes(word)) {
      return true;
    }
  }
  return false;
}
function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex);
  return links || [];
}
async function getPercentage(pdfFileUrl, specialRequirements) {
  let seperated = [];
  for (let i of specialRequirements) {
    for (let j of i.split(' ')) {
      seperated.push(j);
    }
  }
  const numberOfSpecialRequirements = seperated.length;
  let file;
  try {
    if (pdfFileUrl.startsWith('http')) {
      const response = await axios.get(pdfFileUrl, { responseType: 'arraybuffer' });
      file = response.data;
    } else {
      file = fs.readFileSync(pdfFileUrl);
    }
  } catch (error) {
    throw new Error(`Failed to read PDF file: ${error}`);
  }
  return pdf(file).then(function (data) {
    // Extract the text from the PDF document
    // let res = [];
    console.log((data.text.replace(/\n/g, "").trim()).replace(/\n/g, ""))
    console.log(extractLinks(data.text.replace(/\n/g, "").trim()))
    const text = data.text.trim().split('/\s+/');
    // for (let sen of text) {
    //   for (let word of sen.split(' ')) {
    //     res.push(word);
    //   }
    // }
    const clearPdfWords = [...new Set(text)];
    // console.log(res)

    // let clearPdfWords = [];
    // for (let i of res) {
    //   if (!clearPdfWords.includes(i)) {
    //     clearPdfWords.push(i.toLowerCase());
    //   }
    // }
    let clearRequirementsWords = [];
    for (let i of seperated) {
      if (!clearRequirementsWords.includes(i)) {
        clearRequirementsWords.push(i.toLowerCase());
      }
    }
    let numsOfEqualsSkills = 0;
    for (let skill of clearRequirementsWords) {
      if (clearPdfWords.includes(skill)) {
        numsOfEqualsSkills += 1;
      } else {
        if (wordInArrEl(skill, clearPdfWords)) {
          numsOfEqualsSkills += 1;
        }
      }
    }
    let percentage = `${parseInt((numsOfEqualsSkills / numberOfSpecialRequirements) * 100)}%`;
    return percentage;
  });
}


// module.exports = {getPercentage}