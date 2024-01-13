function calculateSimilarity(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    if(str2.includes(str1)){
        return 100
    }
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));
  
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    const similarityPercentage = ((maxLength - distance) / maxLength) * 100;
    return similarityPercentage;
  }
  async function findMatchingCategories(searchName, Db,whichField) {
    const matchingNames = [];
    const names = await Db.distinct(whichField);
    if(names.length===0) return `There is not field in Db called ${whichField}`;
    for (const name of names) {
      const similarity = calculateSimilarity(searchName, name);
      if (similarity > 25) {
        let obj = {similarity};
        obj[whichField] = name;
        matchingNames.push(obj);
      }
    }
    const matchedNamesArr = matchingNames.map((entry) => entry[whichField]);
    return {
        withSimilarity:matchingNames,
        onlyMatchingWords:matchedNamesArr
    };
  }

module.exports = {findMatchingCategories,calculateSimilarity};