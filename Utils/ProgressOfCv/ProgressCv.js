const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios')
function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex);
  return links || [];
}
async function getPercentage(pdfFileUrl, specialRequirements) {
  let seperated = [];
  for (let i of specialRequirements) {
    for (let j of i.split(' ')) {
      seperated.push(j.toLowerCase());
    }
  }
  // const fixed = uniqueArray.map((skil,ind)=>skil.toLowerCase());
  const uniqueArray = Array.from(new Set(seperated))
  console.log("uniq",uniqueArray)
  const numberOfSpecialRequirements = uniqueArray.length;
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
    // console.log((data.text.replace(/\n/g, "").trim()).replace(/\n/g, ""))
    // console.log(extractLinks(data.text.replace(/\n/g, "").trim()))
    
    // console.log(fixed)
    const text = data.text.trim();
    let numsOfEqualsSkills = numOfWords(text,uniqueArray);
    let percentage = parseInt((numsOfEqualsSkills / numberOfSpecialRequirements) * 100)
    return percentage;
  });
}
function numOfWords(text, words) {
  let numOfWord = 0;
  const tx = text
    .toLowerCase() // Büyük/küçük harf duyarlılığı olmadan karşılaştırma yapmak için metni küçük harfe dönüştürüyoruz
    .split(/\W+/) // Metni boşluk ve noktalama işaretlerine göre böleriz ve kelimeleri elde ederiz
  for(let i of words){
    if(tx.includes(i)){
      numOfWord++
    }
  }
  return numOfWord;
}




async function extractText(pdfFileUrl) {
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
    const text = data.text.trim();
    return {text,data};
  });
}








module.exports = {getPercentage,extractText}